import { ActionIcon, Paper } from "@mantine/core";
import classes from "./MediaEntry.module.css";
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from "@tabler/icons-react";
import { useVideoPlayback } from "./useVideoPlayback";
import { AnimatePresence, motion } from "framer-motion";
import { Key, ReactNode } from "react";

interface AnimatedIconProps {
  key: Key;
  children: ReactNode;
}

const AnimatedIcon = ({ key, children }: AnimatedIconProps) => {
  return (
    <motion.div
      key={key}
      className={classes.controlMotion}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div >
  );
};

interface VideoMediaProps {
  src: string;
  onEnlarge: () => void;
}

const VideoMedia = ({ src, onEnlarge }: VideoMediaProps) => {
  const { videoRef, isPlaying, togglePlayback } = useVideoPlayback();
  return (
    <>
      <ActionIcon
        variant="transparent"
        color="white"
        onClick={togglePlayback}
        className={classes.controlIcon}
      >
        <div className={classes.controlMotionContainer}>
          <AnimatePresence mode="wait">
            {isPlaying ? (
              <AnimatedIcon key="pause">
                <IconPlayerPauseFilled size={24} />
              </AnimatedIcon>
            ) : (
              <AnimatedIcon key="play">
                <IconPlayerPlayFilled size={24} />
              </AnimatedIcon>
            )}
          </AnimatePresence>
        </div>
      </ActionIcon>
      <Paper
        withBorder
        shadow="md"

        component="video"
        ref={videoRef}

        src={src}
        display="block"
        w="100%"
        controls={false}
        className={classes.mediaBase}
        onClick={() => {
          onEnlarge();
          if (isPlaying) togglePlayback();
        }}
      />
    </>
  )
};

export default VideoMedia;