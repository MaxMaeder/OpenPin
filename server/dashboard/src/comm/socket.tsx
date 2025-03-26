import { DeviceData, upsertDataById } from "../state/slices/dataSlice";
import {
  DeviceSettings,
  upsertSettingsById,
} from "../state/slices/settingsSlice";
import {
  ReactNode,
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
} from "../state/slices/commSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { selectSelectedDevice } from "../state/slices/devSelectSlice";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

interface SocketContextProps {
  sendMessage: (event: string, message: any) => void;
  sendSettingsUpdate: (message: Partial<DeviceSettings>) => void;
}

const SocketContext = createContext<SocketContextProps | null>(null);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const dispatch = useAppDispatch();
  const [user] = useAuthState(auth);
  const deviceId = useAppSelector(selectSelectedDevice);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    (async () => {
      const socket: Socket = io("/", {
        path: "/dash-link/",
        auth: {
          token: await user.getIdToken(),
        },
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        dispatch(setConnected(true));
        dispatch(clearConnError());
        socket.emit("client_data_req");
      });

      socket.on("dev_data_update", (data: DeviceData) => {
        dispatch(upsertDataById(data));
      });

      socket.on("dev_settings_update", (settings: DeviceSettings) => {
        dispatch(upsertSettingsById(settings));
      });

      socket.on("disconnect", () => {
        dispatch(setConnected(false));
      });

      socket.on("connect_error", (err) => {
        dispatch(setConnected(false));
        dispatch(setConnError(err.message));
      });
    })();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user, dispatch]);

  const sendMessage = useCallback((event: string, message: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, message);
    }
  }, []);

  const sendSettingsUpdate = useCallback(
    (settings: Partial<DeviceSettings>) => {
      sendMessage("client_dev_settings_update", { id: deviceId, ...settings });
    },
    [deviceId]
  );

  return (
    <SocketContext.Provider value={{ sendMessage, sendSettingsUpdate }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
