import Transaction from "../models/transactionModal.js";

export const addTransaction = async (req, res) => {
  try {
    console.log(req.body)
    const {
      type,
      category,
      amount,
      date,
      note,
      isRecurring,
      recurranceInterval,
      nextRecurrance,
    } = req.body;
    const userId = req.user._id;

    const transaction = await Transaction.create({
      userId,
      type,
      category,
      amount,
      date,
      note,
      isRecurring,
      recurranceInterval,
      nextRecurrance,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error adding transaction", error });
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
