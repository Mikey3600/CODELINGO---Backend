import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  type: { type: String },            
  question: { type: String },        
  options: [String],
  correctAnswer: String,
  initialCode: String,
  solution: String,
  buggyCode: String,
  fix: String,
  code: String,
  answer: String,
});

const LessonSchema = new mongoose.Schema(
  {
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: true,
      index: true,
    },

    title: { type: String, required: true },
    description: { type: String, required: true },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },

    
    questions: { type: [QuestionSchema], default: [] },
  },
  { timestamps: true }
);

const Lesson = mongoose.model("Lesson", LessonSchema);
export default Lesson;


