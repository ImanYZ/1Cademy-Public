import { NextApiRequest, NextApiResponse } from "next";
import { callOpenAIChat } from "./openAI/helpers";
import fbAuth from "src/middlewares/fbAuth";

const generateCourseSkills = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  courseDescription: string,
  courseObjectives: string[]
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, description, target learners, number of hour-long class sessions, and objectives, your task is to generate a detailed list of skills that learners will acquire upon completing the course. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.
  
    **Input:**
    
    1. **Course Title:** [Course Title goes here]
    2. **Course Description:** [Course Description goes here]
    3. **Target Learners:** [Target Learners Description goes here]
    4. **Number of Hour-long Class Sessions:** [Number of Class Sessions goes here]
    5. **Objectives:** [Course Objectives go here]
    
    **Output:**
    
    Generate a detailed list of skills that learners will acquire upon completing the course. Each skill should be a phrase that a student could add to the skills section of their resume or LinkedIn profile. The skills should be directly aligned with the course objectives and should reflect the knowledge and capabilities that the learners will gain.
    
    Your generated list of skills should:
    
    1. Be clear, concise, and informative.
    2. Align with the overall learning objectives of the course.
    3. Represent the exact career-oriented skills that the learners will acquire after completing the course.
    4. Represent practical, marketable skills that learners can use in their professional careers and add to their resumes or LinkedIn profiles.
    5. Reflect the latest trends and developments in the field.
    6. Be appropriate for the target learners and their prior knowledge level.
    7. Be achievable within the number of hour-long class sessions provided.
    
    ### Example Input:
    
    \`\`\`json
    {
      "Course Title": "Advanced Web Development",
      "Course Description": "This course covers advanced topics in web development, including modern JavaScript frameworks, server-side programming, database integration, and web security. It is intended for students with a basic understanding of web development.",
      "Target Learners": "Graduate students in computer science or related fields, with prior experience in basic web development.",
      "Number of Hour-long Class Sessions": 16,
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
    "Number of Hour-long Class Sessions": classSessions,
    "Current Description": courseDescription,
    "Course Objectives": courseObjectives,
  };

  const response = await callOpenAIChat([], JSON.stringify(userPrompt), JSON.stringify(systemPrompt));
  const skills = JSON.parse(response).skills;
  console.log(JSON.stringify(skills, null, 2));
  return skills;
};
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseTitle, targetLearners, courseDescription, courseObjectives, hours } = req.body;
    const courseSkills = await generateCourseSkills(
      courseTitle,
      targetLearners,
      hours,
      courseDescription,
      courseObjectives
    ).catch(console.error);

    return res.status(200).json(courseSkills);
  } catch (error) {
    return res.status(500).json({});
  }
}
export default fbAuth(handler);
