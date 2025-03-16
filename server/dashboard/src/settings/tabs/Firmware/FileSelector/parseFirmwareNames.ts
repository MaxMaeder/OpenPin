export interface ParsedFirmwareName {
  value: string;
  fileName: string;
  uploadDate: string;
}

const parseFirmwareNames = (names: string[]) => {
  const parsedNames: ParsedFirmwareName[] = [];

  for (const name of names) {
    const parts = name.split("-");

    if (parts.length < 3) {
      parsedNames.push({
        value: name,
        fileName: name,
        uploadDate: "",
      });
      continue;
    }

    parsedNames.push({
      value: name,
      fileName: parts.slice(2).join("-"),
      uploadDate: new Date(Number(parts[0])).toLocaleString(),
    });
  }

  return parsedNames;
};

export default parseFirmwareNames;
