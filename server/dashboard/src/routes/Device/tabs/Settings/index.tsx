import { Input, Stack, TextInput } from "@mantine/core";
import TabContainer from "../../components/TabContainer";
import React from "react";
import useBindSettings from "./useBindSettings";
import { useDeviceId } from "src/util/useDeviceId";
import ToggleButton from "src/components/ToggleButton";
import { translateLanguages } from "src/assets/languages";
import AppTextarea from "src/routes/Device/tabs/Settings/components/Textarea";
import ContextWindowSlider from "./components/ContextWindowSlider";
import SectionCol from "./components/SectionColumn";
import Section from "./components/Section";
import Select from "src/components/Select";

const Settings: React.FC = () => {
  const bind = useBindSettings();
  const deviceId = useDeviceId();

  return (
    <TabContainer paper={true}>
      <Stack gap="xl">
        <Section title="General">
          <SectionCol>
            <TextInput
              label="Device Name"
              description={`Device ID: ${deviceId}`}
              {...bind("displayName")}
            />
          </SectionCol>
          <SectionCol>
            <Input.Wrapper label="Remotely Disable Device">
              <ToggleButton
                inactiveLabel="Disable Device"
                activeLabel="Reactivate Device"
                display="block"
                {...bind("deviceDisabled")}
              />
            </Input.Wrapper>
          </SectionCol>
        </Section>
        <Section title="Assistant">
          <SectionCol>
            <Select label="LLM/Provider" disabled value="None" onChange={() => { }} />
            <Input.Wrapper label="Messages for Context Window">
              <ContextWindowSlider {...bind("messagesToKeep")} />
            </Input.Wrapper>
            <Input.Wrapper label="Clear Conversation History">
              <ToggleButton
                inactiveLabel="Clear History"
                activeLabel="Clearing History"
                lockOn
                display="block"
                {...bind("clearMessages")}
              />
            </Input.Wrapper>
          </SectionCol>
          <SectionCol>
            <AppTextarea label="LLM Prompt" settingsKey="llmPrompt" />
            <AppTextarea label="Vision LLM Prompt" settingsKey="visionLlmPrompt" />
          </SectionCol>
        </Section>
        <Section title="Translate">
          <SectionCol>
            <Select
              label="My Language"
              data={translateLanguages}
              {...bind("myLanguage")}
            />
          </SectionCol>
          <SectionCol>
            <Select
              label="Language to Translate"
              data={translateLanguages}
              {...bind("translateLanguage")}
            />
          </SectionCol>
        </Section>
      </Stack>
    </TabContainer>
  );
};

export default Settings;
