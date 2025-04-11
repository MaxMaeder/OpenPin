import { Center, Stack, Text, Title } from "@mantine/core";
import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

const SelectDevice: React.FC = () => (
  <DashboardLayout title="Select">
    <Center flex={1}>
      <Stack align="center">
        <Title>Select A Device</Title>
        <Text>Select or add a device from the top right.</Text>
      </Stack>
    </Center>
  </DashboardLayout>
);

export default SelectDevice;
