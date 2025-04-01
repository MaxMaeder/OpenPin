import { Center, Loader, Stack, Title } from "@mantine/core";

interface LoadingPlaceholderProps {
  message?: string;
};

const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({ message }) => (
  <Center flex={1}>
    <Stack align="center">
      <Loader color="white" size="xl" />
      {message && <Title order={2}>{message}</Title>}
    </Stack>
  </Center>
);

export default LoadingPlaceholder;