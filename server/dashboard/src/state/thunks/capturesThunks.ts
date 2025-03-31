import { AppDispatch, RootState } from '../store';
import { capturesSelectors } from "../slices/capturesSlice";
import { capturesActions } from "../slices/capturesSlice";
import { AppSocket } from 'src/comm/socket';
import { CLIENT_DEL_CAPTURE_REQ, CLIENT_MORE_CAPTURES_REQ } from 'src/comm/socket/messageTypes';

export const fetchMoreCaptures = (socket: AppSocket, deviceId: string) =>
  (_: AppDispatch, getState: () => RootState) => {
    const nextStartAfter = capturesSelectors.selectNextStartAfterForDevice(getState(), deviceId);
    const payload = { id: deviceId, startAfter: nextStartAfter };
    socket.sendMessage(CLIENT_MORE_CAPTURES_REQ, payload);
  };

export const deleteCapture = (socket: AppSocket, deviceId: string, captureId: string) =>
  (dispatch: AppDispatch) => {
    dispatch(capturesActions.removeContentForDevice({ deviceId, entryId: captureId }));
    socket.sendMessage(CLIENT_DEL_CAPTURE_REQ, { id: deviceId, entryId: captureId });
  };
