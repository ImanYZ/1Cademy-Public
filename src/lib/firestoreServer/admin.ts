import admin from "firebase-admin";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

require("dotenv").config();

if (!admin.apps.length) {
  initializeApp({
    credential: cert({
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
      databaseURL: process.env.NEXT_PUBLIC_DATA_BASE_URL
    } as any)
  });
  getFirestore().settings({ ignoreUndefinedProperties: true });
}

const db = getFirestore();

export { admin, db };
