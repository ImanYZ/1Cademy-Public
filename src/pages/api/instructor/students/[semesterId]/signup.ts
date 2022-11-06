import { checkRestartBatchWriteCounts, commitBatch } from "@/lib/firestoreServer/admin";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { getAuth as frontGetAuth, sendPasswordResetEmail } from "firebase/auth";
import { getAuth } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { ISemester, ISemesterStudentStat } from "src/types/ICourse";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { initializeNewReputationData } from "src/utils";
import { searchAvailableUnameByEmail } from "src/utils/instructor";
import { db } from "typesenseIndexer";
import { v4 as uuidv4 } from "uuid";

type InstructorSemesterSignUpPayload = {
  students: {
    email: string;
    fName: string;
    lName: string;
  }[];
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  initFirebaseClientSDK();
  const frontAuth = frontGetAuth();
  try {
    let batch = db.batch();
    let writeCounts = 0;

    const { semesterId } = req.query;
    const payload = req.body as InstructorSemesterSignUpPayload;

    const semesterRef = db.collection("semesters").doc(String(semesterId));
    const semesterData = (await semesterRef.get()).data() as ISemester;

    const semesterNodeData = (await db.collection("nodes").doc(semesterData.tagId).get()).data() as INode;

    // Emails existing in firestore already
    const existingEmails = semesterData.students.map(student => student.email);

    // Emails received in Payload
    const receivedEmails = payload.students.map(student => student.email);

    const addedStudents = payload.students.filter(student => existingEmails.indexOf(student.email) === -1);
    const removedStudents = semesterData.students.filter(student => receivedEmails.indexOf(student.email) === -1);

    // adding new students to course
    if (addedStudents.length) {
      // 1. Create User Document
      // 2. Create Reputation Document
      // 3. Select Tag Id
      // 4. Select sNode as Semester Id
      // 5. Create Credit Document
      // 6. Create Student Semester Stat Document
      // 7. Create Student Semester Vote Stat Document
      // 8. Authentication
      for (const addedStudent of addedStudents) {
        const userDocs = await db.collection("users").where("email", "==", addedStudent.email).get();
        // If Student already exists
        if (userDocs.docs.length) {
          const userData = userDocs.docs[0].data() as IUser;
          semesterData.students.push({
            chooseUname: false,
            email: userData.email,
            fullname: `${addedStudent.fName} ${addedStudent.lName}`,
            imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
            uname: userData.uname,
          });

          // Restoring Deleted documents for stats
          const semesterStudentStatsDocs = await db
            .collection("semesterStudentStats")
            .where("uname", "==", userData.uname)
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
            .where("uname", "==", userData.uname)
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
          continue;
        }

        // If Student wasn't present in 1Cademy
        let uname = await searchAvailableUnameByEmail(addedStudent.email);

        // Creating Authorization for User
        const authUser = await getAuth().createUser({
          email: addedStudent.email,
          displayName: uname,
          password: uuidv4().replace(/-/g, ""),
        });

        const userRef = db.collection("users").doc();
        batch.set(userRef, {
          fName: addedStudent.fName,
          lName: addedStudent.lName,
          uname,
          email: addedStudent.email,
          tag: semesterNodeData.title,
          tagId: semesterData.tagId,
          institUpdated: false,
          deInstit: semesterData.uTitle,
          clickedTOS: false,
          imgOrColor: false,
          imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
          practicing: false,
          clickedCP: false,
          clickedPP: false,
          country: "United States",
          background: "Color",
          gender: "",
          totalPoints: 0,
          color: "#36cd96",
          sNode: semesterData.tagId,
          consented: false,
          clickedConsent: false,
          blocked: false,
          lang: "English",
          deCredits: 3,
          userId: authUser.uid,
          theme: "Dark",
          deMajor: semesterData.pTitle,
          from: "School",
          education: "",
          ethnicity: [""],
          stateId: "",
          state: "",
          city: "",
          chooseUname: false,
          occupation: "Student",
          foundFrom: "School",
          fieldOfInterest: "",
          birthDate: null,
          reason: "",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        } as IUser);
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

        const reputationRef = db.collection("reputations").doc();
        let reputationData = initializeNewReputationData({
          tagId: semesterId,
          tag: semesterNodeData.title,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        reputationData.uname = uname;
        delete reputationData.isAdmin;
        batch.set(reputationRef, { ...reputationData });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

        const creditRef = db.collection("credits").doc();
        batch.set(creditRef, {
          credits: 0,
          deepA: 750,
          deepAInst: 210,
          iInstValue: 4,
          iValue: 10,
          ltermA: 1375,
          meanA: 300,
          meanAInst: 84,
          tag: semesterNodeData.title,
          tagId: semesterData.tagId,
          createdAt: Timestamp.now(),
        });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

        const semesterStatRef = db.collection("semesterStudentStats").doc();
        batch.set(semesterStatRef, {
          tagId: semesterData.tagId,
          uname,
          days: [],
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);

        const semesterVoteStatRef = db.collection("semesterStudentVoteStats").doc();
        batch.set(semesterVoteStatRef, {
          tagId: semesterData.tagId,
          uname,
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

        await sendPasswordResetEmail(frontAuth, addedStudent.email);
        semesterData.students.push({
          chooseUname: false,
          email: addedStudent.email,
          fullname: `${addedStudent.fName} ${addedStudent.lName}`,
          imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png",
          uname,
        });
      }
    }

    // removing students from course
    if (removedStudents.length) {
      for (const removedStudent of removedStudents) {
        const idx = semesterData.students.findIndex(student => student.email === removedStudent.email);
        if (idx !== -1) {
          const _removedStudent = semesterData.students[idx];
          semesterData.students.splice(idx, 1);

          const semesterStudentStatsDocs = await db
            .collection("semesterStudentStats")
            .where("uname", "==", _removedStudent.uname)
            .get();
          for (const semesterStudentStatsDoc of semesterStudentStatsDocs.docs) {
            const semesterStudentStatRef = db.collection("semesterStudentStats").doc(semesterStudentStatsDoc.id);
            const semesterStudentStat = semesterStudentStatsDoc.data() as ISemesterStudentStat;
            semesterStudentStat.deleted = true;
            batch.update(semesterStudentStatRef, semesterStudentStat);
            [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
          }

          const semesterStudentVoteStatsDocs = await db
            .collection("semesterStudentVoteStats")
            .where("uname", "==", _removedStudent.uname)
            .get();
          for (const semesterStudentVoteStatsDoc of semesterStudentVoteStatsDocs.docs) {
            const semesterStudentVoteStatRef = db
              .collection("semesterStudentVoteStats")
              .doc(semesterStudentVoteStatsDoc.id);
            const semesterStudentVoteStat = semesterStudentVoteStatsDoc.data() as ISemesterStudentStat;
            semesterStudentVoteStat.deleted = true;
            batch.update(semesterStudentVoteStatRef, semesterStudentVoteStat);
            [batch, writeCounts] = await checkRestartBatchWriteCounts(batch, writeCounts);
          }
        }
      }
    }

    batch.update(semesterRef, semesterData);
    await commitBatch(batch);

    res.status(200).json({ message: "students updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Unable to process your request" });
  }
}

export default fbAuth(handler);
