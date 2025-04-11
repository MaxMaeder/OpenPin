import { Response } from "express";

export const noCacheRes = (res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
}

export const foreverCacheRes = (res: Response) => {
  const oneYearInSeconds = 31536000;
  res.setHeader('Cache-Control', `public, max-age=${oneYearInSeconds}, immutable`);
  res.setHeader('Expires', new Date(Date.now() + oneYearInSeconds * 1000).toUTCString());
}
