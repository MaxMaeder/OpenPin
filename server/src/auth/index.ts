import { NextFunction, Request, Response } from "express";

import admin from "firebase-admin";
import { ExtendedError } from "socket.io/dist/namespace";
import { Socket } from "socket.io";

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
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log(decodedToken);
    // Optionally, attach decoded token info (including uid, email, etc.) to the request object.
    //req.user = decodedToken;
    return next();
  } catch (error: any) {
    return res.status(401).json({ error: "Unauthorized: " + error.message });
  }
};

// Middleware for Socket.io connections
export const authUserSocket = async (
  socket: Socket,
  next: (err?: ExtendedError) => void
) => {
  // next();
  // return;
  console.log(JSON.stringify(socket.handshake.auth));
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // Store the decoded token in socket.data for later use
    console.log("DID AUTH", decodedToken);
    // socket.data.user = decodedToken;
    next();
  } catch (error: any) {
    return next(new Error("Authentication error: " + error.message));
  }
};
