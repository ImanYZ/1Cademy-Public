import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { askGemini } from "./gemini/GeminiAPI";
import { callOpenAIChat } from "./openAI/helpers";

import { detach } from "src/utils/helpers";
import { db } from "@/lib/firestoreServer/admin";
import { retrieveNodesForCourse } from "./retrieveNodesForCourse";
import { retrieveNodesForTopic } from "./retrieveNodesForTopic";

const generateCourseSyllabus = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  sessionHours: number,
  prerequisiteKnowledge: string,
  courseDescription: string,
  courseObjectives: string[],
  courseSkills: string[]
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, description, target learners, their prerequisite knowledge, number of class sessions, number of hours per class session, objectives, and skills, your task is to generate a JSON object with an array of categories, where each category includes a title and an array of topic titles. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.
Your generated categories and topics will be reviewed by a supervisory team. For every helpful category or topic, we will pay you $10 and for every unhelpful one, you'll lose $10.

**Input:**

1. **Course Title:** [Course Title goes here]
2. **Course Description:** [Course Description goes here]
3. **Target Learners:** [Target Learners Description goes here]
4. **Number of Class Sessions:** [Number of Class Sessions goes here]
5. **Number of Hours Per Class Session:** [Number of Hours per Class Session goes here]
6. **Prerequisite Knowledge:** [Description of the Prerequisite Knowledge for taking this course]
7. **Objectives:** [Course Objectives go here]
8. **Skills:** [Skills Gained from the Course go here]

**Output:**

Generate a JSON object with an array of categories. Each category should include:
1. A "title" field for the category title.
2. A "topics" field, which is an array of strings representing the titles of the topics within that category.

### Example Input:

