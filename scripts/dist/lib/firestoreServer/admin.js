"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchDelete = exports.batchUpdate = exports.batchSet = exports.isFirestoreDeadlineError = exports.commitBatch = exports.checkRestartBatchWriteCounts = exports.MAX_TRANSACTION_WRITES = exports.db = exports.firebaseApp = exports.admin = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
// For production:
// admin.initializeApp();
require("dotenv").config();
const firebaseApp = global.firebaseApp
    ? global.firebaseApp
    : (0, app_1.initializeApp)({
        credential: (0, app_1.cert)({
            type: process.env.ONECADEMYCRED_TYPE,
            project_id: process.env.ONECADEMYCRED_PROJECT_ID,
            private_key_id: process.env.ONECADEMYCRED_PRIVATE_KEY_ID,
            private_key: process.env.ONECADEMYCRED_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            client_email: process.env.ONECADEMYCRED_CLIENT_EMAIL,
            client_id: process.env.ONECADEMYCRED_CLIENT_ID,
            auth_uri: process.env.ONECADEMYCRED_AUTH_URI,
            token_uri: process.env.ONECADEMYCRED_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.ONECADEMYCRED_AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.ONECADEMYCRED_CLIENT_X509_CERT_URL,
            storageBucket: process.env.ONECADEMYCRED_STORAGE_BUCKET,
            databaseURL: process.env.ONECADEMYCRED_DATABASE_URL
        })
    }, "onecademy");
exports.firebaseApp = firebaseApp;
// store on global object so we can reuse it if we attempt
// to initialize the app again
global.firebaseApp = firebaseApp;
// Firestore does not accept more than 500 writes in a transaction or batch write.
const MAX_TRANSACTION_WRITES = 499;
exports.MAX_TRANSACTION_WRITES = MAX_TRANSACTION_WRITES;
const isFirestoreDeadlineError = (err) => {
    console.log({ err });
    const errString = err.toString();
    return (errString.includes("Error: 13 INTERNAL: Received RST_STREAM") ||
        errString.includes("Error: 4 DEADLINE_EXCEEDED: Deadline exceeded"));
};
exports.isFirestoreDeadlineError = isFirestoreDeadlineError;
const db = (0, firestore_1.getFirestore)(firebaseApp);
exports.db = db;
// How many transactions/batchWrites out of 500 so far.
// I wrote the following functions to easily use batchWrites wthout worrying about the 500 limit.
let writeCounts = 0;
let batch = db.batch();
let isCommitting = false;
// Commit and reset batchWrites and the counter.
const makeCommitBatch = async () => {
    console.log("makeCommitBatch");
    if (!isCommitting) {
        isCommitting = true;
        await batch.commit();
        writeCounts = 0;
        batch = db.batch();
        isCommitting = false;
    }
    else {
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
    }
    catch (err) {
        console.log({ err });
        if (isFirestoreDeadlineError(err)) {
            const theInterval = setInterval(async () => {
                try {
                    await makeCommitBatch();
                    clearInterval(theInterval);
                }
                catch (err) {
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
exports.commitBatch = commitBatch;
//  If the batchWrite exeeds 499 possible writes, commit and rest the batch object and the counter.
const checkRestartBatchWriteCounts = async () => {
    writeCounts += 1;
    if (writeCounts >= MAX_TRANSACTION_WRITES) {
        await commitBatch();
    }
};
exports.checkRestartBatchWriteCounts = checkRestartBatchWriteCounts;
const batchSet = async (docRef, docData) => {
    if (!isCommitting) {
        batch.set(docRef, docData);
        await checkRestartBatchWriteCounts();
    }
    else {
        const batchWaitInterval = setInterval(async () => {
            if (!isCommitting) {
                batch.set(docRef, docData);
                await checkRestartBatchWriteCounts();
                clearInterval(batchWaitInterval);
            }
        }, 400);
    }
};
exports.batchSet = batchSet;
const batchUpdate = async (docRef, docData) => {
    if (!isCommitting) {
        batch.update(docRef, docData);
        await checkRestartBatchWriteCounts();
    }
    else {
        const batchWaitInterval = setInterval(async () => {
            if (!isCommitting) {
                batch.update(docRef, docData);
                await checkRestartBatchWriteCounts();
                clearInterval(batchWaitInterval);
            }
        }, 400);
    }
};
exports.batchUpdate = batchUpdate;
const batchDelete = async (docRef) => {
    if (!isCommitting) {
        batch.delete(docRef);
        await checkRestartBatchWriteCounts();
    }
    else {
        const batchWaitInterval = setInterval(async () => {
            if (!isCommitting) {
                batch.delete(docRef);
                await checkRestartBatchWriteCounts();
                clearInterval(batchWaitInterval);
            }
        }, 400);
    }
};
exports.batchDelete = batchDelete;
