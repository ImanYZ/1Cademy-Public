import { NextApiRequest, NextApiResponse } from "next";
import { callOpenAIChat } from "./openAI/helpers";
import fbAuth from "src/middlewares/fbAuth";

const improveCourseSyllabus = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  courseDescription: string,
  courseObjectives: string[],
  courseSkills: string[],
  syllabus: Array<
    | {
        topic: string;
        hours: number;
        difficulty: string;
        category?: never;
        topics?: never;
      }
    | {
        category: string;
        topics: Array<{ topic: string; hours: number; difficulty: string }>;
      }
  >
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, description, target learners, number of hour-long class sessions, objectives, skills, and current syllabus, your task is to provide very specific improvements to the syllabus to ensure that the topics are focused, consistent in size, and appropriate for the target students to achieve the course objectives. You can suggest adding, modifying, or deleting topics or categories to enhance the course's effectiveness. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.
  
  **Input:**
  
  1. **Course Title:** [Course Title goes here]
  2. **Course Description:** [Course Description goes here]
  3. **Target Learners:** [Target Learners Description goes here]
  4. **Number of Hour-long Class Sessions:** [Number of Class Sessions goes here]
  5. **Objectives:** [Course Objectives go here]
  6. **Skills:** [Skills Gained from the Course go here]
  7. **Current Syllabus:** [Current Syllabus goes here]
  
  **Output:**
  
  Provide specific suggestions for improving the course syllabus.
  
  Your suggestions should:
  
  1. Ensure each topic is focused and covers a single concept or skill.
  2. Maintain consistency in the size and scope of each topic or category.
  3. Align topics with the course objectives and the needs of the target learners.
  4. Identify and fill any gaps in the syllabus to ensure comprehensive coverage of the subject matter.
  5. Remove any redundant or irrelevant topics.
  6. Consider the sequence of topics to ensure a logical progression of learning.
  7. Consider the number of class sessions available and the level of detail appropriate for the target learners.
  8. Provide clear rationales for each suggested change to the syllabus.
  9. If the syllabus includes categories, ensure that categories are well-structured and sequenced, and topics are appropriately grouped and organized.
  10. Ensure that the hours allocated to each topic are appropriate for the level of detail and complexity required.
  11. Ensure that the difficulty level of each topic is suitable for the target learners.
  12. Ensure that the syllabus is engaging, challenging, and achievable for the target learners.
  13. Ensure that the syllabus reflects the latest trends and developments in the field.
  14. Ensure the descriptions of each topic are clear, concise, and informative.
  15. Ensure the skills and knowledge gained from each topic contribute to the overall learning objectives of the course.
  16. Ensure each topic represents the exact skills that the learners will acquire after completing the course. The skills should be phrases that the student could add to the skills section of their resume or LinkedIn profile.
  
  **Actions:**
  - \`add\`: Add a topic or category.
  - \`modify\`: Modify a topic or category.
  - \`divide\`: Divide a topic or category into subtopics or subcategories.
  - \`move\`: Move a topic or category to a different position.
  - \`delete\`: Delete a topic or category.
  
  Each action should be accompanied by:
  - \`type\`: Indicates whether the action is on a topic or category.
  - \`rationale\`: Explains why the action is being suggested.
  - For \`add\` actions:
    - \`category\`: Specifies the category where the topic should be added (if applicable).
    - \`after\`: Specifies the existing topic/category after which the new topic/category should be added.
  - For \`modify\` actions:
    - \`category\`: Specifies the category where the topic is located (if applicable).
    - \`old_topic\` or \`old_category\`: Specifies the topic or category to modify.
    - \`new_topic\` or \`new_category\`: Specifies the new content for the topic or category.
  - For \`divide\` actions:
    - \`category\`: Specifies the category where the topic is located (if applicable).
    - \`old_topic\` or \`old_category\`: Specifies the topic or category to divide.
    - \`new_topics\` or \`new_categories\`: Specifies the new subtopics or subcategories.
  - For \`move\` actions:
    - \`current_category\`: Specifies the current category of the topic (if applicable).
    - \`topic\` or \`category\`: Specifies the topic or category to move.
    - \`current_after\`: Specifies the current position of the topic/category.
    - \`new_category\`: Specifies the new category (if applicable).
    - \`new_after\`: Specifies the new position of the topic/category.
  - For \`delete\` actions:
    - \`category\`: Specifies the category where the topic is located (if applicable).
    - \`topic\` or \`category\`: Specifies the topic or category to delete.
  
  ### Example Input 1:
  
  \`\`\`json
  {
    "Course Title": "Introduction to Data Science",
    "Course Description": "This course introduces the fundamental concepts and techniques of data science, including data manipulation, visualization, statistical analysis, and machine learning. It is designed for beginners with no prior experience in data science.",
    "Target Learners": "Undergraduate students majoring in computer science or related fields, with a basic understanding of programming.",
    "Number of Hour-long Class Sessions": 13,
    "Objectives": [
      "Understand the fundamental concepts of data science",
      "Gain practical experience with data manipulation and visualization",
      "Learn the basics of statistical analysis and machine learning"
    ],
    "Skills": [
      "Data Cleaning",
      "Data Visualization",
      "Statistical Analysis",
      "Machine Learning"
    ],
    "Current Syllabus": [
      {
        "topic": "Introduction to Data Science",
        "hours": 1,
        "difficulty": "Easy",
        "description": "Overview of data science, its importance, and applications.",
        "skills": ["Understanding Data Science"]
      },
      {
        "topic": "Data Manipulation with Pandas",
        "hours": 2,
        "difficulty": "Medium",
        "description": "Techniques for manipulating data using the Pandas library.",
        "skills": ["Data Manipulation"]
      },
      {
        "topic": "Data Visualization with Matplotlib",
        "hours": 2,
        "difficulty": "Medium",
        "description": "Creating visual representations of data using Matplotlib.",
        "skills": ["Data Visualization"]
      },
      {
        "topic": "Descriptive Statistics",
        "hours": 1,
        "difficulty": "Easy",
        "description": "Basic concepts of descriptive statistics.",
        "skills": ["Descriptive Statistics"]
      },
      {
        "topic": "Inferential Statistics",
        "hours": 2,
        "difficulty": "Medium",
        "description": "Introduction to inferential statistics.",
        "skills": ["Inferential Statistics"]
      },
      {
        "topic": "Introduction to Machine Learning",
        "hours": 1,
        "difficulty": "Medium",
        "description": "Basic concepts and techniques of machine learning.",
        "skills": ["Machine Learning"]
      },
      {
        "topic": "Linear Regression",
        "hours": 1,
        "difficulty": "Medium",
        "description": "Introduction to linear regression models.",
        "skills": ["Linear Regression"]
      },
      {
        "topic": "Classification Algorithms",
        "hours": 1,
        "difficulty": "Medium",
        "description": "Overview of classification algorithms.",
        "skills": ["Classification Algorithms"]
      },
      {
        "topic": "Clustering Algorithms",
        "hours": 1,
        "difficulty": "Medium",
        "description": "Introduction to clustering algorithms.",
        "skills": ["Clustering Algorithms"]
      },
      {
        "topic": "Conclusion and Future Directions",
        "hours": 1,
        "difficulty": "Easy",
        "description": "Summary of course content and future directions in data science.",
        "skills": ["Understanding Future Directions"]
      }
    ]
  }
  \`\`\`
  
  ### Example Output 1:
  
  \`\`\`json
  {
    "suggestions":
    [
      {
        "action": "add",
        "type": "topic",
        "category": null,
        "after": "Introduction to Data Science",
        "new_topic": {
          "topic": "Data Cleaning and Preprocessing",
          "hours": 1,
          "difficulty": "Medium",
          "description": "Methods for cleaning and preprocessing data to ensure quality.",
          "skills": ["Data Cleaning", "Data Preprocessing"]
        },
        "rationale": "This is a crucial step in the data science workflow that beginners need to understand before diving into data manipulation and analysis."
      },
      {
        "action": "divide",
        "type": "topic",
        "category": null,
        "old_topic": "Data Manipulation with Pandas",
        "new_topics": [
          {
            "topic": "Introduction to Pandas",
            "hours": 1,
            "difficulty": "Medium",
            "description": "Basic data manipulation techniques using Pandas.",
            "skills": ["Basic Data Manipulation"]
          },
          {
            "topic": "Advanced Data Manipulation with Pandas",
            "hours": 1,
            "difficulty": "Medium",
            "description": "Advanced techniques for data manipulation using Pandas.",
            "skills": ["Advanced Data Manipulation"]
          }
        ],
        "rationale": "To ensure each topic is focused and manageable for beginners."
      },
      {
        "action": "delete",
        "type": "topic",
        "category": null,
        "topic": "Conclusion and Future Directions",
        "rationale": "This topic is too vague and can be
  
   integrated into the final sessions of each module."
      },
      {
        "action": "modify",
        "type": "topic",
        "category": null,
        "old_topic": "Descriptive Statistics",
        "new_topic": {
          "topic": "Descriptive Statistics - Standardization of Length and Depth",
          "hours": 1,
          "difficulty": "Easy",
          "description": "Standardizing the approach to understanding descriptive statistics.",
          "skills": ["Descriptive Statistics"]
        },
        "rationale": "Standardize the length and depth of 'Descriptive Statistics' to ensure it is consistent."
      },
      {
        "action": "modify",
        "type": "topic",
        "category": null,
        "old_topic": "Inferential Statistics",
        "new_topic": {
          "topic": "Inferential Statistics - Standardization of Length and Depth",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Standardizing the approach to understanding inferential statistics.",
          "skills": ["Inferential Statistics"]
        },
        "rationale": "Standardize the length and depth of 'Inferential Statistics' to ensure it is consistent."
      },
      {
        "action": "add",
        "type": "topic",
        "category": null,
        "after": "Introduction to Machine Learning",
        "new_topic": {
          "topic": "Practical Project: Implementing a Simple Machine Learning Model",
          "hours": 1,
          "difficulty": "Medium",
          "description": "Hands-on project to implement a basic machine learning model.",
          "skills": ["Implementing Machine Learning Models"]
        },
        "rationale": "Add practical assignments or projects for each major section to ensure students can apply what they've learned in real-world scenarios."
      }
    ]
  }
  \`\`\`
  
  ### Example Input 2:
  
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
    ],
    "Current Syllabus": [
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
      }
    ]
  }
  \`\`\`
  
  ### Example Output 2:
  
  \`\`\`json
  {
    "suggestions":
    [
      {
        "action": "add",
        "type": "category",
        "after": "Web Security",
        "new_category": "DevOps and Deployment",
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
        ],
        "rationale": "These topics are crucial for advanced web developers to understand how to deploy and manage web applications in production environments."
      },
      {
        "action": "divide",
        "type": "topic",
        "category": "Frontend Development",
        "old_topic": "State Management in React",
        "new_topics": [
          {
            "topic": "State Management with Redux",
            "hours": 1,
            "difficulty": "Medium",
            "description": "Managing state in React applications using Redux.",
            "skills": ["State Management with Redux"]
          },
          {
            "topic": "State Management with Context API",
            "hours": 1,
            "difficulty": "Medium",
            "description": "Managing state in React applications using the Context API.",
            "skills": ["State Management with Context API"]
          }
        ],
        "rationale": "These are two distinct approaches to state management in React, and each deserves focused attention."
      },
      {
        "action": "delete",
        "type": "topic",
        "category": "Web Security",
        "topic": "Common Security Threats",
        "rationale": "This topic can be integrated into 'Secure Coding Practices' to streamline the content and avoid redundancy."
      },
      {
        "action": "move",
        "type": "topic",
        "current_category": "Backend Development",
        "topic": "RESTful API Design",
        "current_after": "Node.js and Express.js",
        "new_category": "Frontend Development",
        "new_after": "JavaScript ES6 and Beyond",
        "rationale": "Balance the number of topics in 'Frontend Development' and 'Backend Development' to ensure equal emphasis on both areas."
      },
      {
        "action": "add",
        "type": "topic",
        "category": "Backend Development",
        "after": "Database Integration with MongoDB",
        "new_topic": {
          "topic": "GraphQL API Design",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Designing APIs using GraphQL for more flexible data queries.",
          "skills": ["GraphQL"]
        },
        "rationale": "Include modern API design techniques to keep the curriculum up-to-date."
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
    "Current Syllabus": syllabus,
  };

  const response = await callOpenAIChat([], JSON.stringify(userPrompt), JSON.stringify(systemPrompt));
  const suggestions = JSON.parse(response).suggestions;
  console.log(JSON.stringify(suggestions, null, 2));
  return suggestions;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseTitle, courseDescription, targetLearners, syllabus, courseObjectives, courseSkills } = req.body;
    const suggestions = await improveCourseSyllabus(
      courseTitle,
      targetLearners,
      13,
      courseDescription,
      courseObjectives,
      courseSkills,
      syllabus
    );
    // console.log("suggestions ==>", suggestions);

    return res.status(200).json({ suggestions });
  } catch (error) {
    return res.status(500).json({});
  }
}
export default fbAuth(handler);
