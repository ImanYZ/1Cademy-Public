import { Feedback } from "../knowledgeTypes";
import { db } from "./admin";

export const getFeedback = async (): Promise<Feedback[]> => {
  const feedbackDocs = await db.collection("feedback").get();
  const feedbackData = feedbackDocs.docs.map(cur => cur.data());
  return feedbackData.map(cur => ({
    pageURL: cur.pageURL,
    email: cur.email,
    name: cur.name,
    feedback: cur.feedback,
    createdAt: new Date(cur.createdAt._seconds * 1000).toLocaleString()
  }));
};
