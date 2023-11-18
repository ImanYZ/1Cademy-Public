import { db } from "@/lib/firestoreServer/admin";
const { Storage } = require("@google-cloud/storage");

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import fbAuth from "src/middlewares/fbAuth";
// import {app} from ""

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  //   OPENAI_API_ORG_ID: process.env.OPENAI_API_KEY,
});

export async function uploadToCloudStorage(sourceBuffer: any) {
  const storage = new Storage();
  const bucketName = process.env.VISUALEXP_STORAGE_BUCKET;

  const bucket = storage.bucket(bucketName);

  const destination = bucket.file(`SpeechToText/${new Date().toString()}.mp3`);

  await destination.save(sourceBuffer);
  await destination.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination.name}`;
  return publicUrl;
}
export const saveMessageSTT = async (bookId: string, messageId: string, audioUrl: string) => {
  try {
    const bookDoc = await db.collection("books").doc(bookId).get();
    if (bookDoc.exists) {
      const bookData: any = bookDoc.data();
      bookData.messages = {
        ...(bookData.messages || {}),
        [messageId]: {
          audioUrl,
          createdAt: new Date(),
        },
      };
      await bookDoc.ref.update(bookData);
    }
  } catch (error) {
    console.log(error);
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { message, bookId } = req.body;

    const input = message.content[0].text.value;
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: "alloy",
      input,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    const audioUrl = await uploadToCloudStorage(buffer);
    await saveMessageSTT(bookId, message.id, audioUrl);
    return res.status(200).send({
      audioUrl,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
