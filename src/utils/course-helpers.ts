import { DocumentSnapshot, Timestamp, WriteBatch } from "firebase-admin/firestore";
import { checkRestartBatchWriteCounts, db, MAX_TRANSACTION_WRITES, TWriteOperation } from "@/lib/firestoreServer/admin";
import { NodeType } from "src/types";
import {
  ISemester,
  ISemesterStudentSankey,
  ISemesterStudentStat,
  ISemesterStudentStatDay,
  ISemesterStudentVoteStat,
  ISemesterSyllabusItem,
} from "src/types/ICourse";
import { arrayToChunks } from "./arrayToChunks";
import { convertToTGet } from "./convertToTGet";
import { getTypedCollections } from "./getTypedCollections";
import { IUserNodeVersion } from "src/types/IUserNodeVersion";
import { SemesterStudentStat, SemesterStudentVoteStat } from "src/instructorsTypes";
import moment from "moment";
import { INodeType } from "src/types/INodeType";
import { IPractice } from "src/types/IPractice";
import { IUserNode } from "src/types/IUserNode";
import { INode } from "src/types/INode";
import { INotebook } from "src/types/INotebook";
import { createPractice } from "./version-helpers";
import { IUser } from "src/types/IUser";
import { ISemesterStudentVoteStatDay } from "src/types/ICourse";

type IStudentPracticeDayStat = {
  practicesLeft: number;
  correctPractices: number;
  completedDays: number;
  totalDays: number;
};
export const getStudentPracticeDayStats = async (
  semesterId: string,
  uname: string
): Promise<IStudentPracticeDayStat> => {
  const semesterDoc = await db.collection("semesters").doc(semesterId).get();
  const semesterData = semesterDoc.data() as ISemester;

  const practiceDayStat: IStudentPracticeDayStat = {
    practicesLeft: 0,
    correctPractices: 0,
    totalDays: 0,
    completedDays: 0,
  };

  if (!semesterData) return practiceDayStat;

  practiceDayStat.totalDays = moment(semesterData.endDate.toDate()).diff(semesterData.startDate.toDate());

  const studentVoteStats = await db
    .collection("semesterStudentVoteStats")
    .where("uname", "==", uname)
    .where("tagId", "==", semesterId)
    .limit(1)
    .get();

  if (studentVoteStats.docs.length === 0) return practiceDayStat;

  const studentVoteStat = studentVoteStats.docs[0].data() as ISemesterStudentVoteStat;
  const statDate = moment(studentVoteStat.createdAt.toDate()).format("YYYY-MM-DD");
  const dayIdx = getStatVoteDayIdx(statDate, studentVoteStat);

  const completedDays: number = studentVoteStat.days.reduce(
    (completed: number, day: ISemesterStudentVoteStatDay) =>
      day.correctPractices > semesterData?.dailyPractice?.numQuestionsPerDay ? completed + 1 : completed,
    0
  );
  practiceDayStat.completedDays = completedDays;

  const statDay = studentVoteStat.days[dayIdx];
  practiceDayStat.correctPractices = statDay.correctPractices;
  const practicesLeft = (semesterData?.dailyPractice?.numQuestionsPerDay || 0) - statDay.correctPractices;
  practiceDayStat.practicesLeft = practicesLeft < 0 ? 0 : practicesLeft;

  return practiceDayStat;
};

export const createSemesterNotebookForStudents = async (
  semesterId: string,
  studentUnames: string[],
  batch: WriteBatch,
  writeCounts: number
): Promise<
  [
    WriteBatch,
    number,
    {
      [uname: string]: string;
    }
  ]
