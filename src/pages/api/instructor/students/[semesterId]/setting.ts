import { checkRestartBatchWriteCounts, commitBatch } from "@/lib/firestoreServer/admin";
import { getAuth } from "firebase-admin/auth";
import { Timestamp, WriteBatch } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { ISemester, ISemesterStudentStat } from "src/types/ICourse";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { ISemesterSyllabusItem } from "src/types/ICourse";
import { arrayToChunks, initializeNewReputationData } from "src/utils";
import { searchAvailableUnameByEmail } from "src/utils/instructor";
import { db } from "typesenseIndexer";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

type InstructorSemesterSettingPayload = {
  syllabus: ISemesterSyllabusItem[];
  days: number;
  nodeProposals: {
    startDate: Timestamp;
    endDate: Timestamp;
    numPoints: number;
    numProposalPerDay: number;
    totalDaysOfCourse: number;
  };
  questionProposals: {
    startDate: Timestamp;
    endDate: Timestamp;
    numPoints: number;
    numQuestionsPerDay: number;
    totalDaysOfCourse: number;
  };
  votes: {
    pointIncrementOnAgreement: number;
    pointDecrementOnAgreement: number;
    onReceiveVote: number;
    onReceiveDownVote: number;
    onReceiveStar: number;
  };
};

type IProcessNodeParam = {
  batch: WriteBatch;
  writeCounts: number;
  children: ISemesterSyllabusItem[];
  nodeIds: string[];
  updateNodes: boolean;
  userData: IUser;
  parentId: string;
  parentTitle: string;
  universityTitle: string;
};

const createNode = async (
  batch: WriteBatch,
  userData: IUser,
  nodeTitle: string,
  parentId: string,
  parentTitle: string,
  universityTitle: string
): Promise<string> => {
  const nodeRef = db.collection("nodes").doc();
  batch.set(nodeRef, {
    aChooseUname: userData.chooseUname,
    aImgUrl: userData.imageUrl,
    aFullname: `${userData.fName} ${userData.lName}`,
    admin: userData.uname,
    corrects: 0,
    wrongs: 0,
    nodeType: "Relation",
    contribNames: [`${userData.fName} ${userData.lName}`],
    contributors: {
      [`${userData.uname}`]: {
        imageUrl: userData.imageUrl,
        fullname: `${userData.fName} ${userData.lName}`,
        reputation: 0,
        chooseUname: userData.chooseUname,
      },
    },
    title: nodeTitle,
    isTag: true,
    nodeImage: "",
    comments: 0,
    deleted: false,
    content: "",
    choices: [],
    viewers: 0,
    versions: 1,
    tags: [],
    tagIds: [],
    height: 0,
    studied: 0,
    references: [],
    referenceLabels: [],
    referenceIds: [],
    parents: [
      {
        node: parentId,
        title: parentTitle,
        type: "Relation",
        label: "",
      },
    ],
    children: [],
    institNames: [universityTitle],
    institutions: {
      [universityTitle]: {
        reputation: 0,
      },
    },
    locked: true,
    changedAt: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    maxVersionRating: 0,
  } as INode);
  return nodeRef.id;
};

