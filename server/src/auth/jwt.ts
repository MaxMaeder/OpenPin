import { DashUser, getUser } from "./users";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { NextFunction, Request, Response } from "express";

import { ExtendedError } from "socket.io/dist/namespace";
import JWT_KEY from "../keys/jwtKey";
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import passport from "passport";

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    ExtractJwt.fromUrlQueryParameter("token"),
  ]),
  secretOrKey: JWT_KEY,
};

passport.use(
  new JwtStrategy(options, (jwtPayload, done) => {
    done(null, getUser(jwtPayload.sub));
  })
);

const authJwtEndpoint = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (_: unknown, user: DashUser) => {
      if (!user) {
        return res.apiError(401, "Not authenticated.");
      }

      req.user = user;
      return next();
    }
  )(req, res, next);
};

const authJwtSocket = (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, JWT_KEY, (err: jwt.VerifyErrors | null) => {
    if (err) return next(new Error("Authentication error"));
    next();
  });
};

const genJwt = (username: string): string => {
  return jwt.sign({ sub: username }, JWT_KEY, { expiresIn: "1d" });
};

export { passport, authJwtEndpoint, authJwtSocket, genJwt };
