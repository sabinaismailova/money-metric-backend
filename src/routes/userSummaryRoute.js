import express from "express";
import { computeMonthlySummary } from "../controllers/userSummaryController.js";
import UserSummary from "../models/userSummaryModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);

    if (!year || !month) {
      return res.status(400).json({ error: "Year and month are required" });
    }

    await computeMonthlySummary(userId, year, month);

    const summary = await UserSummary.findOne({ userId, year, month }).lean();

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user summary" });
  }
});

export default router;
