import * as functions from "firebase-functions";
import { IQueue, Job } from "src/types/IQueue";

import { db } from "./utils/admin";

export const queueWorker = async (
  change: functions.Change<functions.firestore.QueryDocumentSnapshot>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context: functions.EventContext<{
    uname: string;
  }>
) => {
  try {
    const queue = change.after.data() as IQueue;

    if (queue.jobId) {
      const jobDoc = await db.collection("jobs").doc(queue.jobId).get();
      const { type } = jobDoc.data() as Job;
      if (type === "signal_all_nodes") {
        // execute
      }
    }
  } catch (error) {
    console.log("deleteOldProposals", error);
  }
};
