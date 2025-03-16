import { Group, Text } from "@mantine/core";

import { useMediaQuery } from "@mantine/hooks";

export interface TelemTableRow {
  name: string;
  value?: string;
}

interface TelemTableProps {
  rows: TelemTableRow[];
}

const TelemTableCol = ({ rows }: TelemTableProps) => {
  return (
    <table>
      {rows.map((row) => (
        <tr>
          <td>
            <Text c="dimmed" style={{ textAlign: "right" }} mr="md">
              {row.name}:
            </Text>
          </td>
          <td>
            <Text fw="bold" style={{ whiteSpace: "nowrap" }}>
              {row.value ? row.value : "N/A"}
            </Text>
          </td>
        </tr>
      ))}
    </table>
  );
};

const splitRows = (
  arr: TelemTableRow[]
): [TelemTableRow[], TelemTableRow[]] => {
  const middle = Math.ceil(arr.length / 2);
  const firstHalf = arr.slice(0, middle);
  const secondHalf = arr.slice(middle);
  return [firstHalf, secondHalf];
};

const TelemetryTable = ({ rows }: TelemTableProps) => {
  const twoCol = useMediaQuery("(min-width: 577px) and (max-width: 1050px)");

  let cols = [rows];
  if (twoCol) cols = splitRows(rows);

  return (
    <Group align="start" gap="xl">
      {cols.map((col) => (
        <TelemTableCol rows={col} />
      ))}
    </Group>
  );
};

export default TelemetryTable;
