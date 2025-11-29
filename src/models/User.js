import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarEmoji: {
      type: String,
      default: "👨‍💻",
    },
    totalXP: {
      type: Number,
      default: 0,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
    },
    dailyGoalXP: {
      type: Number,
      default: 50,
    },
    currentCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", 
    },
  },
  {
    timestamps: true,
  }
);


UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

const User = mongoose.model("User", UserSchema);

export default User;
