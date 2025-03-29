import { Center, Stack, Text, Title } from "@mantine/core";
import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

const SelectDevice: React.FC = () => (
  <DashboardLayout title="Select">
    <Center flex={1}>
      <Stack align="center">
        <Title>No Device Selected</Title>
        <Text>Select from Top Right</Text>
      </Stack>
    </Center>
  </DashboardLayout>
);

export default SelectDevice;
