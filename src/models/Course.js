import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    iconEmoji: {
      type: String,
      default: "📘",
    },

    languageCode: {
      type: String,
      enum: ["c", "cpp", "java", "python", "js"],
      required: true,
    },

    totalSkills: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", CourseSchema);

export default Course;
