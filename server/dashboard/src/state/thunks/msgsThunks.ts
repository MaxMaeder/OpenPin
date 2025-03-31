import { AppDispatch, RootState } from '../store';
import { msgsSelectors } from "../slices/msgsSlice";
import { msgsActions } from "../slices/msgsSlice";
import { AppSocket } from 'src/comm/socket';
import { CLIENT_DEL_MSG_REQ, CLIENT_MORE_MSGS_REQ } from 'src/comm/socket/messageTypes';

export const fetchMoreMsgs = (socket: AppSocket, deviceId: string) =>
  (_: AppDispatch, getState: () => RootState) => {
    const nextStartAfter = msgsSelectors.selectNextStartAfterForDevice(getState(), deviceId);
    const payload = { id: deviceId, startAfter: nextStartAfter };
    socket.sendMessage(CLIENT_MORE_MSGS_REQ, payload);
  };

export const deleteMsg = (socket: AppSocket, deviceId: string, msgId: string) =>
  (dispatch: AppDispatch) => {
    dispatch(msgsActions.removeContentForDevice({ deviceId, entryId: msgId }));
    socket.sendMessage(CLIENT_DEL_MSG_REQ, { id: deviceId, entryId: msgId });
  };
