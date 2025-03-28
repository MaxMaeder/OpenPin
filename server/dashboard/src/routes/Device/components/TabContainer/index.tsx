import { Box, Paper } from "@mantine/core";
import { ReactNode } from "react";
import classes from "./TabContainer.module.css";

interface TabContainerProps {
  paper?: boolean;
  children: ReactNode
}

const TabContainer: React.FC<TabContainerProps> = ({ paper = false, children }) => {

  let Content = children;
  if (paper) {
    Content = <Paper withBorder shadow="md" h="100%" p="lg">{Content}</Paper>
  }

  return (
    <Box className={classes.tabContainer}>
      {Content}
    </Box>
  )
}

export default TabContainer;