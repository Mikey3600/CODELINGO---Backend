import mongoose from "mongoose";

const LanguageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }, 
  emoji: { type: String, default: "💻" },
  description: { type: String, default: "" },
}, { timestamps: true });

const Language = mongoose.model("Language", LanguageSchema);
export default Language;
