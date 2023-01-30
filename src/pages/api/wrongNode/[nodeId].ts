import { db, MAX_TRANSACTION_WRITES, TWriteOperation } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";

import fbAuth from "../../../middlewares/fbAuth";
import { arrayToChunks, UpDownVoteNode } from "../../../utils";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { user } = req.body.data as any;
    const fullname = `${user.userData.fName} ${user.userData.lName}`;
    const tWriteOperations: TWriteOperation[] = [];

    await db.runTransaction(async t => {
      await UpDownVoteNode({
        fullname,
        uname: user.userData.uname,
        imageUrl: user.userData.imageUrl,
        chooseUname: user.userData.chooseUname,
        nodeId: req.query.nodeId,
        actionType: "Wrong",
        t,
        tWriteOperations,
      });

      const _tWriteOperations = tWriteOperations.splice(0, MAX_TRANSACTION_WRITES);
      for (const operation of _tWriteOperations) {
        const { objRef, data, operationType } = operation;
        switch (operationType) {
          case "update":
            t.update(objRef, data);
            break;
          case "set":
            t.set(objRef, data);
            break;
          case "delete":
            t.delete(objRef);
            break;
        }
      }
    });

    const chunkedArray = arrayToChunks(tWriteOperations);
    for (const chunk of chunkedArray) {
      await db.runTransaction(async t => {
        for (const operation of chunk) {
          const { objRef, data, operationType } = operation;
          switch (operationType) {
            case "update":
              t.update(objRef, data);
              break;
            case "set":
              t.set(objRef, data);
              break;
            case "delete":
              t.delete(objRef);
              break;
          }
        }
      });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default fbAuth(handler);
