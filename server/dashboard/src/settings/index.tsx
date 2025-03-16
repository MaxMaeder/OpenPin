import { Drawer, Group, Tabs, Title, rem } from "@mantine/core";

import tabs from "./tabs";
import useIsMobile from "../util/useIsMobile";

interface SettingsProps {
  opened: boolean;
  onClose: () => void;
}

const Settings = ({ opened, onClose }: SettingsProps) => {
  const isMobile = useIsMobile();
  const iconStyle = { width: rem(18), height: rem(18) };

  return (
    <Drawer.Root
      opened={opened}
      onClose={onClose}
      offset={8}
      radius="md"
      size={isMobile ? "85%" : "40%"}
      position="bottom"
    >
      <Drawer.Overlay />
      <Drawer.Content>
        <Tabs defaultValue="general" variant="pills">
          <Drawer.Header style={{ alignItems: "start" }}>
            <Group>
              <Title order={3} mr="xl">
                Settings
              </Title>
              <Tabs.List>
                {tabs.map((tab) => (
                  <Tabs.Tab
                    key={tab.id}
                    value={tab.id}
                    leftSection={<tab.icon style={iconStyle} />}
                  >
                    {tab.title}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Group>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body mb="md" style={{ overflowX: "hidden" }}>
            {tabs.map((tab) => (
              <Tabs.Panel key={tab.id} value={tab.id}>
                {<tab.content />}
              </Tabs.Panel>
            ))}
          </Drawer.Body>
        </Tabs>
      </Drawer.Content>
    </Drawer.Root>
  );
};

export default Settings;
