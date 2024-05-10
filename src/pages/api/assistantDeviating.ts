import { NextApiRequest, NextApiResponse } from "next";
import { getChapterRelatedToResponse, getPromptInstructions, handleDeviating, saveLogs } from "./assistantTutor";
import { db } from "@/lib/firestoreServer/admin";
import fbAuth from "src/middlewares/fbAuth";

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { questions, url, cardsModel } = req.body;
    const unit = (url.split("/").pop() || "").split("#")[0];
    const { uid, uname, fName, customClaims } = req.body?.data?.user?.userData;
    const isInstructor = customClaims.instructor;
    const conversationDocs = await db
      .collection("tutorConversations")
      .where("unit", "==", unit)
      .where("uid", "==", uid)
      .where("cardsModel", "==", cardsModel)
      .where("deleted", "==", false)
      .get();
    let course = "the-economy/microeconomics";
    if (url.includes("the-mission-corporation")) {
      course = "the-mission-corporation-4R-trimmed.html";
    }
    let conversationData: any = {};
    let newConversationRef = null;
    if (conversationDocs.docs.length <= 0) {
      return;
    }
    const conversationDoc = conversationDocs.docs[0];
    conversationData = conversationDoc.data();
    newConversationRef = conversationDoc.ref;
    const relevanceResponse = true;
    const { tutorName, courseName, objectives, directions, techniques, assistantSecondAgent, passingThreshold } =
      await getPromptInstructions(course, uname, isInstructor);

    for (let question of questions) {
      const { sections }: any = await getChapterRelatedToResponse(question, courseName);
      console.log("deviating");

      await handleDeviating(
        res,
        conversationData,
        relevanceResponse,
        question,
        newConversationRef,
        uname,
        cardsModel,
        sections
      );
    }
    const questionMessage = conversationData.messages.filter((m: any) => m.hasOwnProperty("question")).reverse()[0];
    if (!!questionMessage) {
      conversationData.messages.push({ ...questionMessage, question: true, sentAt: new Date() });
    }
    await newConversationRef.set({ ...conversationData, updatedAt: new Date() });
    res.end();
    await saveLogs({
      course,
      url,
      uname: uname || "",
      severity: "default",
      where: "assistantDeviating endpoint",
      action: "move on with deviating",
      project: "1Tutor",
    });
  } catch (error) {
    console.log(error);
  }
}

export default fbAuth(handler);
