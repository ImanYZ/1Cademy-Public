import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../lib/firestoreServer/admin";
import { replaceUsername } from "../../utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userDocs = await db.collection("users").get();
    for (let userDoc of userDocs.docs) {
      if (userDoc.id.includes(".") || userDoc.id.includes("/") || userDoc.id.includes("__")) {
        let newUsername = userDoc.id.split(".").join("");
        newUsername = newUsername.split("/").join("");
        newUsername = newUsername.split("__").join("");
        await replaceUsername({ userDoc, newUsername });
      }
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;
