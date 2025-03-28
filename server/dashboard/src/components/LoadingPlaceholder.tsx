import { Center, Loader } from "@mantine/core";

const LoadingPlaceholder: React.FC = () => (
  <Center h="100%" w="100%">
    <Loader />
  </Center>
);

export default LoadingPlaceholder;