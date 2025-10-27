import "express";

declare global {
  namespace Express {
    interface User {
      displayName?: string;
      emails?: { value: string }[];
      photos?: { value: string }[];
    }

    interface Request {
      user?: User;
    }
  }
}
