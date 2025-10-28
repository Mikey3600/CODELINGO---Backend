import express from 'express';
import { serverSupabase } from '../utils/supabaseClient.js';
import AppError from '../utils/apperror.js';
import logger from '../utils/logger.js'; 
 

const router = express.Router();

const LESSON_TABLE = 'lessons'; 
const USER_LESSON_PROGRESS_TABLE = 'user_lessons';




const createLessonService = async (lessonData) => {
    
    if (!lessonData.course_id || !lessonData.title) {
        
        throw new AppError('Lesson requires a course_id and title.', 400);
    }
    
    const { data, error } = await serverSupabase
        .from(LESSON_TABLE)
        .insert([lessonData])
        .select()
        .single();

    if (error) {
        
        logger.error('Database error creating lesson:', { error: error.message, detail: error.details });
        
        throw new AppError(`Database error creating lesson: ${error.message}`, 500);
    }
    return data;
};


const getAllLessonsService = async () => {
    const { data, error } = await serverSupabase
        .from(LESSON_TABLE)
        .select('*')
        .order('course_id', { ascending: true });

    if (error) {
        logger.error('Database error fetching all lessons:', { error: error.message });
        throw new AppError(`Database error fetching all lessons: ${error.message}`, 500);
    }
    return data || [];
};


const getLessonByIdService = async (lessonId) => {
    const { data, error } = await serverSupabase
        .from(LESSON_TABLE)
        .select('*')
        .eq('id', lessonId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means 'No rows found'
        logger.error(`Database error fetching lesson ${lessonId}:`, { error: error.message });
        throw new AppError(`Database error fetching lesson: ${error.message}`, 500);
    }
    return data;
};


const updateLessonService = async (lessonId, updates) => {
    const { data, error } = await serverSupabase
        .from(LESSON_TABLE)
        .update(updates)
        .eq('id', lessonId)
        .select()
        .single();

    if (error) {
        logger.error(`Database error updating lesson ${lessonId}:`, { error: error.message });
        throw new AppError(`Database error updating lesson: ${error.message}`, 500);
    }
    return data;
};


const deleteLessonService = async (lessonId) => {
    const { error, count } = await serverSupabase
        .from(LESSON_TABLE)
        .delete({ count: 'exact' })
        .eq('id', lessonId);

    if (error) {
        logger.error(`Database error deleting lesson ${lessonId}:`, { error: error.message });
        throw new AppError(`Database error deleting lesson: ${error.message}`, 500);
    }
    return count > 0;
};



const getLessonProgressService = async (userId, courseId, lessonIndex) => {
    const { data, error } = await serverSupabase
        .from(USER_LESSON_PROGRESS_TABLE)
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('lesson_index', lessonIndex)
        .single();

    if (error && error.code !== 'PGRST116') {
        logger.error('Database error fetching lesson progress:', { error: error.message, userId, courseId });
        throw new AppError(`Database error fetching progress: ${error.message}`, 500);
    }
    return data;
};


const updateLessonProgressService = async (userId, courseId, lessonIndex, status) => {
    
    const { data, error } = await serverSupabase
        .from(USER_LESSON_PROGRESS_TABLE)
        .upsert({
            user_id: userId,
            course_id: courseId,
            lesson_index: lessonIndex,
            completion_status: status,
            updated_at: new Date().toISOString()
        }, { 
            onConflict: 'user_id, course_id, lesson_index' 
        })
        .select()
        .single();

    if (error) {
        logger.error('Database error upserting lesson progress:', { error: error.message, userId, courseId });
        throw new AppError(`Database error updating progress: ${error.message}`, 500);
    }
    return data;
};


router.get('/', async (req, res, next) => {
    try {
        const lessons = await getAllLessonsService();
        res.status(200).json(lessons);
    } catch (error) {
        next(error);
    }
});


router.get('/:id', async (req, res, next) => {
    try {
        const lesson = await getLessonByIdService(req.params.id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.status(200).json(lesson);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    try {
        
        const lessonData = { ...req.body };
        
     
        if (!lessonData.course_id || 
            !lessonData.title || 
            !lessonData.content || 
            !lessonData.difficulty || 
            lessonData.unit_order == null) {
                
            throw new AppError('Missing required fields. You must provide: course_id (UUID), title, content, difficulty, AND unit_order (integer).', 400);
        }
        

        const newLesson = await createLessonService(lessonData);
        res.status(201).json(newLesson);
    } catch (error) {
        next(error);
    }
});


router.put('/:id', async (req, res, next) => {
    try {
        
        const updates = { ...req.body };

        const updatedLesson = await updateLessonService(req.params.id, updates);
        if (!updatedLesson) {
            return res.status(404).json({ message: 'Lesson not found for update' });
        }
        res.status(200).json(updatedLesson);
    } catch (error) {
        next(error);
    }
});


router.delete('/:id', async (req, res, next) => {
    try {
        const deleted = await deleteLessonService(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Lesson not found for deletion' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});





router.get('/progress/:courseId/:lessonIndex', async (req, res, next) => {
    try {
    
        const userId = req.query.userId || 'placeholder_user_id'; 
        
        const { courseId, lessonIndex } = req.params;
        const progress = await getLessonProgressService(userId, courseId, parseInt(lessonIndex));
        
        res.status(200).json(progress || { message: 'No progress found for this lesson.' });
    } catch (error) {
        next(error);
    }
});


router.post('/progress', async (req, res, next) => {
    try {
        
        const userId = req.body.userId || 'placeholder_user_id'; 

        const { course_id, lesson_index, status } = req.body;

        if (!course_id || lesson_index === undefined || !status) {
            throw new AppError('Missing required fields for progress update: course_id, lesson_index, and status.', 400);
        }

        const updatedProgress = await updateLessonProgressService(
            userId, 
            course_id, 
            parseInt(lesson_index), 
            status
        );
        
        res.status(200).json(updatedProgress);
    } catch (error) {
        next(error);
    }
});


export default router;

