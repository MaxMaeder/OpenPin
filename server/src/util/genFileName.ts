const genFileName = (deviceId: string, extension: string) =>
  `${new Date().toISOString()}-${deviceId}.${extension}`;

export default genFileName;