> => {
  const semesterDoc = await db.collection("semesters").doc(semesterId).get();
  const semesterData = semesterDoc.data() as ISemester;
  const unameNotebooks: {
    [uname: string]: string;
  } = {};
  for (const uname of studentUnames) {
    const userDoc = await db.collection("users").doc(uname).get();
    const userData = userDoc.data() as IUser;
    const notebooks = await db
      .collection("notebooks")
      .where("owner", "==", uname)
      .where("defaultTagId", "==", semesterId)
      .where("title", "==", semesterData.title)
      .limit(1)
      .get();
    if (notebooks.docs.length) {
      unameNotebooks[uname] = notebooks.docs[0].id;
      [batch, writeCounts] = await createNotebookUserNode(notebooks.docs[0].id, semesterId, uname, batch, writeCounts);
      continue;
    }
    const notebookRef = db.collection("notebooks").doc();
    batch.set(notebookRef, {
      defaultTagId: semesterId,
      defaultTagName: semesterData.title,
      owner: userData.uname,
      ownerImgUrl: userData.imageUrl,
      ownerFullName: `${userData.fName} ${userData.lName}`,
      ownerChooseUname: userData.chooseUname,
      title: semesterData.title,
      isPublic: "none",
      users: [userData.uname],
      usersInfo: {
        [uname]: {
          role: "owner",
          imageUrl: userData.imageUrl,
          fullname: `${userData.fName} ${userData.lName}`,
          chooseUname: userData.chooseUname,
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as INotebook);
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

    unameNotebooks[uname] = notebookRef.id;
    [batch, writeCounts] = await createNotebookUserNode(notebookRef.id, semesterId, uname, batch, writeCounts);
  }

  return [batch, writeCounts, unameNotebooks];
};

export const createNotebookUserNode = async (
  notebookId: string,
  nodeId: string,
  uname: string,
  batch: WriteBatch,
  writeCounts: number
): Promise<[WriteBatch, number]> => {
  const userNodes = await db
    .collection("userNodes")
    .where("user", "==", uname)
    .where("node", "==", nodeId)
    .limit(1)
    .get();
  if (userNodes.docs.length) {
    const userNodeRef = db.collection("userNodes").doc(userNodes.docs[0].id);
    const userNode = userNodes.docs[0].data() as IUserNode;
    const notebooks = userNode.notebooks || [];
    const expands = userNode.expands || [];

    const notebookIdx = notebooks.indexOf(notebookId);
    if (notebookIdx === -1) {
      notebooks.push(notebookId);
      expands.push(true);
    } else {
      expands[notebookIdx] = true;
    }
    batch.update(userNodeRef, {
      notebooks,
      expands,
    });
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    return [batch, writeCounts];
  }

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
    node: nodeId,
    updatedAt: new Date(),
    user: uname,
    wrong: false,
    nodeChanges: {},
    expands: [false],
    notebooks: [notebookId],
  } as IUserNode);
  [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

  return [batch, writeCounts];
};

export const createPracticeForSemesterStudents = async (
  semesterId: string,
  studentUnames: string[],
  batch: WriteBatch,
  writeCounts: number
): Promise<[WriteBatch, number]> => {
  const semesterDoc = await db.collection("semesters").doc(semesterId).get();
  const bfs = async (_nodeIds: string[]) => {
    const nodeIdsChunk = arrayToChunks(_nodeIds, 10);
    const cRelationNodes: string[] = [];
    for (const nodeIds of nodeIdsChunk) {
      const nodes = await db.collection("nodes").where("__name__", "in", nodeIds).get();
      for (const node of nodes.docs) {
        const nodeData = node.data() as INode;
        if (!nodeData.tagIds.includes(semesterId)) {
          continue;
        }
        for (const child of nodeData.children) {
          if ((nodeData.nodeType === "Concept" || nodeData.nodeType === "Relation") && child.type === "Question") {
            // looking for practice
            [batch, writeCounts] = await createPractice({
              unames: studentUnames,
              tagIds: [semesterId],
              nodeId: child.node,
              parentId: node.id,
              currentTimestamp: Timestamp.now(),
              writeCounts,
              batch,
            });
          }
          cRelationNodes.push(child.node);
        }
      }
    }

    if (!cRelationNodes.length) {
      return;
    }

    await bfs(cRelationNodes);
  };

  const semester = semesterDoc.data() as ISemester;
  if (semester.root) {
    await bfs([semester.root]);
  }

  return [batch, writeCounts];
};

export const createOrRestoreStatDocs = async (
  semesterId: string,
  studentUname: string,
  batch: WriteBatch,
  writeCounts: number
): Promise<[WriteBatch, number]> => {
  const semesterStudentStats = await db
    .collection("semesterStudentStats")
    .where("uname", "==", studentUname)
    .where("tagId", "==", semesterId)
    .limit(1)
    .get();
  if (semesterStudentStats.docs.length) {
    for (const semesterStudentStatsDoc of semesterStudentStats.docs) {
      const semesterStudentStatRef = db.collection("semesterStudentStats").doc(semesterStudentStatsDoc.id);
      const semesterStudentStat = semesterStudentStatsDoc.data() as ISemesterStudentStat;
      if (!semesterStudentStat.deleted) continue;
      semesterStudentStat.deleted = false;
      batch.update(semesterStudentStatRef, semesterStudentStat);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }
  } else {
    const semesterStudentStatRef = db.collection("semesterStudentStats").doc();
    batch.set(semesterStudentStatRef, {
      days: [],
      tagId: semesterId,
      uname: studentUname,
      deleted: false,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    } as ISemesterStudentStat);
  }

  const semesterStudentVoteStats = await db
    .collection("semesterStudentVoteStats")
    .where("uname", "==", studentUname)
    .where("tagId", "==", semesterId)
    .limit(1)
    .get();
  if (semesterStudentVoteStats.docs.length) {
    for (const semesterStudentVoteStatsDoc of semesterStudentVoteStats.docs) {
      const semesterStudentVoteStatRef = db.collection("semesterStudentVoteStats").doc(semesterStudentVoteStatsDoc.id);
      const semesterStudentVoteStat = semesterStudentVoteStatsDoc.data() as ISemesterStudentVoteStat;
      if (!semesterStudentVoteStat.deleted) continue;
      semesterStudentVoteStat.deleted = false;
      batch.update(semesterStudentVoteStatRef, semesterStudentVoteStat);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }
  } else {
    const semesterStudentVoteStatRef = db.collection("semesterStudentVoteStats").doc();
    batch.set(semesterStudentVoteStatRef, {
      agreementsWithInst: 0,
      disagreementsWithInst: 0,
      improvements: 0,
      lastActivity: Timestamp.fromDate(new Date()),
      links: 0,
      newNodes: 0,
      nodes: 0,
      questionProposals: 0,
      questions: 0,
      questionPoints: 0,
      totalPoints: 0,
      votePoints: 0,
      votes: 0,
      instVotes: 0,
      upVotes: 0,
      downVotes: 0,
      days: [],
      tagId: semesterId,
      uname: studentUname,
      correctPractices: 0,
      totalPractices: 0,
      deleted: false,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    } as ISemesterStudentVoteStat);
  }

  const semesterStudentSankeys = await db
    .collection("semesterStudentSankeys")
    .where("uname", "==", studentUname)
    .where("tagId", "==", semesterId)
    .limit(1)
    .get();
  if (semesterStudentSankeys.docs.length) {
    for (const semesterStudentSankeyDoc of semesterStudentSankeys.docs) {
      const semesterStudentSankeyRef = db.collection("semesterStudentSankeys").doc(semesterStudentSankeyDoc.id);
      const semesterStudentSankey = semesterStudentSankeyDoc.data() as ISemesterStudentSankey;
      if (!semesterStudentSankey.deleted) continue;
      semesterStudentSankey.deleted = false;
      batch.update(semesterStudentSankeyRef, semesterStudentSankey);
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }
  } else {
    const semesterStudentSankeyRef = db.collection("semesterStudentSankeys").doc();
    batch.set(semesterStudentSankeyRef, {
      interactions: [],
      tagId: semesterId,
      uname: studentUname,
      deleted: false,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    } as ISemesterStudentSankey);
  }
  return [batch, writeCounts];
};

type INodePracticePresentableParams = {
  nodeId: string;
  tagId: string;
  user: string;
};
export const isNodePracticePresentable = async ({
  nodeId,
  tagId,
  user,
}: INodePracticePresentableParams): Promise<IPractice | null> => {
  const practices = await db
    .collection("practice")
    .where("user", "==", user)
    .where("tagId", "==", tagId)
    .where("node", "==", nodeId)
    .limit(1)
    .get();
  if (practices.docs.length) {
    const practice = practices.docs[0].data() as IPractice;
    const nextDate = practice.nextDate as Timestamp;
    if (!practice.lastPresented || (practice.nextDate && moment().isSameOrAfter(nextDate.toDate())) || !practice.q) {
      practice.documentId = practices.docs[0].id;
      return practice;
    }
  }
  return null;
};

type IGetOrCreateUserNodeParams = {
  nodeId: string;
  user: string;
};
export const getOrCreateUserNode = async ({
  nodeId,
  user,
}: IGetOrCreateUserNodeParams): Promise<DocumentSnapshot<any>> => {
  const userNodes = await db
    .collection("userNodes")
    .where("user", "==", user)
    .where("node", "==", nodeId)
    .limit(1)
    .get();
  if (userNodes.docs.length) {
    return userNodes.docs[0];
  }
  const userNodeData: IUserNode = {
    changed: false,
    correct: false,
    deleted: false,
    isStudied: false,
    bookmarked: false,
    node: nodeId,
    notebooks: [],
    expands: [],
    open: true,
    user,
    visible: true,
    wrong: false,
    nodeChanges: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const userNodeRef = db.collection("userNodes").doc();
  await userNodeRef.set(userNodeData);
  return userNodeRef.get();
};

export const getSemesterIdsFromTagIds = async (tagIds: string[]) => {
  const semesterIds: string[] = [];

  const tagIdsChunks = arrayToChunks(tagIds, 10);
  for (const tagIds of tagIdsChunks) {
    const semesters = await db.collection("semesters").where("__name__", "in", tagIds).get();
    for (const semester of semesters.docs) {
      semesterIds.push(semester.id);
    }
  }

  return Array.from(new Set(semesterIds)); // unique semester ids
};

export const getCourseIdsFromTagIds = async (tagIds: string[]) => {
  const courseIds: string[] = [];

  const tagIdsChunks = arrayToChunks(tagIds, 10);
  for (const tagIds of tagIdsChunks) {
    const courses = await db.collection("courses").where("__name__", "in", tagIds).get();
    for (const course of courses.docs) {
      courseIds.push(course.id);
    }
  }

  return Array.from(new Set(courseIds)); // unique course ids
};
// tagIds

export const getSemestersByIds = async (semesterIds: string[]) => {
  const semestersByIds: {
    [semesterId: string]: ISemester;
  } = {};

  const semesterIdsChunks = arrayToChunks(Array.from(new Set(semesterIds)), 30);
  for (const semesterIds of semesterIdsChunks) {
    const semesters = await db.collection("semesters").where("__name__", "in", semesterIds).get();
    for (const semester of semesters.docs) {
      semestersByIds[semester.id] = semester.data() as ISemester;
    }
  }

  return semestersByIds;
};

export const getStudentStatsBySemesterId = async (
  semesterId: string,
  t: FirebaseFirestore.Transaction,
  includeDeleted: boolean = false
) => {
  const semesterStudentStatByStudent: {
    [studentUname: string]: SemesterStudentStat;
  } = {};

  let semesterStudentStatsQ = db.collection("semesterStudentStats").where("tagId", "==", semesterId);
  if (!includeDeleted) {
    semesterStudentStatsQ = semesterStudentStatsQ.where("deleted", "==", false);
  }
  const semesterStudentStats = await convertToTGet(semesterStudentStatsQ, t);
  for (const semesterStudentStat of semesterStudentStats.docs) {
    const semesterStudentStatData = semesterStudentStat.data() as SemesterStudentStat;
    semesterStudentStatData.documentId = semesterStudentStat.id;
    semesterStudentStatByStudent[semesterStudentStatData.uname] = semesterStudentStatData;
  }

  return semesterStudentStatByStudent;
};

export const getStudentVoteStatsBySemesterId = async (
  semesterId: string,
  t: FirebaseFirestore.Transaction,
  includeDeleted: boolean = false
) => {
  const voteStatsByStudent: {
    [studentUname: string]: SemesterStudentVoteStat;
  } = {};

  let studentVoteStatsQ = db.collection("semesterStudentVoteStats").where("tagId", "==", semesterId);
  if (!includeDeleted) {
    studentVoteStatsQ = studentVoteStatsQ.where("deleted", "==", false);
  }
  const studentVoteStats = await convertToTGet(studentVoteStatsQ, t);
  for (const studentVoteStat of studentVoteStats.docs) {
    const studentVoteStatData = studentVoteStat.data() as SemesterStudentVoteStat;
    studentVoteStatData.documentId = studentVoteStat.id;
    voteStatsByStudent[studentVoteStatData.uname] = studentVoteStatData;
  }

  return voteStatsByStudent;
};

export const getStudentSankeysBySemesterId = async (
  semesterId: string,
  t: FirebaseFirestore.Transaction,
  includeDeleted: boolean = false
) => {
  const sankeyByStudent: {
    [studentUname: string]: ISemesterStudentSankey;
  } = {};

  let studentSankeyQ = db.collection("semesterStudentSankeys").where("tagId", "==", semesterId);
  if (!includeDeleted) {
    studentSankeyQ = studentSankeyQ.where("deleted", "==", false);
  }
  const studentSankeys = await convertToTGet(studentSankeyQ, t);
  for (const studentSankey of studentSankeys.docs) {
    const studentSankeyData = studentSankey.data() as ISemesterStudentSankey;
    studentSankeyData.documentId = studentSankey.id;
    sankeyByStudent[studentSankeyData.uname] = studentSankeyData;
  }

  return sankeyByStudent;
};

export const getChapterIdsByTagIds = (tagIds: string[], syllabus: ISemesterSyllabusItem[]) => {
  const chaptersIds: string[] = [];
  for (const syllabusItem of syllabus) {
    if (tagIds.includes(syllabusItem.node!)) {
      chaptersIds.push(syllabusItem.node!);
    }
  }
  return chaptersIds;
};

export const getStatDayIdx = (statDate: string, studentStat: ISemesterStudentStat, semester: ISemester) => {
  let dayIdx = studentStat.days.findIndex(statDay => statDay.day === statDate);
  if (dayIdx === -1) {
    studentStat.days.push({
      chapters: [],
      day: statDate,
    });
    dayIdx = studentStat.days.length - 1;
    const dayStat = studentStat.days[dayIdx];
    for (const syllabusItem of semester.syllabus) {
      dayStat.chapters.push({
        agreementsWithInst: 0,
        disagreementsWithInst: 0,
        proposals: 0,
        questionProposals: 0,
        nodes: 0,
        questions: 0,
        links: 0,
        newNodes: 0,
        node: syllabusItem.node!,
        title: syllabusItem.title,
        correctPractices: 0,
        totalPractices: 0,
      });
    }
  }
  return dayIdx;
};

export const getStatDayChapterIdx = (dayStat: ISemesterStudentStatDay, chapterId: string, semester: ISemester) => {
  let chapterIdx = dayStat.chapters.findIndex(chapter => chapter.node! === chapterId);
  // initialization if required
  if (chapterIdx === -1) {
    const syllabusItem = semester.syllabus.find(item => item.node! === chapterId)!;
    dayStat.chapters.push({
      agreementsWithInst: 0,
      disagreementsWithInst: 0,
      proposals: 0,
      questionProposals: 0,
      nodes: 0,
      questions: 0,
      links: 0,
      newNodes: 0,
      node: syllabusItem.node!,
      title: syllabusItem.title,
      correctPractices: 0,
      totalPractices: 0,
    });
    chapterIdx = dayStat.chapters.length - 1;
  }
  return chapterIdx;
};

export const getStatVoteDayIdx = (statDate: string, studentVoteStat: ISemesterStudentVoteStat) => {
  if (!studentVoteStat.days) studentVoteStat.days = [];
  let dayVIdx = studentVoteStat.days.findIndex(day => day.day === statDate);
  if (dayVIdx === -1) {
    studentVoteStat.days.push({
      agreementsWithInst: 0,
      disagreementsWithInst: 0,
      day: statDate,
      upVotes: 0,
      downVotes: 0,
      instVotes: 0,
      nodes: 0,
      proposals: 0,
      questionProposals: 0,
      questions: 0,
      links: 0,
      newNodes: 0,
      improvements: 0,
      correctPractices: 0,
      totalPractices: 0,
    });
    dayVIdx = studentVoteStat.days.length - 1;
  }
  return dayVIdx;
};

type IUpdateStatsOnVersionVote = {
  voter: string; // voter student
  proposer: string; // proposer student
  nodeId: string;
  tagIds: string[]; // tag ids from version
  parentType?: INodeType;
  nodeType: INodeType;
  versionId: string;
  voterCorrect: number; // 0, 1, -1
  voterWrong: number; // 0, 1, -1
  isChild: boolean;
  justApproved: boolean;
  approved: boolean;
};

export const updateStatsOnVersionVote = async ({
  tagIds,
  voter,
  proposer,
  parentType,
  nodeType,
  versionId,
  voterCorrect,
  voterWrong,
  isChild,
  justApproved,
  approved,
}: IUpdateStatsOnVersionVote) => {
  const tWriteOperations: TWriteOperation[] = [];

  await db.runTransaction(async t => {
    const semesters = await getSemestersByIds(tagIds);

    const studentStatUpdates: {
      [uname: string]: ISemesterStudentStat;
    } = {};
    const studentVoteStatUpdates: {
      [uname: string]: ISemesterStudentVoteStat;
    } = {};

    if (!Object.keys(semesters).length) return; // if current node is not related any course

    for (const semesterId in semesters) {
      const semester = semesters[semesterId];

      // creating missing stat documents
      let batch = db.batch();
      let writeCounts = 0;
      for (const student of semester.students) {
        [batch, writeCounts] = await createOrRestoreStatDocs(semesterId, student.uname, batch, writeCounts);
      }
      await batch.commit();

      const isVoterStudent = semester.students.some(student => student.uname === voter);
      const isProposerStudent = semester.students.some(student => student.uname === proposer);

      const isVoterInst = semester.instructors.includes(voter);
      const isProposerInst = semester.instructors.includes(proposer);

      const isVoterValid = isVoterStudent || isVoterInst;
      const isProposerValid = isProposerStudent || isProposerInst;

      if (!isVoterValid || !isProposerValid) continue;

      const chapterIds = getChapterIdsByTagIds(tagIds, semester.syllabus);

      if (!chapterIds.length) continue; // if interaction is not relevant

      // per chapter stats
      const studentStats = await getStudentStatsBySemesterId(semesterId, t, true);
      // aggregated stats
      const studentVoteStats = await getStudentVoteStatsBySemesterId(semesterId, t, true);
      // student to student interactions
      const studentSankeys = await getStudentSankeysBySemesterId(semesterId, t, true);

      const { userVersionsColl } = getTypedCollections();
      const versionVotesByUser: {
        [uname: string]: FirebaseFirestore.QueryDocumentSnapshot<any>;
      } = {};

      const userVersions = await userVersionsColl.where("version", "==", versionId).get();
      for (const userVersion of userVersions.docs) {
        const userVersionData = userVersion.data() as IUserNodeVersion;
        versionVotesByUser[userVersionData.user] = userVersion;
      }

      const instVersion = versionVotesByUser[semester.instructors[0]];

      // if instructor is voting for node, update relative stat documents
      if (isVoterInst && !isProposerInst) {
        for (const uname in versionVotesByUser) {
          const userVersion = versionVotesByUser[uname];
          const userVersionData = userVersion.data() as IUserNodeVersion;
          const voteCreatedAt = (userVersionData.createdAt as unknown as Timestamp).toDate();
          const statDate = moment(voteCreatedAt).format("YYYY-MM-DD");

          // to update in per chapter stats documents
          const studentStat = studentStats[uname];
          // if version voter is not student
          if (!studentStats[uname]) continue;

          const studentVoteStat = studentVoteStats[uname];
          studentStatUpdates[uname] = studentStat;
          studentVoteStatUpdates[uname] = studentVoteStat;

          const dayIdx = getStatDayIdx(statDate, studentStat, semester);

          let changeInAgreement = 0;
          let changeInDisagreement = 0;
          if (userVersionData.correct === true) {
            changeInAgreement = voterCorrect === 1 ? 1 : voterCorrect === -1 ? -1 : 0;
            changeInDisagreement = voterWrong === 1 ? 1 : voterWrong === -1 ? -1 : 0;
          } else if (userVersionData.wrong === true) {
            changeInAgreement = voterWrong === 1 ? 1 : voterWrong === -1 ? -1 : 0;
            changeInDisagreement = voterCorrect === 1 ? 1 : voterCorrect === -1 ? -1 : 0;
          }

          for (const chapterId of chapterIds) {
            const dayStat = studentStat.days[dayIdx];
            const chapterIdx = getStatDayChapterIdx(dayStat, chapterId, semester);

            // logic to set agreement or disagrement
            const chapterItem = dayStat.chapters[chapterIdx];

            chapterItem.agreementsWithInst = changeInAgreement;
            chapterItem.disagreementsWithInst = changeInDisagreement;
          }

          const dayVIdx = getStatVoteDayIdx(statDate, studentVoteStat);
          const dayVoteStat = studentVoteStat.days[dayVIdx];
          dayVoteStat.agreementsWithInst += changeInAgreement;
          dayVoteStat.disagreementsWithInst += changeInDisagreement;

          studentVoteStat.agreementsWithInst += changeInAgreement;
          studentVoteStat.disagreementsWithInst += changeInDisagreement;
        }
      } else if (!isVoterInst && !isProposerInst && instVersion) {
        // updating agreement/disagreement for student who is voting
        const instVersionData = instVersion.data() as IUserNodeVersion;
        const statDate = moment().format("YYYY-MM-DD");

        const studentStat = studentStats[voter];
        const studentVoteStat = studentVoteStats[voter];
        studentStatUpdates[voter] = studentStat;
        studentVoteStatUpdates[voter] = studentVoteStat;

        const dayIdx = getStatDayIdx(statDate, studentStat, semester);
        const dayStat = studentStat.days[dayIdx];

        let changeInAgreement = 0;
        let changeInDisagreement = 0;

        if (instVersionData.correct === true) {
          changeInAgreement = voterCorrect === 1 ? 1 : voterCorrect === -1 ? -1 : 0;
          changeInDisagreement = voterWrong === 1 ? 1 : voterWrong === -1 ? -1 : 0;
        } else if (instVersionData.wrong === true) {
          changeInAgreement = voterWrong === 1 ? 1 : voterWrong === -1 ? -1 : 0;
          changeInDisagreement = voterCorrect === 1 ? 1 : voterCorrect === -1 ? -1 : 0;
        }

        for (const chapterId of chapterIds) {
          const chapterIdx = getStatDayChapterIdx(dayStat, chapterId, semester);
          const chapterItem = dayStat.chapters[chapterIdx];

          chapterItem.agreementsWithInst = changeInAgreement;
          chapterItem.disagreementsWithInst = changeInDisagreement;
        }

        const dayVIdx = getStatVoteDayIdx(statDate, studentVoteStat);
        const dayVoteStat = studentVoteStat.days[dayVIdx];
        dayVoteStat.agreementsWithInst += changeInAgreement;
        dayVoteStat.disagreementsWithInst += changeInDisagreement;

        studentVoteStat.agreementsWithInst += changeInAgreement;
        studentVoteStat.disagreementsWithInst += changeInDisagreement;
      }

      if (justApproved && isProposerStudent) {
        let statDate = moment().format("YYYY-MM-DD");
        if (versionVotesByUser[proposer]) {
          const userVersionData = versionVotesByUser[proposer].data() as IUserNodeVersion;
          const voteCreatedAt = (userVersionData.createdAt as unknown as Timestamp).toDate();
          statDate = moment(voteCreatedAt).format("YYYY-MM-DD");
        }

        const studentStat = studentStats[proposer];
        const studentVoteStat = studentVoteStats[proposer];

        const dayIdx = getStatDayIdx(statDate, studentStat, semester);

        for (const chapterId of chapterIds) {
          const dayStat = studentStat.days[dayIdx];
          const chapterIdx = getStatDayChapterIdx(dayStat, chapterId, semester);

          const chapterItem = dayStat.chapters[chapterIdx];
          if (isChild) {
            chapterItem.newNodes += 1;
            if (nodeType === "Question") {
              chapterItem.questions += 1;
            }
          }
        }

        const dayVIdx = getStatVoteDayIdx(statDate, studentVoteStat);
        if (isChild) {
          studentVoteStat.days[dayVIdx].newNodes += 1;
          studentVoteStat.newNodes += 1;
        } else {
          studentVoteStat.days[dayVIdx].improvements += 1;
          studentVoteStat.improvements += 1;
        }

        if (nodeType === "Question") {
          studentVoteStat.days[dayVIdx].questions += 1;
          studentVoteStat.questions += 1;
        }
      }

      // if both are students then we can consider updating sankey
      if (!isVoterInst && !isProposerInst) {
        let interactionIdx = studentSankeys[voter].interactions.findIndex(
          interaction => interaction.uname === proposer
        );
        if (interactionIdx === -1) {
          studentSankeys[voter].interactions.push({
            uname: proposer,
            upVote: 0,
            downVote: 0,
          });
          interactionIdx = studentSankeys[voter].interactions.length - 1;
        }

        studentSankeys[voter].interactions[interactionIdx].upVote += voterCorrect;
        studentSankeys[voter].interactions[interactionIdx].downVote += voterWrong;

        const semesterStudentSankeyRef = db.collection("semesterStudentSankeys").doc(studentSankeys[voter].documentId!);

        tWriteOperations.push({
          objRef: semesterStudentSankeyRef,
          operationType: "update",
          data: {
            interactions: studentSankeys[voter].interactions,
          },
        });
      }

      if (!isProposerInst) {
        const studentVoteStat = studentVoteStats[proposer];
        studentVoteStat.upVotes += voterCorrect;
        studentVoteStat.downVotes += voterWrong;

        const statDate = moment().format("YYYY-MM-DD");

        const dayVIdx = getStatVoteDayIdx(statDate, studentVoteStat);
        studentVoteStat.days[dayVIdx].upVotes += voterCorrect;
        studentVoteStat.days[dayVIdx].downVotes += voterWrong;

        if (!studentStatUpdates[proposer]) {
          studentVoteStatUpdates[proposer] = studentVoteStat;
        }
      }
    }

    for (const studentUname in studentStatUpdates) {
      const studentStat = studentStatUpdates[studentUname];
      if (studentStat.documentId) {
        const studentStatRef = db.collection("semesterStudentStats").doc(studentStat.documentId!);
        delete studentStat.documentId;
        tWriteOperations.push({
          objRef: studentStatRef,
          operationType: "update",
          data: studentStat,
        });
      } else {
        const studentStatRef = db.collection("semesterStudentStats").doc();
        tWriteOperations.push({
          objRef: studentStatRef,
          operationType: "set",
          data: studentStat,
        });
      }
    }

    for (const studentUname in studentVoteStatUpdates) {
      const studentVoteStat = studentVoteStatUpdates[studentUname];
      if (studentVoteStat.documentId) {
        const studentVoteStatRef = db.collection("semesterStudentVoteStats").doc(studentVoteStat.documentId!);
        delete studentVoteStat.documentId;
        tWriteOperations.push({
          objRef: studentVoteStatRef,
          operationType: "update",
          data: studentVoteStat,
        });
      } else {
        const studentVoteStatRef = db.collection("semesterStudentVoteStats").doc();
        tWriteOperations.push({
          objRef: studentVoteStatRef,
          operationType: "set",
          data: studentVoteStat,
        });
      }
    }

    const _tWriteOperations = tWriteOperations.splice(0, MAX_TRANSACTION_WRITES - 1);
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
};

type IUpdateStatsOnProposal = {
  tagIds: string[];
  proposer: string;
  nodeType: INodeType;
  approved: boolean;
  isChild: boolean;
  linksUpdated: boolean;
};
export const updateStatsOnProposal = async ({
  tagIds,
  proposer,
  nodeType,
  approved,
  isChild,
  linksUpdated,
}: IUpdateStatsOnProposal) => {
  await db.runTransaction(async t => {
    const semesters = await getSemestersByIds(tagIds);
    const statDate = moment().format("YYYY-MM-DD");

    for (const semesterId in semesters) {
      const semester = semesters[semesterId];

      // creating missing stat documents
      let batch = db.batch();
      let writeCounts = 0;
      for (const student of semester.students) {
        [batch, writeCounts] = await createOrRestoreStatDocs(semesterId, student.uname, batch, writeCounts);
      }
      await batch.commit();

      const isProposerStudent = semester.students.some(student => student.uname === proposer);
      // if proposer is instructor we don't need do to processing
      if (!isProposerStudent) {
        continue;
      }

      const chapterIds = getChapterIdsByTagIds(tagIds, semester.syllabus);
      if (!chapterIds.length) {
        continue;
      }

      // per chapter stats
      const studentStats = (await convertToTGet(
        db.collection("semesterStudentStats").where("tagId", "==", semesterId).where("uname", "==", proposer),
        t
      )) as FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
      // aggregated stats
      const studentVoteStats = (await convertToTGet(
        db.collection("semesterStudentVoteStats").where("tagId", "==", semesterId).where("uname", "==", proposer),
        t
      )) as FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
      // student to student interactions
      const studentSankeys = (await convertToTGet(
        db.collection("semesterStudentSankeys").where("tagId", "==", semesterId).where("uname", "==", proposer),
        t
      )) as FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;

      let studentStatRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
      let studentVoteStatRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
      let studentSankeyRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;

      let studentStat: ISemesterStudentStat;
      let studentVoteStat: ISemesterStudentVoteStat;
      let studentSankey: ISemesterStudentSankey;

      const isStudentStatNew = !studentStats.docs.length;
      const isStudentVoteStatNew = !studentVoteStats.docs.length;
      const isStudentSankeyNew = !studentSankeys.docs.length;

      if (isStudentStatNew) {
        studentStatRef = db.collection("semesterStudentStats").doc();
        studentStat = {
          tagId: semesterId,
          uname: proposer,
          days: [],
          deleted: false,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        };
      } else {
        studentStatRef = db.collection("semesterStudentStats").doc(studentStats.docs[0].id);
        studentStat = studentStats.docs[0].data() as ISemesterStudentStat;
      }

      if (isStudentVoteStatNew) {
        studentVoteStatRef = db.collection("semesterStudentVoteStats").doc();
        studentVoteStat = {
          tagId: semesterId,
          uname: proposer,
          upVotes: 0,
          downVotes: 0,
          instVotes: 0,
          agreementsWithInst: 0,
          disagreementsWithInst: 0,
          lastActivity: Timestamp.fromDate(new Date()),
          days: [],
          totalPoints: 0,
          nodes: 0,
          newNodes: 0,
          improvements: 0,
          links: 0,
          questions: 0,
          questionProposals: 0,
          questionPoints: 0,
          votes: 0,
          votePoints: 0,
          deleted: false,
          correctPractices: 0,
          totalPractices: 0,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        };
      } else {
        studentVoteStatRef = db.collection("semesterStudentVoteStats").doc(studentVoteStats.docs[0].id);
        studentVoteStat = studentVoteStats.docs[0].data() as ISemesterStudentVoteStat;
      }

      if (isStudentSankeyNew) {
        studentSankeyRef = db.collection("semesterStudentSankeys").doc();
        studentSankey = {
          interactions: [],
          tagId: semesterId,
          uname: proposer,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
          deleted: false,
        } as ISemesterStudentSankey;
      } else {
        studentSankeyRef = db.collection("semesterStudentSankeys").doc(studentSankeys.docs[0].id);
        studentSankey = studentSankeys.docs[0].data() as ISemesterStudentSankey;
      }

      for (const chapterId of chapterIds) {
        const dayIdx = getStatDayIdx(statDate, studentStat, semester);

        const dayStat = studentStat.days[dayIdx];
        const chapterIdx = dayStat.chapters.findIndex(chapter => chapter.node === chapterId);
        const chapter = dayStat.chapters[chapterIdx];

        chapter.proposals += 1;

        if (nodeType === "Question") {
          chapter.questionProposals += 1;
          if (approved) {
            chapter.questions += 1;
          }
        }

        if (isChild) {
          chapter.nodes += 1;
          if (approved) {
            chapter.newNodes += 1;
          }
        }

        if (linksUpdated) {
          chapter.links += 1;
        }
      }

      const statDayIdx = getStatVoteDayIdx(statDate, studentVoteStat);
      const voteStatDay = studentVoteStat.days[statDayIdx];

      voteStatDay.proposals += 1;

      if (nodeType === "Question") {
        voteStatDay.questionProposals += 1;
        studentVoteStat.questionProposals += 1;
        if (approved) {
          voteStatDay.questions += 1;
          studentVoteStat.questions += 1;
        }
      }

      if (isChild) {
        voteStatDay.nodes += 1;
        studentVoteStat.nodes += 1;
        if (approved) {
          voteStatDay.newNodes += 1;
          studentVoteStat.newNodes += 1;
        }
      }

      if (linksUpdated) {
        voteStatDay.links += 1;
        studentVoteStat.links += 1;
      }

      if (!isChild && approved) {
        voteStatDay.improvements += 1;
        studentVoteStat.improvements += 1;
      }

      voteStatDay.upVotes += 1;
      studentVoteStat.upVotes += 1;

      // updating sankey data
      let interactionIdx = studentSankey.interactions.findIndex(interaction => interaction.uname === proposer);
      if (interactionIdx === -1) {
        studentSankey.interactions.push({
          upVote: 0,
          downVote: 0,
          uname: proposer,
        });
        interactionIdx = studentSankey.interactions.length - 1;
      }
      studentSankey.interactions[interactionIdx].upVote += 1;

      if (isStudentSankeyNew) {
        t.set(studentSankeyRef, studentSankey);
      } else {
        t.update(studentSankeyRef, studentSankey);
      }

      if (isStudentStatNew) {
        t.set(studentStatRef, studentStat);
      } else {
        t.update(studentStatRef, studentStat);
      }

      if (isStudentVoteStatNew) {
        t.set(studentVoteStatRef, studentVoteStat);
      } else {
        t.update(studentVoteStatRef, studentVoteStat);
      }
    }
  });
};

type IUpdateStatsOnPractice = {
  tagIds: string[];
  uname: string;
  correct: boolean;
};
export const updateStatsOnPractice = async ({ tagIds, correct, uname }: IUpdateStatsOnPractice) => {
  const tWriteOperations: TWriteOperation[] = [];

  await db.runTransaction(async t => {
    const semesters = await getSemestersByIds(tagIds);
    const statDate = moment().format("YYYY-MM-DD");

    for (const semesterId in semesters) {
      const semester = semesters[semesterId];

      // creating missing stat documents
      let batch = db.batch();
      let writeCounts = 0;
      for (const student of semester.students) {
        [batch, writeCounts] = await createOrRestoreStatDocs(semesterId, student.uname, batch, writeCounts);
      }
      await batch.commit();

      const isPractitionerStudent = semester.students.some(student => student.uname === uname);
      // if practitioner is not student then we don't need do to processing
      if (!isPractitionerStudent) {
        continue;
      }

      const chapterIds = getChapterIdsByTagIds(tagIds, semester.syllabus);

      // per chapter stats
      const studentStats = (await convertToTGet(
        db.collection("semesterStudentStats").where("tagId", "==", semesterId).where("uname", "==", uname),
        t
      )) as FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
      // aggregated stats
      const studentVoteStats = (await convertToTGet(
        db.collection("semesterStudentVoteStats").where("tagId", "==", semesterId).where("uname", "==", uname),
        t
      )) as FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;

      const studentStatRef = db.collection("semesterStudentStats").doc(studentStats.docs[0].id);
      const studentStat = studentStats.docs[0].data() as ISemesterStudentStat;
      const studentVoteStatRef = db.collection("semesterStudentVoteStats").doc(studentVoteStats.docs[0].id);
      const studentVoteStat = studentVoteStats.docs[0].data() as ISemesterStudentVoteStat;

      if (chapterIds.length) {
        for (const chapterId of chapterIds) {
          const dayIdx = getStatDayIdx(statDate, studentStat, semester);
          const dayStat = studentStat.days[dayIdx];
          const chapterIdx = getStatDayChapterIdx(dayStat, chapterId, semester);
          if (correct) {
            studentStat.days[dayIdx].chapters[chapterIdx].correctPractices += 1;
          }
          studentStat.days[dayIdx].chapters[chapterIdx].totalPractices += 1;
        }
        tWriteOperations.push({
          objRef: studentStatRef,
          operationType: "update",
          data: {
            days: studentStat.days,
          },
        });
      }

      const dayVIdx = getStatVoteDayIdx(statDate, studentVoteStat);
      const dayVoteStat = studentVoteStat.days[dayVIdx];

      if (correct) {
        if (!dayVoteStat.correctPractices) {
          dayVoteStat.correctPractices = 0;
        }
        if (!studentVoteStat.correctPractices) {
          studentVoteStat.correctPractices = 0;
        }

        dayVoteStat.correctPractices += 1;
        studentVoteStat.correctPractices += 1;
      }

      if (!dayVoteStat.totalPractices) {
        dayVoteStat.totalPractices = 0;
      }
      if (!studentVoteStat.totalPractices) {
        studentVoteStat.totalPractices = 0;
      }
      dayVoteStat.totalPractices += 1;
      studentVoteStat.totalPractices += 1;

      studentVoteStat.updatedAt = Timestamp.now();

      tWriteOperations.push({
        objRef: studentVoteStatRef,
        operationType: "update",
        data: studentVoteStat,
      });
    }

    const _tWriteOperations = tWriteOperations.splice(0, MAX_TRANSACTION_WRITES - 1);
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
};

//we call this function to check if an instructor is creating a new version of a node
//if yes we approve the version automatically
export const shouldInstantApprovalForProposal = async (tagIds: string[], uname: string) => {
  const semestersByIds = await getSemestersByIds(tagIds);
  let isInstructor = false;
  const instructorDocs = await db.collection("instructors").where("uname", "==", uname).get();
  if (instructorDocs.docs.length > 0) {
    isInstructor = true;
  }
  if (!Object.keys(semestersByIds).length) {
    return {
      isInstructor,
      courseExist: false,
      instantApprove: true,
    };
  }
  for (const semester of Object.values(semestersByIds)) {
    if (!semester.instructors.includes(uname)) {
      return {
        isInstructor,
        courseExist: true,
        instantApprove: false,
      };
    }
  }
  return {
    isInstructor,
    courseExist: true,
    instantApprove: true,
  };
};

//we call this function to check if an instructor is votig on a proposal
//if yes then we approve the proposal of the node automatically
export const checkInstantApprovalForProposalVote = async (tagIds: string[], uname: string, versionId: string) => {
  const semestersByIds = await getSemestersByIds(tagIds);

  let isInstructor = false;
  const instructorDocs = await db.collection("instructors").where("uname", "==", uname).get();
  if (instructorDocs.docs.length > 0) {
    isInstructor = true;
  }

  if (!Object.keys(semestersByIds).length) {
    return {
      isInstructor,
      courseExist: false,
      instantApprove: true,
    };
  }
  const { userVersionsColl } = getTypedCollections();

  const userVersions = await userVersionsColl.where("version", "==", versionId).get();

  const instructorVotes: {
    [uname: string]: boolean;
  } = {};

  for (const semesterId in semestersByIds) {
    const semester = semestersByIds[semesterId];
    semester.instructors.forEach(instructor => (instructorVotes[instructor] = false));
  }

  instructorVotes[uname] = true;

  for (const userVersion of userVersions.docs) {
    const userVersionData = userVersion.data() as IUserNodeVersion;
    if (instructorVotes.hasOwnProperty(userVersionData.user) && userVersionData.correct) {
      instructorVotes[userVersionData.user] = true;
    }
  }

  for (const semesterId in semestersByIds) {
    const semester = semestersByIds[semesterId];
    if (!semester.instructors.some(instructor => instructorVotes[instructor])) {
      return {
        isInstructor,
        courseExist: true,
        instantApprove: false,
      };
    }
  }

  return {
    isInstructor,
    courseExist: true,
    instantApprove: true,
  };
};

//we call this function to check if an instructor is deleting a node
export const checkInstantDeleteForNode = async (tagIds: string[], uname: string, nodeId: string) => {
  const semestersByIds = await getSemestersByIds(tagIds);
  if (!Object.keys(semestersByIds).length) {
    return {
      courseExist: false,
      instantDelete: false,
    };
  }
  const userNodes = await db.collection("userNodes").where("node", "==", nodeId).get();

  const instructorVotes: {
    [uname: string]: boolean;
  } = {};

  for (const semesterId in semestersByIds) {
    const semester = semestersByIds[semesterId];
    semester.instructors.forEach(instructor => (instructorVotes[instructor] = false));
  }

  instructorVotes[uname] = true;

  for (const userNode of userNodes.docs) {
    const userNodeData = userNode.data() as IUserNode;
    if (instructorVotes.hasOwnProperty(userNodeData.user) && userNodeData.wrong) {
      instructorVotes[userNodeData.user] = true;
    }
  }

  for (const semesterId in semestersByIds) {
    const semester = semestersByIds[semesterId];
    if (!semester.instructors.some(instructor => instructorVotes[instructor])) {
      return {
        courseExist: true,
        instantDelete: false,
      };
    }
  }
  return {
    courseExist: true,
    instantDelete: true,
  };
};
