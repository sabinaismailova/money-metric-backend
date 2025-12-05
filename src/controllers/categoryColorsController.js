import CategoryColor from "../models/categoryColorsModel.js";
import Transaction from "../models/transactionModel.js";

export const sync = async (req, res) => {
  try {
    const userId = req.user.userId;

    const categories = await Transaction.distinct("category", { userId });

    const saved = [];

    for (const category of categories) {
      const exists = await CategoryColor.findOne({ userId, category });
      if (!exists) {
        const newColor = new CategoryColor({
          userId,
          category,
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
    res.status(500).json({ message: "Error syncing categories", error: err });
  }
};

export const getCategoryColors = async (req, res) => {
  const userId = req.user.userId;

  const colors = await CategoryColor.find({ userId });

  res.json(colors);
};

export const updateCategoryColors = async (req, res) => {
  const userId = req.user.userId;
  const { updates } = req.body;

  try {
    for (let u of updates) {
      await CategoryColor.findOneAndUpdate(
        { userId, category: u.category },
        { color: u.color },
        { upsert: true }
      );
    }

    res.json({ message: "Colors updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating colors", error });
  }
};
