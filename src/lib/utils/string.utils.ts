export function capitalizeFirstLetter(str: string): string {
  const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  return capitalized;
}
export const capitalizeString = (str: string): string => {
  return str
    .split(" ")
    .map(cur => capitalizeFirstLetter(cur))
    .join(" ");
};
export const addSuffixToUrlGMT = (url: string, suffix: string) => {
  let urlArr = url.split("GMT");
  return urlArr[0] + "GMT" + suffix + urlArr[1];
};

export const ellipsisString = (text: string, length: number) => {
  return text.length > length ? `${text.slice(0, length)}...` : text;
};
