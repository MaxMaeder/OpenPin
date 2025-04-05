import { Request, Response } from "express";
import createHttpError from "http-errors";
import { PairRequest } from "src/dbTypes";
import { createDevice } from "src/services/database/device/list";
import { usePairCode } from "src/services/database/pairRequests";
import { addUserDevice } from "src/services/database/userData";
import { sendNewDevDetails } from "src/sockets/msgProducers/devAdded";
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

  await createDevice(deviceId);
  
  await addUserDevice(userId, deviceId);
  await sendNewDevDetails(userId, deviceId);

  const baseUrl = process.env.HOSTED_BASE_URL as string;
  return res.status(200).send({
    baseUrl,
    deviceId
  });
}