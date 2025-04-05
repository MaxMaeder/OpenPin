import { Stack } from "@mantine/core";
import TabContainer from "../../components/TabContainer";
import { useAppDispatch, useAppSelector } from "src/state/hooks";
import { msgsSelectors } from "src/state/slices/msgsSlice";
import { useDeviceId } from "src/util/useDeviceId";
import { deleteMsg, fetchMoreMsgs } from "src/state/thunks/msgsThunks";
import { useSocket } from "src/comm/socket";
import FetchMoreButton from "../../components/FetchMoreButton";
import { openConfirmModal } from "src/modals";
import NoContentPlaceholder from "../../components/NoContentPlaceholder";
import MessageEntry from "./MessageEntry";
import { IconList } from "@tabler/icons-react";
import api from "src/comm/api";
import { useAuthToken } from "src/comm/AuthTokenProvider";

const Messages: React.FC = () => {
  const dispatch = useAppDispatch();
  const socket = useSocket();

  const { idToken } = useAuthToken();
  const deviceId = useDeviceId()!;

  const messages = useAppSelector((state) =>
    msgsSelectors.selectAllForDevice(state, deviceId)
  );
  const hasMore = useAppSelector((state) =>
    msgsSelectors.selectHasMoreForDevice(state, deviceId)
  );

  const handleFetchMore = () => {
    dispatch(fetchMoreMsgs(socket, deviceId));
  };

  const handleDelete = (messageId: string) => async () => {
    await openConfirmModal("Confirm delete", "Are you sure you want to delete this message?");
    dispatch(deleteMsg(socket, deviceId, messageId));
  }

  return (
    <TabContainer paper={true}>
      {messages.length == 0 ?
        (<NoContentPlaceholder Icon={IconList} contentName="messages" />) :
        (
          <Stack gap="xl">
            {messages.map((message) => {
              let imgSrc: string | undefined;
              if (idToken && message.userImgId) {
                imgSrc = api.getMediaDownloadUrl(idToken, message.userImgId);
              }

              return (
                <MessageEntry
                  key={message.id}
                  date={message.date}
                  userMsg={message.userMsg}
                  assistantMsg={message.assistantMsg}
                  imageSrc={imgSrc}
                  onDelete={handleDelete(message.id)}
                />
              );
            })}
            <FetchMoreButton disabled={!hasMore} onClick={handleFetchMore} />
          </Stack>
        )}
    </TabContainer>
  )
};

export default Messages;
