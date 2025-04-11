import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';

import { G_MAPS_KEY } from "./keys/google.ts";
import { MantineProvider } from "@mantine/core";
import { APIProvider as MapsAPIProvider } from "@vis.gl/react-google-maps";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from '@mantine/notifications';
import { Provider as ReduxProvider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { SocketProvider } from "./comm/socket/index.tsx";
import { router } from "./routes.tsx";
import { store } from "./state/store.ts";
import { theme } from "./theme";
import PairModal from "./modals/PairModal/index.tsx";
import { AuthTokenProvider } from "./comm/AuthTokenProvider.tsx";
import { auth } from "./comm/firebase.ts";
import { GalleryProvider } from "./lightbox/GalleryContext.tsx";

export default function App() {
  return (
    <MapsAPIProvider apiKey={G_MAPS_KEY}>
      <ReduxProvider store={store}>
        <AuthTokenProvider auth={auth} >
          <SocketProvider>
            <MantineProvider defaultColorScheme="dark" theme={theme}>
              <GalleryProvider>
                <Notifications />
                <ModalsProvider modals={{ pair: PairModal }}>
                  <RouterProvider router={router} />
                </ModalsProvider>
              </GalleryProvider>
            </MantineProvider>
          </SocketProvider>
        </AuthTokenProvider>
      </ReduxProvider>
    </MapsAPIProvider>
  );
}
