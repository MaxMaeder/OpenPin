import { Button, Center, Loader, Paper, Stack, Text } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import api from "src/comm/api";
import { auth } from "src/comm/firebase";
import useAuthToken from "src/util/useAuthToken";

const PairModal = ({
  context,
  id,
}: ContextModalProps) => {
  const { idToken, loading, error } = useAuthToken(auth);

  return (
    <Stack gap="md">
      <Text size="sm">
        On your AI Pin running PrimaryApp, open settings, enter pairing mode, and scan the below QR code.
      </Text>

      {(!loading && idToken) ?
        (<Paper component="img" src={api.getPairQrUrl(idToken)} withBorder w="100%" />) :
        (<Paper withBorder w="100%" style={{ aspectRatio: 1 }}><Center h="100%"><Loader /></Center></Paper>)}

      {error && <Text c="red">{error.message}</Text>}
      <Button fullWidth onClick={() => context.closeModal(id)}>
        Cancel
      </Button>
    </Stack>
  );
};

export default PairModal;
