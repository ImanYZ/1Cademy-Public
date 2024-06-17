import moment = require("moment");
import { db } from "./admin";

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
        for (let student of semesterData.students) {
          const trackHoursDayQuery = await db
            .collection("trackHours")
            .where("uname", "==", student.uname)
            .where("day", "==", todayDate)
            .get();
          if (trackHoursDayQuery.docs.length > 0) {
            const trackDoc = trackHoursDayQuery.docs[0];
            const trackData = trackDoc.data();
            const addedPrev = trackData.meetings.findIndex((m: { day: string }) => m.day === todayDate);
            if (addedPrev !== -1) {
              trackData.meetings = [
                ...trackData.meetings,
                {
                  day: todayDate,
                  attended: false,
                },
              ];
            }
            trackDoc.ref.update({
              meetings: trackData.meetings,
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
