import { NextApiRequest, NextApiResponse } from "next";
import { callOpenAIChat } from "./openAI/helpers";
import fbAuth from "src/middlewares/fbAuth";

const improveCourseSyllabus = async (
  courseTitle: string,
  courseDescription: string,
  targetLearners: string,
  syllabus: Array<string | { category: string; topics: string[] }>
) => {
  const systemPrompt = ``;

  const userPrompt = {
    "Course Title": courseTitle,
    "Course Description": courseDescription,
    "Target Learners": targetLearners,
    "Current Syllabus": syllabus,
  };

  const response = await callOpenAIChat([], JSON.stringify(userPrompt), JSON.stringify(systemPrompt));
  const suggestions = JSON.parse(response).suggestions;
  console.log("suggestions:", suggestions);
  return suggestions;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseTitle, courseDescription, targetLearners, syllabus } = req.body;
    const suggestions = await improveCourseSyllabus(courseTitle, courseDescription, targetLearners, syllabus);
    return res.status(200).json({ suggestions });
  } catch (error) {
    return res.status(500).json({});
  }
}
export default fbAuth(handler);
