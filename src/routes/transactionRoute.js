import express from "express";
import {
  addTransaction,
  getTransactions,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/", addTransaction);
router.get("/", getTransactions);

export default router;
