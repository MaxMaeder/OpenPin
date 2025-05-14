import "source-map-support/register";
import "tsconfig-paths/register";
import "express-async-errors";

import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(readFileSync("/keys/firebaseKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "smartglasses-e58d8.appspot.com",
});

import auth from "src/services/auth";
import { createServer } from "http";
import express from "express";
// import firebaseKey from "./keys/firebaseKey";
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
import cookieParser from "cookie-parser";

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
app.get("/api/dash/pair-qr.png", auth.authUserEndpoint, handleGeneratePairQR);

app.get("/api/dash/auth/me", cookieParser(), auth.authUserEndpoint, (req, res) => {
  res.json(req.user);
});
app.post("/api/dash/auth/login", express.json(), async (req, res, next) => {
  try {
    console.log(req.body);
    const { user, token } = await auth.login(req.body.email, req.body.password);
    const twoWeeks = 14 * 24 * 60 * 60 * 1000;
    res.cookie("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: twoWeeks,
    });
    // res.cookie("session", token, COOKIE_OPTS);
    res.json({ user }); // <── here
  } catch (e) {
    next(e);
  }
});

app.post("/api/dash/auth/signup", async (req, res, next) => {
  try {
    const token = await auth.signup(req.body.email, req.body.password);
    res.cookie("session", token, { httpOnly: true, secure: true, sameSite: "lax" });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

app.post("/api/dash/auth/reset-password", async (req, res, next) => {
  try {
    await auth.resetPassword(req.body.email);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

app.post("/api/dev/pair/:pairCode", handlePairDevice);
app.post("/api/dev/handle", parseDeviceReq, handleAssistant);
app.post("/api/dev/translate", parseDeviceReq, handleTranslate);
app.post("/api/dev/upload-capture", parseUploadCapture, handleUploadCapture);
app.post("/api/dev/home-data", parseGetHomeData, handleGetHomeData);
app.post("/api/dev/locate", parseLocateDevice, handleLocateDevice);

app.use("/favicon.svg", express.static("dashboard/dist/favicon.svg"));
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
