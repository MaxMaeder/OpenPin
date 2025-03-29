import { Request, Response, NextFunction } from "express";

export const handleExpressErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // Optional logging

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
};