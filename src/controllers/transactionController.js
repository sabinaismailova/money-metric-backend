import mongoose from "mongoose";
import Transaction from "../models/transactionModal.js";

function parseDateToUTC(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export const addTransaction = async (req, res) => {
  try {
    const {
      type,
      category,
      amount,
      date,
      note,
      isRecurring,
      recurrenceInterval,
      nextRecurrence,
    } = req.body;
    const userId = req.user._id;

    const transactionData = {
      userId,
      type,
      category,
      amount: Number(amount),
      date: parseDateToUTC(date),
      note,
      isRecurring,
    };

    if (isRecurring) {
      transactionData.recurrenceInterval = recurrenceInterval;
      transactionData.nextRecurrence = parseDateToUTC(nextRecurrence);
    }

    const transaction = await Transaction.create(transactionData);

    console.log("transaction: ", transaction)

    res.status(201).json(transaction);
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({
      message: "Error adding transaction",
      error: error.message,
      stack: error.stack,
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error });
  }
};

function getNextRecurrenceDate(currentDate, interval) {
  const next = new Date(currentDate);
  switch (interval) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      break;
  }
  return next;
}

export const processRecurringTransactions = async () => {
  try {
    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);

    console.log("reccuring here ");

    const recurring = await Transaction.find({
      isRecurring: true,
      nextRecurrence: { $lte: today },
    });

    console.log("recurring: ", recurring);

    for (const tx of recurring) {
      const newTx = new Transaction({
        ...tx.toObject(),
        _id: new mongoose.Types.ObjectId(),
        date: today,
      });

      const nextDate = getNextRecurrenceDate(today, tx.recurrenceInterval);
      newTx.nextRecurrence = nextDate;

      console.log("newTx: ", newTx);

      await newTx.save();
    }

    console.log("Recurring transaction processor completed.");
  } catch (err) {
    console.error("Error processing recurring transactions:", err);
  }
};
