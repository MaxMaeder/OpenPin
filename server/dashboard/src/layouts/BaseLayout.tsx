import { Box, BoxComponentProps, MantineStyleProp } from "@mantine/core";
import { ReactNode, useEffect } from "react";

import api from "../comm/api";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../comm/firebase";

export interface BaseLayoutProps extends BoxComponentProps {
  title: string;
  children: ReactNode;
}

const BaseLayout = ({ title, children, ...props }: BaseLayoutProps) => {
  useEffect(() => {
    document.title = `${title} - OpenPin`;
  }, [title]);

  const [user] = useAuthState(auth);

  useEffect(() => {
    if (!user) return;

    (async () => {
      api.setAuthToken(await user.getIdToken());
    })()
  }, [user]);

  const boxStyle: MantineStyleProp = {
    height: "100%",
    backgroundImage: "radial-gradient(#2F2F2F 0.5px, #171717 0.5px)",
    backgroundSize: "10px 10px",
  };

  return (
    <Box {...props} style={boxStyle}>
      {children}
    </Box>
  );
};

export default BaseLayout;
