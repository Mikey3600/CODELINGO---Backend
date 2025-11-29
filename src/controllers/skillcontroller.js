

import Skill from "../models/Skill.js";
import Course from "../models/Course.js";


export const getSkillsByCourse = async (req, res) => {
  try {
    const skills = await Skill.find({ courseId: req.params.courseId })
      .sort({ orderIndex: 1 });

    return res.status(200).json({
      skills,    
    });
  } catch (err) {
    console.error("SKILLS ERROR:", err);
    return res.status(500).json({
      error: "Failed to fetch skills",
    });
  }
};


export const getSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    return res.status(200).json({
      skill,    
    });
  } catch (err) {
    console.error("GET SKILL ERROR:", err);
    return res.status(500).json({
      error: "Failed to fetch skill",
    });
  }
};


export const createSkill = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ error: "Invalid courseId" });
    }

    const skill = await Skill.create({
      ...req.body,
      progress: 0,
      isUnlocked: false,
    });

    return res.status(201).json({
      skill,
    });
  } catch (err) {
    console.error("CREATE SKILL ERROR:", err);
    return res.status(500).json({
      error: "Failed to create skill",
    });
  }
};


export const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    const updated = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.status(200).json({
      skill: updated,
    });
  } catch (err) {
    console.error("UPDATE SKILL ERROR:", err);
    return res.status(500).json({
      error: "Failed to update skill",
    });
  }
};


export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    await skill.deleteOne();

    return res.status(200).json({
      message: "Skill deleted",
    });
  } catch (err) {
    console.error("DELETE SKILL ERROR:", err);
    return res.status(500).json({
      error: "Failed to delete skill",
    });
  }
};
