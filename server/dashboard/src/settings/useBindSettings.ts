import { ChangeEvent, useCallback } from "react";
import {
  DeviceSettings,
  selectSettingsById,
  updateSettingsById,
} from "../state/slices/settingsSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";

import _ from "lodash";
import { selectSelectedDevice } from "../state/slices/devSelectSlice";
import { useSocket } from "../comm/socket";

const isChangeEvent = (value: any): value is ChangeEvent => {
  return (value as ChangeEvent).target !== undefined;
};

const useBindSettings = () => {
  const dispatch = useAppDispatch();
  const { sendSettingsUpdate } = useSocket();

  // Return dummy binding if no device id
  const deviceId = useAppSelector(selectSelectedDevice);
  if (!deviceId) throw new Error("Need to select a device to bind settings!");

  const deviceSettings = useAppSelector((state) =>
    selectSettingsById(state, deviceId)
  );

  const updateRemoteSettings = useCallback(
    _.debounce(
      (settings: Partial<DeviceSettings>) => sendSettingsUpdate(settings),
      1000
    ),
    [deviceSettings]
  );

  const bind = <K extends keyof DeviceSettings>(key: K) => {
    return {
      value: deviceSettings[key],
      onChange: (
        rawValue:
          | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          | DeviceSettings[K]
      ) => {
        let value = rawValue as DeviceSettings[K];

        if (isChangeEvent(rawValue)) {
          if (rawValue.target.type === "checkbox") {
            value = (rawValue.target as HTMLInputElement)
              .checked as DeviceSettings[K];
          } else {
            value = rawValue.target.value as DeviceSettings[K];
          }
        }

        const changes: Partial<DeviceSettings> = {};
        changes[key] = value;

        dispatch(
          updateSettingsById({
            id: deviceId,
            changes,
          })
        );
        updateRemoteSettings(changes);
      },
    };
  };

  return bind;
};

export default useBindSettings;
