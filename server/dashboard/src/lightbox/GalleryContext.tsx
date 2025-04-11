import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import { DeviceCaptureType } from 'src/state/slices/capturesSlice';
import Lightbox from './Lightbox';

export interface MediaItem {
  id: string;
  date: Date;
  type: DeviceCaptureType;
  src: string;
}

interface GalleryContextProps {
  mediaItems: MediaItem[];
  register: (item: MediaItem) => void;
  unregister: (id: string) => void;
  openLightbox: (id: string) => void;
  closeLightbox: () => void;
  openMediaId: string | null;
  setOpenMediaId: (id: string | null) => void;
}

// Create the context.
const GalleryContext = createContext<GalleryContextProps | undefined>(undefined);

// Provider that holds our media items and the state of the lightbox.
export const GalleryProvider = ({ children }: { children: React.ReactNode }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [openMediaId, setOpenMediaId] = useState<string | null>(null);

  const register = useCallback((item: MediaItem) => {
    setMediaItems((prev) => [...prev, item].sort((a, b) => a.date.getTime() - b.date.getTime()));
  }, []);

  const unregister = useCallback((id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const openLightbox = (id: string) => {
    setOpenMediaId(id);
  };

  const closeLightbox = () => {
    setOpenMediaId(null);
  };

  return (
    <GalleryContext.Provider
      value={{
        mediaItems,
        register,
        unregister,
        openLightbox,
        closeLightbox,
        openMediaId,
        setOpenMediaId,
      }}
    >
      {children}
      <Lightbox />
    </GalleryContext.Provider>
  );
};

// Custom hook for accessing the gallery context.
export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};
