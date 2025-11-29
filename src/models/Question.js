import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    type: {
      type: String,
      enum: ["mcq", "code", "bugfix", "output", "tf"],
      required: true,
    },

    questionText: { type: String, required: true },

    
    options: [{ type: String }],

    correctAnswerIndex: { type: Number },

    
    starterCode: { type: String },
    expectedOutput: { type: String },

    explanation: { type: String, default: "" },

    xpReward: { type: Number, default: 10 },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", QuestionSchema);
export default Question;
