import { Timestamp } from "firebase-admin/firestore";
import { IJob, IQueue } from "src/types/IQueue";

import { db } from "./utils/admin";

const JOB_TIMEOUT = 500000;
const DEFAULT_RETRIES = 3;

interface TWriteOperator {
  objRef: any;
  data: any;
  operationType: string;
}

interface AssignNextJobToQueue {
  queueName: string;
  queueRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
  t: FirebaseFirestore.Transaction;
  tWriteOperations: TWriteOperator[];
}
export const assignNextJobToQueue = async ({ queueName, queueRef, t, tWriteOperations }: AssignNextJobToQueue) => {
  const { docs: jobs } = await t.get(
    db.collection("jobs").where("queue", "==", queueName).where("status", "==", "pending").limit(1)
  );

  if (!jobs.length) return;

  const jobRef = jobs[0].ref;

  tWriteOperations.push({
    objRef: queueRef,
    data: {
      jobId: jobRef.id,
      jobStartedAt: Timestamp.now(),
    } as Partial<IQueue>,
    operationType: "update",
  });

  tWriteOperations.push({
    objRef: jobRef,
    data: {
      status: "executing",
    },
    operationType: "update",
  });
};

export const queuesScheduler = async () => {
  try {
    await db.runTransaction(async t => {
      const tWriteOperations: TWriteOperator[] = [];

      const { docs: queues } = await t.get(db.collection("queues"));
      for (const doc of queues) {
        const queueRef = doc.ref;
        const queue = doc.data() as IQueue;
        const maxRetry = queue.maxRetry || DEFAULT_RETRIES;

        const isTimeout = queue.jobId && new Date().getTime() > queue.jobStartedAt!.toDate().getTime() + JOB_TIMEOUT;
        let passedRetries = false;
        if (isTimeout) {
          const jobRef = db.collection("jobs").doc(queue.jobId!);
          const jobDoc = await t.get(jobRef);
          const job = jobDoc.data() as IJob;
          const retry = job.retry || 0;
          passedRetries = maxRetry < retry;

          if (!passedRetries) {
            tWriteOperations.push({
              objRef: jobRef,
              data: {
                retry: retry + 1,
              },
              operationType: "update",
            });

            tWriteOperations.push({
              objRef: queueRef,
              data: {
                jobStartedAt: Timestamp.now(),
              },
              operationType: "update",
            });
          } else {
            // Delete job on max retires
            tWriteOperations.push({
              objRef: jobRef,
              data: {},
              operationType: "delete",
            });

            // create job doc on failed jobs
            tWriteOperations.push({
              objRef: db.collection("failedJobs").doc(jobRef.id),
              data: job,
              operationType: "set",
            });

            await assignNextJobToQueue({
              queueName: queue.name,
              queueRef,
              t,
              tWriteOperations,
            });
          }
        } else if (!queue.jobId) {
          await assignNextJobToQueue({
            queueName: queue.name,
            queueRef,
            t,
            tWriteOperations,
          });
        }
      }

      for (const operation of tWriteOperations) {
        const { objRef, data, operationType } = operation;
        switch (operationType) {
          case "update":
            t.update(objRef, data);
            break;
          case "set":
            t.set(objRef, data);
            break;
          case "delete":
            t.delete(objRef);
            break;
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};
