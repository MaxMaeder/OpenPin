import * as express from "express";

import { genCommonDevRes, handleCommonDevData } from "./voice/common";

import { ParsedAssistantRequest } from "./voice/parser";

export const handleUpdateStatus = async (
  req: ParsedAssistantRequest,
  res: express.Response
) => {
  try {
    const { deviceId } = req.metadata;

    const { deviceData, deviceSettings } = await handleCommonDevData(
      req,
      deviceId
    );

    const resData = await genCommonDevRes(deviceId, deviceData, deviceSettings);

    return res.send(Buffer.from(resData));
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error });
  }
};
