/**
 * IMPORTANT: this function is used only to see the execution order of function
 * - This will be printed only in develop
 * - this will print [FUNCTION_NAME]
 * - logInUpperCase must be writer to sho log like this: FUNCTION_NAME
 */
const disableLogsTemporally = true;
const disableTutorialLogs = true;
const disableWorkerLogs = true;
export const devLog = (logInUpperCase: string, otherData = {}, type?: "TUTORIAL" | "WORKER") => {
  if (disableLogsTemporally) return;
  if (process.env.NODE_ENV !== "development") return;
  if (type === "TUTORIAL" && disableTutorialLogs) return;
  if (type === "WORKER" && disableWorkerLogs) return;

  console.info(`[${logInUpperCase.toUpperCase()}]`, otherData);
};
