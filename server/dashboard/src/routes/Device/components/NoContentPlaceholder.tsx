import { Center, Stack, Title } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import React from "react";

interface NoContentPlaceholderProps {
  Icon: Icon;
  contentName: string;
}

const NoContentPlaceholder: React.FC<NoContentPlaceholderProps> = ({ Icon, contentName }) => (
  <Center h="100%">
    <Stack align="center">
      <Icon size="2rem" />
      <Title order={3} size="xl">No {contentName} yet.</Title>
    </Stack>
  </Center>
);

export default NoContentPlaceholder;
