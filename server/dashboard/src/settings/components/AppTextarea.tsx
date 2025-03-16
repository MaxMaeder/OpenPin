import { ActionIcon, Stack, Textarea, TextareaProps, rem } from "@mantine/core";
import { IconArrowsDiagonal, IconMinimize } from "@tabler/icons-react";

import { DeviceSettings } from "../../state/slices/settingsSlice";
import { modals } from "@mantine/modals";
import useBindSettings from "../useBindSettings";

type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type TextareaSettingsKey = Exclude<StringKeys<DeviceSettings>, undefined>;

interface ModalContentProps {
  settingsKey: TextareaSettingsKey;
}

const ModalContent = ({ settingsKey }: ModalContentProps) => {
  const bind = useBindSettings();

  const style = {
    width: "80vw",
    maxWidth: "1000px",
  };

  return <Textarea style={style} autosize {...bind(settingsKey)} />;
};

interface AppTextareaProps extends Omit<TextareaProps, "value" | "onChange"> {
  settingsKey: TextareaSettingsKey;
}

const AppTextarea = ({ label, settingsKey, ...props }: AppTextareaProps) => {
  const bind = useBindSettings();

  const handleExpand = () => {
    modals.open({
      title: label,
      size: "auto",
      closeButtonProps: {
        icon: <IconMinimize stroke={1.5} />,
      },
      children: <ModalContent settingsKey={settingsKey} />,
    });
  };

  const ExpandIcon = () => (
    <Stack justify="flex-start" h="100%" pt={4}>
      <ActionIcon variant="transparent" color="white" onClick={handleExpand}>
        <IconArrowsDiagonal
          style={{ width: rem(18), height: rem(18) }}
          stroke={1.5}
        />
      </ActionIcon>
    </Stack>
  );

  return (
    <Textarea
      label={label}
      rightSection={<ExpandIcon />}
      {...bind(settingsKey)}
      {...props}
    />
  );
};

export default AppTextarea;
