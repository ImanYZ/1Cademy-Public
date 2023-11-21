import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "./openAI/helpers";
import { FieldValue } from "firebase-admin/firestore";
import { saveLogs } from "./booksAssistant";
import fbAuth from "src/middlewares/fbAuth";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { bookId } = req.body;
    const data = req.body.data;

    const bookDoc = await db.collection("books").doc(bookId).get();
    const book: any = bookDoc.data();
    if (book.file_id) {
      bookDoc.ref.update({
        file_id: book.default ? book.file_id : "",
        deleted: !book.default,
        threadId: FieldValue.delete(),
      });
      if (!book.default) {
        await openai.files.del(book.file_id);
      }
    }
    await saveLogs({
      doer: data.user.userData.uname,
      action: "Delete thread",
      bookUrl: book.bookUrl,
      bookId: bookId,
      threadId: book.threadId,
    });
    return res.status(200).send({
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
