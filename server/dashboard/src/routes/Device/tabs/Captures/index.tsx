import { Grid, Stack } from "@mantine/core";
import TabContainer from "../../components/TabContainer";
import { useAppDispatch, useAppSelector } from "src/state/hooks";
import { capturesSelectors } from "src/state/slices/capturesSlice";
import { useDeviceId } from "src/util/useDeviceId";
import { deleteCapture, fetchMoreCaptures } from "src/state/thunks/capturesThunks";
import { useSocket } from "src/comm/socket";
import FetchMoreButton from "../../components/FetchMoreButton";
import { openConfirmModal } from "src/modals";
import NoContentPlaceholder from "../../components/NoContentPlaceholder";
import MediaEntry from "../../components/MediaEntry";
import { IconGridDots } from "@tabler/icons-react";
import api from "src/comm/api";
import { useAuthToken } from "src/comm/AuthTokenProvider";

const Captures: React.FC = () => {
  const dispatch = useAppDispatch();
  const socket = useSocket();

  const { idToken } = useAuthToken();
  const deviceId = useDeviceId()!;

  const captures = useAppSelector((state) =>
    capturesSelectors.selectAllForDevice(state, deviceId)
  );
  const hasCaptures = captures.length != 0;
  const hasMore = useAppSelector((state) =>
    capturesSelectors.selectHasMoreForDevice(state, deviceId)
  );

  const handleFetchMore = () => {
    dispatch(fetchMoreCaptures(socket, deviceId));
  };

  const handleDelete = (captureId: string) => async () => {
    await openConfirmModal("Confirm delete", "Are you sure you want to delete this capture?");
    dispatch(deleteCapture(socket, deviceId, captureId));
  }

  return (
    <TabContainer paper={!hasCaptures}>
      {!hasCaptures ?
        (<NoContentPlaceholder Icon={IconGridDots} contentName="captures" />) :
        (
          <Stack gap="xl">
            <Grid>
              {captures.map((capture) => (
                <MediaEntry
                  key={capture.id}

                  id={capture.id}
                  date={capture.date}
                  type={capture.type}

                  src={api.getMediaDownloadUrl(idToken!, capture.mediaId)}
                  onDelete={handleDelete(capture.id)}
                />
              ))}
            </Grid>
            <FetchMoreButton disabled={!hasMore} onClick={handleFetchMore} />
          </Stack>
        )}
    </TabContainer>
  )
};

export default Captures;
