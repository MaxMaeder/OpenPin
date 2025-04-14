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
import VoiceSpeedSlider from "./components/VoiceSpeedSlider";
import VolumeBoostSlider from "./components/VolumeBoostSlider";
import { assistantVoices } from "src/assets/voices";
import { useModelsForInterface } from "./useModelsForInterface";

const Settings: React.FC = () => {
  const bind = useBindSettings();
  const deviceId = useDeviceId();

  const textModels = useModelsForInterface({ supportText: true });
  const visionModels = useModelsForInterface({ supportVision: true });

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
                disabled
                {...bind("deviceDisabled")}
              />
            </Input.Wrapper>
          </SectionCol>
        </Section>
        <Section title="Assistant">
          <SectionCol>
            <Select
              label="Language Model"
              data={textModels}
              {...bind("llmName")}
            />
            <Select
              label="Vision Language Model"
              data={visionModels}
              {...bind("visionLlmName")}
            />
            <Input.Wrapper label="Messages for Context Window">
              <ContextWindowSlider {...bind("messagesToKeep")} />
            </Input.Wrapper>
          </SectionCol>
          <SectionCol>
            <AppTextarea label="LLM Prompt" settingsKey="llmPrompt" />
            <AppTextarea label="Vision LLM Prompt" settingsKey="visionLlmPrompt" />
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
        </Section>
        <Section title="Translate">
          <SectionCol>
            <Select
              label="My Language"
              data={translateLanguages}
              {...bind("myLanguage")}
            />
            <Input.Wrapper
              label="Volume Boost"
              description="Volume can be boosted so the other speaker can hear more clearly"
            >
              <VolumeBoostSlider mt="0.25rem" {...bind("translateVolumeBoost")} />
            </Input.Wrapper>
          </SectionCol>
          <SectionCol>
            <Select
              label="Language to Translate"
              data={translateLanguages}
              {...bind("translateLanguage")}
            />
          </SectionCol>
        </Section>
        <Section title="Voice">
          <SectionCol>
            <Select
              label="Voice Name"
              data={assistantVoices}
              {...bind("voiceName")}
            />
          </SectionCol>
          <SectionCol>
            <Input.Wrapper label="Voice Speed">
              <VoiceSpeedSlider {...bind("voiceSpeed")} />
            </Input.Wrapper>
          </SectionCol>
        </Section>
      </Stack>
    </TabContainer>
  );
};

export default Settings;
