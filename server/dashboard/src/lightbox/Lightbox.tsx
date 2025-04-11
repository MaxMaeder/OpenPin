import { useState } from "react";
import { useGallery } from "./GalleryContext";
import { AnimatePresence, motion } from "framer-motion";
import { ActionIcon, Overlay } from "@mantine/core";
import { IconArrowLeft, IconArrowRight, IconCaretLeftFilled, IconCaretRightFilled } from "@tabler/icons-react";

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
    animate: { x: 0, opacity: 1, transition: { duration: 0.4 } },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      transition: { duration: 0.4 },
    }),
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1000,
        }}
        onClick={closeLightbox}
      >
        {/* Animated overlay background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.4 } }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <Overlay opacity={0.8} color="black" zIndex={0} />
        </motion.div>

        {/* Content container prevents click propagation */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Previous arrow */}
          <ActionIcon
            onClick={handlePrev}
            variant="transparent"
            style={{ position: 'absolute', left: 20, top: '50%' }}
            size="xl"
          >
            <IconCaretLeftFilled size={32} />
          </ActionIcon>

          {/* Media content with horizontal slide animation */}
          <AnimatePresence custom={slideDirection} mode="wait">
            <motion.div
              key={currentItem.id}
              custom={slideDirection}
              variants={mediaVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            >
              {currentItem.type === 'image' ? (
                <img
                  src={currentItem.src}
                  alt=""
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              ) : (
                <video
                  src={currentItem.src}
                  controls
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Next arrow */}
          <ActionIcon
            onClick={handleNext}
            variant="transparent"
            style={{ position: 'absolute', right: 20, top: '50%' }}
            size="xl"
          >
            <IconCaretRightFilled size={32} />
          </ActionIcon>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Lightbox;
