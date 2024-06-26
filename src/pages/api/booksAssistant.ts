import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { saveMessageSTT, uploadToCloudStorage } from "./STT";
import {
  createThread,
  fetchCompelation,
  getAssistantGenerateTitle,
  getAssistantTutorID,
  getFile,
  getJSON,
  openai,
  sendMessageTime,
} from "./openAI/helpers";
import { detach } from "src/utils/helpers";
import { saveLogs } from "@/lib/firestoreServer/logs";

const uploadPdf = async (bookUrl: string, bookId: string) => {
  const bookRef = db.collection("books").doc(bookId);
  const bookDoc = await bookRef.get();
  const bookData: any = bookDoc.data();
  const file = await openai.files.create({
    file: await fetch(bookUrl),
    purpose: "assistants",
  });
  let title = bookData.title;
  if (!title) {
    const assistantTitleId = await getAssistantGenerateTitle();
    //get response
    const newThread = await openai.beta.threads.create();
    await openai.beta.threads.messages.create(newThread.id, {
      role: "user",
      file_ids: [file.id],
      content: "The document is attached.",
    });
    const { response } = await fetchCompelation(newThread.id, assistantTitleId);
    title = response.title;
  }
  await bookRef.update({
    file_id: file.id,
    title,
  });
  return file.id;
};

const getThread = async (bookId: string) => {
  const bookDoc = await db.collection("books").doc(bookId).get();
  const bookData = bookDoc.data();
  return bookData;
};

const savReaction = async (bookId: string, messageId: string, reaction: string, username: string) => {
  const bookDoc = await db.collection("books").doc(bookId).get();
  if (bookDoc.exists) {
    const bookData: any = bookDoc.data();
    bookData.messagesReaction = {
      ...(bookData.messagesReaction || {}),
      [messageId]: {
        ...((bookData?.messagesReaction || {})[messageId] || { createdAt: new Date() }),
        reaction,
        updatedAt: new Date(),
      },
    };
    await saveLogs({
      doer: username,
      action: "reaction message",
      bookUrl: bookData.bookUrl,
      bookId: bookId,
      reaction,
    });
    await bookDoc.ref.update(bookData);
  }
};

const generateAudio = async (bookId: string, messageId: string, audioType: string, uname: string, message: string) => {
  console.log("generateAudio");
  const mp3 = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: audioType,
    input: message || "",
  });
  const buffer = Buffer.from(await mp3.arrayBuffer());
  const audioUrl = await uploadToCloudStorage(buffer);
  await saveMessageSTT(bookId, messageId, audioUrl, audioType, uname);
  return audioUrl;
};
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { bookId, message, audioType, reaction, asAudio } = req.body;
    const data = req.body.data;
    const firstname = data.user.userData.fName;
    let newMessage = message;

    const documentData: any = await getThread(bookId);

    const assistantId = await getAssistantTutorID();

    let pdfId = documentData.file_id;
    if (!pdfId || !getFile(pdfId)) {
      pdfId = await uploadPdf(documentData.bookUrl, bookId);
    }
    let threadId = documentData.threadId;

    if (!threadId) {
      threadId = await createThread(bookId);
      newMessage = message + `Hi, I'm ${firstname}. Teach me everything in the attached file.`;
    }
    newMessage = newMessage + sendMessageTime() + (reaction !== null ? `\n[The user reacted with ${reaction}]` : "");
    //create thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      file_ids: [pdfId],
      content: newMessage,
    });
    //get response
    let { response, messageId } = await fetchCompelation(threadId, assistantId);
    response = getJSON(response);
    const threadMessages = await openai.beta.threads.messages.list(threadId);
    let audioUrl = "";
    if (asAudio) {
      audioUrl = await generateAudio(bookId, messageId, audioType, data.user.userData.uname, response?.message || "");
    }

    await detach(async () => {
      if (!asAudio) {
        await generateAudio(bookId, messageId, audioType, data.user.userData.uname, response?.message || "");
      }

      const lastUserMessage = threadMessages.data[1];

      if (lastUserMessage.id) {
        await savReaction(bookId, lastUserMessage.id, reaction, data.user.userData.uname);
      }
      await saveLogs({
        doer: data.user.userData.uname,
        action: "Asked Assistant",
        bookUrl: documentData.bookUrl,
        bookId: bookId,
        message: newMessage,
        reponse: response?.message || "",
        reaction,
        project: "booksAssistant",
      });
    });

    return res.status(200).send({
      messages: threadMessages.data.sort((a: any, b: any) => a.created_at - b.created_at),
      audioUrl,
      messageId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
