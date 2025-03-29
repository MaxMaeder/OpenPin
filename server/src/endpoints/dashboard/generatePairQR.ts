import { Request, Response } from "express";
import QRCode from "qrcode";

const STATIC_URL = 'https://example.com';

const generateQR = async (url: string) => {
  const qrDataUrl = await QRCode.toDataURL(url);

  // Remove the 'data:image/jpeg;base64,' prefix
  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

export const handleGeneratePairQR = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'image/png');
  console.log("HERE! QR CODE")
  res.send(await generateQR(STATIC_URL));
};