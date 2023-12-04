import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IUser } from "src/types/IUser";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userData = req.body.data.user.userData as IUser;
    const annoucementDocs = await db.collection("annoucements").where("tagId", "==", userData.tagId).get();

    const annoucements: any[] = [];
    annoucementDocs.forEach(doc => {
      const data = doc.data() as any;
      annoucements.push({
        id: doc.id,
        ...data,
      } as any);
    });

    const response: any = { annoucements };
    res.status(200).json(response);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ errorMessage: error.message });
  }
}

export default fbAuth(handler);
