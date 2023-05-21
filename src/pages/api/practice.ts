import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../lib/firestoreServer/admin";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { arrayToChunks } from "src/utils";
import { IPractice } from "src/types/IPractice";
import { Timestamp } from "firebase-admin/firestore";
import { getOrCreateUserNode, getStudentPracticeDayStats, isNodePracticePresentable } from "src/utils/course-helpers";
import { IUserNode } from "src/types/IUserNode";
import fbAuth from "src/middlewares/fbAuth";
import { ISemester } from "src/types/ICourse";

type IPracticeParams = {
  tagId: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      throw new Error(`${req.method} not allowed.`);
    }

    const userData = req.body.data.user.userData as IUser;
    const payload = req.body as IPracticeParams;

    const semesterDoc = await db.collection("semesters").doc(payload.tagId).get();
    if (!semesterDoc.exists) {
      throw new Error(`invalid request`);
    }
    const semester = semesterDoc.data() as ISemester;

    const bfs = async (_nodeIds: string[]): Promise<IPractice | null> => {
      const nodeIdsChunk = arrayToChunks(_nodeIds, 10);
      const cRelationNodes: string[] = [];
      for (const nodeIds of nodeIdsChunk) {
        const nodes = await db.collection("nodes").where("__name__", "in", nodeIds).get();
        for (const node of nodes.docs) {
          const nodeData = node.data() as INode;
          for (const child of nodeData.children) {
            if (child.type === "Concept" || child.type === "Relation") {
              // looking for practice
              const practice = await isNodePracticePresentable({
                user: userData.uname,
                tagId: payload.tagId,
                nodeId: child.node,
              });
              if (practice !== null) {
                return practice;
              }

              cRelationNodes.push(child.node);
            }
          }
        }
      }

      if (!cRelationNodes.length) {
        return null;
      }

      return bfs(cRelationNodes);
    };

    let practice: IPractice | null = await isNodePracticePresentable({
      nodeId: payload.tagId,
      tagId: payload.tagId,
      user: userData.uname,
    });

    if (practice === null) {
      practice = await bfs([semester.root]);
    }

    if (practice === null) {
      return res.json({
        done: true,
      });
    }

    let questionId: string = practice.questionNodes[0];
    if (practice.lastId) {
      let questionIdx = practice.questionNodes.indexOf(practice.lastId);
      if (questionIdx >= practice.questionNodes.length - 1) {
        questionIdx = 0;
      } else {
        questionIdx += 1;
      }
      questionId = practice.questionNodes[questionIdx];
    }

    const questionNode = await db.collection("nodes").doc(questionId).get();
    const questionNodeData = questionNode.data() as INode;

    const userNode = await getOrCreateUserNode({
      nodeId: questionNode.id,
      user: userData.uname,
    });
    const userNodeData = userNode.data() as IUserNode;
    const theNode = {
      id: questionNode.id,
      choices: questionNodeData.choices || [],
      tags: questionNodeData.tags,
      content: questionNodeData.content,
      corrects: questionNodeData.corrects,
      nodeImage: questionNodeData.nodeImage ?? "",
      nodeVideo: questionNodeData.nodeVideo ?? "",
      nodeAudio: questionNodeData.nodeAudio ?? "",
      studied: questionNodeData.studied,
      title: questionNodeData.title,
      wrongs: questionNodeData.wrongs,
      correct: userNodeData.correct,
      isStudied: userNodeData.isStudied,
      wrong: userNodeData.wrong,
      locked: Boolean(questionNodeData.locked),
      parents: questionNodeData.parents.map(c => c.node),
    };
    const currentTimestamp = Timestamp.fromDate(new Date());
    const studentPracticeDay = await getStudentPracticeDayStats(semesterDoc.id, userData.uname);

    // This is required to only check answers after this timestamp in do_check_answer().
    const flashcardRef = db.collection("practice").doc(practice.documentId!);
    await flashcardRef.update({
      lastId: theNode.id,
      lastPresented: currentTimestamp,
      updatedAt: currentTimestamp,
    });
    return res.json({
      flashcardId: practice.documentId,
      question: theNode,
      ...studentPracticeDay,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default fbAuth(handler);
