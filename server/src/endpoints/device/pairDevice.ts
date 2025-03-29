import { Request, Response } from "express";
import createHttpError from "http-errors";
import { PairRequest } from "src/dbTypes";
import { usePairCode } from "src/services/database/pairRequests";
import { addUserDevice } from "src/services/database/userData";
import { v4 as uuidv4 } from "uuid";

export const handlePairDevice = async (req: Request, res: Response) => {
  const pairCode = req.params.pairCode;

  let pairRequest: PairRequest;
  try {
    pairRequest = await usePairCode(pairCode);
  } catch (error) {
    throw createHttpError(404, "Pair code does not exist");
  }

  const userId = pairRequest.userId;
  const deviceId = uuidv4();

  await addUserDevice(userId, deviceId);

  return res.status(200).send({
    deviceId
  });
}