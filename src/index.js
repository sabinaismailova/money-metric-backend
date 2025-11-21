import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import setupPassport from "./config/passport.js";
import oauthRoutes from "./routes/oauthRoute.js";
import userRoutes from "./routes/userRoute.js";
import transactionRoute from "./routes/transactionRoute.js";
import { isAuthenticated } from "./controllers/oauthController.js";
import { processRecurringTransactions } from "./controllers/transactionController.js";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";
import userSummaryRoutes from "./routes/userSummaryRoute.js";
import chatbotRoutes from "./routes/chatbotRoute.js";

dotenv.config();

const PORT = process.env.PORT || 5050;
const app = express();

connectDB(process.env.MONGODB_URL).catch((err) =>
  console.error("MongoDB connection failed:", err)
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(passport.initialize());
setupPassport(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/oauth", oauthRoutes);
app.use("/user", isAuthenticated, userRoutes);
app.use("/api/transactions", isAuthenticated, transactionRoute);

app.post("/api/processRecurringTransactions", processRecurringTransactions);
app.use("/api/user-summary", isAuthenticated, userSummaryRoutes);
app.use("/api/chatbot", isAuthenticated, chatbotRoutes);
app.get("/", (req, res) => res.send("Backend is running!"));

export default app;
