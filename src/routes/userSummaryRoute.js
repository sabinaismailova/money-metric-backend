import express from "express";
import { computeSummary } from "../controllers/userSummaryController.js";
import UserSummary from "../models/userSummaryModel.js";
import Transaction from "../models/transactionModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);
    const mode = req.query.mode;

    const startDate =
      mode == "yearly"
        ? new Date(Date.UTC(year, 0, 0))
        : new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const endDate =
      mode == "yearly"
        ? new Date(Date.UTC(year + 1, 0, 0))
        : new Date(Date.UTC(year, parseInt(month) + 1, 0, 23, 59, 59));

    const transactionsExist = await Transaction.findOne({
      userId,
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    if (!year) {
      return res.status(400).json({ error: "Year is required" });
    }

    if (transactionsExist) {
      await computeSummary(userId, year, month, mode);

      const summary =
        mode == "yearly"
          ? await UserSummary.findOne({ userId, year, mode }).lean()
          : await UserSummary.findOne({ userId, year, month, mode }).lean();

      res.json(summary);
    } else {
      res.json("No transactions exist for " + `${month + 1}/${year}`);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user summary" });
  }
});

export default router;
