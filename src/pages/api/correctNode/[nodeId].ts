import { NextApiRequest, NextApiResponse } from "next";

import fbAuth from "../../../middlewares/fbAuth";
import { UpDownVoteNode } from "../../../utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user } = req.body.data as any;
    const fullname = `${user.userData.fName} ${user.userData.lName}`;

    await UpDownVoteNode({
      fullname,
      uname: user.userData.uname,
      imageUrl: user.userData.imageUrl,
      chooseUname: user.userData.chooseUname,
      nodeId: req.query.nodeId,
      actionType: "Correct",
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default fbAuth(handler);
