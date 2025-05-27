import "source-map-support/register";
import "tsconfig-paths/register";
import "express-async-errors";

import admin from "firebase-admin";
import { authUserEndpoint } from "./auth";
import { createServer } from "http";
import express from "express";
import firebaseKey from "./keys/firebaseKey";
import { handleAssistant } from "./endpoints/device/voice/assistant";
import { handleDownloadMedia } from "./endpoints/dashboard/downloadMedia";
import { parseDeviceReq } from "./endpoints/device/voice/parser";
import passport from "passport";
import { setupSocket } from "./sockets";
import upgradeHttp from "./util/upgradeHttp";
import { handleTranslate } from "./endpoints/device/voice/translate";
import { handleGeneratePairQR } from "./endpoints/dashboard/generatePairQR";
import { handleExpressErrors } from "./util/errors";
import { handlePairDevice } from "./endpoints/device/pairDevice";
import { handleUploadCapture, parseUploadCapture } from "./endpoints/device/uploadCapture";
import { noCacheRes } from "./util/caching";
import { handleGetHomeData, parseGetHomeData } from "./endpoints/device/getHomeData";
import { handleLocateDevice, parseLocateDevice } from "./endpoints/device/locateDevice";

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
  // authUserEndpoint,
  handleDownloadMedia
);
app.get("/api/dash/pair-qr.png", authUserEndpoint, handleGeneratePairQR);

app.post("/api/dev/pair/:pairCode", handlePairDevice);
app.post("/api/dev/handle", parseDeviceReq, handleAssistant);
app.post("/api/dev/translate", parseDeviceReq, handleTranslate);
app.post("/api/dev/upload-capture", parseUploadCapture, handleUploadCapture);
app.post("/api/dev/home-data", parseGetHomeData, handleGetHomeData);
app.post("/api/dev/locate", parseLocateDevice, handleLocateDevice);

app.use("/favicon.svg", express.static("dashboard/dist/favicon.svg"));
app.use("/patreon/icon.png", express.static("dashboard/dist/patreon-icon.png"));
app.use("/dash-assets", express.static("dashboard/dist/dash-assets"));
app.get("*", upgradeHttp, (_, res) => {
  noCacheRes(res);
  res.sendFile("index.html", { root: "dashboard/dist" });
});

app.use(handleExpressErrors);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
