import { Box, Paper } from "@mantine/core";
import { ReactNode } from "react";
import classes from "./TabContainer.module.css";

interface TabContainerProps {
  paper?: boolean;
  children: ReactNode
}

const TabContainer: React.FC<TabContainerProps> = ({ paper = false, children }) => {

  let Content = <Box p="lg">{children}</Box>;
  if (paper) {
    Content = <Paper withBorder shadow="md" h="100%">{Content}</Paper>
  }

  return (
    <Box className={classes.tabContainer}>
      {Content}
    </Box>
  )
}

export default TabContainer;