import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firestoreServer/admin";
import OpenAI from "openai";
import fbAuth from "src/middlewares/fbAuth";

import moment from "moment";
import { FieldValue } from "firebase-admin/firestore";
import { saveLogs } from "@/lib/firestoreServer/logs";
const MAX_REQUESTS = 100;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_API_ORG_ID,
});

const checkLimit = async () => {
  const logsDocs = await db.collection("openAICalls").where("date", "==", moment().format("MM/DD/YYYY")).get();
  const logData: any = logsDocs.docs[0]?.data() || 0;
  return (logData?.numRequests || 0) > MAX_REQUESTS;
};
const updateRequestTrack = async () => {
  const logsDocs = await db.collection("openAICalls").where("date", "==", moment().format("MM/DD/YYYY")).get();
  if (logsDocs.docs.length > 0) {
    const currentDatDoc = logsDocs.docs[0];
    currentDatDoc.ref.update({
      numRequests: FieldValue.increment(1),
      updatedAt: new Date(),
    });
  } else {
    const newLogRef = db.collection("openAICalls").doc();
    await newLogRef.set({
      date: moment().format("MM/DD/YYYY"),
      createdAt: new Date(),
      numRequests: 1,
    });
  }
};

export const callOpenAI = async (args: any) => {
  // if (await checkLimit()) {
  //   throw new Error("limit exceeded");
  // }
  const response = await openai.chat.completions.create(args);
  await saveLogs({
    action: "openai-call",
    args,
    createdAt: new Date(),
  });
  updateRequestTrack();
  return response.choices[0].message.content;
};
export const streamOpenAI = async (args: any) => {
  if (await checkLimit()) {
    throw new Error("limit exceeded");
  }
  await saveLogs({
    action: "openai-call",
    args,
    createdAt: new Date(),
  });
  updateRequestTrack();
  const response = await openai.chat.completions.create(args);
  return response;
};
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { stream, ...args } = req.body;
    const response = await callOpenAI(args);
    return res.status(200).json({ response });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export default handler;
