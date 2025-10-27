import express from "express";
import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  })
);

// Middleware
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/oauth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.get(
  "/oauth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/oauth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/profile`);
  }
);

app.get("/profile", (req, res) => {
  res.send(req.user);
  console.log("user: ", req.user);
});

app.get("/logout", (req, res) => {
  req.logOut(() => {
    res.redirect(`${process.env.FRONTEND_URL}`);
  });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
