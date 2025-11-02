import express from "express";
import passport from "passport";
import {
  googleCallback,
  getProfile,
  logout,
} from "../controllers/oauthController.js";

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false}));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false}),
  googleCallback
);

router.get("/profile", getProfile);
router.get("/logout", logout);

export default router;
