import express from "express";
import UserSummary from "../models/userSummaryModel.js";
import { answer } from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { question, year, month } = req.body;
    const userId = req.user.userId;

    const summary = await UserSummary.findOne({ userId, year, month }).lean();
    if (!summary) {
      return res.status(404).json({ error: "No summary for this month." });
    }

    const result = await answer(question, summary);
    return res.json({ answer: result.response.text() });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process question." });
  }
});

export default router;
