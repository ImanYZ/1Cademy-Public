import { NextApiRequest, NextApiResponse } from "next";
import { callOpenAIChat } from "./openAI/helpers";
import fbAuth from "src/middlewares/fbAuth";

const generateCourseSkills = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  sessionHours: number,
  prerequisiteKnowledge: string,
  courseDescription: string,
  courseObjectives: string[]
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, description, target learners, their prerequisite knowledge, number of class sessions, number of hours per class session, and objectives, your task is to generate a detailed list of skills that learners will acquire upon completing the course. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.
Your generated skills will be reviewed by a supervisory team. For every helpful skill, we will pay you $10 and for every unhelpful one, you'll lose $10.

**Input:**

1. **Course Title:** [Course Title goes here]
2. **Course Description:** [Course Description goes here]
3. **Target Learners:** [Target Learners Description goes here]
4. **Number of Class Sessions:** [Number of Class Sessions goes here]
5. **Number of Hours Per Class Session:** [Number of Hours per Class Session goes here]
6. **Prerequisite Knowledge:** [Description of the Prerequisite Knowledge for taking this course]
7. **Objectives:** [Course Objectives go here]

**Output:**

Generate a detailed list of skills that learners will acquire upon completing the course. Each skill should be a phrase that a student could add to the skills section of their resume or LinkedIn profile. The skills should be directly aligned with the course objectives and should reflect the knowledge and capabilities that the learners will gain.

Your generated list of skills should:

1. Be clear, concise, and informative.
2. Align with the overall learning objectives of the course.
3. Represent the exact career-oriented skills that the learners will acquire after completing the course.
4. Represent practical, marketable skills that learners can use in their professional careers and add to their resumes or LinkedIn profiles.
5. Reflect the latest trends and developments in the field.
6. Be appropriate for the target learners and their prior knowledge level.
7. Be achievable within the provided number of class sessions and number of hours per class session.

### Example Input:

\`\`\`json
{
  "Course Title": "Advanced Web Development",
  "Course Description": "This course covers advanced topics in web development, including modern JavaScript frameworks, server-side programming, database integration, and web security. It is intended for students with a basic understanding of web development.",
  "Target Learners": "Graduate students in computer science or related fields, with prior experience in basic web development.",
  "Number of Class Sessions": 16,
  "Number of Hours Per Class Session": 2,
  "Prerequisite Knowledge": "HTML and CSS fundamentals, JavaScript programming basics, Understanding of DOM manipulation, Basic knowledge of responsive design, Experience with version control systems (e.g., Git), Familiarity with basic web development tools (e.g., text editors, browsers), Introduction to web development frameworks (e.g., Bootstrap), Basic understanding of web servers and how they work, Introductory knowledge of HTTP/HTTPS protocols, Basic concepts of API integration, Understanding of client-server architecture, Basic knowledge of database management and SQL, Introductory knowledge of web security best practices, Experience with basic debugging and testing techniques"
  "Objectives": [
    "Master advanced frontend and backend web development techniques",
    "Understand and implement web security best practices",
    "Deploy web applications using modern tools and platforms"
  ]
}
\`\`\`

### Example Output:

\`\`\`json
{
  "skills": [
    "Advanced HTML",
    "Advanced CSS",
    "JavaScript ES6",
    "React",
    "State Management in React",
    "Node.js",
    "Express.js",
    "RESTful API Design",
    "MongoDB Integration",
    "Authentication and Authorization",
    "Web Security Best Practices",
    "CI/CD Pipelines",
    "Docker",
    "Cloud Deployment"
  ]
}
\`\`\`
`;

  const userPrompt = {
    "Course Title": courseTitle,
    "Target Learners": targetLearners,
    "Number of Class Sessions": classSessions,
    "Number of Hours Per Class Session": sessionHours,
    "Current Description": courseDescription,
    "Prerequisite Knowledge": prerequisiteKnowledge,
    "Course Objectives": courseObjectives,
  };

  const response = await callOpenAIChat([], JSON.stringify(userPrompt), JSON.stringify(systemPrompt));
  const skills = response.skills;
  console.log(JSON.stringify(skills, null, 2));
  return skills;
};
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      courseTitle,
      targetLearners,
      courseDescription,
      courseObjectives,
      classSessions,
      sessionHours,
      prerequisiteKnowledge,
    } = req.body;
    const courseSkills = await generateCourseSkills(
      courseTitle,
      targetLearners,
      classSessions,
      sessionHours,
      prerequisiteKnowledge,
      courseDescription,
      courseObjectives
    ).catch(console.error);

    return res.status(200).json(courseSkills);
  } catch (error) {
    return res.status(500).json({});
  }
}
export default fbAuth(handler);
