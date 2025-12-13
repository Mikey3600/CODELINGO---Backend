import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  languageCode: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  icon: {
    type: String,
    default: 'book'
  },
  estimatedTime: {
    type: Number,
    default: 10
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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

lessonSchema.index({ languageCode: 1, order: 1 });

lessonSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Lesson', lessonSchema);
