import { Center, Image, Stack, Text } from "@mantine/core";

import { IconPhoto } from "@tabler/icons-react";
import api from "src/comm/api";
import { auth } from "src/comm/firebase";
import useAuthToken from "src/util/useAuthToken";

interface CameraViewProps {
  imageName?: string;
}

const CameraView = ({ imageName }: CameraViewProps) => {
  const { idToken } = useAuthToken(auth);

  if (!imageName || !idToken) {
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
      src={api.getMediaDownloadUrl(idToken, imageName)}
    />
  );
};

export default CameraView;
