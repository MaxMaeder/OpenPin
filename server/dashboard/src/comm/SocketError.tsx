import { Button, Notification, Portal, Stack, Transition } from "@mantine/core";
import { clearConnError, selectConnError } from "../state/slices/commSlice";
import { useAppDispatch, useAppSelector } from "../state/hooks";

import { logoutUser } from "../state/slices/userSlice";

const SocketError = () => {
  const dispatch = useAppDispatch();
  const connError = useAppSelector(selectConnError);

  const handleReLogin = () => dispatch(logoutUser());
  const handleDismissed = () => dispatch(clearConnError());

  return (
    <Portal target="#dash-main">
      <Transition
        mounted={!!connError}
        transition="fade-left"
        duration={400}
        timingFunction="ease"
      >
        {(styles) => (
          <Notification
            title="Error Establishing Data Link"
            style={{
              zIndex: 1000,
              position: "absolute",
              top: "calc(var(--mantine-spacing-md) + 60px)",
              right: "var(--mantine-spacing-md)",
              ...styles,
            }}
            color="red"
            onClose={handleDismissed}
          >
            <Stack align="start" w={300} gap="xs">
              We couldn't establish a connection with the server. You may need
              to log in again.
              <i>{connError}</i>
              <Button onClick={handleReLogin}>Log In Again</Button>
            </Stack>
          </Notification>
        )}
      </Transition>
    </Portal>
  );
};

export default SocketError;
