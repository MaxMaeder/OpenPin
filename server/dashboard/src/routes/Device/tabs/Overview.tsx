import { useAppSelector } from "../../../state/hooks";
import { selectDataById } from "../../../state/slices/dataSlice";
import { selectSettingsById } from "../../../state/slices/settingsSlice";
import { getMapZoom } from "../../../util/zoomUtil";
import CameraView from "../CameraView";
import DataLayout from "../DataLayout";
import TelemetryView from "../TelemetryView";
import LocationView from "../LocationView";
import { useDeviceId } from "../../../util/useDeviceId";

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
