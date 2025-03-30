import { getFirestore } from "firebase-admin/firestore";
import { DEV_DATA_COL } from "src/config";
import { sendDataUpdate } from "../msgBuilders/device";

export const startDevDataUpdates = () => {
  // Listen for device data changes and emit updates only to the relevant device room.
  getFirestore()
    .collection(DEV_DATA_COL)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const deviceId = change.doc.id;
          
          sendDataUpdate(deviceId, change.doc.data());
        }
      });
    });
}