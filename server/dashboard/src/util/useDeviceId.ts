import { useParams } from "react-router-dom";

export const useDeviceId = (): string | undefined => {
  const { deviceId } = useParams<{ deviceId: string }>();
  return deviceId;
};
