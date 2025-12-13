import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  languageCode: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true,
    index: true
  },
  completedQuestions: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttemptDate: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userProgressSchema.index({ userId: 1, languageCode: 1, lessonId: 1 }, { unique: true });

userProgressSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  if (this.completedQuestions === this.totalQuestions) {
    this.isCompleted = true;
    if (!this.completedAt) {
      this.completedAt = Date.now();
    }
  }
  if (this.totalQuestions > 0) {
    this.score = Math.round((this.correctAnswers / this.totalQuestions) * 100);
  }
  next();
});

export default mongoose.model("UserProgress", userProgressSchema);


