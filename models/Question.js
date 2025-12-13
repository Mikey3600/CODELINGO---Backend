import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
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
  question: {
    type: String,
    required: true
  },
  code: {
    type: String,
    default: null
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    default: null
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  order: {
    type: Number,
    required: true
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

questionSchema.index({ lessonId: 1, order: 1 });

questionSchema.pre('save', function (next) {
  if (this.options.length !== 4) {
    return next(new Error('Question must have exactly 4 options'));
  }
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Question', questionSchema);
