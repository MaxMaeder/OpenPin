import { Box } from "@mantine/core";
import classes from "./Pin.module.css";

const Pin = () => (
  <Box className={classes.locationPin}>
    <Box className={classes.ringContainer}>
      <Box className={classes.ring} />
      <Box className={classes.circle} />
    </Box>
  </Box>
);

export default Pin;
