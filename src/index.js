import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import setupPassport from "./config/passport.js";
import oauthRoutes from "./routes/oauthRoute.js";
import userRoutes from "./routes/userRoute.js";
import transactionRoute from "./routes/transactionRoute.js";
import { isAuthenticated } from "./controllers/oauthController.js";
import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";

dotenv.config();

const PORT = process.env.PORT || 5050;

connectDB(process.env.MONGODB_URL);

const app = express();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      collectionName: "sessions",
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
setupPassport(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/oauth", oauthRoutes);
app.use("/user", isAuthenticated, userRoutes);
app.use("/api/transactions", isAuthenticated, transactionRoute);


app.get("/", (req, res) => res.send("Backend is running!"));

export default app;
