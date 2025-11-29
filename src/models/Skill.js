import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    name: { type: String, required: true },
    description: { type: String, required: true },

    iconEmoji: { type: String, default: "🔥" },

    orderIndex: { type: Number, required: true },

    isUnlocked: { type: Boolean, default: false },

    lessonsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Skill = mongoose.model("Skill", SkillSchema);

export default Skill;
