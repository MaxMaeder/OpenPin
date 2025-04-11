// useMediaThumbnail.tsx
import { useEffect, useCallback, useId } from 'react';
import { MediaItem, useGallery } from './GalleryContext';

export const useMediaThumbnail = ({
  id,
  date,
  type,
  src,
}: MediaItem) => {
  // Generate an id if one is not provided.
  const generatedId = useId();
  const mediaId = id || generatedId;

  const { register, unregister, openLightbox } = useGallery();

  // Register the media item when the component mounts and unregister on unmount.
  useEffect(() => {
    register({ id: mediaId, date, type, src });
    return () => {
      unregister(mediaId);
    };
  }, [mediaId, type, src, register, unregister]);

  // Create the click handler to open the lightbox.
  const onClick = useCallback(() => {
    openLightbox(mediaId);
  }, [openLightbox, mediaId]);

  // Return the click handler so it can be spread on the target element.
  return { onClick };
};
