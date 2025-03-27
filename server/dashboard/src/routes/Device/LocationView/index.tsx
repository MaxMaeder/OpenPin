import { Box } from "@mantine/core";
import { Map } from "@vis.gl/react-google-maps";
import Pin from "./Pin";
import mapStyles from "./mapStyles";

interface MapLocationProps {
  lat: number;
  lng: number;
  zoom: number;
}

const MapLocation = ({ lat, lng, zoom }: MapLocationProps) => {
  return (
    <>
      <style>
        {`
        a[href^="http://maps.google.com/maps"]{display:none !important}
        a[href^="https://maps.google.com/maps"]{display:none !important}
        
        .gmnoprint a, .gmnoprint span, .gm-style-cc {
            display:none;
        }
        .gmnoprint div {
            background:none !important;
        }
        `}
      </style>
      <Box h="100%" pos="relative">
        <Pin />
        <Map
          zoom={zoom}
          center={{ lat, lng }}
          styles={mapStyles}
          disableDefaultUI
          gestureHandling="none"
          zoomControl={false}
          scrollwheel={false}
          disableDoubleClickZoom={true}
        />
      </Box>
    </>
  );
};

export default MapLocation;
