import { AuthProvider } from "./AuthProvider";
import { User } from "./types";
import { RequestHandler } from "express";
import { Socket } from "socket.io";
import cookie from "cookie";

export interface AuthService extends AuthProvider {
  /** Express middleware that attaches `req.user` or returns 401 */
  authUserEndpoint: RequestHandler;
  /** Socket.io middleware that attaches `socket.user` or errors */
  authUserSocket: (socket: Socket, next: (err?: Error) => void) => void;
}

export const composeAuthService = (provider: AuthProvider): AuthService => {
  // Express middleware
  const authUserEndpoint: RequestHandler = async (req, res, next) => {
    try {
      const token = (req.cookies || ({} as any)).session;
      console.log(token);
      if (!token) return res.sendStatus(401);
      req.user = await provider.verify(token);
      return next();
    } catch {
      return res.sendStatus(401);
    }
  };

  // Socket.io middleware
  const authUserSocket = (socket: Socket & { user?: User }, next: (err?: Error) => void) => {
    try {
      const rawCookie = socket.request.headers.cookie;
      if (!rawCookie) return next(new Error("UNAUTHORIZED"));
      const { session } = cookie.parse(rawCookie);
      if (!session) return next(new Error("UNAUTHORIZED"));
      provider
        .verify(session)
        .then((u) => {
          socket.user = u;
          next();
        })
        .catch(() => next(new Error("UNAUTHORIZED")));
    } catch (err) {
      next(err as Error);
    }
  };

  return Object.assign(provider, { authUserEndpoint, authUserSocket });
};
