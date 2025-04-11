import { useState } from "react";
import { useGallery } from "./GalleryContext";
import { AnimatePresence, motion } from "framer-motion";
import { ActionIcon, Box, Overlay, Paper } from "@mantine/core";
import { IconCaretLeftFilled, IconCaretRightFilled, IconDownload, IconX } from "@tabler/icons-react";
import classes from "./Lightbox.module.css"
import clsx from "clsx";

const Lightbox = () => {
  const { mediaItems, openMediaId, setOpenMediaId, closeLightbox } =
    useGallery();
  const [slideDirection, setSlideDirection] = useState(1);

  if (!openMediaId) return null;

  // Find the current media item based on the openMediaId.
  const currentIndex = mediaItems.findIndex((item) => item.id === openMediaId);
  if (currentIndex === -1) return null;
  const currentItem = mediaItems[currentIndex];

  // Handlers to navigate through media items.
  const handlePrev = () => {
    setSlideDirection(-1);
    const newIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
    setOpenMediaId(mediaItems[newIndex].id);
  };

  const handleNext = () => {
    setSlideDirection(1);
    const newIndex = (currentIndex + 1) % mediaItems.length;
    setOpenMediaId(mediaItems[newIndex].id);
  };

  // Animation variants for media sliding in/out horizontally.
  const mediaVariants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    animate: { x: 0, opacity: 1, transition: { duration: 0.2 } },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      transition: { duration: 0.2 },
    }),
  };

  return (
    <Box className={classes.lightboxContainer}>

      <Overlay color="black" zIndex={0} />

      <Box className={classes.lightboxContent}>

        <Box className={classes.lightboxControls}>
          <ActionIcon
            size="lg"
            variant="transparent"
            color="white"
            component="a"
            href={currentItem.src}
            download={true}
          >
            <IconDownload size={32} />
          </ActionIcon>
          <ActionIcon
            size="lg"
            variant="transparent"
            color="white"
            onClick={closeLightbox}
          >
            <IconX size={32} />
          </ActionIcon>
        </Box>

        <Box className={classes.lightboxGrid}>
          {/* Previous arrow */}
          <Box className={clsx(classes.arrowContainer, classes.prevContainer)}>
            <ActionIcon
              onClick={handlePrev}
              variant="transparent"
              color="white"
              className={classes.arrowIconButton}
            >
              <IconCaretLeftFilled className={classes.arrowIcon} />
            </ActionIcon>
          </Box>


          <Box className={classes.contentContainer}>
            <AnimatePresence custom={slideDirection} mode="wait">
              <motion.div
                key={currentItem.id}
                custom={slideDirection}
                variants={mediaVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className={classes.contentWrapper}
              >
                {currentItem.type === 'image' ? (
                  <Paper
                    className={clsx(classes.contentPaper, classes.imgContent)}
                    component="img"
                    withBorder
                    src={currentItem.src}
                  />
                ) : (
                  <Paper
                    className={clsx(classes.contentPaper, classes.videoContent)}
                    component="video"
                    withBorder
                    src={currentItem.src}
                    controls
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </Box>

          {/* Next arrow */}
          <Box className={clsx(classes.arrowContainer, classes.nextContainer)}>
            <ActionIcon
              onClick={handleNext}
              variant="transparent"
              color="white"
              className={classes.arrowIconButton}
            >
              <IconCaretRightFilled className={classes.arrowIcon} />
            </ActionIcon>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Lightbox;
