/* eslint-disable indent */
import { object, string } from "yup";
import { FunctionHandlerError, FunctionHandlerReturnType } from "..";
import { DeviceData, DeviceSettings } from "../../../dbTypes";

import { sendSettingsUpdate } from "../../../sockets";

type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

type ToggleSettingKeys = Exclude<BooleanKeys<DeviceSettings>, undefined>;

interface PayloadTransformationsType {
  [key: string]: (state: boolean) => boolean;
}

const payloadTransformations: PayloadTransformationsType = {
  on: () => true,
  off: () => false,
  toggle: (state) => !state,
};

const payloadSchema = object({
  transformation: string()
    .oneOf(Object.keys(payloadTransformations))
    .required(),
});

export const handleToggleSetting =
  (
    settingKey: ToggleSettingKeys,
    spokenName: string,
    stateVerbs: [string, string] // on, off
  ) =>
  async (
    payload: string,
    deviceId: string,
    deviceData: DeviceData,
    deviceSettings: DeviceSettings
  ): FunctionHandlerReturnType => {
    let transformationName: string;
    try {
      const parsedPayload = await payloadSchema.validate(JSON.parse(payload));
      transformationName = parsedPayload.transformation;
    } catch {
      throw new FunctionHandlerError(
        `Settings toggle command for ${spokenName} misformed.`
      );
    }

    const transformer = payloadTransformations[transformationName];
    deviceSettings[settingKey] = transformer(deviceSettings[settingKey]);

    const settingsUpdate: Partial<DeviceSettings> = {};
    settingsUpdate[settingKey] = deviceSettings[settingKey];

    sendSettingsUpdate(deviceId, settingsUpdate);

    let spokenVerb: string;
    if (deviceSettings[settingKey]) {
      spokenVerb = stateVerbs[0];
    } else {
      spokenVerb = stateVerbs[1];
    }

    const returnValue = JSON.stringify({
      result: `${spokenName} ${spokenVerb}`,
    });

    return {
      returnValue,
      audioComponents: [],
    };
  };
