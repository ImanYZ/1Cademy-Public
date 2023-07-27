import { ErrorLog } from "src/client/firestore/errors.firestore";

export class CustomError extends Error {
  // Extend the Error class and add a constructor to accept additional properties
  constructor(message: string, public options: ErrorLog) {
    super(message);
    // this.name = "CustomError";
    // Optionally, you can assign the error code to the name for better identification
    // this.name = `CustomError [${options.errorCode}]`;
  }
}
