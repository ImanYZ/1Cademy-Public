import admin from "firebase-admin";
import { App, cert, getApp, initializeApp } from "firebase-admin/app";
import { DocumentReference, getFirestore, WriteBatch } from "firebase-admin/firestore";

import { arrayToChunks } from "../../utils";
import { delay } from "../utils/utils";

export const publicStorageBucket = process.env.ONECADEMYCRED_STORAGE_BUCKET;

require("dotenv").config();

let app: App;
let db: any;
if (!admin.apps.filter((a: any) => a.name === "exp").length) {
  let initializationConfigs: any = {
    credential: cert({
      type: process.env.VISUALEXPCRED_TYPE,
      project_id: process.env.VISUALEXP_PROJECT_ID,
      private_key_id: process.env.VISUALEXPCRED_PRIVATE_KEY_ID,
      private_key: process.env.VISUALEXPCRED_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.VISUALEXPCRED_CLIENT_EMAIL,
      client_id: process.env.VISUALEXPCRED_CLIENT_ID,
      auth_uri: process.env.VISUALEXPCRED_AUTH_URI,
      token_uri: process.env.VISUALEXPCRED_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.VISUALEXPCRED_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.VISUALEXPCRED_CLIENT_X509_CERT_URL,
      storageBucket: process.env.VISUALEXP_STORAGE_BUCKET,
    } as any),
  };

  if (process.env.NODE_ENV === "test") {
    initializationConfigs = {
      projectId: "test",
      credential: admin.credential.applicationDefault(),
    };
  }
  app = initializeApp(initializationConfigs, "exp");
}
db = getFirestore(getApp("exp"));
export const MAX_TRANSACTION_WRITES = 499;

const makeCommitBatch = async (batch: WriteBatch): Promise<[WriteBatch, number]> => {
  await batch.commit();
  batch = db.batch();
  return [batch, 0];
};

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const isFirestoreDeadlineError = (err: any) => {
  const errString = err.toString();
  return (
    errString.includes("Error: 13 INTERNAL: Received RST_STREAM") ||
    errString.includes("Error: 4 DEADLINE_EXCEEDED: Deadline exceeded")
  );
};

export const commitBatch = async (batch: WriteBatch): Promise<[WriteBatch, number]> => {
  try {
    return makeCommitBatch(batch);
  } catch (err) {
    console.log(err, "batch errr");
    await delay(4000);
    // we removed this condition so that it keeps trying until transaction is committed
    // if (isFirestoreDeadlineError(err))
    return commitBatch(batch);
  }
};

const checkRestartBatchWriteCounts = async (batch: WriteBatch, writeCounts: number): Promise<[WriteBatch, number]> => {
  writeCounts += 1;
  if (writeCounts >= MAX_TRANSACTION_WRITES) {
    [batch, writeCounts] = await commitBatch(batch);
  }
  return [batch, writeCounts];
};

//////////
interface TWriteOperation {
  objRef: DocumentReference;
  data?: { [key: string]: any };

  operationType: "set" | "update" | "delete";
}
const writeTransaction = async (tWriteOperations: TWriteOperation[]) => {
  const chunked = arrayToChunks(tWriteOperations);

  await db.runTransaction(async t => {
    for (let chunk of chunked) {
      for (let op of chunk) {
        const { operationType, objRef, data } = op;
        switch (operationType) {
          case "set":
            t.set(objRef, data);
            break;

          case "update":
            t.update(objRef, data);
            break;

          case "delete":
            t.delete(objRef);
            break;
        }
      }
    }
  });
};

export { admin, db, writeTransaction, type TWriteOperation, checkRestartBatchWriteCounts, app };
