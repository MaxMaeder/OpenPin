import { Grid, Stack } from "@mantine/core";
import React, { ReactNode } from "react";

interface SectionColProps {
  children: ReactNode;
}

const SectionCol: React.FC<SectionColProps> = ({ children }) => (
  <Grid.Col span={{ xs: 12, sm: 6 }}>
    <Stack gap="lg">{children}</Stack>
  </Grid.Col>
);

export default SectionCol;
