import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../lib/firestoreServer/admin";

// Logic
// - creating new feeddback in feedback collection
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data } = req.body;

    await db.collection("feedback").add({ ...data, createdAt: new Date() });
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot send feedback" });
  }
}

export default handler;
