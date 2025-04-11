import { Button, Center, Loader, Paper, Stack, Text } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "src/comm/api";
import { useAuthToken } from "src/comm/AuthTokenProvider";
import { selectDeviceIds } from "src/state/slices/settingsSlice";
import { useOnItemAdded } from "src/util/useOnItemAdded";

const PairModal = ({
  context,
  id,
}: ContextModalProps) => {
  const navigate = useNavigate();

  const { idToken, loading, error } = useAuthToken();
  const deviceIds = useSelector(selectDeviceIds);

  useOnItemAdded(deviceIds, (newIds) => {
    navigate(`/${newIds[0]}`)
  });

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
