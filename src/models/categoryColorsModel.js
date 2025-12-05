import mongoose from "mongoose";

const categoryColorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#4bc0c0",
  },
});

categoryColorSchema.index({ userId: 1, category: 1 }, { unique: true });

const CategoryColor = mongoose.model("CategoryColor", categoryColorSchema);

export default CategoryColor;
