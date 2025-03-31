import "source-map-support/register";
import "tsconfig-paths/register";
import "express-async-errors";

import admin from "firebase-admin";
import { authUserEndpoint } from "./auth";
import { createServer } from "http";
import express from "express";
import firebaseKey from "./keys/firebaseKey";
import {
  handleAssistant,
  handleAssistantError,
} from "./endpoints/device/assistant";
import { handleDownloadMedia } from "./endpoints/dashboard/downloadMedia";
import { handleUpdateStatus } from "./endpoints/device/updateStatus";
import { parseDeviceReq } from "./endpoints/device/util/parser";
import passport from "passport";
import { setupSocket } from "./sockets";
import upgradeHttp from "./util/upgradeHttp";
import { handleTranslate } from "./endpoints/device/translate";
import { handleGeneratePairQR } from "./endpoints/dashboard/generatePairQR";
import { handleExpressErrors } from "./util/errors";
import { handlePairDevice } from "./endpoints/device/pairDevice";

admin.initializeApp({
  credential: admin.credential.cert(firebaseKey),
  storageBucket: "smartglasses-e58d8.appspot.com",
});

const app = express();
app.set("trust proxy", 1); // One proxy (google app engine)
const server = createServer(app);

app.use(passport.initialize());

setupSocket(server);

app.get(
  "/api/dash/media-download/:name",
  authUserEndpoint,
  handleDownloadMedia
);
app.get(
  "/api/dash/pair-qr.png",
  authUserEndpoint,
  handleGeneratePairQR
)

app.post("/api/dev/pair/:pairCode", handlePairDevice);
app.post(
  "/api/dev/handle",
  parseDeviceReq,
  handleAssistant,
  handleAssistantError
);
app.post(
  "/api/dev/translate",
  parseDeviceReq,
  handleTranslate,
  handleAssistantError
);
app.post("/api/dev/update-status", parseDeviceReq, handleUpdateStatus);

app.use("/favicon.svg", express.static("dashboard/dist/favicon.svg"));
app.use("/dash-assets", express.static("dashboard/dist/dash-assets"));
app.get("*", upgradeHttp, (_, res) => {
  res.sendFile("index.html", { root: "dashboard/dist" });
});

app.use(handleExpressErrors);

// import { clearDeviceContent } from "./services/database/device/content";
// import { addDeviceNote, getDeviceNotesRef } from "./services/database/device/notes";
// // For example, you can define your test device ID.
// const deviceId = 'a3cd78aa-463c-4d1e-ba37-2261910f0476';

// (async () => {
//   try {
//     // First, clear all existing notes for the device.
//     await clearDeviceContent(deviceId, getDeviceNotesRef);
//     console.log(`Cleared all notes for device: ${deviceId}`);

//     // Insert 30 random notes.
//     for (let i = 0; i < 30; i++) {
//       const note = {
//         title: `Random Note ${i + 1}`,
//         content: `This is the content for random note ${i + 1}.`
//       };
//       await addDeviceNote(deviceId, note);
//       console.log(`Inserted note ${i + 1}`);
//     }

//     console.log('Successfully inserted 30 random notes.');
//   } catch (error) {
//     console.error('Error during test:', error);
//   }
// })();

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
