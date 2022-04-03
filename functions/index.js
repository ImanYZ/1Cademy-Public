// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");

const cors = require("cors");

require("dotenv").config();

const {
  deleteUser,
  retrieveData,
  feedbackData,
  loadContacts,
  reassignAllPConditionNums,
  applicationReminder,
} = require("./users");
const {
  voteEndpoint,
  voteActivityReset,
  deleteActivity,
  voteInstructorEndpoint,
  voteInstructorReset,
  assignExperimentSessionsPoints,
  remindCalendarInvitations,
  updateNotTakenSessions,
} = require("./projectManagement");
const {
  loadImage,
  sendEventNotificationEmail,
  rescheduleEventNotificationEmail,
  sendPersonalInvitations,
} = require("./emailing");
const {
  schedule,
  allEvents,
  deleteEvent,
  scheduleLifeLog,
  ongoingEvents,
} = require("./scheduling");
const { card, image } = require("./misinformationExp");

process.env.TZ = "America/Detroit";

const express = require("express");

const app = express();

app.use(express.json());

app.use(cors());

app.get("/loadImage/:contactId/:randNum", loadImage);
app.get("/loadContacts", loadContacts);
app.get("/sendPersonalInvitations", sendPersonalInvitations);
app.get("/reassignAllPConditionNums", reassignAllPConditionNums);
// app.get("/retrieveData", retrieveData);
// app.get("/feedbackData", feedbackData);
app.post("/vote", voteEndpoint);
app.post("/voteInstructor", voteInstructorEndpoint);
app.post("/voteInstructorReset", voteInstructorReset);
app.post("/voteActivityReset", voteActivityReset);
app.post("/deleteActivity", deleteActivity);
// app.get("/loadfeedbackCodes", loadfeedbackCodes);

// Emailing
app.post("/sendEventNotificationEmail", sendEventNotificationEmail);
app.post("/rescheduleEventNotificationEmail", rescheduleEventNotificationEmail);

// Schedule UX Research appointments
app.post("/schedule", schedule);
app.post("/allEvents", allEvents);
app.post("/ongoingEvents", ongoingEvents);
app.post("/deleteEvent", deleteEvent);
app.post("/scheduleLifeLog", scheduleLifeLog);

// Misinformation Experiment
app.get("/card", card);
app.get("/image*", image);

// https://baseurl.com/api/
exports.api = functions
  .runWith({
    memory: "1GB",
    timeoutSeconds: 520,
  })
  .https.onRequest(app);

exports.deleteUser = functions.firestore
  .document("users/{fullname}")
  .onDelete(deleteUser);

exports.updateNotTakenSessionsScheduler = functions.pubsub
  .schedule("every 40 minutes")
  .onRun(updateNotTakenSessions);

exports.assignExperimentSessionsPointsScheduler = functions.pubsub
  .schedule("every 4 hours")
  .onRun(assignExperimentSessionsPoints);

exports.remindCalendarInvitationsScheduler = functions.pubsub
  .schedule("every 4 hours")
  .onRun(remindCalendarInvitations);

exports.applicationReminder = functions.pubsub
  .schedule("every 25 hours")
  .onRun(applicationReminder);
