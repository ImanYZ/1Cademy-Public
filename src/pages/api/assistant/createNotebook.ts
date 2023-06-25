import { db } from "@/lib/firestoreServer/admin";
import { Timestamp } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { INode } from "src/types/INode";
import { INotebook } from "src/types/INotebook";
import { IUser } from "src/types/IUser";
import { generateNotebookTitleGpt4 } from "src/utils/assistant-helpers";

export type IAssistantCreateNotebookRequestPayload = {
  title?: string;
  message: string;
  conversationId: string;
};

// TODO: check if conversation is from current user otherwise someone can use this to read other people interactions
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // Course Id
    const tagId: string = "HjIukJr12fIP9DNoD9gX";
    const tagDoc = await db.collection("nodes").doc(tagId).get();
    const tagData = tagDoc.data() as INode;

    const userData = req.body.data.user.userData as IUser;
    const notebookRef = db.collection("notebooks").doc();

    const notebookData: INotebook = {
      owner: userData.uname,
      ownerChooseUname: userData.chooseUname,
      ownerFullName: `${userData.fName} ${userData.lName}`,
      ownerImgUrl: userData.imageUrl,
      title: "",
      isPublic: "none",
      users: [userData.uname],
      usersInfo: {
        [userData.uname]: {
          chooseUname: userData.chooseUname,
          fullname: `${userData.fName} ${userData.lName}`,
          imageUrl: userData.imageUrl,
          role: "owner",
        },
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (tagData) {
      notebookData.defaultTagId = tagId;
      notebookData.defaultTagName = tagData.title;
    }

    const payload = req.body as IAssistantCreateNotebookRequestPayload;

    if (payload.title) {
      notebookData.title = payload.title;
      await notebookRef.set(notebookData);
      return res.status(200).json({
        notebookId: notebookRef.id,
        notebookTitle: notebookData.title,
      });
    }

    const assistantConversationDoc = await db.collection("assistantConversations").doc(payload.conversationId).get();
    if (!assistantConversationDoc.exists) {
      throw new Error("Conversation doesn't exist");
    }

    const notebookTitle = await generateNotebookTitleGpt4(payload.message);
    notebookData.title = notebookTitle;
    notebookData.conversation = payload.conversationId;
    await notebookRef.set(notebookData);

    return res.status(200).json({
      notebookId: notebookRef.id,
      notebookTitle: notebookData.title,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default fbAuth(handler);
