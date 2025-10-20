
import express from 'express';
import {
  createLesson,
  getLessonById,
  getAllLessons,
  updateLesson,
  deleteLesson,
} from '../models/lessonMOdel.js';

const router = express.Router();

// Create a new lesson
router.post('/', async (req, res) => {
  try {
    const lessonData = req.body;
    const newLesson = await createLesson(lessonData);
    res.status(201).json(newLesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all lessons
router.get('/', async (req, res) => {
  try {
    const lessons = await getAllLessons();
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get lesson by ID
router.get('/:id', async (req, res) => {
  try {
    const lesson = await getLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lesson by ID
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const updatedLesson = await updateLesson(req.params.id, updates);
    if (!updatedLesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(updatedLesson);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete lesson by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await deleteLesson(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Lesson not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;