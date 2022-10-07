import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";

import { db } from "../../lib/firestoreServer/admin";
import { replaceUsername } from "../../utils";

// TODO: need to discuss about username format is only alphanumeric or we allow other symbols .i.e (!@#$%^&*())
// TODO: it allows spaces in user, we need to fixed that I can help hackers to impersonate someone else
// Logic
// check if username is valid (ideal username should not have .,/,__) otherwise throw error with 400
// check if new user equal old one ignore change username (need change this behaviour)
// check if new username already exist for someone else, throw error and respond with 500
// create a new doc with new username in users collection and copy all of fields from old doc to new
// delete old user doc
// change old username in each collection that has usernames:
// - {nodeType}Versions, user{nodeType}Versions, {nodeType}VersionsComments (not implemented), user{nodeType}VersionsComments (not implemented)
// - userNodes, userNodesLog, userVersionsLog, practice (not implemented), practiceCompletion (not implemented), practiceLog (not implemented)
// - comPoints, comMonthlyPoints, comWeeklyPoints, comOthersPoints, comOthMonPoints, comOthWeekPoints
//   (all following not implemented)
// - schoolPoints, schoolMonthlyPoints, schoolWeeklyPoints, schoolOthersPoints, schoolOthMonPoints, schoolOthWeekPoints
// - reputations, monthlyReputations, weeklyReputations, othersReputations, othMonReputations, othWeekReputations
// - notifications, presentations, presNodes,
//   userBackgroundLog, userClosedSidebarLog, userClustersLog, userLeaderboardLog, userComLeaderboardLog (not implemented), userNodePartsLog
//   userNodeSelectLog, userOpenSidebarLog, userSearchLog, userThemeLog, userUserInfoLog, userUsersStatusLog
// - messages, notifications*, userUserInfoLog
// - nodes
// update newUsername as displayName in firebase auth user
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const userDoc = await db.doc(`/users/${req.body.data.user.userData.uname}`).get();
    const newUsername = req.body.data.newUname;
    if (newUsername.includes(".") || newUsername.includes("/") || newUsername.includes("__")) {
      return res.status(400).json({ error: "Please don't include '.', '/', or '__' in your username" });
    } else if (newUsername !== req.body.data.user.userData.uname) {
      await replaceUsername({ userDoc, newUsername });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error, success: false });
  }
}

export default fbAuth(handler);