const processNodeIdsFromSyllabusChildren = async ({
  batch,
  writeCounts,
  children,
  nodeIds,
  updateNodes = false,
  userData,
  parentId,
  parentTitle,
  universityTitle,
}: IProcessNodeParam): Promise<[WriteBatch, number]> => {
  for (const child of children) {
    if (child.node) {
      nodeIds.push(child.node);
    } else if (updateNodes) {
      const newId = await createNode(batch, userData, child.title, parentId, parentTitle, universityTitle);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
      child.node = newId;
    }
    if (child.children && child.children.length) {
      const parentNode = (await db.collection("nodes").doc(String(child.node)).get()).data() as INode;
      [batch, writeCounts] = await processNodeIdsFromSyllabusChildren({
        batch,
        writeCounts,
        children: child.children,
        nodeIds,
        updateNodes,
        userData,
        parentId: String(child.node),
        parentTitle: parentNode.title,
        universityTitle,
      });
    }
  }
  return [batch, writeCounts];
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (!req.body?.data?.user?.instructor) {
      throw new Error("your are not instructor");
    }
    const userData = req?.body?.data?.user?.userData as IUser;

    const instructorUname = req.body.data.user.userData.uname;
    let batch = db.batch();
    let writeCounts = 0;

    const { semesterId } = req.query;
    const payload = req.body as InstructorSemesterSettingPayload;

    let existingNodeIds: string[] = [];
    let nodeIds: string[] = [];

    const semesterRef = db.collection("semesters").doc(String(semesterId));
    const semesterData = (await semesterRef.get()).data() as ISemester;

    // check if current user is a instructor and access to this course
    if (semesterData.instructors.indexOf(instructorUname) === -1) {
      throw new Error("access denied");
    }

    const semesterNodeData = (await db.collection("nodes").doc(semesterData.tagId).get()).data() as INode;

    for (const syllabusItem of semesterData.syllabus) {
      if (syllabusItem.node) {
        existingNodeIds.push(syllabusItem.node);
      }
      if (syllabusItem.children) {
        [batch, writeCounts] = await processNodeIdsFromSyllabusChildren({
          batch,
          writeCounts,
          children: syllabusItem.children,
          nodeIds: existingNodeIds,
          updateNodes: false,
          userData,
          parentId: semesterData.tagId,
          parentTitle: semesterNodeData.title,
          universityTitle: semesterData.uTitle,
        });
      }
    }

    for (const syllabusItem of payload.syllabus) {
      if (syllabusItem.node) {
        nodeIds.push(syllabusItem.node);
      }
      if (syllabusItem.children) {
        [batch, writeCounts] = await processNodeIdsFromSyllabusChildren({
          batch,
          writeCounts,
          children: syllabusItem.children,
          nodeIds,
          updateNodes: true,
          userData,
          parentId: semesterData.tagId,
          parentTitle: semesterNodeData.title,
          universityTitle: semesterData.uTitle,
        });
      }
    }

    const removedNodeIds = existingNodeIds.filter((existingNodeId: string) => nodeIds.indexOf(existingNodeId) === -1);
    // flag removed nodes as deleted=true
    for (const removedNodeId of removedNodeIds) {
      const nodeRef = db.collection("nodes").doc(removedNodeId);
      const nodeData = (await nodeRef.get()).data() as INode;
      nodeData.deleted = false;
      batch.update(nodeRef, nodeData);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    semesterData.syllabus = payload.syllabus;
    semesterData.days = Math.floor(payload.days);
    semesterData.nodeProposals = {
      startDate: Timestamp.fromDate(moment(payload.nodeProposals.startDate).toDate()),
      endDate: Timestamp.fromDate(moment(payload.nodeProposals.endDate).toDate()),
      numPoints: payload.nodeProposals.numPoints,
      numProposalPerDay: payload.nodeProposals.numProposalPerDay,
      totalDaysOfCourse: payload.nodeProposals.totalDaysOfCourse,
    };

    semesterData.questionProposals = {
      startDate: Timestamp.fromDate(moment(payload.questionProposals.startDate).toDate()),
      endDate: Timestamp.fromDate(moment(payload.questionProposals.endDate).toDate()),
      numPoints: payload.questionProposals.numPoints,
      numQuestionsPerDay: payload.questionProposals.numQuestionsPerDay,
      totalDaysOfCourse: payload.questionProposals.totalDaysOfCourse,
    };

    semesterData.votes = { ...payload.votes };
    batch.update(semesterRef, semesterData);
    await commitBatch(batch);

    res.status(200).json({ message: "students updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Unable to process your request" });
  }
}

export default fbAuth(handler);
