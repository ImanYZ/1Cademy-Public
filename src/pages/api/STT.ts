import { db } from "@/lib/firestoreServer/admin";
const { Storage } = require("@google-cloud/storage");

import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { getJSON, openai } from "./openAI/helpers";
import { saveLogs } from "./booksAssistant";
// import {app} from ""

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

export async function uploadFileToStorage(sourceBuffer: any, folder: string, filename: string) {
  const storage = new Storage();
  const bucketName = process.env.VISUALEXP_STORAGE_BUCKET;

  const bucket = storage.bucket(bucketName);

  const destination = bucket.file(`${folder}/${filename}`);

  await destination.save(sourceBuffer);
  await destination.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination.name}`;
  return publicUrl;
}

export const saveMessageSTT = async (
  bookId: string,
  messageId: string,
  audioUrl: string,
  audioType: string,
  username: string
) => {
  try {
    const bookDoc = await db.collection("books").doc(bookId).get();
    if (bookDoc.exists) {
      const bookData: any = bookDoc.data();
      bookData.messages = {
        ...(bookData.messages || {}),
        [messageId]: {
          ...((bookData?.messages || {})[messageId] || { createdAt: new Date() }),
          [audioType]: audioUrl,
          updatedAt: new Date(),
        },
      };
      await saveLogs({
        doer: username,
        action: "Asked For Audio",
        audioType,
        bookUrl: bookData.bookUrl,
        bookId: bookId,
        reponse: audioUrl,
      });
      await bookDoc.ref.update(bookData);
    }
  } catch (error) {
    console.log(error);
  }
};
const saveMessageAssistant = async (audioUrl: string, message: any, uid: string) => {
  const convoDoc = await db.collection("tutorConversations").doc(uid).get();
  const messages = convoDoc.data()?.messages || [];
  const messagIdx = messages.findIndex((m: any) => m?.mid === message?.mid);
  if (messagIdx !== -1) {
    messages[messagIdx].audioUrl = audioUrl;
    convoDoc.ref.update({
      messages,
    });
  }
};
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { message, bookId, audioType, save } = req.body;
    if (!audioType) {
      throw new Error("Audio type is not specified");
    }
    let audioUrl = "";
    let input = "";
    if (bookId) {
      input = getJSON(message.content[0].text.value).message;
    } else {
      input = message.content;
    }
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",
      voice: audioType,
      input,
    });
    const data = req.body.data;
    const buffer = Buffer.from(await mp3.arrayBuffer());
    audioUrl = await uploadToCloudStorage(buffer);

    if (bookId) {
      await saveMessageSTT(bookId, message.id, audioUrl, audioType, data.user.userData.uname);
    } else if (save) {
      await saveMessageAssistant(audioUrl, message, data.user.userData.uid);
    }
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
