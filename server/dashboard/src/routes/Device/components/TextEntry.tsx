import { Box, Button, Divider, Flex, Group, Text, Title } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { ReactNode } from "react";

interface TextEntryProps {
  title?: string;
  date: Date;
  children: ReactNode;
  onDelete: () => void;
}

const TextEntry: React.FC<TextEntryProps> = ({ title, date, children, onDelete }) => (
  <Box>
    <Flex w="100%" align="center" mb="sm">
      <Group gap="md" mr="md">
        {title && <Title order={2} size="sm">{title}</Title>}
        <Text>{date.toLocaleString()}</Text>
      </Group>
      <Box flex={1}>
        <Divider color="white" size="sm" />
      </Box>
      <Button
        variant="transparent"
        leftSection={<IconTrash size="1.25rem" />}
        onClick={onDelete}
      >
        Delete
      </Button>
    </Flex>
    {children}
  </Box>
);

export default TextEntry;