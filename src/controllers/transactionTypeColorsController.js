import TransactionTypeColor from "../models/transactionTypeColorsModel.js";
import Transaction from "../models/transactionModel.js";

export const sync = async (req, res) => {
  try {
    const userId = req.user.userId;

    const types = await Transaction.distinct("type", { userId });

    const saved = [];

    for (const type of types) {
      const exists = await TransactionTypeColor.findOne({ userId, type });
      if (exists == null) {
        const newColor = new TransactionTypeColor({
          userId,
          type,
        });
        await newColor.save();
        saved.push(newColor);
      }
    }

    res.status(200).json({
      message: "Synced!",
      created: saved,
    });
  } catch (err) {
    res.status(500).json({ message: "Error syncing types", error: err });
  }
};

export const getTransactionTypeColors = async (req, res) => {
  const userId = req.user.userId;

  const colors = await TransactionTypeColor.find({ userId });

  res.json(colors);
};

export const updateTransactionTypeColors = async (req, res) => {
  const userId = req.user.userId;
  const { updates } = req.body;

  try {
    for (let u of updates) {
      await TransactionTypeColor.findOneAndUpdate(
        { userId, type: u.type },
        { color: u.color },
        { upsert: true }
      );
    }

    res.json({ message: "Colors updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating colors", error });
  }
};
