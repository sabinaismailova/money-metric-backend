export const googleCallback = (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
};

export const getProfile = (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  res.json(req.user);
};

export const logout = async (req, res, next) => {
  try {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect(`${process.env.FRONTEND_URL}`);
      });
    });
  } catch (err) {
    next(err);
  }
};

export const isAuthenticated = (req, res, next) => {
  if (req.user) return next();
  res.status(401).json({ message: "Not authenticated" });
};
