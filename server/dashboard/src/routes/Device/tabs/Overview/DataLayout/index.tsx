import { Box, Center, Paper } from "@mantine/core";

import { ReactNode } from "react";
import classes from "./DataLayout.module.css";

interface DataLayoutProps {
  leftSection: ReactNode;
  middleSection: ReactNode;
  rightSection: ReactNode;
}

const DataLayout = ({
  leftSection,
  middleSection,
  rightSection,
}: DataLayoutProps) => {
  return (
    <Center h="100%" className={classes.center}>
      <Box className={classes.container}>
        <Paper className={classes.bigBox} withBorder>
          {leftSection}
        </Paper>
        <Paper className={classes.littleBox} withBorder>
          {middleSection}
        </Paper>
        <Paper className={classes.bigBox} withBorder>
          {rightSection}
        </Paper>
      </Box>
    </Center>
  );
};

export default DataLayout;
