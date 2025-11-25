import express from "express";
import {
  addTransaction,
  getTransactions,
  getTransactionsByMonthYear,
  getYears
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/", addTransaction);
router.get("/", getTransactions);
router.get("/:month/:year", getTransactionsByMonthYear);
router.get("/years", getYears);
  

export default router;
