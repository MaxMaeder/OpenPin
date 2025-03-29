import { Request, Response } from "express";
import QRCode from "qrcode";
import { createPairCode } from "src/services/database/pairRequests";
import { noCacheRes } from "src/util/caching";

const generateQR = async (url: string) => {
  const qrDataUrl = await QRCode.toDataURL(url);

  // Remove the "data:image/jpeg;base64," prefix
  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
  return Buffer.from(base64Data, "base64");
}

export const handleGeneratePairQR = async (req: Request, res: Response) => {

  const pairCode = await createPairCode(req.userId);

  const baseUrl = process.env.HOSTED_BASE_URL as string;
  const pairingUrl = `${baseUrl}/api/dev/pair/${pairCode}`;

  res.setHeader("Content-Type", "image/png");
  noCacheRes(res);
  res.send(await generateQR(pairingUrl));
};