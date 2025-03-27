import { Center, Image, Stack, Text } from "@mantine/core";

import { IconPhoto } from "@tabler/icons-react";
import api from "../../comm/api";

interface CameraViewProps {
  imageName?: string;
}

const CameraView = ({ imageName }: CameraViewProps) => {
  if (!imageName) {
    return (
      <Center h="100%">
        <Stack align="center" gap="xs">
          <IconPhoto size={30} />
          <Text size="xl">No Image</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Image
      radius="3px"
      h="100%"
      fit="cover"
      src={api.getMediaDownloadUrl(imageName)}
    />
  );
};

export default CameraView;
