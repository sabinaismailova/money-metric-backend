import express from "express";
import {
  addTransaction,
  getTransactions,
  getTransactionsByMonthYear
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/", addTransaction);
router.get("/", getTransactions);
router.get("/:month/:year", getTransactionsByMonthYear);

export default router;
