import {
  Button,
  Grid,
  Input,
  Select,
  Slider,
  Stack,
  TextInput,
} from "@mantine/core";

import AppTextarea from "../components/AppTextarea";
import SettingsCol from "../components/SettingsCol";
import ToggleButton from "../components/ToggleButton";
import useBindSettings from "../useBindSettings";
import { translateLanguages } from "../../assets/languages";

const Conversations = () => {
  const bind = useBindSettings();

  return (
    <Grid>
      <SettingsCol>
        <Stack gap="xl">
          <Input.Wrapper label="Messages for Context Window">
            <Slider
              name="msgsToKeep"
              label={null}
              marks={[
                { value: 0, label: "0" },
                { value: 10, label: "10" },
                { value: 20, label: "20" },
                { value: 30, label: "30" },
                { value: 40, label: "40" },
                { value: 50, label: "50" },
              ]}
              defaultValue={20}
              min={0}
              max={50}
              step={10}
              {...bind("messagesToKeep")}
            />
          </Input.Wrapper>
          <TextInput
            label="User SMS Number"
            description={"The number your assistant will use to contact you"}
            {...bind("userSmsNumber")}
          />
          <Select
            label="My Language"
            data={translateLanguages}
            {...bind("myLanguage")}
          />
          <Select
            label="Translate Language"
            data={translateLanguages}
            {...bind("translateLanguage")}
          />
        </Stack>
      </SettingsCol>
      <SettingsCol>
        <AppTextarea label="LLM Prompt" settingsKey="llmPrompt" />
        <AppTextarea label="Vision LLM Prompt" settingsKey="visionLlmPrompt" />
      </SettingsCol>
      <SettingsCol>
        <Input.Wrapper label="Clear Conversation History">
          <ToggleButton
            inactiveLabel="Clear History"
            activeLabel="Clearing History"
            lockOn
            display="block"
            {...bind("clearMessages")}
          />
        </Input.Wrapper>
        <Input.Wrapper label="View Conversation History">
          <Button display="block">View Messages</Button>
        </Input.Wrapper>
      </SettingsCol>
    </Grid>
  );
};

export default Conversations;
