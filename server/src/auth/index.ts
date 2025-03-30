import { NextFunction, Request, Response } from "express";

import admin from "firebase-admin";
import { ExtendedError } from "socket.io/dist/namespace";
import { Socket } from "socket.io";
import createHttpError from "http-errors";

const extractAuthToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7); // Remove "Bearer "
  }

  const token = req.query.token;
  if (typeof token === "string" && token.trim() !== "") {
    return token;
  }

  return null;
};

export const authUserEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractAuthToken(req);

  if (!token) {
    throw createHttpError(401, "No token provided");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    return next();
  } catch (error: any) {
    throw createHttpError(401, "Unauthorized: " + error.message);
  }
};

// Middleware for Socket.io connections
export const authUserSocket = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.data.userId = decodedToken.uid;
    next();
  } catch (error: any) {
    return next(new Error("Authentication error: " + error.message));
  }
};
