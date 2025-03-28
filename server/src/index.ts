import "source-map-support/register";

import { addResponseUtils } from "./util/responseUtils";
import admin from "firebase-admin";
import { authUserEndpoint } from "./auth";
import { createServer } from "http";
import express from "express";
import firebaseKey from "./keys/firebaseKey";
import {
  handleAssistant,
  handleAssistantError,
} from "./endpoints/deviceComm/assistant";
import { handleDownloadMedia } from "./endpoints/downloadMedia";
import { handleUpdateStatus } from "./endpoints/deviceComm/updateStatus";
import { parseDeviceReq } from "./endpoints/deviceComm/parser";
import passport from "passport";
import { setupSocket } from "./sockets";
import upgradeHttp from "./util/upgradeHttp";
import { handleTranslate } from "./endpoints/deviceComm/translate";
import { handleGeneratePairQR } from "./endpoints/generatePairQR";

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

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
