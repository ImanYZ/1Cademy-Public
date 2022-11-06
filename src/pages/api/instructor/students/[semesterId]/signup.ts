import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { ISemester } from "src/types/ICourse";
import { db } from "typesenseIndexer";

type InstructorSemesterSignUpPayload = {
  students: {
    email: string;
    fName: string;
    lName: string;
  }[];
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { semesterId } = req.query;
    const payload = req.body as InstructorSemesterSignUpPayload;

    const semesterRef = db.collection("semesters").doc(String(semesterId));
    const semesterData = (await semesterRef.get()).data() as ISemester;

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
    }

    // removing students from course
    if (removedStudents.length) {
    }
    res.status(200).json({ message: "students updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Unable to process your request" });
  }
}

export default fbAuth(handler);
