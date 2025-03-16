export const formatDate = (millis: number): string => {
  const date = new Date(millis);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${month}/${day}, ${hours}:${minutes}`;
};

export const formatBattery = (left: number) => (left * 100).toFixed(0) + "%";

export const formatCoords = (lat: number, lng: number): string[] => {
  // Helper function to convert decimal degrees to DMS
  const convertDMS = (degree: number): string => {
    const absolute = Math.abs(degree);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(3);
    return `${degrees}° ${minutes}′ ${seconds}″`;
  };

  // Get the DMS values
  const latDMS = convertDMS(lat);
  const lngDMS = convertDMS(lng);

  // Determine cardinal directions
  const latDirection = lat >= 0 ? "N" : "S";
  const lngDirection = lng >= 0 ? "E" : "W";

  // Format with directions
  return [`${latDMS} ${latDirection}`, `${lngDMS} ${lngDirection}`];
};
