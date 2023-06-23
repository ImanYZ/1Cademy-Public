import { admin, db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import { IUser } from "src/types/IUser";
import { createChat } from "src/utils/assistant-helpers";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    let userData: IUser | undefined = undefined;
    // loading user document if authorization provided
    let token = (req.headers.authorization || req.headers.Authorization || "") as string;
    token = token.replace("Bearer ", "").trim();
    if (token) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (decodedToken) {
          const users = await db.collection("users").where("userId", "==", decodedToken.uid).limit(1).get();
          if (users.docs.length) {
            userData = users.docs[0].data() as IUser;
          }
        }
      } catch (e) {}
    }

    const chatId = createChat(userData?.uname);

    return res.status(200).json({
      chatId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      error: true,
    });
  }
}

export default handler;
