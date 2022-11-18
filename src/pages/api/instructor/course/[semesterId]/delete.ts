import { checkRestartBatchWriteCounts, commitBatch, db } from "@/lib/firestoreServer/admin";
import { Timestamp } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { IInstructor, ISemester, ISemesterSyllabusItem } from "src/types/ICourse";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { deleteNode } from "src/utils/instructor";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (!req.body?.data?.user?.instructor) {
      throw new Error("your are not instructor");
    }

    const userData = req?.body?.data?.user?.userData as IUser;
    const { semesterId } = req?.query;

    let writeCounts = 0;
    let batch = db.batch();

    const semesterDoc = await db.collection("semesters").doc(String(semesterId)).get();
    if (!semesterDoc.exists) {
      throw new Error("Semester doesn't exists!");
    }

    const semesterData = semesterDoc.data() as ISemester;

    // check if current user is a instructor and access to this course
    if (semesterData.instructors.indexOf(userData.uname) === -1) {
      throw new Error("access denied");
    }

    const nodeIds: string[] = [];
    const findNodeIds = (item: ISemesterSyllabusItem, nodeIds: string[]) => {
      nodeIds.push(String(item.node));
      if (item.children) {
        for (const _item of item.children) {
          findNodeIds(_item, nodeIds);
        }
      }
    };
    for (const syllabusItem of semesterData.syllabus) {
      findNodeIds(syllabusItem, nodeIds);
    }

    const courseNode = await db.collection("nodes").doc(semesterData.cTagId).get();
    const courseData = courseNode.data() as INode;
    const remainingSemesters = courseData.children.filter(child => child.node === semesterData.tagId);

    // 1. deleting course if don't have any semester left
    if (!remainingSemesters.length) {
      [batch, writeCounts] = await deleteNode({
        batch,
        writeCounts,
        nodeId: semesterData.cTagId,
      });
    }

    // 2. semester document
    [batch, writeCounts] = await deleteNode({
      batch,
      writeCounts,
      nodeId: semesterData.tagId,
    });

    // 3. deleting chapter nodes
    for (const nodeId of nodeIds) {
      [batch, writeCounts] = await deleteNode({
        batch,
        writeCounts,
        nodeId: nodeId,
      });
    }

    // 4. delete stat and vote stat docs related to course
    const semesterStudentStats = await db
      .collection("semesterStudentStats")
      .where("tagId", "==", semesterData.tagId)
      .get();
    for (const semesterStudentStat of semesterStudentStats.docs) {
      const semesterStudentStatRef = db.collection("semesterStudentStats").doc(semesterStudentStat.id);
      batch.update(semesterStudentStatRef, {
        deleted: true,
        updatedAt: Timestamp.now(),
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    const semesterStudentVoteStats = await db
      .collection("semesterStudentVoteStats")
      .where("tagId", "==", semesterData.tagId)
      .get();
    for (const semesterStudentVoteStat of semesterStudentVoteStats.docs) {
      const semesterStudentVoteStatRef = db.collection("semesterStudentVoteStats").doc(semesterStudentVoteStat.id);
      batch.update(semesterStudentVoteStatRef, {
        deleted: true,
        updatedAt: Timestamp.now(),
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    // 5. removing semester entries from instructors' documents
    for (const uname of semesterData.instructors) {
      const instructorDocs = await db.collection("instructors").where("uname", "==", uname).get();
      const instructorDoc = instructorDocs.docs[0];
      const instructorData = instructorDoc.data() as IInstructor;
      const courses = instructorData.courses.filter(course => course.tagId !== semesterData.tagId);
      batch.update(db.collection("instructors").doc(instructorDoc.id), {
        courses,
      });
      [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
    }

    // 6. removing semester document
    batch.update(db.collection("semesters").doc(String(semesterId)), {
      deleted: true,
      updatedAt: Timestamp.now(),
    });
    [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

    await commitBatch(batch);

    return res.status(200).json({
      message: "Semester is deleted.",
    });
  } catch (e: any) {
    console.log(e);
    res.status(500).json({
      message: "Unable to process request",
    });
  }
}

export default fbAuth(handler);
