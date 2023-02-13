import { Timestamp } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { User } from "src/knowledgeTypes";
import fbAuth from "src/middlewares/fbAuth";
import { ISemesterStudentStat } from "src/types/ICourse";
import { checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";

interface AssignCourseToUserPayload {
  course: string;
  user: any;
}
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (req.method !== "POST") {
      return res.status(200).end();
    }

    let writeCounts = 0;
    let batch = db.batch();
    const data = req.body.data as AssignCourseToUserPayload;

    if (!data?.course) {
      return res.status(400).json({ message: "Please provide course." });
    }

    const userRef = db.doc(`/users/${data.user.userData.uname}`);
    if ((await userRef.get()).exists) {
      let userData = (await userRef.get()).data();
      if (data.course) {
        const semesterRef = db.collection("semesters").doc(data.course);
        const semesterData = (await semesterRef.get()).exists ? (await semesterRef.get()).data() : null;
        if (!semesterData) {
          return res.status(400).json({ message: "The given course is not valid." });
        }

        let students = semesterData?.students;
        let checkExistingStudent = students.filter((student: any) => student.uname === data.user.userData.uname);
        if (checkExistingStudent.length > 0) {
          return res.status(400).json({ message: "The course has already assigned to this user." });
        }
        students.push({
          uname: userData?.uname,
          chooseUname: userData?.chooseUname,
          imageUrl: userData?.imageUrl,
          fName: userData?.fName,
          lName: userData?.lName,
          email: userData?.email,
        });
        batch.update(semesterRef, {
          students: students,
        });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

        // Restoring Deleted documents for stats
        const semesterStudentStatsDocs = await db
          .collection("semesterStudentStats")
          .where("uname", "==", userData?.uname)
          .get();
        for (const semesterStudentStatsDoc of semesterStudentStatsDocs.docs) {
          const semesterStudentStatRef = db.collection("semesterStudentStats").doc(semesterStudentStatsDoc.id);
          const semesterStudentStat = semesterStudentStatsDoc.data() as ISemesterStudentStat;
          semesterStudentStat.deleted = false;
          batch.update(semesterStudentStatRef, semesterStudentStat);
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }
        const semesterStudentVoteStatsDocs = await db
          .collection("semesterStudentVoteStats")
          .where("uname", "==", userData?.uname)
          .get();
        for (const semesterStudentVoteStatsDoc of semesterStudentVoteStatsDocs.docs) {
          const semesterStudentVoteStatRef = db
            .collection("semesterStudentVoteStats")
            .doc(semesterStudentVoteStatsDoc.id);
          const semesterStudentVoteStat = semesterStudentVoteStatsDoc.data() as ISemesterStudentStat;
          semesterStudentVoteStat.deleted = false;
          batch.update(semesterStudentVoteStatRef, semesterStudentVoteStat);
          [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        }

        const semesterStatRef = db.collection("semesterStudentStats").doc();
        batch.set(semesterStatRef, {
          tagId: semesterData.tagId,
          uname: userData?.uname,
          days: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

        const semesterVoteStatRef = db.collection("semesterStudentVoteStats").doc();
        batch.set(semesterVoteStatRef, {
          tagId: semesterData.tagId,
          uname: userData?.uname,
          upVotes: 0,
          downVotes: 0,
          instVotes: 0,
          agreementsWithInst: 0,
          disagreementsWithInst: 0,
          lastActivity: Timestamp.now(),
          totalPoints: 0,
          newNodes: 0,
          improvements: 0,
          questions: 0,
          questionPoints: 0,
          votes: 0,
          votePoints: 0,
          deleted: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
        await commitBatch(batch);
      }
      return res.status(201).json({ message: "The course has assiged successfully." });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

export default fbAuth(handler);
