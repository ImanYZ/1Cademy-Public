import { NextApiRequest, NextApiResponse } from "next";
import { callOpenAIChat } from "./openAI/helpers";
import fbAuth from "src/middlewares/fbAuth";
const generateCourseSyllabus = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  courseDescription: string,
  courseObjectives: string[],
  courseSkills: string[]
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, description, target learners, number of hour-long class sessions, objectives, and skills, your task is to generate a detailed syllabus for the course. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.
  
    **Input:**
    
    1. **Course Title:** [Course Title goes here]
    2. **Course Description:** [Course Description goes here]
    3. **Target Learners:** [Target Learners Description goes here]
    4. **Number of Hour-long Class Sessions:** [Number of Class Sessions goes here]
    5. **Objectives:** [Course Objectives go here]
    6. **Skills:** [Skills Gained from the Course go here]
    
    **Output:**
    
    Generate a detailed syllabus that includes categories and topics. Each topic should have clear, concise, and informative descriptions. The skills and knowledge gained from each topic should contribute to the overall learning objectives of the course. Each topic should represent the exact skills that the learners will acquire after completing the course. The skills should be phrases that the student could add to the skills section of their resume or LinkedIn profile.
    
    Your generated syllabus should:
    
    1. Ensure each topic is focused and covers a single concept or skill.
    2. Maintain consistency in the size and scope of each topic or category.
    3. Align topics with the course objectives and the needs of the target learners.
    4. Ensure comprehensive coverage of the subject matter.
    5. Sequence topics logically to ensure a progression of learning.
    6. Consider the number of class sessions available and the level of detail appropriate for the target learners.
    7. Ensure that the hours allocated to each topic are appropriate for the level of detail and complexity required.
    8. Ensure that the difficulty level of each topic is suitable for the target learners.
    9. Ensure that the syllabus is engaging, challenging, and achievable for the target learners.
    10. Reflect the latest trends and developments in the field.
    11. Ensure the descriptions of each topic are clear, concise, and informative.
    12. Ensure the skills and knowledge gained from each topic contribute to the overall learning objectives of the course.
    13. Ensure each topic represents the exact skills that the learners will acquire after completing the course. The skills should be phrases that the student could add to the skills section of their resume or LinkedIn profile.
    
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
      ],
      "Skills": [
        "Advanced HTML and CSS",
        "JavaScript ES6",
        "React",
        "Node.js",
        "Express.js",
        "RESTful APIs",
        "MongoDB",
        "Web Security",
        "CI/CD",
        "Docker"
      ]
    }
    \`\`\`
    
    ### Example Output:
    
    \`\`\`json
    {
      "syllabus": [
        {
          "category": "Frontend Development",
          "topics": [
            {
              "topic": "Advanced HTML and CSS",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Advanced techniques in HTML and CSS for modern web design.",
              "skills": ["Advanced HTML", "Advanced CSS"]
            },
            {
              "topic": "JavaScript ES6 and Beyond",
              "hours": 2,
              "difficulty": "Medium",
              "description": "In-depth coverage of ES6 features and modern JavaScript.",
              "skills": ["JavaScript ES6"]
            },
            {
              "topic": "Introduction to React",
              "hours": 3,
              "difficulty": "Medium",
              "description": "Fundamentals of React for building dynamic user interfaces.",
              "skills": ["React"]
            },
            {
              "topic": "State Management in React",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Managing state in React applications using various techniques.",
              "skills": ["State Management in React"]
            }
          ]
        },
        {
          "category": "Backend Development",
          "topics": [
            {
              "topic": "Node.js and Express.js",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Building server-side applications using Node.js and Express.js.",
              "skills": ["Node.js", "Express.js"]
            },
            {
              "topic": "RESTful API Design",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Designing RESTful APIs for web applications.",
              "skills": ["RESTful APIs"]
            },
            {
              "topic": "Database Integration with MongoDB",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Integrating MongoDB with web applications for data storage.",
              "skills": ["MongoDB"]
            },
            {
              "topic": "Authentication and Authorization",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Implementing secure authentication and authorization mechanisms.",
              "skills": ["Authentication", "Authorization"]
            }
          ]
        },
        {
          "category": "Web Security",
          "topics": [
            {
              "topic": "Common Security Threats",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Identifying and mitigating common web security threats.",
              "skills": ["Web Security Threats"]
            },
            {
              "topic": "Secure Coding Practices",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Best practices for writing secure code.",
              "skills": ["Secure Coding"]
            },
            {
              "topic": "Web Application Firewalls",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Using web application firewalls to protect web applications.",
              "skills": ["Web Application Firewalls"]
            }
          ]
        },
        {
          "category": "DevOps and Deployment",
          "topics": [
            {
              "topic": "Continuous Integration and Continuous Deployment (CI/CD)",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Practices and tools for continuous integration and deployment.",
              "skills": ["CI/CD"]
            },
            {
              "topic": "Containerization with Docker",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Using Docker for containerization and deployment.",
              "skills": ["Docker"]
            },
            {
              "topic": "Deployment on Cloud Platforms",
              "hours": 2,
              "difficulty": "Medium",
              "description": "Deploying web applications on cloud platforms.",
              "skills": ["Cloud Deployment"]
            }
          ]
        }
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
    "Course Skills": courseSkills,
  };

  const response = await callOpenAIChat([], JSON.stringify(userPrompt), JSON.stringify(systemPrompt));
  const syllabus = JSON.parse(response).syllabus;
  console.log(JSON.stringify(syllabus, null, 2));
  return syllabus;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseTitle, targetLearners, courseDescription, courseObjectives, courseSkills, hours } = req.body;
    const syllabus = await generateCourseSyllabus(
      courseTitle,
      targetLearners,
      hours,
      courseDescription,
      courseObjectives,
      courseSkills
    ).catch(console.error);

    console.log("description ==>", syllabus);
    return res.status(200).json(syllabus);
  } catch (error) {
    return res.status(500).json({});
  }
}
export default fbAuth(handler);
