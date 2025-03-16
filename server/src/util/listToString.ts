const listToString = (arr: Array<string>) => {
  if (arr.length === 0) return "";
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return arr.join(" and ");

  const lastItem = arr.pop();
  return arr.join(", ") + ", and " + lastItem;
};

export default listToString;
