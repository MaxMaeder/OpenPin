import { DeviceData, upsertDataById } from "../../state/slices/dataSlice";
import {
  DeviceSettings,
  upsertSettingsById,
} from "../../state/slices/settingsSlice";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Socket, io } from "socket.io-client";
import {
  clearConnError,
  setConnError,
  setConnected,
  setLoading,
} from "../../state/slices/commSlice";
import { useAppDispatch, useAuth } from "../../state/hooks";
import superjson from "superjson";
import {
  CLIENT_DATA_REQ,
  CLIENT_DATA_REQ_DONE,
  CLIENT_DEV_SETTINGS_UPDATE,
  DEV_CAPTURES_UPDATE,
  DEV_DATA_UPDATE,
  DEV_MSGS_UPDATE,
  DEV_NOTES_UPDATE,
  DEV_SETTINGS_UPDATE
} from "./messageTypes";
import { PaginatedData } from "src/state/slices/createContentSlice";
import { capturesActions, DeviceCapture } from "src/state/slices/capturesSlice";
import { DeviceNote, notesActions } from "src/state/slices/notesSlice";
import { DeviceMessage, msgsActions } from "src/state/slices/msgsSlice";

interface SocketContextProps {
  sendMessage: (event: string, message: any) => void;
  sendSettingsUpdate: (deviceId: string, message: Partial<DeviceSettings>) => void;
}

const SocketContext = createContext<SocketContextProps | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only establish the socket connection if we have both user and token.
    if (!user) return;

    // Create a new socket connection using the current token.
    const socket: Socket = io("/", {
      path: "/dash-link/",
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      dispatch(setConnected(true));
      dispatch(clearConnError());

      socket.emit(CLIENT_DATA_REQ, "{}");
      dispatch(setLoading(true));
    });

    socket.on("disconnect", () => {
      dispatch(setConnected(false));
    });

    socket.on("connect_error", (err) => {
      dispatch(setConnected(false));
      dispatch(setConnError(err.message));
    });

    // Utility for adding listeners that deserialize the payload.
    const addListener = (event: string, listener: (payload: any) => void) => {
      const handleEvent = (serialized: string) => {
        const payload = superjson.parse(serialized);
        listener(payload);
      };
      socket.on(event, handleEvent);
    };

    addListener(CLIENT_DATA_REQ_DONE, () => {
      dispatch(setLoading(false));
    })

    addListener(DEV_DATA_UPDATE, (data: DeviceData) => {
      dispatch(upsertDataById(data));
    });
    addListener(DEV_SETTINGS_UPDATE, (settings: DeviceSettings) => {
      dispatch(upsertSettingsById(settings));
    });
    addListener(DEV_CAPTURES_UPDATE, (captures: PaginatedData<DeviceCapture>) => {
      dispatch(capturesActions.upsertContentForDevice(captures));
    });
    addListener(DEV_NOTES_UPDATE, (notes: PaginatedData<DeviceNote>) => {
      dispatch(notesActions.upsertContentForDevice(notes));
    });
    addListener(DEV_MSGS_UPDATE, (messages: PaginatedData<DeviceMessage>) => {
      dispatch(msgsActions.upsertContentForDevice(messages));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user, dispatch]); // reinitialize socket if user changes

  const sendMessage = useCallback((event: string, message: any) => {
    if (socketRef.current) {
      const serialized = superjson.stringify(message);
      socketRef.current.emit(event, serialized);
    }
  }, []);

  const sendSettingsUpdate = useCallback(
    (deviceId: string, settings: Partial<DeviceSettings>) => {
      sendMessage(CLIENT_DEV_SETTINGS_UPDATE, { id: deviceId, ...settings });
    },
    [sendMessage]
  );

  return (
    <SocketContext.Provider value={{ sendMessage, sendSettingsUpdate }}>
      {children}
    </SocketContext.Provider>
  );
};

export type AppSocket = SocketContextProps;

export const useSocket = (): AppSocket => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};
