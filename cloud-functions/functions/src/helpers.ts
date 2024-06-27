import moment = require("moment-timezone");

import { db, commitBatch, batchUpdate } from "./admin";

export const signalFlashcardChanges = async (nodeId: string, type: string) => {
  const nodeDoc = await db.collection("nodes").doc(nodeId).get();
  const nodeData = nodeDoc.data();
  if (nodeData && nodeData.hasOwnProperty("linkedFlashcards")) {
    const linkedFlashcards = nodeData.linkedFlashcards;
    for (let linkedF of linkedFlashcards) {
      const passageDoc = await db.collection("chaptersBook").doc(linkedF.documentId).get();

      const flashcards = passageDoc.data()?.flashcards;

      let needUpdate = false;
      flashcards.forEach((flashcard: any) => {
        if (flashcard.node === nodeId) {
          needUpdate = true;
          if (type === "delete") {
            flashcard.deleted = true;
            flashcard.proposed = false;
            flashcard.node = "";
            flashcard.proposal = "";
          } else if (type === "update") {
            flashcard.content = nodeData.content;
            flashcard.title = nodeData.title;
            flashcard.fullname = nodeData.aFullname;
            flashcard.user = nodeData.admin;
            flashcard.userImage = nodeData.aImgUrl;
            flashcard.type = nodeData.nodeType;
          }
        }
      });
      if (needUpdate) {
        await batchUpdate(passageDoc.ref, { flashcards, updatedAt: new Date() });
      }
    }
  }
  await commitBatch();
};
const getListOfStudents = async () => {
  const semestersDocs = await db.collection("semesters").where("trackingHours", "==", true).get();

  const studentsMap: { [uname: string]: any } = {};
  for (let semesterDoc of semestersDocs.docs) {
    const semesterData = semesterDoc.data();
    for (let student of semesterData.students) {
      studentsMap[student.uname] = { ...student, semesterId: semesterDoc.id, semesterName: semesterData.title };
    }
  }
  return studentsMap;
};
const getMinutesDiff = (createdAt: any, lastActionTime: any) => {
  const _createdAt = createdAt.seconds(0).milliseconds(0);
  const _lastActionTime = lastActionTime.seconds(0).milliseconds(0);
  return _createdAt.diff(_lastActionTime, "minutes");
};

const shouldTrackHours = (semesterId: string, hourEST: any, dayOfWeekEST: any) => {
  const community1 =
    (semesterId === "6E1h49QYINasnDOpVpHL" || semesterId === "mrnIdj52F4FVBgTaJBl1") &&
    hourEST >= 18 &&
    hourEST < 19 &&
    dayOfWeekEST === 5;
  const community2 =
    (semesterId === "8bMQ51sit8VeFD27TDEt" || semesterId === "mrnIdj52F4FVBgTaJBl1") &&
    hourEST >= 16 &&
    hourEST < 17 &&
    dayOfWeekEST === 1;
  return !community1 && !community2;
};
export const trackHours = async (data: any) => {
  try {
    const students: { [uname: string]: any } = await getListOfStudents();
    if (!(data.doer in students)) {
      return;
    }
    const createdAt = moment(data.createdAt.toDate());
    const todayDate = moment().format("DD-MM-YYYY");

    const createdAtEST = createdAt.tz("America/New_York");
    const hourEST = createdAtEST.hour();
    const dayOfWeekEST = createdAtEST.day();

    console.log("shouldTrackHours==>", dayOfWeekEST, hourEST, students[data.doer].semesterId, data.doer);
    if (!shouldTrackHours(students[data.doer].semesterId, hourEST, dayOfWeekEST)) {
      console.log(`Cannot track hours for ${students[data.doer].semesterId} currently in a meeting`);
      return;
    }

    const trackHoursRef = db.collection("trackHours").doc(`${data.doer}-${todayDate}`);

    await db.runTransaction(async transaction => {
      const trackHoursDoc = await transaction.get(trackHoursRef);

      if (trackHoursDoc.exists) {
        const trackData: any = trackHoursDoc.data();

        const lastActionTime = moment(trackData.lastActionTime.toDate());

        const diffInMinutes = getMinutesDiff(createdAt, lastActionTime);

        if (diffInMinutes > 0 && diffInMinutes <= 5) {
          trackData.totalMinutes += diffInMinutes;
          trackData.trackedMinutes.push(createdAt);
          trackData.lastActionTime = createdAt;
        } else if (diffInMinutes > 5) {
          trackData.totalMinutes += 1;
          trackData.trackedMinutes.push(createdAt);
          trackData.lastActionTime = createdAt;
        }

        transaction.update(trackHoursRef, { ...trackData, paid: false });
      } else {
        const newData = {
          day: todayDate,
          totalMinutes: 1,
          trackedMinutes: [data.createdAt],
          ...students[data.doer],
          lastActionTime: createdAt,
          createdAt: new Date(),
        };

        transaction.set(trackHoursRef, newData);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export const roundNum = (num: any) => Number(Number.parseFloat(Number(num).toFixed(2)));
