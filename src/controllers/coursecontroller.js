

import Course from "../models/Course.js";

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    return res.status(200).json({
      courses, 
    });
  } catch (err) {
    console.error("COURSE LIST ERROR:", err);
    return res.status(500).json({ error: "Failed to load courses" });
  }
};

// -----------------------------
// GET SINGLE COURSE
// GET /api/courses/:id
// -----------------------------
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    return res.status(200).json({
      course,
    });
  } catch (err) {
    console.error("COURSE GET ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch course" });
  }
};


export const createCourse = async (req, res) => {
  try {
    const { title, description, iconEmoji, languageCode, totalSkills } = req.body;

    
    if (!title || !languageCode) {
      return res.status(400).json({
        error: "title and languageCode are required",
      });
    }

    const course = await Course.create({
      title,
      description: description || "",
      iconEmoji: iconEmoji || "📘",
      languageCode,
      totalSkills: totalSkills || 0,
    });

    return res.status(201).json({
      course,
    });
  } catch (err) {
    console.error("COURSE CREATE ERROR:", err);
    return res.status(500).json({ error: "Failed to create course" });
  }
};


export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    return res.status(200).json({
      course: updated,
    });
  } catch (err) {
    console.error("COURSE UPDATE ERROR:", err);
    return res.status(500).json({ error: "Failed to update course" });
  }
};


export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    await course.deleteOne();

    return res.status(200).json({
      message: "Course deleted",
    });
  } catch (err) {
    console.error("COURSE DELETE ERROR:", err);
    return res.status(500).json({ error: "Failed to delete course" });
  }
};
