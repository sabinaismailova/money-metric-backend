import mongoose from "mongoose";

const transactionTypeColorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#4bc0c0",
  },
});

const TransactionTypeColor = mongoose.model("TransactionTypeColor", transactionTypeColorSchema);

export default TransactionTypeColor;
