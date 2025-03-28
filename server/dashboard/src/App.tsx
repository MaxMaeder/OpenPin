import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';

import { G_MAPS_KEY } from "./keys/google.ts";
import { MantineProvider } from "@mantine/core";
import { APIProvider as MapsAPIProvider } from "@vis.gl/react-google-maps";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from '@mantine/notifications';
import { Provider as ReduxProvider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { SocketProvider } from "./comm/socket.tsx";
import { router } from "./routes.tsx";
import { store } from "./state/store.ts";
import { theme } from "./theme";
import PairModal from "./modals/PairModal/index.tsx";

export default function App() {
  return (
    <MapsAPIProvider apiKey={G_MAPS_KEY}>
      <ReduxProvider store={store}>
        <SocketProvider>
          <MantineProvider defaultColorScheme="dark" theme={theme}>
            <Notifications />
            <ModalsProvider modals={{ pair: PairModal }}>
              <RouterProvider router={router} />
            </ModalsProvider>
          </MantineProvider>
        </SocketProvider>
      </ReduxProvider>
    </MapsAPIProvider>
  );
}
