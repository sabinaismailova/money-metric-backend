import express from "express";
import {
  getTransactionTypeColors,
  updateTransactionTypeColors,
  sync,
} from "../controllers/transactionTypeColorsController.js";

const router = express.Router();

router.post("/sync", sync)
router.put("/update", updateTransactionTypeColors);
router.get("/", getTransactionTypeColors);

export default router;