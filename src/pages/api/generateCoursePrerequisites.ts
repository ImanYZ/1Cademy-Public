import { NextApiRequest, NextApiResponse } from "next";
import { callOpenAIChat } from "./openAI/helpers";

const generateCoursePrerequisites = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  sessionHours: number
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, target learners, number of class sessions, and number of hours per class session, your task is to generate the detailed prerequisite knowledge for taking the course, as a long string. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.
Your generated prerequisites will be reviewed by a supervisory team. For helpful prerequisites, we will pay you $100 and for an unhelpful one, you'll lose $100.

**Input:**

1. **Course Title:** [Course Title goes here]
2. **Target Learners:** [Target Learners Description goes here]
3. **Number of Class Sessions:** [Number of Class Sessions goes here]
4. **Number of Hours Per Class Session:** [Number of Hours per Class Session goes here]

### Example Input:

\`\`\`json
{
  "Course Title": "Advanced Web Development",
  "Target Learners": "Graduate students in computer science or related fields, with prior experience in basic web development.",
  "Number of Class Sessions": 16,
  "Number of Hours Per Class Session": 2
}
\`\`\`

### Example Output:

\`\`\`json
{
  "prerequisiteKnowledge": "HTML and CSS fundamentals, JavaScript programming basics, Understanding of DOM manipulation, Basic knowledge of responsive design, Experience with version control systems (e.g., Git), Familiarity with basic web development tools (e.g., text editors, browsers), Introduction to web development frameworks (e.g., Bootstrap), Basic understanding of web servers and how they work, Introductory knowledge of HTTP/HTTPS protocols, Basic concepts of API integration, Understanding of client-server architecture, Basic knowledge of database management and SQL, Introductory knowledge of web security best practices, Experience with basic debugging and testing techniques"
}
\`\`\`
`;

  const userPrompt = {
    "Course Title": courseTitle,
    "Target Learners": targetLearners,
    "Number of Class Sessions": classSessions,
    "Number of Hours Per Class Session": sessionHours,
  };

  const response = await callOpenAIChat([], JSON.stringify(userPrompt), JSON.stringify(systemPrompt));
  const prerequisiteKnowledge = response.prerequisiteKnowledge;
  console.log(prerequisiteKnowledge);
  return prerequisiteKnowledge;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseTitle, targetLearners, classSessions, sessionHours } = req.body;
    const coursePrerequisites = await generateCoursePrerequisites(
      courseTitle,
      targetLearners,
      classSessions,
      sessionHours
    ).catch(console.error);
    console.log("Prerequisites ==>", coursePrerequisites);
    return res.status(200).json(coursePrerequisites);
  } catch (error) {
    return res.status(500).json({});
  }
}
