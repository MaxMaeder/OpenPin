import * as enforce from "express-sslify";

import { NextFunction, Request, Response } from "express";

const upgradeHttp = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line new-cap
    enforce.HTTPS({ trustProtoHeader: true })(req, res, next);
  } else {
    next();
  }
};

export default upgradeHttp;
