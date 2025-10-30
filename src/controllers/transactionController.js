import Transaction from "../models/transactionModal.js";

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
      date: new Date(date),
      note,
      isRecurring,
    };

    if (isRecurring) {
      transactionData.recurrenceInterval = recurrenceInterval;
      transactionData.nextRecurrence = new Date(nextRecurrence);
    }

    const transaction = await Transaction.create(transactionData);

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
