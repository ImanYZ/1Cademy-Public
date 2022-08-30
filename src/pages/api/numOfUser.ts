import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../lib/firestoreServer/admin";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const usersRefs = db.collection("users");
    const userDocs = await usersRefs.get();
    const usersNum: any = {};
    for (let userDoc of userDocs.docs) {
      const tag = userDoc.data().tag;
      if (tag.title in usersNum) {
        usersNum[tag.title]++;
      } else {
        usersNum[tag.title] = 1;
      }
    }
    const usersNumTags = Object.keys(usersNum).sort((t1, t2) => usersNum[t2] - usersNum[t1]);
    const usersNumSorted = [];
    usersNumTags.map((userTag: any) => usersNumSorted.push({ [userTag]: usersNum[userTag] }));
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;