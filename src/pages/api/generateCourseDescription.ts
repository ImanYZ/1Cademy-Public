import { NextApiRequest, NextApiResponse } from "next";
import { callOpenAIChat } from "./openAI/helpers";
import fbAuth from "src/middlewares/fbAuth";

const generateCourseDescription = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  sessionHours: number,
  prerequisiteKnowledge: string
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, target learners, their prerequisite knowledge, number of class sessions, and number of hours per class session, your task is to generate a detailed course description. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.
Your generated description will be reviewed by a supervisory team. For a helpful description, we will pay you $1000 and for an unhelpful one, you'll lose $1000.

**Input:**

1. **Course Title:** [Course Title goes here]
2. **Target Learners:** [Target Learners Description goes here]
3. **Number of Class Sessions:** [Number of Class Sessions goes here]
4. **Number of Hours Per Class Session:** [Number of Hours per Class Session goes here]
5. **Prerequisite Knowledge:** [Description of the Prerequisite Knowledge for taking this course]

**Output:**

Generate a detailed course description that provides a clear overview of the course, including its main topics, the skills and knowledge learners will gain, and how the course is structured. The description should be engaging and informative, accurately reflecting the course content and objectives.

Your generated course description should:

1. Be clear, concise, and informative.
2. Align with the course title and target learners.
3. Provide an overview of the key topics covered in the course.
4. Highlight the skills and knowledge learners will gain.
5. Indicate the structure and format of the course.
6. Be appropriate for the target learners and their prerequisite knowledge.
7. Reflect the provided number of class sessions and number of hours per class session.
8. Be engaging and motivating for prospective learners.

### Example Input:

\`\`\`json
{
  "Course Title": "Advanced Web Development",
  "Target Learners": "Graduate students in computer science or related fields, with prior experience in basic web development.",
  "Number of Class Sessions": 16,
  "Number of Hours Per Class Session": 2,
  "Prerequisite Knowledge": "HTML and CSS fundamentals, JavaScript programming basics, Understanding of DOM manipulation, Basic knowledge of responsive design, Experience with version control systems (e.g., Git), Familiarity with basic web development tools (e.g., text editors, browsers), Introduction to web development frameworks (e.g., Bootstrap), Basic understanding of web servers and how they work, Introductory knowledge of HTTP/HTTPS protocols, Basic concepts of API integration, Understanding of client-server architecture, Basic knowledge of database management and SQL, Introductory knowledge of web security best practices, Experience with basic debugging and testing techniques"
}
\`\`\`

### Example Output:

\`\`\`json
{
  "description": "This course offers an in-depth exploration of advanced web development techniques, focusing on modern JavaScript frameworks, server-side programming, database integration, and web security. Over 16 class sessions, each taking an hour, students will master advanced HTML and CSS, develop dynamic user interfaces with React, and manage state using Redux and Context API. The course also covers backend development with Node.js and Express.js, RESTful API design, and MongoDB integration for robust data management. Learners will implement secure authentication and authorization mechanisms, understand and mitigate common web security threats, and apply best practices for secure coding. Additionally, the course includes setting up and managing CI/CD pipelines, using Docker for containerization, and deploying applications on cloud platforms. By the end of this course, students will possess the advanced skills necessary to build, secure, and deploy modern web applications, ready to tackle complex development challenges in their professional careers."
}
\`\`\`
`;

  const userPrompt = {
    "Course Title": courseTitle,
    "Target Learners": targetLearners,
    "Number of Class Sessions": classSessions,
    "Number of Hours Per Class Session": sessionHours,
    "Prerequisite Knowledge": prerequisiteKnowledge,
  };

  const response = await callOpenAIChat([], JSON.stringify(userPrompt), JSON.stringify(systemPrompt));
  const description = response.description;
  console.log(JSON.stringify(description, null, 2));
  return description;
};
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseTitle, targetLearners, classSessions, sessionHours, prerequisiteKnowledge } = req.body;
    const description = await generateCourseDescription(
      courseTitle,
      targetLearners,
      classSessions,
      sessionHours,
      prerequisiteKnowledge
    ).catch(console.error);
    console.log("description ==>", description);
    return res.status(200).json(description);
  } catch (error) {
    return res.status(500).json({});
  }
}
export default fbAuth(handler);

// generateCourseObjectives(
//   courseTitle,
//   targetLearners,
//   13,
//   courseDescription
// ).catch(console.error);

// generateCourseSkills(
//   courseTitle,
//   targetLearners,
//   13,
//   courseDescription,
//   courseObjectives
// ).catch(console.error);

// generateCourseSyllabus(
//   courseTitle,
//   targetLearners,
//   13,
//   courseDescription,
//   courseObjectives,
//   courseSkills
// ).catch(console.error);