\`\`\`json
{
  "Course Title": "Advanced Web Development",
  "Course Description": "This course covers advanced topics in web development, including modern JavaScript frameworks, server-side programming, database integration, and web security. It is intended for students with a basic understanding of web development.",
  "Target Learners": "Graduate students in computer science or related fields, with prior experience in basic web development.",
  "Number of Class Sessions": 16,
  "Number of Hours Per Class Session": 2,
  "Prerequisite Knowledge": [
    "HTML and CSS fundamentals",
    "JavaScript programming basics",
    "Understanding of DOM manipulation",
    "Basic knowledge of responsive design",
    "Experience with version control systems (e.g., Git)",
    "Familiarity with basic web development tools (e.g., text editors, browsers)",
    "Introduction to web development frameworks (e.g., Bootstrap)",
    "Basic understanding of web servers and how they work",
    "Introductory knowledge of HTTP/HTTPS protocols",
    "Basic concepts of API integration",
    "Understanding of client-server architecture",
    "Basic knowledge of database management and SQL",
    "Introductory knowledge of web security best practices",
    "Experience with basic debugging and testing techniques"
  ],
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
  "categories": [
    {
      "title": "Frontend Development",
      "topics": [
        "Advanced HTML and CSS",
        "JavaScript ES6 and Beyond",
        "Introduction to React",
        "State Management in React"
      ]
    },
    {
      "title": "Backend Development",
      "topics": [
        "Node.js and Express.js",
        "RESTful API Design",
        "Database Integration with MongoDB",
        "Authentication and Authorization"
      ]
    },
    {
      "title": "Web Security",
      "topics": [
        "Common Security Threats",
        "Secure Coding Practices",
        "Web Application Firewalls"
      ]
    },
    {
      "title": "DevOps and Deployment",
      "topics": [
        "Continuous Integration and Continuous Deployment (CI/CD)",
        "Containerization with Docker",
        "Deployment on Cloud Platforms"
      ]
    }
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
    "Course Skills": courseSkills,
  };

  const response = await callOpenAIChat([], JSON.stringify(userPrompt), JSON.stringify(systemPrompt));
  const categories = response.categories;
  console.log(JSON.stringify(categories, null, 2));
  return categories;
};

const generateCourseCategory = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  sessionHours: number,
  prerequisiteKnowledge: string,
  courseDescription: string,
  courseObjectives: string[],
  courseSkills: string[],
  categories: { title: string; topics: string[] }[],
  category: { title: string; topics: string[] }
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, description, target learners, their prerequisite knowledge, number of class sessions, number of hours per class session, objectives, skills, and the entire array of categories and their topic titles, along with the title of a specific category, your task is to generate a detailed syllabus for that specific category. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.
Your generated categories and topics will be reviewed by a supervisory team. For every helpful category or topic, we will pay you $10 and for every unhelpful one, you'll lose $10.

**Input:**

1. **Course Title:** [Course Title goes here]
2. **Course Description:** [Course Description goes here]
3. **Target Learners:** [Target Learners Description goes here]
4. **Number of Class Sessions:** [Number of Class Sessions goes here]
5. **Number of Hours Per Class Session:** [Number of Hours per Class Session goes here]
6. **Prerequisite Knowledge:** [Description of the Prerequisite Knowledge for taking this course]
7. **Objectives:** [Course Objectives go here]
8. **Skills:** [Skills Gained from the Course go here]
9. **Categories:** [Array of categories and their topic titles goes here]
10. **Category Title:** [Title of the category to generate detailed data for]

**Output:**

Generate a detailed syllabus for the specified category. Each topic should have clear, concise, and informative descriptions. The objectives and knowledge gained from each topic should contribute to the overall learning objectives of the course. Each topic should represent the exact learning objectives that the learners will achieve after completing the course.

Your generated syllabus should:

1. Ensure each topic is focused and covers a single concept or skill.
2. Maintain consistency in the size and scope of each topic.
3. Align topics with the course objectives and the needs of the target learners.
4. Ensure comprehensive coverage of the subject matter.
5. Sequence topics logically to ensure a progression of learning.
6. Consider the number of class sessions, number of hours per class session, and the level of detail appropriate for the target learners.
7. Ensure that the hours allocated to each topic are appropriate for the level of detail and complexity required.
8. Ensure that the difficulty level of each topic is suitable for the target learners.
9. Ensure that the syllabus is engaging, challenging, and achievable for the target learners.
10. Reflect the latest trends and developments in the field.
11. Ensure the descriptions of each topic are clear, concise, and informative.
12. Ensure the objectives and knowledge gained from each topic contribute to the overall learning objectives of the course.
13. Ensure each topic represents the exact learning objectives that the learners will achieve after completing the course.
14. Include a "description" field for every topic.
15. Include an "objectives" field, as an array of strings, for every topic.
16. Include a "skills" field, as an array of strings, for every topic.
17. Include a "prerequisiteKnowledge" field, as an array of strings, for every topic.
18. Include a "prompts" field, as an array of objects, for every topic. Prompts are specific types of questions that encourage social learning. Prompts should be as subjective and engaging as possible to stimulate critical thinking and active participation in the discussion.

Prompts can be of two types:

- **Poll:** {"type": "Poll", "text": "The question text", "choices": [An array of choices], "purpose": "An explanation of how this question would encourage a discussion among students."}
- **Open-Ended:** {"type": "Open-Ended", "text": "The question stem", "purpose": "An explanation of how this question would encourage a discussion among students."}

### Example Input:

\`\`\`json
{
  "Course Title": "Advanced Web Development",
  "Course Description": "This course covers advanced topics in web development, including modern JavaScript frameworks, server-side programming, database integration, and web security. It is intended for students with a basic understanding of web development.",
  "Target Learners": "Graduate students in computer science or related fields, with prior experience in basic web development.",
  "Number of Class Sessions": 16,
  "Number of Hours Per Class Session": 2,
  "Prerequisite Knowledge": [
    "HTML and CSS fundamentals",
    "JavaScript programming basics",
    "Understanding of DOM manipulation",
    "Basic knowledge of responsive design",
    "Experience with version control systems (e.g., Git)",
    "Familiarity with basic web development tools (e.g., text editors, browsers)",
    "Introduction to web development frameworks (e.g., Bootstrap)",
    "Basic understanding of web servers and how they work",
    "Introductory knowledge of HTTP/HTTPS protocols",
    "Basic concepts of API integration",
    "Understanding of client-server architecture",
    "Basic knowledge of database management and SQL",
    "Introductory knowledge of web security best practices",
    "Experience with basic debugging and testing techniques"
  ],
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
  "Categories": [
    {
      "title": "Frontend Development",
      "topics": [
        "Advanced HTML and CSS",
        "JavaScript ES6 and Beyond",
        "Introduction to React",
        "State Management in React"
      ]
    },
    {
      "title": "Backend Development",
      "topics": [
        "Node.js and Express.js",
        "RESTful API Design",
        "Database Integration with MongoDB",
        "Authentication and Authorization"
      ]
    },
    {
      "title": "Web Security",
      "topics": [
        "Common Security Threats",
        "Secure Coding Practices",
        "Web Application Firewalls"
      ]
    },
    {
      "title": "DevOps and Deployment",
      "topics": [
        "Continuous Integration and Continuous Deployment (CI/CD)",
        "Containerization with Docker",
        "Deployment on Cloud Platforms"
      ]
    }
  ],
  "Category Title": "Frontend Development"
}
\`\`\`

### Example Output:

\`\`\`json
{
  "category": {
    "title": "Frontend Development",
    "description": "In-depth exploration of advanced frontend development techniques and frameworks.",
    "objectives": [
      "Master advanced HTML and CSS",
      "Learn modern JavaScript features",
      "Build dynamic user interfaces with React"
    ],
    "skills": [
      "Advanced HTML and CSS",
      "JavaScript ES6",
      "React"
    ],
    "prerequisiteKnowledge": [
      "HTML and CSS fundamentals",
      "JavaScript programming basics"
    ],
    "prompts": [
      {
        "type": "Poll",
        "text": "Which modern JavaScript feature do you find most useful?",
        "choices": ["Arrow functions", "Promises", "Template literals"],
        "purpose": "Encourage students to discuss the advantages and use cases of different ES6 features."
      },
      {
        "type": "Open-Ended",
        "text": "How would you implement a responsive design for a complex layout?",
        "purpose": "Encourage students to explore and discuss different approaches to responsive design."
      }
    ],
    "topics": [
      {
        "title": "Advanced HTML and CSS",
        "hours": 2,
        "difficulty": "Medium",
        "description": "Advanced techniques in HTML and CSS for modern web design.",
        "objectives": [
          "Utilize advanced HTML elements and attributes",
          "Implement responsive design using advanced CSS techniques",
          "Create complex layouts using CSS Grid and Flexbox"
        ],
        "skills": [
          "Advanced HTML",
          "Advanced CSS",
          "Responsive Design"
        ],
        "prerequisiteKnowledge": [
          "HTML and CSS fundamentals",
          "Basic knowledge of responsive design"
        ],
        "prompts": [
          {
            "type": "Poll",
            "text": "Which CSS layout technique do you prefer: Grid or Flexbox?",
            "choices": ["Grid", "Flexbox", "Both"],
            "purpose": "Encourage discussion on the pros and cons of CSS Grid and Flexbox."
          },
          {
            "type": "Open-Ended",
            "text": "Describe a scenario where using CSS Grid is more advantageous than Flexbox.",
            "purpose": "Encourage students to think critically about the use cases for CSS Grid."
          }
        ]
      },
      {
        "title": "JavaScript ES6 and Beyond",
        "hours": 2,
        "difficulty": "Medium",
        "description": "In-depth coverage of ES6 features and modern JavaScript.",
        "objectives": [
          "Master new syntax and features in ES6",
          "Understand the use of promises and async/await for asynchronous programming",
          "Use modern JavaScript best practices for cleaner and more efficient code"
        ],
        "skills": [
          "JavaScript ES6",
          "Asynchronous Programming",
          "Modern JavaScript Best Practices"
        ],
        "prerequisiteKnowledge": [
          "JavaScript programming basics",
          "Understanding of DOM manipulation"
        ],
        "prompts": [
          {
            "type": "Poll",
            "text": "Do you prefer using promises or async/await for handling asynchronous operations?",
            "choices": ["Promises", "Async/Await", "Both"],
            "purpose": "Encourage students to discuss their preferences and the reasons behind them."
          },
          {
            "type": "Open-Ended",
            "text": "Explain how async/await improves code readability and maintenance.",
            "purpose": "Encourage students to explore the benefits of async/await."
          }
        ]
      },
      {
        "title": "Introduction to React",
        "hours": 3,
        "difficulty": "Medium",
        "description": "Fundamentals of React for building dynamic user interfaces.",
        "objectives": [
          "Understand the React component model",
          "Build and manage stateful and stateless components",
          "Utilize JSX for rendering UI elements"
        ],
        "skills": [
          "React",
          "Component-Based Architecture",
          "JSX"
        ],
        "prerequisiteKnowledge": [
          "JavaScript programming basics",
          "Understanding of DOM manipulation"
        ],
        "prompts": [
          {
            "type": "Poll",
            "text": "What aspect of React do you find most challenging?",
            "choices": ["Component lifecycle", "State management", "JSX"],
            "purpose": "Identify and discuss common challenges in learning React."
          },
          {
            "type": "Open-Ended",
            "text": "Describe a scenario where using stateful components is more appropriate than stateless components.",
            "purpose": "Encourage students to think critically about component design in React."
          }
        ]
      },
      {
        "title": "State Management in React",
        "hours": 2,
        "difficulty": "Medium",
        "description": "Managing state in React applications using various techniques.",
        "objectives": [
          "Implement state management using React hooks",
          "Use Context API for global state management",
          "Integrate state management libraries like Redux"
        ],
        "skills": [
          "React Hooks",
          "Context API",
          "Redux"
        ],
        "prerequisiteKnowledge": [
          "Introduction to React",
          "JavaScript programming basics"
        ],
        "prompts": [
          {
            "type": "Poll",
            "text": "Which state management technique do you prefer in React applications?",
            "choices": ["Hooks", "Context API", "Redux"],
            "purpose": "Encourage discussion on the pros and cons of different state management techniques in React."
          },
          {
            "type": "Open-Ended",
            "text": "Explain a scenario where using Redux is more advantageous than React Context.",
            "purpose": "Encourage students to think critically about state management in React."
          }
        ]
      }
    ]
  }
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
    "Course Skills": courseSkills,
    Categories: categories,
    Category: category,
  };

  const response = await callOpenAIChat(
    [],
    JSON.stringify(userPrompt) +
      "\nPlease pay attention to the titles of the topics under the desired category.\n" +
      "The category " +
      category.title +
      " has the following topics: " +
      category.topics.join(", ") +
      "\nSo, we expect to see the exact same topic titles in the generated category.",
    JSON.stringify(systemPrompt)
  );
  const catOjb = response.category;
  console.log(JSON.stringify(catOjb, null, 2));
  return catOjb;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      courseId,
      courseTitle,
      targetLearners,
      courseDescription,
      prerequisiteKnowledge,
      courseObjectives,
      courseSkills,
      hours,
      classSessions,
      tags,
      references,
    } = req.body;

    const categories = await generateCourseSyllabus(
      courseTitle,
      targetLearners,
      hours,
      classSessions,
      prerequisiteKnowledge,
      courseDescription,
      courseObjectives,
      courseSkills
    ).catch(console.error);

    const courseRef = db.collection("coursesAI").doc(courseId);
    const _categories = JSON.parse(JSON.stringify(categories));

    for (let category of _categories) {
      delete category.topics;
    }

    await courseRef.update({
      syllabus: _categories,
      done: false,
    });

    await detach(async () => {
      let syllabus: any = null;
      const categoryPromises = categories.map(async (category: { title: string; topics: string[] }) => {
        const topics = await generateCourseCategory(
          courseTitle,
          targetLearners,
          classSessions,
          hours,
          prerequisiteKnowledge,
          courseDescription,
          courseObjectives,
          courseSkills,
          categories,
          category
        );

        console.log("topics", topics);

        await db.runTransaction(async (t: any) => {
          const courseDoc = await t.get(courseRef);
          const courseData = courseDoc.data();
          const categoryIdex = courseData.syllabus.findIndex((c: any) => c.title === category.title);
          courseData.syllabus[categoryIdex] = topics;
          syllabus = courseData.syllabus;
          t.update(courseRef, courseData);
        });
      });

      await Promise.all(categoryPromises);
      await db.runTransaction(async (t: any) => {
        const courseDoc = await t.get(courseRef);
        const courseData = courseDoc.data();
        courseData.done = true;
        t.update(courseRef, courseData);
      });

      if (syllabus) {
        const nodTopicsPromises = syllabus.map(async (category: any) => {
          for (let topic of category.topics) {
            try {
              const nodes = await retrieveNodesForTopic(
                tags,
                courseTitle,
                courseDescription,
                targetLearners,
                references,
                syllabus,
                topic.title
              );
              await db.runTransaction(async (t: any) => {
                const courseDoc = await t.get(courseRef);
                const courseData = courseDoc.data();
                if (courseData.nodes) {
                  courseData.nodes[topic.title] = nodes;
                } else {
                  courseData.nodes = { [topic.title]: nodes };
                }
                t.update(courseRef, courseData);
              });
            } catch (error) {
              console.log(error);
            }
          }
        });
        await Promise.all(nodTopicsPromises);
      }
    });

    return res.status(200).json({});
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({});
  }
}

export default fbAuth(handler);
