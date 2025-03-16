import { Grid, Stack } from "@mantine/core";

import { ReactNode } from "react";

interface SettingsColProps {
  children: ReactNode;
}

const SettingsCol = ({ children }: SettingsColProps) => (
  <Grid.Col span={{ xs: 12, sm: 6, lg: 4 }}>
    <Stack gap="lg">{children}</Stack>
  </Grid.Col>
);

export default SettingsCol;
