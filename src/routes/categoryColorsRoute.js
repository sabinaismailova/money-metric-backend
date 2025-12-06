import express from "express";
import {
  getCategoryColors,
  updateCategoryColors,
  sync,
} from "../controllers/categoryColorsController.js";

const router = express.Router();

router.post("/sync", sync)
router.put("/update", updateCategoryColors);
router.get("/", getCategoryColors);

export default router;
