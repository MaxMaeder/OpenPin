import { ActionIcon, Group, Table, Text } from "@mantine/core";
import { IconEye, IconEyeOff, IconTrash } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";

import { WifiNetwork } from "../../../state/slices/settingsSlice";

interface NetworkTableProps {
  onRemove: (index: number) => () => Promise<void>;
  wifiNetworks: WifiNetwork[];
}

const NetworkTable = ({ onRemove, wifiNetworks }: NetworkTableProps) => {
  const [shownPass, setShownPass] = useState<number | null>(null);

  const handleTogglePassVis = useCallback(
    (index: number) => () => {
      if (index == shownPass) setShownPass(null);
      else setShownPass(index);
    },
    [shownPass]
  );

  const wifiRows = useMemo(
    () =>
      wifiNetworks.map((network, i) => (
        <Table.Tr key={i}>
          <Table.Td>{network.ssid}</Table.Td>
          <Table.Td>
            {network.password && (
              <Group gap="xs">
                <Text fz="sm">
                  {shownPass === i
                    ? network.password
                    : network.password.replace(/./g, "•")}
                </Text>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={handleTogglePassVis(i)}
                >
                  {shownPass === i ? (
                    <IconEyeOff height={20} />
                  ) : (
                    <IconEye height={20} />
                  )}
                </ActionIcon>
              </Group>
            )}
          </Table.Td>
          <Table.Td
            style={{ width: 1, whiteSpace: "nowrap", textAlign: "center" }}
          >
            <ActionIcon variant="subtle" color="gray" onClick={onRemove(i)}>
              <IconTrash height={20} />
            </ActionIcon>
          </Table.Td>
        </Table.Tr>
      )),
    [wifiNetworks, shownPass]
  );

  return (
    <Table striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>SSID</Table.Th>
          <Table.Th>Password</Table.Th>
          <Table.Th>Delete</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{wifiRows}</Table.Tbody>
    </Table>
  );
};

export default NetworkTable;
