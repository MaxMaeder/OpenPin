import "source-map-support/register";

import { handleGenSpeech, parseGenSpeech } from "./endpoints/genSpeech";
import { handleLogin, limitLogin, parseLogin } from "./endpoints/login";
import {
  handleUploadFirmware,
  parseUploadFirmware,
} from "./endpoints/uploadFirmware";

import { addResponseUtils } from "./util/responseUtils";
import admin from "firebase-admin";
import { authJwtEndpoint } from "./auth/jwt";
import { createServer } from "http";
import express from "express";
import firebaseKey from "./keys/firebaseKey";
import {
  handleAssistant,
  handleAssistantError,
} from "./endpoints/deviceComm/assistant";
import { handleDownloadFirmware } from "./endpoints/downloadFirmware";
import { handleDownloadMedia } from "./endpoints/downloadMedia";
import { handleGetDevWiFiNets } from "./endpoints/getDevWiFiNets";
import { handleUpdateStatus } from "./endpoints/deviceComm/updateStatus";
import { parseDeviceReq } from "./endpoints/deviceComm/parser";
import passport from "passport";
import { setupSocket } from "./sockets";
import upgradeHttp from "./util/upgradeHttp";
import {
  handleUpdateDevLocWiFi,
  parseUpdateDevLocWiFi,
} from "./endpoints/updateDevLocWifi";
import { handleTranslate } from "./endpoints/deviceComm/translate";

admin.initializeApp({
  credential: admin.credential.cert(firebaseKey),
  storageBucket: "smartglasses-e58d8.appspot.com",
});

const app = express();
app.set("trust proxy", 1); // One proxy (google app engine)
app.use(addResponseUtils);
const server = createServer(app);

app.use(passport.initialize());

setupSocket(server);

app.post("/api/dash/login", limitLogin, parseLogin, handleLogin);
app.post(
  "/api/dash/firmware-upload",
  authJwtEndpoint,
  parseUploadFirmware,
  handleUploadFirmware
);
app.get("/api/dash/media-download/:name", authJwtEndpoint, handleDownloadMedia);

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
app.post(
  "/api/dev/update-location-wifi/:deviceId",
  parseUpdateDevLocWiFi,
  handleUpdateDevLocWiFi
);
app.get("/api/dev/firmware/:deviceId/latest.bin", handleDownloadFirmware);
app.get("/api/dev/wifi-networks/:deviceId", handleGetDevWiFiNets);
app.post("/api/dev/gen-speech", parseGenSpeech, handleGenSpeech);
app.use("/api/dev/sounds", express.static("sound_effects"));

app.use("/favicon.svg", express.static("dashboard/dist/favicon.svg"));
app.use("/dash-assets", express.static("dashboard/dist/dash-assets"));
app.get("*", upgradeHttp, (_, res) => {
  res.sendFile("index.html", { root: "dashboard/dist" });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
