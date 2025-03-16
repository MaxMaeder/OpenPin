import { Box, BoxComponentProps, MantineStyleProp } from "@mantine/core";
import { ReactNode, useEffect } from "react";

import api from "../comm/api";
import { selectAuthToken } from "../state/slices/userSlice";
import { useAppSelector } from "../state/hooks";

export interface BaseLayoutProps extends BoxComponentProps {
  title: string;
  children: ReactNode;
}

const BaseLayout = ({ title, children, ...props }: BaseLayoutProps) => {
  useEffect(() => {
    document.title = `${title} - OpenPin`;
  }, [title]);

  const authToken = useAppSelector(selectAuthToken);
  useEffect(() => {
    api.setAuthToken(authToken);
  }, [authToken]);

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
