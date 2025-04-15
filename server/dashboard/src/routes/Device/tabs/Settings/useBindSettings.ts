import { ChangeEvent, useCallback } from "react";
import {
  DeviceSettings,
  selectSettingsById,
  updateSettingsById,
} from "src/state/slices/settingsSlice";
import { useAppDispatch, useAppSelector } from "src/state/hooks";

import _ from "lodash";
import { useSocket } from "src/comm/socket";
import { useDeviceId } from "src/util/useDeviceId";

const isChangeEvent = (value: any): value is ChangeEvent => {
  return (value as ChangeEvent).target !== undefined;
};

const useBindSettings = (_deviceId?: string) => {
  const dispatch = useAppDispatch();
  const { sendSettingsUpdate } = useSocket();

  let deviceId = useDeviceId();

  deviceId = deviceId ?? _deviceId;
  if (!deviceId) throw new Error("Need to select a device to bind settings!");

  const deviceSettings = useAppSelector((state) => selectSettingsById(state, deviceId));

  const updateRemoteSettings = useCallback(
    _.debounce(
      (settings: Partial<DeviceSettings>) => sendSettingsUpdate(deviceId, settings),
      1000,
      { trailing: true }
    ),
    [deviceId]
  );

  const bind = <K extends keyof DeviceSettings>(key: K) => {
    return {
      value: deviceSettings[key],
      onChange: (
        rawValue: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | DeviceSettings[K]
      ) => {
        let value = rawValue as DeviceSettings[K];

        if (isChangeEvent(rawValue)) {
          if (rawValue.target.type === "checkbox") {
            value = (rawValue.target as HTMLInputElement).checked as DeviceSettings[K];
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
