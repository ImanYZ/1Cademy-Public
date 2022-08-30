import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../lib/firestoreServer/admin";
import { replaceUsername } from '../../utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userDoc = await db.doc(`/users/${req.body.data.user.userData.uname}`).get();
    const newUsername = req.body.data.newUname;
    if (newUsername.includes(".") || newUsername.includes("/") || newUsername.includes("__")) {
      return res
        .status(400)
        .json({ error: "Please don't include '.', '/', or '__' in your username" });
    } else if (newUsername !== req.body.data.user.userData.uname) {
      await replaceUsername({ userDoc, newUsername });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error, success: false });
  }
}

export default handler;
