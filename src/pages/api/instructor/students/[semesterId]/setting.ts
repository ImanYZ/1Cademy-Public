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
import { INodeVersion } from "src/types/INodeVersion";
import { detach } from "src/utils/helpers";
import { retrieveAndsignalAllUserNodesChanges } from "src/utils";
import { deleteNode } from "src/utils/instructor";

export type InstructorSemesterSettingPayload = {
  syllabus: ISemesterSyllabusItem[];
  // days: number;
  startDate: string;
  endDate: string;
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
  isProposalRequired: boolean;
  isQuestionProposalRequired: boolean;
  isCastingVotesRequired: boolean;
  isGettingVotesRequired: boolean;
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
  semesterTitle: string;
};

const createNodeContent = (children: INodeLink[]) => {
  let content = "";
  for (const child of children) {
    content += `- ${child.title}\n`;
  }
  return content;
};

const createVersion = async (
  nodeData: INode | null,
  nodeChanges: any,
  nodeRef: DocumentReference,
  userData: IUser,
  isNew: boolean = false
) => {
  let titleChanged = false;
  let contentChanged = false;
  let addedParents = false;
  let addedChildren = false;
  let removedParents = false;
  let removedChildren = false;
  if (nodeData) {
    // calculate changed values
    if (nodeChanges.title && nodeData.title !== nodeChanges.title) {
      titleChanged = true;
    }

    if (nodeChanges.content && nodeData.content !== nodeChanges.content) {
      titleChanged = true;
    }

    if (nodeChanges.children) {
      const changesChildIds: string[] = nodeChanges.children.map((child: any) => child.node);
      const childIds: string[] = nodeData.children.map(child => child.node);
      const _addedChildren = changesChildIds.filter(changesChildId => childIds.indexOf(changesChildId) === -1);
      const _removedChildren = childIds.filter(childId => changesChildIds.indexOf(childId) === -1);
      addedChildren = !!_addedChildren.length;
      removedChildren = !!_removedChildren.length;
    }

    if (nodeChanges.parents) {
      const changesParentIds: string[] = nodeChanges.parents.map((parent: any) => parent.node);
      const parentIds: string[] = nodeData.parents.map(parent => parent.node);
      const _addedParents = changesParentIds.filter(changesParentId => parentIds.indexOf(changesParentId) === -1);
      const _removedParents = parentIds.filter(parentId => changesParentIds.indexOf(parentId) === -1);
      addedParents = !!_addedParents.length;
      removedParents = !!_removedParents.length;
    }
  }

  const anythingChanged =
    titleChanged || contentChanged || addedParents || addedChildren || removedParents || removedChildren;

  if (!isNew && anythingChanged) {
    // TODO: move these to queue
    await detach(async () => {
      let batch = db.batch();
      let writeCounts = 0;
      // In both cases of accepting an improvement proposal and a child proposal,
      // we need to signal all the users that it's changed.
      await retrieveAndsignalAllUserNodesChanges({
        batch,
        linkedId: nodeRef.id,
        nodeChanges,
        major: true,
        currentTimestamp: Timestamp.now(),
        updatedAt: Timestamp.now(),
        writeCounts,
      });
      await commitBatch(batch);
    });
  }
  if (anythingChanged || isNew) {
    let versionData = {
      content: nodeChanges.content || nodeData?.content,
      title: nodeChanges.title || nodeData?.title,
      fullname: `${userData.fName} ${userData.lName}`,
      children: (nodeChanges.children as INodeLink[]) || nodeData?.children,
      addedInstitContris: false,
      accepted: true,
      imageUrl: userData.imageUrl,
      updatedAt: new Date(),
      chooseUname: userData.chooseUname,
      node: nodeRef.id,
      parents: (nodeChanges.parents as INodeLink[]) || nodeData?.parents,
      deleted: false,
      corrects: 1,
      proposer: userData.uname,
      viewers: 1,
      proposal: "", // reason of purposed changes
      addedParents,
      removedParents,
      changedContent: contentChanged,
      changedTitle: titleChanged,
      addedChildren,
      removedChildren,
      awards: 0,
      summary: "",
      nodeImage: "",
      referenceIds: nodeData?.referenceIds || [],
      references: nodeData?.references || [],
      referenceLabels: nodeData?.referenceLabels || [],
      wrongs: 0,
      createdAt: new Date(),
      tags: nodeData?.tags || [],
      tagIds: nodeData?.tagIds || [],
    } as INodeVersion;
    return { versionRef: db.collection("relationVersions").doc(), versionData };
  }

  return { versionRef: null, versionData: null };
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
  let content = createNodeContent(children);
  const nodeData = {
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
  } as INode;
  batch.set(nodeRef, nodeData);
  // first version
  const { versionRef, versionData } = await createVersion(nodeData, {}, nodeRef, userData, true);
  if (versionRef) {
    batch.set(versionRef, versionData);
  }
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
  semesterTitle,
}: IProcessNodeParam): Promise<[WriteBatch, number]> => {
  if (!nodeRef) {
    if (item.node) {
      nodeRef = db.collection("nodes").doc(item.node);
    } else {
      nodeRef = db.collection("nodes").doc();
    }
  }

  const children: INodeLink[] = [];
  const childRefs: {
    [title: string]: DocumentReference;
  } = {};
  let subChapter = 1;
  if (item.children && item.children.length) {
    for (const child of item.children) {
      const childRef = child.node ? db.collection("nodes").doc(child.node) : db.collection("nodes").doc();
      childRefs[child.title] = childRef;
      children.push({
        node: childRef.id,
        title: `Ch.${chapter}.${subChapter} ${child.title} - ${semesterTitle}`,
        type: "Relation",
      });
      subChapter++;
    }
  }

  subChapter = 1;
  if (item.children && item.children.length) {
    for (const child of item.children) {
      const childRef = childRefs[child.title];
      [batch, writeCounts] = await processNodeIdsFromSyllabusItem({
        batch,
        writeCounts,
        item: child,
        nodeIds,
        updateNodes,
        userData,
        parentId: nodeRef.id,
        parentTitle: `Ch.${chapter} ${item.title} - ${semesterTitle}`,
        universityTitle,
        nodeRef: childRef,
        tagIds,
        tags,
        chapter: `${chapter}.${subChapter}`,
        semesterTitle,
      });
      subChapter++;
    }
  }

  const _tagIds = [...tagIds];
  const _tags = [...tags];

  let parentTagIdx = _tagIds.indexOf(parentId);
  if (parentTagIdx === -1) {
    _tagIds.push(parentId);
    _tags.push(parentTitle);
  } else {
    _tagIds[parentTagIdx] = parentId;
    _tags[parentTagIdx] = parentTitle;
  }

  if (item.node) {
    if (updateNodes) {
      const nodeChanges = {
        title: `Ch.${chapter} ${item.title} - ${semesterTitle}`,
        tagIds: _tagIds,
        tags: _tags,
        parents: [
          {
            node: parentId,
            title: parentTitle,
            type: "Relation",
          },
        ],
        children,
        content: createNodeContent(children),
        deleted: false,
      };

      const nodeData = (await nodeRef.get()).data() as INode;
      const { versionRef, versionData } = await createVersion(nodeData, nodeChanges, nodeRef, userData, false);
      if (versionRef) {
        batch.set(versionRef, versionData);
      }

      batch.update(nodeRef, nodeChanges);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }
    nodeIds.push(item.node);
  } else if (updateNodes) {
    const newId = await createNode(
      batch,
      userData,
      `Ch.${chapter} ${item.title} - ${semesterTitle}`,
      parentId,
      parentTitle,
      universityTitle,
      nodeRef,
      children,
      _tagIds,
      _tags
    );
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    item.node = newId;
    // Creating userNodes
    const userNodeRef = db.collection("userNodes").doc();
    batch.set(userNodeRef, {
      visible: true,
      open: false,
      bookmarked: false,
      changed: false,
      correct: false,
      createdAt: new Date(),
      deleted: false,
      isStudied: false,
      node: newId,
      updatedAt: new Date(),
      user: userData.uname,
      wrong: false,
    });
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

    const semesterNodeRef = db.collection("nodes").doc(semesterData.tagId);
    const semesterNodeData = (await semesterNodeRef.get()).data() as INode;
    // university, department, program, course and semester
    const _tagIds = [
      semesterData.uTagId,
      semesterData.dTagId,
      semesterData.pTagId,
      semesterData.cTagId,
      semesterData.tagId,
    ].filter(tagId => typeof tagId !== "undefined");
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
          semesterTitle: semesterNodeData.title,
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
        semesterTitle: semesterNodeData.title,
      });
      chapter++;
    }

    await commitBatch(batch);

    writeCounts = 0;
    batch = db.batch();

    // adding chapter nodes to semester node as children
    const semesterChildren: INodeLink[] = [];
    for (const syllabusItem of payload.syllabus) {
      const nodeData = (await db.collection("nodes").doc(String(syllabusItem.node)).get()).data() as INode;
      semesterChildren.push({
        node: String(syllabusItem.node),
        title: nodeData.title,
        type: "Relation",
      });
    }

    // update
    batch.update(semesterNodeRef, {
      children: semesterChildren,
      changedAt: Timestamp.now(),
    });
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

    const removedNodeIds = existingNodeIds.filter((existingNodeId: string) => nodeIds.indexOf(existingNodeId) === -1);
    // flag removed nodes as deleted=true
    for (const removedNodeId of removedNodeIds) {
      [batch, writeCounts] = await deleteNode({
        nodeId: removedNodeId,
        batch,
        writeCounts,
      });
    }

    const startDate = moment(payload.startDate);
    const endDate = moment(payload.endDate);

    semesterData.syllabus = payload.syllabus;
    semesterData.startDate = Timestamp.fromDate(startDate.toDate());
    semesterData.endDate = Timestamp.fromDate(endDate.toDate());
    semesterData.days = endDate.diff(startDate, "days");
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

    semesterData.isProposalRequired = payload.isProposalRequired;
    semesterData.isQuestionProposalRequired = payload.isQuestionProposalRequired;
    semesterData.isCastingVotesRequired = payload.isCastingVotesRequired;
    semesterData.isGettingVotesRequired = payload.isGettingVotesRequired;

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
