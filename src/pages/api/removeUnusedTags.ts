import { NextApiRequest, NextApiResponse } from "next";

import { doRemoveUnusedTags } from '../../utils';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await doRemoveUnusedTags();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;