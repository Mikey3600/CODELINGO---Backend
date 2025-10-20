
import {
  createLesson,
  getLessonById,
  getAllLessons,
  updateLesson,
  deleteLesson,
} from '../models/lessonMOdel.js';

export const createLessonController = async (req, res) => {
  try {
    const lessonData = req.body;
    const newLesson = await createLesson(lessonData);
    res.status(201).json(newLesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllLessonsController = async (req, res) => {
  try {
    const lessons = await getAllLessons();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLessonByIdController = async (req, res) => {
  try {
    const lesson = await getLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLessonController = async (req, res) => {
  try {
    const updates = req.body;
    const updatedLesson = await updateLesson(req.params.id, updates);
    if (!updatedLesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(updatedLesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteLessonController = async (req, res) => {
  try {
    const deleted = await deleteLesson(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Lesson not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};