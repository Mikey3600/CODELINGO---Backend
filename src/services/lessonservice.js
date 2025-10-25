
import { serverSupabase } from '../index.js'; 

const COURSES_TABLE = 'courses';
const LESSONS_TABLE = 'lessons';
const QUESTIONS_TABLE = 'questions';


export async function getAllCourses() {
    try {
        
        const { data, error } = await serverSupabase
            .from(COURSES_TABLE)
            .select('id, name, language_code')
            .eq('is_active', true);

        if (error) {
            console.error('[LessonService] Error fetching courses:', error);
            throw new Error('Database error retrieving courses.');
        }

        return data || [];

    } catch (error) {
        console.error(`[LessonService] Unexpected error in getAllCourses: ${error.message}`);
        throw new Error('Internal server error during course fetch.');
    }
}


export async function getLessonsByCourse(courseId) {
    if (!courseId) {
        throw new Error('Course ID is required to fetch lessons.');
    }

    try {
        const { data, error } = await serverSupabase
            .from(LESSONS_TABLE)
            .select('id, title, difficulty, unit_order')
            .eq('course_id', courseId)
            .order('unit_order', { ascending: true }); 

        if (error) {
            console.error(`[LessonService] Error fetching lessons for course ${courseId}:`, error);
            throw new Error('Database error retrieving lessons.');
        }

        return data || [];

    } catch (error) {
        console.error(`[LessonService] Unexpected error in getLessonsByCourse: ${error.message}`);
        throw new Error('Internal server error during lesson fetch.');
    }
}


export async function getQuestionsByLesson(lessonId) {
    if (!lessonId) {
        throw new Error('Lesson ID is required to fetch questions.');
    }

    try {
        const { data, error } = await serverSupabase
            .from(QUESTIONS_TABLE)
            
            .select('*')
            .eq('lesson_id', lessonId);

        if (error) {
            console.error(`[LessonService] Error fetching questions for lesson ${lessonId}:`, error);
            throw new Error('Database error retrieving questions.');
        }

        return data || [];

    } catch (error) {
        console.error(`[LessonService] Unexpected error in getQuestionsByLesson: ${error.message}`);
        throw new Error('Internal server error during question fetch.');
    }
}

export default {
    getAllCourses,
    getLessonsByCourse,
    getQuestionsByLesson,
};
