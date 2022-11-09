/**
 * will try to format the number with commas
 * if there is an error will return the original value
 */
export const formatNumber = (num: number | undefined) => {
  try {
    if (!num) return 0;
    return num.toLocaleString("en-US");
  } catch (error) {
    return num;
  }
};
