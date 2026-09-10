import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

export const requireAuth: RequestHandler = (req, res, next) => {
  const auth = getAuth(req);
  const userId =
    typeof auth?.sessionClaims?.userId === "string"
      ? auth.sessionClaims.userId
      : auth?.userId;

  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  (req as typeof req & { userId: string }).userId = userId;
  next();
};