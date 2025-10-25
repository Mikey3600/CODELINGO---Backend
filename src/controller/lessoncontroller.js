import lessonService from '../services/lessonservice.js'; 
export const getAllCoursesAndLessonsController = async (req, res, next) => {
    try {
        
        const courses = await lessonService.getAllCourses();

       
        const courseData = await Promise.all(
            courses.map(async (course) => {
                const lessons = await lessonService.getLessonsByCourse(course.id);
                return {
                    ...course,
                    lessons: lessons,
                };
            })
        );

        res.json(courseData);
    } catch (error) {
       
        next(error);
    }
};


export const getLessonContentController = async (req, res, next) => {
    try {
        const lessonId = req.params.id;

      
        if (!lessonId) {
            return res.status(400).json({ message: 'Lesson ID is required' });
        }

        
        const questions = await lessonService.getQuestionsByLesson(lessonId);

        if (questions.length === 0) {
            return res.status(404).json({ message: 'Lesson content not found or empty' });
        }

       
        res.json({ lessonId, questions });
    } catch (error) {
        next(error);
    }
};


export const createLessonController = async (req, res, next) => {
    try {
        
        const newLesson = await lessonService.createLesson(req.body);
        res.status(201).json(newLesson);
    } catch (error) {
        next(error);
    }
};


export const updateLessonController = async (req, res, next) => {
    try {
        const updatedLesson = await lessonService.updateLesson(req.params.id, req.body);
        if (!updatedLesson) return res.status(404).json({ message: 'Lesson not found' });
        res.json(updatedLesson);
    } catch (error) {
        next(error);
    }
};


export const deleteLessonController = async (req, res, next) => {
    try {
        const deleted = await lessonService.deleteLesson(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Lesson not found' });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};


export default {
    getAllCoursesAndLessonsController,
    getLessonContentController,
    createLessonController,
    updateLessonController,
    deleteLessonController
}