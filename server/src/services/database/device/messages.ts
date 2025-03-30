import { DeviceId } from "src/dbTypes";
import { CollectionReference, getFirestore } from "firebase-admin/firestore";

import { DEV_MSGS_COL } from "src/config";
import { addDeviceContent, clearDeviceContent, deleteDeviceContent, DeviceContent, getDeviceContent, PaginationConfig } from "./content";

export interface DeviceMessage extends DeviceContent {
  userMsg: string;
  userImgGcsUri?: string;
  assistantMsg: string;
}

export const getDeviceMsgsRef = (deviceId: string): CollectionReference =>
  getFirestore().collection(DEV_MSGS_COL).doc(deviceId).collection("entries");

export const getDeviceMsgs = async (
  deviceId: DeviceId,
  config?: PaginationConfig
) => getDeviceContent<DeviceMessage>(deviceId, getDeviceMsgsRef, config);

export const addDeviceMsg = async (
  deviceId: DeviceId,
  message: Omit<DeviceMessage, "date">,
  contextWindow: number
) => addDeviceContent<DeviceMessage>(deviceId, message, getDeviceMsgsRef, contextWindow);

export const deleteDeviceMsg = async (
  deviceId: DeviceId,
  id: string
) => deleteDeviceContent(deviceId, id, getDeviceMsgsRef);

export const clearDeviceMsgs = async (
  deviceId: DeviceId
) => clearDeviceContent(deviceId, getDeviceMsgsRef);


// export const getDeviceMsgsRef = (deviceId: string): DocumentReference =>
//   getFirestore().collection(DEV_MSGS_COL).doc(deviceId);

// export const getDeviceMsgs = async (deviceId: string): Promise<Message[]> => {
//   let msgs: Message[] = [];
//   const msgsDoc = await getDeviceMsgsRef(deviceId).get();
//   if (msgsDoc.exists) {
//     ({ msgs } = msgsDoc.data() as DeviceMessages);
//   }

//   return msgs;
// };

// const setDeviceMsgs = async (deviceId: string, msgs: Message[]) =>
//   await getDeviceMsgsRef(deviceId).set({ msgs });

// export const updateDeviceMsgs = async (
//   deviceId: string,
//   userMsg: string,
//   userImage: Buffer | undefined,
//   assistantMessage: string,
//   keepNum: number
// ): Promise<void> => {
//   const msgs = await getDeviceMsgs(deviceId);

//   if (userImage) {
//     userMsg += " <user attached image>";
//   }

//   msgs.push({
//     role: "user",
//     content: userMsg,
//   });
//   msgs.push({
//     role: "assistant",
//     content: assistantMessage,
//   });

//   let keepMsgs: Message[] = [];
//   if (keepNum !== 0) {
//     keepMsgs = msgs.slice(-keepNum);
//   }

//   setDeviceMsgs(deviceId, keepMsgs);
// };

// export const clearDeviceMsgs = async (deviceId: string) =>
//   await setDeviceMsgs(deviceId, []);
