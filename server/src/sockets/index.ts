import { UserId } from "../dbTypes";
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { handleDataReq } from "./msgHandlers/dataReq";
import { handleDevSettingsUpdate } from "./msgHandlers/devSettingsUpdate";
import { authUserSocket } from "../auth";
import { getUserDevices } from "src/services/database/userData";
import { startDevDataUpdates } from "./msgProducers/devDataUpdates";
import { 
  CLIENT_DATA_REQ,
  CLIENT_DEL_CAPTURE_REQ,
  CLIENT_DEL_MSG_REQ,
  CLIENT_DEL_NOTE_REQ,
  CLIENT_DEV_SETTINGS_UPDATE,
  CLIENT_MORE_CAPTURES_REQ,
  CLIENT_MORE_MSGS_REQ,
  CLIENT_MORE_NOTES_REQ
} from "./messageTypes";
import { getDevRID, getUserRID } from "./roomIDs";
import superjson from "superjson";
import { SuperJSONValue } from "superjson/dist/types";
import { 
  handleDeleteCaptureReq,
  handleDeleteMsgsReq,
  handleDeleteNoteReq,
  handleMoreCapturesReq,
  handleMoreMsgsReq,
  handleMoreNotesReq
} from "./msgHandlers/devContentReq";

export let io: Server | undefined;

export const setupSocket = (server: HttpServer) => {
  io = new Server(server, {
    path: "/dash-link/",
  });
  io.use(authUserSocket);

  io.on("connection", (socket) => {
    try {
      addListener(socket, CLIENT_DATA_REQ, handleDataReq(socket));
      addListener(socket, CLIENT_DEV_SETTINGS_UPDATE, handleDevSettingsUpdate(socket));

      addListener(socket, CLIENT_MORE_CAPTURES_REQ, handleMoreCapturesReq(socket));
      addListener(socket, CLIENT_MORE_NOTES_REQ, handleMoreNotesReq(socket));
      addListener(socket, CLIENT_MORE_MSGS_REQ, handleMoreMsgsReq(socket));

      addListener(socket, CLIENT_DEL_CAPTURE_REQ, handleDeleteCaptureReq(socket));
      addListener(socket, CLIENT_DEL_NOTE_REQ, handleDeleteNoteReq(socket));
      addListener(socket, CLIENT_DEL_MSG_REQ, handleDeleteMsgsReq(socket));

      const userId = socket.data.userId as UserId;
      joinRooms(socket, userId);
    } catch (error) {
      console.error("Error while setting up socket connection", error)
    }
  });

  startDevDataUpdates();
};

const joinRooms = async (socket: Socket, userId: UserId) => {
  try {
    const userDevices = await getUserDevices(userId);

    // Each socket joins a room for the signed-in user
    // + a room per device that user owns
    socket.join(getUserRID(userId))
    socket.join(userDevices.map(getDevRID));
  } catch (err) {
    console.error("Error while adding socket to rooms", err);
  }
}

export const sendToRoom = (room: string, event: string, payload: SuperJSONValue) => {
  if (!io) return;

  const serialized = superjson.stringify(payload);
  io.to(room).emit(event, serialized);
}

export const addListener = (socket: Socket, event: string, listener: (payload: SuperJSONValue) => Promise<void>) => {
  const handleEvent = async (serialized: string) => {
    try {
      const payload = superjson.parse(serialized);
      await listener(payload);
    } catch (error) {
      console.error(`Error in handler for event: ${event}`, error)
    }
  }

  socket.on(event, handleEvent);
}
