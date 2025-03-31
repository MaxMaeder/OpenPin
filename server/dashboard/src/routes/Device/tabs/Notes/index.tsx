import { Stack, Text } from "@mantine/core";
import TabContainer from "../../components/TabContainer";
import TextEntry from "../../components/TextEntry";
import Spoiler from "src/components/Spoiler";
import { useAppDispatch, useAppSelector } from "src/state/hooks";
import { notesSelectors } from "src/state/slices/notesSlice";
import { useDeviceId } from "src/util/useDeviceId";
import { deleteNote, fetchMoreNotes } from "src/state/thunks/notesThunks";
import { useSocket } from "src/comm/socket";
import FetchMoreButton from "../../components/FetchMoreButton";
import { openConfirmModal } from "src/modals";
import NoContentPlaceholder from "../../components/NoContentPlaceholder";
import { IconList } from "@tabler/icons-react";

const Notes: React.FC = () => {
  const dispatch = useAppDispatch();
  const socket = useSocket();

  const deviceId = useDeviceId()!;

  const notes = useAppSelector((state) =>
    notesSelectors.selectAllForDevice(state, deviceId)
  );
  const hasMore = useAppSelector((state) =>
    notesSelectors.selectHasMoreForDevice(state, deviceId)
  );

  const handleFetchMore = () => {
    dispatch(fetchMoreNotes(socket, deviceId));
  };

  const handleDelete = (noteId: string) => async () => {
    await openConfirmModal("Confirm delete", "Are you sure you want to delete this note?");
    dispatch(deleteNote(socket, deviceId, noteId));
  }

  return (
    <TabContainer paper={true}>
      {notes.length == 0 ?
        (<NoContentPlaceholder Icon={IconList} contentName="notes" />) :
        (
          <Stack gap="xl">
            {notes.map((note) => (
              <TextEntry
                key={note.id}
                title={note.title}
                date={note.date}
                onDelete={handleDelete(note.id)}
              >
                <Spoiler>
                  <Text>{note.content}</Text>
                </Spoiler>
              </TextEntry>
            ))}
            <FetchMoreButton disabled={!hasMore} onClick={handleFetchMore} />
          </Stack>
        )}
    </TabContainer>
  )
};

export default Notes;
