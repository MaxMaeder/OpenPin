import {
  ActionIcon,
  AppShell,
  Flex,
  Group,
  Image,
  Select,
  Tooltip,
} from "@mantine/core";
import BaseLayout, { BaseLayoutProps } from "./BaseLayout";
import { IconLogout, IconSettings } from "@tabler/icons-react";
import {
  selectSelectedDevice,
  setSelectedDevice,
} from "../state/slices/devSelectSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";

import Logo from "../assets/logo.svg";
import Settings from "../settings";
import SocketError from "../comm/SocketError";
import { appConfirm } from "../modals";
import { logoutUser } from "../state/slices/userSlice";
import { selectDeviceNames } from "../state/slices/settingsSlice";
import { useDisclosure } from "@mantine/hooks";
import useIsMobile from "../util/useIsMobile";
import { useMemo } from "react";

const DashboardLayout = ({ children, ...props }: BaseLayoutProps) => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();

  const deviceNames = useAppSelector(selectDeviceNames);

  const selectorDevices = useMemo(
    () =>
      Object.entries(deviceNames).map(([id, name]) => ({
        value: id,
        label: name,
      })),
    [deviceNames]
  );
  const selectedDevice = useAppSelector(selectSelectedDevice);

  const [settingsOpened, { open: openSettings, close: closeSettings }] =
    useDisclosure(false);

  const handleDeviceSelected = (id: string | null) => {
    if (id) dispatch(setSelectedDevice(id));
  };

  const handleLogout = async () => {
    await appConfirm("Confirm Log Out", "Are you sure you want to log out?");

    dispatch(logoutUser());
  };

  return (
    <BaseLayout {...props}>
      <AppShell header={{ height: 60 }} h="100%">
        <AppShell.Header>
          <Flex h="100%" justify="space-between" px="xl">
            <Flex align="center">
              {!isMobile && <Image src={Logo} h="30px" pt={2} />}
            </Flex>
            <Flex align="center">
              <Group wrap="nowrap">
                <Select
                  w="200px"
                  allowDeselect={false}
                  withCheckIcon={false}
                  placeholder="Choose device..."
                  value={selectedDevice}
                  onChange={handleDeviceSelected}
                  data={selectorDevices}
                />
                <Tooltip label="Settings">
                  <ActionIcon
                    variant="transparent"
                    styles={{
                      root: {
                        backgroundColor: "transparent",
                      },
                    }}
                    size="lg"
                    disabled={!selectedDevice}
                    onClick={openSettings}
                  >
                    <IconSettings />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Log Out">
                  <ActionIcon
                    variant="transparent"
                    size="lg"
                    onClick={handleLogout}
                  >
                    <IconLogout />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Flex>
          </Flex>
        </AppShell.Header>
        <AppShell.Main id="dash-main" style={{ position: "relative" }} h="100%">
          <SocketError />
          {children}
          <Settings opened={settingsOpened} onClose={closeSettings} />
        </AppShell.Main>
      </AppShell>
    </BaseLayout>
  );
};

export default DashboardLayout;
