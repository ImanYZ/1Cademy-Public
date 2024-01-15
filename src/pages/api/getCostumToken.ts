import { getAuth } from "firebase-admin/auth";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uid } = req.body?.data?.user?.userData;
    const customToken = await getAuth().createCustomToken(uid);
    return res.status(200).json({
      customToken,
    });
  } catch (error) {
    console.log("Error creating custom token:", error);
  }
}
export default fbAuth(handler);
