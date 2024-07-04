import { admin, db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next/types";

import fbAuth from "src/middlewares/fbAuth";
const removeInvalidTokens = async (uid: string, invalidTokens: string[]) => {
  const fcmTokensDoc = await db.collection("fcmTokens").doc(uid).get();
  if (fcmTokensDoc.exists) {
    const tokens = fcmTokensDoc.data()?.tokens;
    const newTokens = tokens.filter((token: string) => !invalidTokens.includes(token));
    await fcmTokensDoc.ref.update({
      tokens: newTokens,
    });
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { title, body, receiverUID } = req.body as any;
    const fcmTokensDoc = await db.collection("fcmTokens").doc(receiverUID).get();
    if (!fcmTokensDoc.exists) throw new Error("FCM token not exists");
    const tokens = fcmTokensDoc.data()?.tokens;
    const invalidTokens: string[] = [];
    try {
      for (let token of tokens) {
        const payload = {
          token,
          notification: {
            title: title,
            body: body,
          },
        };
        console.log(admin.messaging());
        console.log(payload);
        admin
          .messaging()
          .send(payload)
          .then((response: any) => {
            console.log("Successfully sent message: ", response);
          })
          .catch((error: any) => {
            if (
              error.code === "messaging/invalid-registration-token" ||
              error.code === "messaging/registration-token-not-registered"
            ) {
              console.log(`Token ${token} is invalid. Removing token...`);
              invalidTokens.push(token);
            }
          });
      }
    } catch (error) {
      console.log(error, "error");
    }
    await removeInvalidTokens(receiverUID, invalidTokens);
    return res.status(200).send({});
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: true,
    });
  }
}
export default fbAuth(handler);
