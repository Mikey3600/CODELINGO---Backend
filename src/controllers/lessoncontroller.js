

import Lesson from "../models/Lesson.js";
import Skill from "../models/Skill.js";
import Question from "../models/Question.js";


export const getLessonsBySkill = async (req, res) => {
  try {
    const lessons = await Lesson.find({ skillId: req.params.skillId })
      .sort({ orderIndex: 1 });

    return res.status(200).json({
      lessons,   // <--- Flutter EXPECTS THIS
    });
  } catch (err) {
    console.error("LESSON LIST ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch lessons" });
  }
};


export const getLessonWithQuestions = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const questions = await Question.find({ lessonId: lesson._id });

    return res.status(200).json({
      lesson,       
      questions,    
    });
  } catch (err) {
    console.error("LESSON DETAIL ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch lesson" });
  }
};

export const createLesson = async (req, res) => {
  try {
    const { skillId, title } = req.body;

    if (!skillId || !title) {
      return res.status(400).json({ error: "skillId and title are required" });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    const lesson = await Lesson.create({
      ...req.body,
      questionCount: 0,
    });

    return res.status(201).json({
      lesson,
    });
  } catch (err) {
    console.error("CREATE LESSON ERROR:", err);
    return res.status(500).json({ error: "Failed to create lesson" });
  }
};


export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const updated = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
      req.body,
      { new: true }
    );

    return res.status(200).json({
      lesson: updated,
    });
  } catch (err) {
    console.error("UPDATE LESSON ERROR:", err);
    return res.status(500).json({ error: "Failed to update lesson" });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    await Question.deleteMany({ lessonId: lesson._id });
    await lesson.deleteOne();

    return res.status(200).json({
      message: "Lesson deleted",
    });
  } catch (err) {
    console.error("DELETE LESSON ERROR:", err);
    return res.status(500).json({ error: "Failed to delete lesson" });
  }
};


export const addQuestion = async (req, res) => {
  try {
    const { lessonId } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const question = await Question.create(req.body);

    lesson.questionCount += 1;
    await lesson.save();

    return res.status(201).json({
      question,
    });
  } catch (err) {
    console.error("ADD QUESTION ERROR:", err);
    return res.status(500).json({ error: "Failed to add question" });
  }
};
