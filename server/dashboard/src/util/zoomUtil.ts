export const getMapZoom = (certainty: "low" | "high") =>
  certainty === "low" ? 13 : 15;
