import { Flex, Stack, Text, Title } from "@mantine/core";
import TelemetryTable, { TelemTableRow } from "./TelemertryTable";
import { formatBattery, formatCoords, formatDate } from "src/util/format";

import { DeviceData } from "src/state/slices/dataSlice";
import { DeviceSettings } from "src/state/slices/settingsSlice";
// import { IconCamera } from "@tabler/icons-react";
// import ToggleButton from "../../../settings/components/ToggleButton";
// import useBindSettings from "../../../settings/useBindSettings";

interface TelemetryViewProps {
  data: DeviceData;
  settings: DeviceSettings;
}

const TelemetryView = ({ data, settings }: TelemetryViewProps) => {
  // const bind = useBindSettings();
  const [lat, lng] = formatCoords(data.latitude, data.longitude);

  const telemData: TelemTableRow[] = [
    {
      name: "Ping",
      value: formatDate(data.lastConnected),
    },
    {
      name: "Img",
      value:
        (data.latestImageCaptured && formatDate(data.latestImageCaptured)) ||
        undefined,
    },
    {
      name: "Batt",
      value: formatBattery(data.battery),
    },
    {
      name: "Lat",
      value: lat,
    },
    {
      name: "Lng",
      value: lng,
    },
  ];

  return (
    <Stack align="center" p="md">
      <Flex direction="column" align="center">
        <Title>{settings.displayName}</Title>
        <Text size="sm" c="dimmed" ta="center">
          {settings.id}
        </Text>
      </Flex>
      <TelemetryTable rows={telemData} />
      {/* <ToggleButton
        inactiveLabel="Capture Image"
        activeLabel="Cancel Capture"
        display="block"
        leftSection={<IconCamera size={14} />}
        {...bind("captureImage")}
      /> */}
    </Stack>
  );
};

export default TelemetryView;
