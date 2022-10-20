/**
 * IMPORTANT: this function is used only to see the execution order of function
 * This will be printed only in develop
 * this will print [FUNCTION_NAME]
 */
export const devLog = (log: string, secondaryText: string = "") => {
  if (process.env.NODE_ENV !== "development") return;

  const subLog = secondaryText ? `:${secondaryText}` : "";
  console.log(`[${log.toUpperCase()}]${subLog}`);
};
