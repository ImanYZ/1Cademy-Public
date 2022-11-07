import { checkRestartBatchWriteCounts, commitBatch, db } from "@/lib/firestoreServer/admin";
import { DocumentReference, Timestamp, WriteBatch } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { ISemester } from "src/types/ICourse";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { ISemesterSyllabusItem } from "src/types/ICourse";
import moment from "moment";
import { INodeLink } from "src/types/INodeLink";

export type InstructorSemesterSettingPayload = {
  syllabus: ISemesterSyllabusItem[];
  days: number;
  nodeProposals: {
    startDate: string;
    endDate: string;
    numPoints: number;
    numProposalPerDay: number;
    totalDaysOfCourse: number;
  };
  questionProposals: {
    startDate: string;
    endDate: string;
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
  item: ISemesterSyllabusItem;
  nodeIds: string[];
  updateNodes: boolean;
  userData: IUser;
  parentId: string;
  parentTitle: string;
  universityTitle: string;
  nodeRef: DocumentReference | null;
  tagIds: string[];
  tags: string[];
  chapter: string;
};

const createNode = async (
  batch: WriteBatch,
  userData: IUser,
  nodeTitle: string,
  parentId: string,
  parentTitle: string,
  universityTitle: string,
  nodeRef: DocumentReference | null,
  children: INodeLink[],
  tagIds: string[],
  tags: string[]
): Promise<string> => {
  if (!nodeRef) {
    nodeRef = db.collection("nodes").doc();
  }
  let content = "";
  for (const child of children) {
    content += `${child.title}\n`;
  }
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
    content,
    choices: [],
    viewers: 0,
    versions: 1,
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
    children,
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
    tagIds,
    tags,
  } as INode);
  return nodeRef.id;
};

const processNodeIdsFromSyllabusItem = async ({
  batch,
  writeCounts,
  item,
  nodeIds,
  updateNodes = false,
  userData,
  parentId,
  parentTitle,
  universityTitle,
  nodeRef,
  tagIds,
  tags,
  chapter,
}: IProcessNodeParam): Promise<[WriteBatch, number]> => {
  if (item.node) {
    // TOOD: need to update title for children -> parent entry
    const _nodeRef = db.collection("nodes").doc(item.node);
    batch.update(_nodeRef, {
      title: `Ch.${chapter} ${item.title}`,
    });
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    nodeIds.push(item.node);
  } else if (updateNodes) {
    if (!nodeRef) {
      nodeRef = db.collection("nodes").doc();
    }
    const children: INodeLink[] = [];
    let subChapter = 1;
    if (item.children && item.children.length) {
      for (const child of item.children) {
        const childRef = db.collection("nodes").doc();
        children.push({
          node: childRef.id,
          title: child.title,
          nodeType: "Relation",
        });
        [batch, writeCounts] = await processNodeIdsFromSyllabusItem({
          batch,
          writeCounts,
          item: child,
          nodeIds,
          updateNodes,
          userData,
          parentId: nodeRef.id,
          parentTitle: `Ch.${chapter} ${item.title}`,
          universityTitle,
          nodeRef: childRef,
          tagIds,
          tags,
          chapter: `${chapter}.${subChapter}`,
        });
        subChapter++;
      }
    }
    await createNode(
      batch,
      userData,
      `Ch.${chapter} ${item.title}`,
      parentId,
      parentTitle,
      universityTitle,
      nodeRef,
      children,
      tagIds,
      tags
    );
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    item.node = nodeRef.id;
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
    // university, department, program, course and semester
    const _tagIds = [
      semesterData.uTagId,
      semesterData.dTagId,
      semesterData.pTagId,
      semesterData.cTagId,
      semesterData.tagId,
    ];
    const tagNodes = await db.collection("nodes").where("__name__", "in", _tagIds).get();
    const tagIds: string[] = [];
    const tags: string[] = [];
    for (const tagNode of tagNodes.docs) {
      tagIds.push(tagNode.id);
      tags.push(tagNode.data()?.title);
    }

    for (const syllabusItem of semesterData.syllabus) {
      if (syllabusItem.node) {
        existingNodeIds.push(syllabusItem.node);
      }
      if (syllabusItem.children) {
        [batch, writeCounts] = await processNodeIdsFromSyllabusItem({
          batch,
          writeCounts,
          item: syllabusItem,
          nodeIds: existingNodeIds,
          updateNodes: false,
          userData,
          parentId: semesterData.tagId,
          parentTitle: semesterNodeData.title,
          universityTitle: semesterData.uTitle,
          nodeRef: null,
          tagIds,
          tags,
          chapter: "1",
        });
      }
    }

    let chapter = 1;
    for (const syllabusItem of payload.syllabus) {
      [batch, writeCounts] = await processNodeIdsFromSyllabusItem({
        batch,
        writeCounts,
        item: syllabusItem,
        nodeIds,
        updateNodes: true,
        userData,
        parentId: semesterData.tagId,
        parentTitle: semesterNodeData.title,
        universityTitle: semesterData.uTitle,
        nodeRef: null,
        tagIds,
        tags,
        chapter: String(chapter),
      });
      chapter++;
    }

    const removedNodeIds = existingNodeIds.filter((existingNodeId: string) => nodeIds.indexOf(existingNodeId) === -1);
    // flag removed nodes as deleted=true
    for (const removedNodeId of removedNodeIds) {
      const nodeRef = db.collection("nodes").doc(removedNodeId);
      const nodeData = (await nodeRef.get()).data() as INode;
      nodeData.deleted = true;
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
