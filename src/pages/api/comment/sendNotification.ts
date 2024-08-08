import { admin, db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next/types";

import fbAuth from "src/middlewares/fbAuth";
import { getSemestersByIds } from "src/utils/course-helpers";
const removeInvalidTokens = async (invalidTokens: { [key: string]: string[] }) => {
  for (let uid in invalidTokens) {
    const fcmTokensDoc = await db.collection("fcmTokens").doc(uid).get();
    if (fcmTokensDoc.exists) {
      const tokens = fcmTokensDoc.data()?.tokens;
      const newTokens = tokens.filter((token: string) => !invalidTokens[uid].includes(token));
      await fcmTokensDoc.ref.update({
        tokens: newTokens,
      });
    }
  }
};
const replaceMentions = (text: string) => {
  let pattern = /\[@(.*?)\]\(\/mention\/.*?\)/g;
  return text.replace(pattern, (match, displayText) => `@${displayText}`);
};

const triggerNotifications = async (data: any) => {
  try {
    const { nodeId, comment, subject, commentSidebarInfo, members } = data;
    const fcmTokensHash: { [key: string]: string } = {};
    const fcmTokensDocs = await db.collection("fcmTokens").get();

    for (let fcmToken of fcmTokensDocs.docs) {
      fcmTokensHash[fcmToken.id] = fcmToken.data().tokens;
    }
    let nodeRef = db.collection("nodes").doc(nodeId);

    const nodeDoc = await nodeRef.get();
    console.log(fcmTokensHash);
    if (nodeDoc.exists) {
      const nodeData = nodeDoc.data();
      const semesters = await getSemestersByIds(nodeData?.tagIds || []);
      let instructors: any = [];
      for (const semester in semesters) {
        instructors = [
          ...instructors,
          ...semesters[semester].instructors.map(instructor => {
            return {
              id: instructor,
            };
          }),
        ];
      }
      const combineMembers = [...instructors, ...members].filter((m: any) => m.id !== comment.sender);
      const _member = new Set();
      const invalidTokens: any = {};
      for (let member of combineMembers) {
        if (_member.has(member.id)) continue;
        const userDoc = await db.collection("users").where("uname", "==", member.id).get();
        if (!userDoc.docs.length) continue;
        const UID = userDoc.docs[0].data().userId;

        const newNotification = {
          ...comment,
          createdAt: new Date(),
          commentSidebarInfo,
          title: nodeData?.title,
          nodeId: nodeDoc.id,
          checked: false,
          proposer: member.id, // todo: the field would be changed to notify
          user: member.id,
          oType: "Comment",
          aType: commentSidebarInfo?.proposal ? "proposal" : "comment",
        };
        const notificationRef = db.collection("notifications").doc();
        try {
          const tokens = fcmTokensHash[UID] || [];
          for (let token of tokens) {
            const payload = {
              token,
              notification: {
                title: `${subject} on ${nodeData?.title} node`,
                body: replaceMentions(comment.text),
              },
              data: {
                notificationType: "comment",
                nodeId,
                commentSidebarInfo: JSON.stringify(commentSidebarInfo),
              },
            };
            console.log(admin.messaging());
            console.log(payload);
            admin
              .messaging()
              .send(payload)
              .then((response: any) => {
                console.log("Successfully sent message: ", response);
              })
              .catch((error: any) => {
                if (
                  error.code === "messaging/invalid-registration-token" ||
                  error.code === "messaging/registration-token-not-registered"
                ) {
                  console.log(`Token ${token} is invalid. Removing token...`);

                  invalidTokens[UID] = [...(invalidTokens[UID] || []), token];
                }
              });
          }
        } catch (error) {
          console.log(error, "error");
        }
        await notificationRef.set(newNotification);
        _member.add(member.id);
      }
      await removeInvalidTokens(invalidTokens);
    }

    console.log("documents created");
  } catch (error) {
    console.log(error);
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { uname } = req.body?.data?.user?.userData;
    const { nodeId, comment, subject, commentSidebarInfo, members } = req.body as any;
    if (uname !== comment.sender) {
      throw new Error("");
    }
    await triggerNotifications({ nodeId, comment, subject, commentSidebarInfo, members });
    return res.status(200).send({});
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error: true,
    });
  }
}
export default fbAuth(handler);
