import { Paper } from "@mantine/core";
import classes from "./MediaEntry.module.css";

interface ImageMediaProps {
  src: string;
  onEnlarge: () => void;
}

const ImageMedia = ({ src, onEnlarge }: ImageMediaProps) => (
  <Paper
    withBorder
    shadow="md"

    component="img"
    src={src}
    display="block"
    w="100%"
    className={classes.mediaBase}
    onClick={onEnlarge}
  />
);

export default ImageMedia;