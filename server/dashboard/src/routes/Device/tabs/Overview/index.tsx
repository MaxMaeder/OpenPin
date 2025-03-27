import { useAppSelector } from "src/state/hooks";
import { selectDataById } from "src/state/slices/dataSlice";
import { selectSettingsById } from "src/state/slices/settingsSlice";
import { getMapZoom } from "src/util/zoomUtil";
import CameraView from "./CameraView";
import DataLayout from "./DataLayout";
import TelemetryView from "./TelemetryView";
import LocationView from "./LocationView";
import { useDeviceId } from "src/util/useDeviceId";

const Overview = () => {
  const deviceId = useDeviceId()!;

  const deviceData = useAppSelector((state) => selectDataById(state, deviceId));
  const deviceSettings = useAppSelector((state) =>
    selectSettingsById(state, deviceId)
  );

  return (
    <DataLayout
      leftSection={<CameraView imageName={deviceData.latestImage} />}
      middleSection={
        <TelemetryView data={deviceData} settings={deviceSettings} />
      }
      rightSection={
        <LocationView
          lat={deviceData.latitude}
          lng={deviceData.longitude}
          zoom={getMapZoom(deviceData.locationCertainty)}
        />
      }
    />
  );
};

export default Overview;
