import { Timestamp, WriteBatch } from "firebase-admin/firestore";
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
      intractions: [],
      tagId: semesterId,
      uname: studentUname,
      deleted: false,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    } as ISemesterStudentSankey);
  }
  return [batch, writeCounts];
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

export const getSemestersByIds = async (semesterIds: string[]) => {
  const semestersByIds: {
    [semesterId: string]: ISemester;
  } = {};

  const semesterIdsChunks = arrayToChunks(Array.from(new Set(semesterIds)), 10);
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
    });
    dayVIdx = studentVoteStat.days.length - 1;
  }
  return dayVIdx;
};

type IUpdateInstStatsForPreviousVotes = {
  versionId: string;
  nodeType: string;
};
export const updateInstStatsForPreviousVotes = async ({ versionId, nodeType }: IUpdateInstStatsForPreviousVotes) => {
  const { userVersionsColl } = getTypedCollections({
    nodeType: nodeType as NodeType,
  });

  const upVoters: {
    [voter: string]: Timestamp;
  } = {};
  const downVoters: {
    [voter: string]: Timestamp;
  } = {};

  const userVersions = await userVersionsColl.where("version", "==", versionId).get();
  for (const userVersion of userVersions.docs) {
    const userVersionData = userVersion.data() as IUserNodeVersion;
    if (userVersionData.correct) {
      upVoters[userVersionData.user] = userVersionData.updatedAt as unknown as Timestamp;
      continue;
    }

    if (userVersionData.wrong) {
      downVoters[userVersionData.user] = userVersionData.updatedAt as unknown as Timestamp;
      continue;
    }
  }
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

      const { userVersionsColl } = getTypedCollections({
        nodeType: (isChild && (justApproved || (!justApproved && !approved)) ? parentType : nodeType) as NodeType,
      });
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
        let interactionIdx = studentSankeys[voter].intractions.findIndex(interaction => interaction.uname === proposer);
        if (interactionIdx === -1) {
          studentSankeys[voter].intractions.push({
            uname: proposer,
            upVote: 0,
            downVote: 0,
          });
          interactionIdx = studentSankeys[voter].intractions.length - 1;
        }

        studentSankeys[voter].intractions[interactionIdx].upVote += voterCorrect;
        studentSankeys[voter].intractions[interactionIdx].downVote += voterWrong;

        const semesterStudentSankeyRef = db.collection("semesterStudentSankeys").doc(studentSankeys[voter].documentId!);

        tWriteOperations.push({
          objRef: semesterStudentSankeyRef,
          operationType: "update",
          data: {
            intractions: studentSankeys[voter].intractions,
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
          intractions: [],
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
      let interactionIdx = studentSankey.intractions.findIndex(interaction => interaction.uname === proposer);
      if (interactionIdx === -1) {
        studentSankey.intractions.push({
          upVote: 0,
          downVote: 0,
          uname: proposer,
        });
        interactionIdx = studentSankey.intractions.length - 1;
      }
      studentSankey.intractions[interactionIdx].upVote += 1;

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
