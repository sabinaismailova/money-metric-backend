import jwt from "jsonwebtoken";

export const googleCallback = (req, res) => {
  const token = jwt.sign(
    { userId: req.user._id, email: req.user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
};

export const getProfile = (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  res.json(req.user);
};

export const logout = async (req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.redirect(process.env.FRONTEND_URL);
};

export const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      _id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ message: "Not authenticated" });
  }
};
