import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: '#4bc0c0',
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      required: false,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrenceInterval: {
      type: String,
      enum: ["Daily", "Weekly", "Biweekly", "Monthly", "Yearly", ""],
      default: "",
    },
    nextRecurrence: {
      type: Date,
    },
    timezone: {
        type: String,
    }
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
