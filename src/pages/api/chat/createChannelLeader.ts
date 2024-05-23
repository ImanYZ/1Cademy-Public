import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { getAuth } from "firebase-admin/auth";

type IAddUserLeadingPayload = {
  channelId: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const auth = getAuth();
    const { uid } = req.body?.data?.user?.userData;
    const { channelId } = req.body as IAddUserLeadingPayload;
    const user = await auth.getUser(uid);
    const customClaims = user.customClaims || {};
    const leading = customClaims.leading || [];
    leading.push(channelId);
    await auth.setCustomUserClaims(uid, {
      ...customClaims,
      leading,
    });
    return res.status(200).send({});
  } catch (error: any) {
    return res.status(500).send({
      error: error.message,
    });
  }
}
export default fbAuth(handler);
