import { Grid, Group, Input, Text, TextInput } from "@mantine/core";

import AppCheckbox from "../components/AppCheckbox";
import PercentageSlider from "../components/PercentageSlider";
import SettingsCol from "../components/SettingsCol";
import ToggleButton from "../components/ToggleButton";
import UpdateFreqSlider from "../components/UpdateFreqSlider";
import useBindSettings from "../useBindSettings";
import { useDeviceId } from "../../util/useDeviceId";

const General = () => {
  const bind = useBindSettings();
  const deviceId = useDeviceId();

  return (
    <Grid>
      <SettingsCol>
        <TextInput
          label="Device Name"
          description={`Device ID: ${deviceId}`}
          {...bind("displayName")}
        />
        <Input.Wrapper label="Remotely Disable Device">
          <ToggleButton
            inactiveLabel="Disable Device"
            activeLabel="Reactivate Device"
            display="block"
            {...bind("deviceDisabled")}
          />
        </Input.Wrapper>
        <TextInput
          label="Hologram SIM ID"
          description="If specified, used to determine approx. location"
          {...bind("hologramId")}
        />
      </SettingsCol>
      <SettingsCol>
        <Input.Wrapper label="Update Freq.">
          <UpdateFreqSlider {...bind("updateFreq")} />
        </Input.Wrapper>
        <Input.Wrapper label="<20% Batt. Update Freq.">
          <UpdateFreqSlider {...bind("lowBattUpdateFreq")} />
        </Input.Wrapper>
        <Text c="dimmed" mt="xs" size="sm">
          How often the device 'calls home' to transmit telemetry and check if
          settings are updated.
        </Text>
      </SettingsCol>
      <SettingsCol>
        <Input.Wrapper label="'On' Light Brightness">
          <PercentageSlider {...bind("lightLevel")} />
        </Input.Wrapper>
        <Input.Wrapper label="Speaker Volume">
          <PercentageSlider {...bind("speakerVol")} />
        </Input.Wrapper>
        <Input.Wrapper label="Connectivity">
          <Group mt="xs">
            <AppCheckbox label="GPS/GNSS" {...bind("enableGnss")} />
            <AppCheckbox label="WiFi" {...bind("enableWifi")} />
            <AppCheckbox label="Bluetooth" {...bind("enableBluetooth")} />
          </Group>
        </Input.Wrapper>
      </SettingsCol>
    </Grid>
  );
};

export default General;
