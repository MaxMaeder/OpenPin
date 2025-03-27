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
import { IconLogout } from "@tabler/icons-react";
import { useAppSelector } from "../state/hooks";

import Logo from "../assets/logo.svg";
import SocketError from "../comm/SocketError";
import { appConfirm } from "../modals";
import { selectDeviceNames } from "../state/slices/settingsSlice";
import useIsMobile from "../util/useIsMobile";
import { useMemo } from "react";
import { auth } from "../comm/firebase";
import { useSignOut } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { useDeviceId } from "../util/useDeviceId";

const DashboardLayout = ({ children, ...props }: BaseLayoutProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [signOut] = useSignOut(auth);

  const deviceNames = useAppSelector(selectDeviceNames);

  const selectorDevices = useMemo(
    () =>
      Object.entries(deviceNames).map(([id, name]) => ({
        value: id,
        label: name,
      })),
    [deviceNames]
  );
  const selectedDevice = useDeviceId();

  const handleDeviceSelected = (id: string | null) => {
    if (id) navigate(`/${id}/overview`);
  };

  const handleLogout = async () => {
    await appConfirm("Confirm Log Out", "Are you sure you want to log out?");

    signOut();
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
        </AppShell.Main>
      </AppShell>
    </BaseLayout>
  );
};

export default DashboardLayout;
