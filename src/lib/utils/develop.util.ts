/**
 * IMPORTANT: this function is used only to see the execution order of function
 * - This will be printed only in develop
 * - this will print [FUNCTION_NAME]
 * - logInUpperCase must be writer to sho log like this: FUNCTION_NAME
 */
const disableLogsTemporally = true;
export const devLog = (logInUpperCase: string, otherData = {}) => {
  if (disableLogsTemporally) return;
  if (process.env.NODE_ENV !== "development") return;

  console.log(`[${logInUpperCase.toUpperCase()}]`, otherData);
};
