import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IUser } from "src/types/IUser";
import { checkInstantApprovalForProposal } from "src/utils/course-helpers";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { tagIds } = req.body;
    const { uname } = req?.body?.data?.user?.userData as IUser;
    const canInstantApprove = await checkInstantApprovalForProposal(tagIds, uname);
    return res.status(200).json({ canInstantApprove });
  } catch (error) {
    return res.status(500).json({ error: true });
  }
}

export default fbAuth(handler);
