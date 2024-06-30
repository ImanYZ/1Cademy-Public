import moment from "moment";

import { db } from "./utils/admin";

const checkMeetingTime = (semesterId: string): boolean => {
  // Get the current day of the week
  const today = new Date().getDay();
  return (
    (semesterId === "8bMQ51sit8VeFD27TDEt" && today === 1) || (semesterId === "6E1h49QYINasnDOpVpHL" && today === 5)
  );
};
exports.createMeeting = async () => {
  try {
    const semestersDocs = await db.collection("semesters").get();
    const todayDate = moment().format("DD-MM-YYYY");
    for (let semesterDoc of semestersDocs.docs) {
      if (checkMeetingTime(semesterDoc.id)) {
        const semesterData = semesterDoc.data();
        const LibraryScienceDoc = await db.collection("semesters").doc("mrnIdj52F4FVBgTaJBl1").get();
        const LibraryScienceData: any = LibraryScienceDoc.data();
        const students = [...semesterData.students, ...LibraryScienceData.students];
        for (let student of students) {
          const trackHoursDayQuery = await db
            .collection("trackHours")
            .where("uname", "==", student.uname)
            .where("day", "==", todayDate)
            .get();
          if (trackHoursDayQuery.docs.length > 0) {
            console.log(student.uname, "student.uname");
            const trackDoc = trackHoursDayQuery.docs[0];
            trackDoc.ref.update({
              meetings: [
                {
                  day: todayDate,
                  attended: false,
                },
              ],
            });
          } else {
            const newData = {
              day: todayDate,
              totalMinutes: 0,
              trackedMinutes: [],
              meetings: [
                {
                  day: todayDate,
                  attended: false,
                },
              ],
              ...student,
              semesterId: semesterDoc.id,
              semesterName: semesterData.title,
              lastActionTime: new Date(),
              createdAt: new Date(),
            };
            const trackHoursRef = db.collection("trackHours").doc();
            trackHoursRef.set(newData);
          }
        }
      }
    }
  } catch (error) {
    console.log("cleanOpenAiAssistants", error);
  }
};
