// The Firebase Admin SDK to access Firestore.
let admin = require("firebase-admin");
require("dotenv").config();

admin = admin.initializeApp(
  {
    credential: admin.credential.cert({
      type: process.env.ONECADEMYCRED_TYPE,
      project_id: process.env.NEXT_PUBLIC_PROJECT_ID,
      private_key_id: process.env.ONECADEMYCRED_PRIVATE_KEY_ID,
      private_key: process.env.ONECADEMYCRED_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      client_email: process.env.ONECADEMYCRED_CLIENT_EMAIL,
      client_id: process.env.ONECADEMYCRED_CLIENT_ID,
      auth_uri: process.env.ONECADEMYCRED_AUTH_URI,
      token_uri: process.env.ONECADEMYCRED_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.ONECADEMYCRED_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.ONECADEMYCRED_CLIENT_X509_CERT_URL,
      storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
      databaseURL: process.env.NEXT_PUBLIC_DATA_BASE_URL,
    }),
  },
  "onecademy"
);

// Firestore does not accept more than 500 writes in a transaction or batch write.
const MAX_TRANSACTION_WRITES = 499;

const isFirestoreDeadlineError = err => {
  console.log({ err });
  const errString = err.toString();
  return (
    errString.includes("Error: 13 INTERNAL: Received RST_STREAM") ||
    errString.includes("Error: 4 DEADLINE_EXCEEDED: Deadline exceeded")
  );
};

const db = admin.firestore();

// How many transactions/batchWrites out of 500 so far.
// I wrote the following functions to easily use batchWrites wthout worrying about the 500 limit.
let writeCounts = 0;
let batch = db.batch();
let isCommitting = false;

// Commit and reset batchWrites and the counter.
const makeCommitBatch = async () => {
  if (!isCommitting) {
    isCommitting = true;
    await batch.commit();
    writeCounts = 0;
    batch = db.batch();
    isCommitting = false;
  } else {
    const batchWaitInterval = setInterval(async () => {
      if (!isCommitting) {
        isCommitting = true;
        await batch.commit();
        writeCounts = 0;
        batch = db.batch();
        isCommitting = false;
        clearInterval(batchWaitInterval);
      }
    }, 400);
  }
};

// Commit the batchWrite; if you got a Firestore Deadline Error try again every 4 seconds until it gets resolved.
const commitBatch = async () => {
  try {
    await makeCommitBatch();
  } catch (err) {
    console.log({ err });
    if (isFirestoreDeadlineError(err)) {
      const theInterval = setInterval(async () => {
        try {
          await makeCommitBatch();
          clearInterval(theInterval);
        } catch (err) {
          console.log({ err });
          if (!isFirestoreDeadlineError(err)) {
            clearInterval(theInterval);
            throw err;
          }
        }
      }, 4000);
    }
  }
};

//  If the batchWrite exeeds 499 possible writes, commit and rest the batch object and the counter.
const checkRestartBatchWriteCounts = async () => {
  writeCounts += 1;
  if (writeCounts >= MAX_TRANSACTION_WRITES) {
    await commitBatch();
  }
};

const batchSet = async (docRef, docData) => {
  if (!isCommitting) {
    batch.set(docRef, docData);
    await checkRestartBatchWriteCounts();
  } else {
    const batchWaitInterval = setInterval(async () => {
      if (!isCommitting) {
        batch.set(docRef, docData);
        await checkRestartBatchWriteCounts();
        clearInterval(batchWaitInterval);
      }
    }, 400);
  }
};

const batchUpdate = async (docRef, docData) => {
  if (!isCommitting) {
    batch.update(docRef, docData);
    await checkRestartBatchWriteCounts();
  } else {
    const batchWaitInterval = setInterval(async () => {
      if (!isCommitting) {
        batch.update(docRef, docData);
        await checkRestartBatchWriteCounts();
        clearInterval(batchWaitInterval);
      }
    }, 400);
  }
};

const batchDelete = async docRef => {
  if (!isCommitting) {
    batch.delete(docRef);
    await checkRestartBatchWriteCounts();
  } else {
    const batchWaitInterval = setInterval(async () => {
      if (!isCommitting) {
        batch.delete(docRef);
        await checkRestartBatchWriteCounts();
        clearInterval(batchWaitInterval);
      }
    }, 400);
  }
};

module.exports = {
  admin,
  db,
  MAX_TRANSACTION_WRITES,
  checkRestartBatchWriteCounts,
  commitBatch,
  isFirestoreDeadlineError,
  batchSet,
  batchUpdate,
  batchDelete,
};
