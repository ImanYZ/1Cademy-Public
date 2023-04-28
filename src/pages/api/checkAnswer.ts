import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../lib/firestoreServer/admin";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { arrayToChunks, getUserNode } from "src/utils";
import { IPractice } from "src/types/IPractice";
import { Timestamp } from "firebase-admin/firestore";
import { getOrCreateUserNode, isNodePracticePresentable } from "src/utils/course-helpers";
import { IUserNode } from "src/types/IUserNode";
import fbAuth from "src/middlewares/fbAuth";
import moment from "moment";
import { checkRestartBatchWriteCounts, commitBatch } from "@/lib/firestoreServer/admin-exp";

export type ICheckAnswerRequestParams = {
  nodeId: string;
  flashcardId: string;
  answers: boolean[];
  postpone: boolean;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      throw new Error(`${req.method} not allowed.`);
    }

    const currentTimestamp = Timestamp.now();

    const userData = req.body.data.user.userData as IUser;
    const payload = req.body as ICheckAnswerRequestParams;

    const practiceDoc = await db.collection("practice").doc(payload.flashcardId).get();
    if (!practiceDoc.exists) {
      throw new Error(`invalid request`);
    }
    const practiceRef = db.collection("practice").doc(payload.flashcardId);
    const practice = practiceDoc.data() as IPractice;

    if (practice.questionNodes.includes(payload.nodeId)) {
      throw new Error(`invalid request`);
    }

    const courseDoc = await db.collection("courses").doc(practice.tagId).get();
    if (!courseDoc.exists) {
      throw new Error(`invalid request`);
    }

    const nodeDoc = await db.collection("nodes").doc(payload.nodeId).get();
    if (!nodeDoc.exists) {
      throw new Error(`invalid request`);
    }
    const nodeData = nodeDoc.data() as INode;

    const lastPresented: Date =
      practice.lastPresented instanceof Timestamp
        ? practice.lastPresented.toDate()
        : moment().add(20, "minutes").toDate();
    const practiceDuration: number = moment(lastPresented).diff(moment(), "minute", true);

    let q = 0;
    let corrects = 0;
    for (let i = 0; i < (nodeData.choices || []).length; i++) {
      if (nodeData.choices?.[i]?.correct === payload.answers[i]) {
        corrects += 1;
      } else {
        corrects -= 1;
      }
    }
    corrects /= (nodeData.choices || []).length;
    if (corrects === 1 && practiceDuration <= 1.3) {
      q = 5;
    } else if (corrects >= 0.7 && practiceDuration <= 2.5) {
      q = 4;
    } else if (corrects >= 0.4 && practiceDuration <= 3.1) {
      q = 3;
    } else if (corrects >= 0.1 && practiceDuration <= 4) {
      q = 2;
    } else {
      q = 1;
    }

    let e_factor = practice.eFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (e_factor < 1.3) {
      e_factor = 1.3;
    }
    // Get next inter-repetition interval after the n-th repetition.
    let i_interval = 1;
    if (payload.postpone) {
      i_interval = 1;
    } else if (q <= 4) {
      // If the student has clicked "I want to postpone this to tomorrow." or if we think they've forgotten the concept.
      i_interval = 0;
    } else {
      const last_i_interval = practice.iInterval;
      if (last_i_interval === 0) {
        i_interval = 1;
      } else if (last_i_interval === 1) {
        i_interval = 6;
      } else {
        i_interval = Math.ceil(last_i_interval * e_factor);
      }
    }

    let batch = db.batch();
    let writeCounts = 0;

    const userNodeDoc = await getOrCreateUserNode({
      nodeId: practice.node,
      user: userData.uname,
    });
    const userNodeRef = db.collection("userNodes").doc(userNodeDoc.id);
    const userNodeData = userNodeDoc.data() as IUserNode;

    if (q >= 4) {
      // TODO: Update points in relative chapters and stat documents for Student
      batch.update(userNodeRef, {
        isStudied: true,
        updatedAt: currentTimestamp,
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      const userNodeLogRef = db.collection("userNodesLog").doc();
      delete (userNodeData as unknown as any).updatedAt;
      batch.set(userNodeLogRef, {
        ...userNodeData,
        isStudied: true,
        createdAt: currentTimestamp,
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    batch.update(practiceRef, {
      answers: payload.answers,
      q,
      eFactor: e_factor,
      iInterval: i_interval,
      nextDate: moment().add(i_interval, "day").toDate(),
      start_practice: lastPresented,
      end_practice: currentTimestamp,
      updatedAt: currentTimestamp,
    });

    await commitBatch(batch);

    return res.json({
      flashcardId: practiceDoc.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default fbAuth(handler);
