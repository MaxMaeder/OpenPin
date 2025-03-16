import { Center, Stack, Text, Title } from "@mantine/core";

import CameraView from "./CameraView";
import DashboardLayout from "../../layouts/DashboardLayout";
import DataLayout from "./DataLayout";
import LocationView from "./LocationView";
import TelemetryView from "./TelemetryView";
import { getMapZoom } from "../../util/zoomUtil";
import { selectDataById } from "../../state/slices/dataSlice";
import { selectSelectedDevice } from "../../state/slices/devSelectSlice";
import { selectSettingsById } from "../../state/slices/settingsSlice";
import { useAppSelector } from "../../state/hooks";

const DeviceRoute = () => {
  const deviceId = useAppSelector(selectSelectedDevice)!;
  const deviceData = useAppSelector((state) => selectDataById(state, deviceId));
  const deviceSettings = useAppSelector((state) =>
    selectSettingsById(state, deviceId)
  );

  return (
    <DashboardLayout title="Home">
      {!deviceId ? (
        <Center h="100%">
          <Stack align="center">
            <Title>No Device Selected</Title>
            <Text>Select from Top Right</Text>
          </Stack>
        </Center>
      ) : (
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
      )}
    </DashboardLayout>
  );
};

export default DeviceRoute;
