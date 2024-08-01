import { NextApiRequest, NextApiResponse } from "next";
import { callOpenAIChat } from "./openAI/helpers";
import fbAuth from "src/middlewares/fbAuth";

const generateCourseObjectives = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  sessionHours: number,
  prerequisiteKnowledge: string,
  courseDescription: string
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, description, target learners, their prerequisite knowledge, number of class sessions, and number of hours per class session, your task is to generate a detailed list of course objectives. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.
Your generated objectives will be reviewed by a supervisory team. For every helpful objective, we will pay you $10 and for every unhelpful one, you'll lose $10.

**Input:**

1. **Course Title:** [Course Title goes here]
2. **Course Description:** [Course Description goes here]
3. **Target Learners:** [Target Learners Description goes here]
4. **Number of Class Sessions:** [Number of Class Sessions goes here]
5. **Number of Hours Per Class Session:** [Number of Hours per Class Session goes here]
6. **Prerequisite Knowledge:** [Description of the Prerequisite Knowledge for taking this course]

**Output:**

Generate a detailed list of course objectives that clearly define what learners will achieve by the end of the course. Each objective should be specific, measurable, achievable, relevant, and time-bound (SMART). The objectives should align with the course content and be appropriate for the target learners.

Your generated list of objectives should:

1. Be clear, concise, and informative.
2. Align with the course title and description.
3. Address the needs and prior knowledge level of the target learners.
4. Reflect the knowledge and skills learners will gain.
5. Be achievable within the number of provided number of class sessions and number of hours per class session.
6. Cover all key aspects of the course content.
7. Be structured in a way that logically progresses through the course material.

### Example Input:

\`\`\`json
{
  "Course Title": "Advanced Web Development",
  "Course Description": "This course covers advanced topics in web development, including modern JavaScript frameworks, server-side programming, database integration, and web security. It is intended for students with a basic understanding of web development.",
  "Target Learners": "Graduate students in computer science or related fields, with prior experience in basic web development.",
  "Number of Class Sessions": 16,
  "Number of Hours Per Class Session": 2,
  "Prerequisite Knowledge": "HTML and CSS fundamentals, JavaScript programming basics, Understanding of DOM manipulation, Basic knowledge of responsive design, Experience with version control systems (e.g., Git), Familiarity with basic web development tools (e.g., text editors, browsers), Introduction to web development frameworks (e.g., Bootstrap), Basic understanding of web servers and how they work, Introductory knowledge of HTTP/HTTPS protocols, Basic concepts of API integration, Understanding of client-server architecture, Basic knowledge of database management and SQL, Introductory knowledge of web security best practices, Experience with basic debugging and testing techniques"
}
\`\`\`

### Example Output:

\`\`\`json
{
  "objectives": [
    "Master advanced techniques in HTML and CSS for modern web design",
    "Develop and manage dynamic user interfaces using React",
    "Implement state management in React applications using Redux and Context API",
    "Build server-side applications with Node.js and Express.js",
    "Design and implement RESTful APIs",
    "Integrate MongoDB for data storage in web applications",
    "Implement secure authentication and authorization mechanisms",
    "Identify and mitigate common web security threats",
    "Apply best practices for secure coding",
    "Use web application firewalls to protect web applications",
    "Set up and manage CI/CD pipelines",
    "Use Docker for containerization and deployment",
    "Deploy web applications on cloud platforms"
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
  };

  const response = await callOpenAIChat([], JSON.stringify(userPrompt), JSON.stringify(systemPrompt));
  const objectives = response.objectives;
  console.log(JSON.stringify(objectives, null, 2));
  return objectives;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseTitle, targetLearners, courseDescription, prerequisiteKnowledge, classSessions, sessionHours } =
      req.body;
    const courseObjectives = await generateCourseObjectives(
      courseTitle,
      targetLearners,
      classSessions,
      sessionHours,
      prerequisiteKnowledge,
      courseDescription
    ).catch(console.error);
    console.log("description ==>", courseObjectives);
    return res.status(200).json(courseObjectives);
  } catch (error) {
    return res.status(500).json({});
  }
}
export default fbAuth(handler);
