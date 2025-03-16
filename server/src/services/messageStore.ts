import { DeviceMessages, Message } from "../dbTypes";
import { DocumentReference, getFirestore } from "firebase-admin/firestore";

import { DEV_MSGS_COL } from "../config";

export const getDeviceMsgsRef = (deviceId: string): DocumentReference =>
  getFirestore().collection(DEV_MSGS_COL).doc(deviceId);

export const getDeviceMsgs = async (deviceId: string): Promise<Message[]> => {
  let msgs: Message[] = [];
  const msgsDoc = await getDeviceMsgsRef(deviceId).get();
  if (msgsDoc.exists) {
    ({ msgs } = msgsDoc.data() as DeviceMessages);
  }

  return msgs;
};

const setDeviceMsgs = async (deviceId: string, msgs: Message[]) =>
  await getDeviceMsgsRef(deviceId).set({ msgs });

export const updateDeviceMsgs = async (
  deviceId: string,
  userMsg: string,
  userImage: Buffer | undefined,
  assistantMessage: string,
  keepNum: number
): Promise<void> => {
  const msgs = await getDeviceMsgs(deviceId);

  if (userImage) {
    userMsg += " <user attached image>";
  }

  msgs.push({
    role: "user",
    content: userMsg,
  });
  msgs.push({
    role: "assistant",
    content: assistantMessage,
  });

  let keepMsgs: Message[] = [];
  if (keepNum !== 0) {
    keepMsgs = msgs.slice(-keepNum);
  }

  setDeviceMsgs(deviceId, keepMsgs);
};

export const clearDeviceMsgs = async (deviceId: string) =>
  await setDeviceMsgs(deviceId, []);
