import { NextApiRequest, NextApiResponse } from "next";
import { checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";

interface Payload {
  course: string;
  uname: string;
}
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    if (req.method !== "POST") {
      return res.status(200).end();
    }

    let writeCounts = 0;
    let batch = db.batch();
    const data = req.body.data as Payload;

    if (!data?.course) {
      return res.status(400).json({ message: "Please provide course." });
    } else if (!data.uname) {
      return res.status(400).json({ message: "Please provide uname." });
    }

    const userRef = db.doc(`/users/${data.uname}`);
    if ((await userRef.get()).exists) {
      let userData = (await userRef.get()).data();
      if (data.course) {
        const semesterRef = db.collection("semesters").doc(data.course);
        const semesterData = (await semesterRef.get()).exists ? (await semesterRef.get()).data() : null;
        if (!semesterData) {
          return res.status(400).json({ message: "The given course is not valid." });
        }

        let students = semesterData?.students;
        let checkExistingStudent = students.filter((student: any) => student.uname === data.uname);
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
        await commitBatch(batch);
      }
      return res.status(201).json({ message: "The course has assiged successfully." });
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

export default handler;
