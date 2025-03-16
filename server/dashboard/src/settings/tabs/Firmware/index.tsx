import { Grid, Input, Stack } from "@mantine/core";

import FileSelector from "./FileSelector";
import SettingsCol from "../../components/SettingsCol";
import ToggleButton from "../../components/ToggleButton";
import UploadForm from "./UploadForm";
import useBindSettings from "../../useBindSettings";

const Firmware = () => {
  const bind = useBindSettings();

  const { value: updateFiles } = useBindSettings()("uploadedFirmwareFiles");
  const { value: doFirmwareUpdate } = useBindSettings()("doFirmwareUpdate");

  return (
    <Grid>
      <SettingsCol>
        <UploadForm />
      </SettingsCol>
      <SettingsCol>
        <Stack align="start">
          <Input.Wrapper label="Step #2: Flash Uploaded Binary">
            <FileSelector
              disabled={doFirmwareUpdate}
              data={updateFiles}
              {...bind("firmwareUpdateFile")}
            />
          </Input.Wrapper>
          <ToggleButton
            inactiveLabel="Flash Firmware"
            activeLabel="Flashing Firmware"
            lockOn
            display="block"
            {...bind("doFirmwareUpdate")}
          />
        </Stack>
      </SettingsCol>
    </Grid>
  );
};

export default Firmware;
