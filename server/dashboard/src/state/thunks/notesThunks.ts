import { AppDispatch, RootState } from '../store';
import { notesSelectors } from "../slices/notesSlice";
import { notesActions } from "../slices/notesSlice";
import { AppSocket } from 'src/comm/socket';
import { CLIENT_DEL_NOTE_REQ, CLIENT_MORE_NOTES_REQ } from 'src/comm/socket/messageTypes';

export const fetchMoreNotes = (socket: AppSocket, deviceId: string) =>
  (_: AppDispatch, getState: () => RootState) => {
    const nextStartAfter = notesSelectors.selectNextStartAfterForDevice(getState(), deviceId);
    const payload = { id: deviceId, startAfter: nextStartAfter };
    socket.sendMessage(CLIENT_MORE_NOTES_REQ, payload);
  };

export const deleteNote = (socket: AppSocket, deviceId: string, noteId: string) =>
  (dispatch: AppDispatch) => {
    dispatch(notesActions.removeContentForDevice({ deviceId, entryId: noteId }));
    socket.sendMessage(CLIENT_DEL_NOTE_REQ, { id: deviceId, entryId: noteId });
  };
