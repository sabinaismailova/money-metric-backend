import express from "express";
import { computeSummary } from "../controllers/userSummaryController.js";
import UserSummary from "../models/userSummaryModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.user.userId;
    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);
    const mode = req.query.mode

    if (!year || !month) {
      return res.status(400).json({ error: "Year is required" });
    }

    await computeSummary(userId, year, month, mode);

    const summary = mode=="yearly"? await UserSummary.findOne({ userId, year, mode}).lean(): await UserSummary.findOne({ userId, year, month, mode}).lean();

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user summary" });
  }
});

export default router;
