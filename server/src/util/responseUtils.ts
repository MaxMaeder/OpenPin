import { NextFunction, Request, Response } from "express";

export const addResponseUtils = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.apiOk = (status: string) => {
    res.status(200).send({ status });
  };

  res.apiError = (code: number, error: string) => {
    res.status(code).send({ error });
  };

  next();
};
