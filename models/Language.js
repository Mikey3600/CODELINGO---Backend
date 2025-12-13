import mongoose from "mongoose";

const languageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: "code"
  },
  color: {
    type: String,
    default: "#00599C"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalLessons: {
    type: Number,
    default: 0
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

languageSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Language", languageSchema);