import { NextApiRequest, NextApiResponse } from "next";
import { callOpenAIChat } from "./openAI/helpers";
import fbAuth from "src/middlewares/fbAuth";

const improveCourseSyllabus = async (
  courseTitle: string,
  courseDescription: string,
  targetLearners: string,
  syllabus: Array<string | { category: string; topics: string[] }>
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, description, target learners, and current syllabus, your task is to provide very specific improvements to the syllabus to ensure that the topics are focused, consistent in size, and appropriate for the target students to achieve the course objectives. You can suggest adding, modifying, dividing, moving, or deleting topics or categories to enhance the course's effectiveness. The course \`syllabus\` can be either an array of strings or an array of objects. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.",
  
  **Input:**
  
  1. **Course Title:** [Insert Course Title Here]
  2. **Course Description:** [Insert Course Description Here]
  3. **Target Learners:** [Insert Target Learners Description Here]
  4. **Current Syllabus:** [Insert Current Syllabus Here]
  
  **Output:**
  
  Provide specific suggestions for improving the course syllabus. If the current syllabus is an array of strings, each string represents a topic covered in the course. If the current syllabus is an array of objects, each object has the structure: \`{"category": "category 1 title", "topics": [An array of topics covered in category 1]}\`.
  
  Your suggestions should:
  
  1. Ensure each topic is focused and covers a single concept or skill.
  2. Maintain consistency in the size and scope of each topic or category.
  3. Align topics with the course objectives and the needs of the target learners.
  4. Identify and fill any gaps in the syllabus to ensure comprehensive coverage of the subject matter.
  5. Remove any redundant or irrelevant topics.
  
  ### Example Input 1:
  
  \`\`\`
  {
    "Course Title": "Introduction to Data Science",
    "Course Description": "This course introduces the fundamental concepts and techniques of data science, including data manipulation, visualization, statistical analysis, and machine learning. It is designed for beginners with no prior experience in data science.",
    "Target Learners": "Undergraduate students majoring in computer science or related fields, with a basic understanding of programming.",
    "Current Syllabus": [
      "Introduction to Data Science",
      "Data Manipulation with Pandas",
      "Data Visualization with Matplotlib",
      "Descriptive Statistics",
      "Inferential Statistics",
      "Introduction to Machine Learning",
      "Linear Regression",
      "Classification Algorithms",
      "Clustering Algorithms",
      "Conclusion and Future Directions"
    ]
  }
  \`\`\`
  
  ### Example Output 1:
  
  \`\`\`
  [
    {
      "action": "add",
      "type": "topic",
      "category": null,
      "after": "Introduction to Data Science",
      "topic": "Data Cleaning and Preprocessing",
      "rationale": "This is a crucial step in the data science workflow that beginners need to understand before diving into data manipulation and analysis."
    },
    {
      "action": "divide",
      "type": "topic",
      "category": null,
      "old_topic": "Data Manipulation with Pandas",
      "new_topics": ["Introduction to Pandas", "Advanced Data Manipulation with Pandas"],
      "rationale": "To ensure each topic is focused and manageable for beginners."
    },
    {
      "action": "delete",
      "type": "topic",
      "category": null,
      "topic": "Conclusion and Future Directions",
      "rationale": "This topic is too vague and can be integrated into the final sessions of each module."
    }
  ]
  \`\`\`
  
  ### Example Input 2:
  
  \`\`\`
  {
    "Course Title": "Advanced Web Development",
    "Course Description": "This course covers advanced topics in web development, including modern JavaScript frameworks, server-side programming, database integration, and web security. It is intended for students with a basic understanding of web development.",
    "Target Learners": "Graduate students in computer science or related fields, with prior experience in basic web development.",
    "Current Syllabus": [
      {
        "category": "Frontend Development",
        "topics": [
          "Advanced HTML and CSS",
          "JavaScript ES6 and Beyond",
          "Introduction to React",
          "State Management in React"
        ]
      },
      {
        "category": "Backend Development",
        "topics": [
          "Node.js and Express.js",
          "RESTful API Design",
          "Database Integration with MongoDB",
          "Authentication and Authorization"
        ]
      },
      {
        "category": "Web Security",
        "topics": [
          "Common Security Threats",
          "Secure Coding Practices",
          "Web Application Firewalls"
        ]
      }
    ]
  }
  \`\`\`
  
  ### Example Output 2:
  
  \`\`\`
  [
    {
      "action": "add",
      "type": "category",
      "after": "Web Security",
      "category": {
        "category": "DevOps and Deployment",
        "topics": [
          "Continuous Integration and Continuous Deployment (CI/CD)",
          "Containerization with Docker",
          "Deployment on Cloud Platforms"
        ]
      },
      "rationale": "These topics are crucial for advanced web developers to understand how to deploy and manage web applications in production environments."
    },
    {
      "action": "divide",
      "type": "topic",
      "category": "Frontend Development",
      "old_topic": "State Management in React",
      "new_topics": ["State Management with Redux", "State Management with Context API"],
      "rationale": "These are two distinct approaches to state management in React, and each deserves focused attention."
    },
    {
      "action": "delete",
      "type": "topic",
      "category": "Web Security",
      "topic": "Common Security Threats",
      
      "rationale": "This topic can be integrated into 'Secure Coding Practices' to streamline the content and avoid redundancy."
    }
  ]
  \`\`\`
  `;

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
