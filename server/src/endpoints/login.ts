import * as express from "express";

import { ValidationError, object, string } from "yup";

import { authUser } from "../auth/users";
import { genJwt } from "../auth/jwt";
import rateLimit from "express-rate-limit";

export const limitLogin = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 7, // Limit each IP to 7 requests per `window`
});

export const parseLogin = express.json({ type: () => true });

export const handleLogin = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const loginSchema = object({
      username: string().required(),
      password: string().required(),
    });

    const loginReq = await loginSchema.validate(req.body, { strict: true });

    const user = authUser(loginReq.username, loginReq.password);

    if (!user) {
      return res.apiError(401, "Incorrect credentials.");
    }

    res.json({
      token: genJwt(user.username),
    });
  } catch (error) {
    const statusCode = error instanceof ValidationError ? 400 : 500;
    return res.apiError(statusCode, (error as Error).message);
  }
};
