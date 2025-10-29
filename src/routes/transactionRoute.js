import express from "express";
import {
  addTransaction,
  getTransactions,
} from "../controllers/transactionController.js";
import { isAuthenticated } from "../controllers/oauthController.js";

const router = express.Router();

router.post("/", isAuthenticated, addTransaction);
router.get("/", isAuthenticated, getTransactions);

export default router;
