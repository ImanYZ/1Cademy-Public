import { NextApiRequest, NextApiResponse } from "next";
import { callOpenAIChat } from "./openAI/helpers";
import fbAuth from "src/middlewares/fbAuth";
const generateMorePromptsForTopic = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  prerequisiteKnowledge: string,
  courseDescription: string,
  courseObjectives: string[],
  courseSkills: string[],
  syllabus: any[],
  topic: string
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. 
  Given the course title, description, target learners, their prerequisite knowledge, number of hour-long class sessions, objectives, skills, current syllabus, and a specified topic, your task is to generate an array of additional prompts designed to encourage discussion among students and the instructor about the specified topic. 
  Your response should not include anything other than a JSON object with a single key "prompts" whose value should be an array of prompts. 
  Please take your time and carefully make the prompts as subjective and engaging as possible to stimulate critical thinking and active participation in the discussion.
  Your generated prompts will be reviewed by a supervisory team. For every helpful prompt, we will pay you $10 and for every unhelpful one, you'll lose $10.
  **Input:**
  
  1. **Course Title:** [Course Title goes here]
  2. **Course Description:** [Course Description goes here]
  3. **Target Learners:** [Target Learners Description goes here]
  4. **Number of Hour-long Class Sessions:** [Number of Class Sessions goes here]
  5. **Prerequisite Knowledge:** [Description of the Prerequisite Knowledge for taking this course]
  6. **Objectives:** [Course Objectives go here]
  7. **Skills:** [Skills Gained from the Course go here]
  8. **Current Syllabus:** [Current Syllabus goes here]
  9. **Topic Title:** [The specified Topic goes here]
  
  ### Example Input:
  
  \`\`\`json
  {
    "Course Title": "Advanced Web Development",
    "Course Description": "This course covers advanced topics in web development, including modern JavaScript frameworks, server-side programming, database integration, and web security. It is intended for students with a basic understanding of web development.",
    "Target Learners": "Graduate students in computer science or related fields, with prior experience in basic web development.",
    "Number of Hour-long Class Sessions": 16,
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
    "Current Syllabus": [
      {
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
                "purpose": "Encourage discussion on the pros and cons of CSS Grid and Flexbox.",
                "choices": ["Grid", "Flexbox"]
              },
              {
                "type": "Open-Ended",
                "text": "Describe a scenario where using CSS Grid is more advantageous than Flexbox.",
                "purpose": "Encourage students to think critically about the use cases for CSS Grid."
              },
              {
                "type": "Group Activity",
                "text": "In small groups, create a responsive layout using both Grid and Flexbox, then compare the results. Discuss the challenges and benefits encountered with each method.",
                "purpose": "Promote hands-on learning and collaborative discussion on the practical applications of Grid and Flexbox."
              },
              {
                "type": "Debate",
                "text": "Form two groups and debate the statement: 'CSS Grid should be the default layout technique for modern web design.'",
                "purpose": "Stimulate critical thinking and understanding of different perspectives on layout techniques."
              },
              {
                "type": "Case Study",
                "text": "Analyze a complex website layout and identify where Grid and Flexbox have been used. Discuss why the developers might have chosen each technique for different parts of the layout.",
                "purpose": "Encourage practical analysis and understanding of real-world applications of CSS layout techniques."
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
                "purpose": "Encourage students to discuss their preferences and the reasons behind them.",
                "choices": ["Promises", "Async/Await"]
              },
              {
                "type": "Open-Ended",
                "text": "Explain how async/await improves code readability and maintenance.",
                "purpose": "Encourage students to explore the benefits of async/await."
              },
              {
                "type": "Code Review",
                "text": "Review a code snippet that uses promises and refactor it to use async/await. Discuss the differences and improvements.",
                "purpose": "Provide hands-on experience with async/await and facilitate a discussion on code quality and readability."
              },
              {
                "type": "Scenario Discussion",
                "text": "Describe a scenario where promises would be more appropriate to use than async/await. Discuss with your peers.",
                "purpose": "Encourage critical thinking about the use cases for both promises and async/await."
              },
              {
                "type": "Pair Programming",
                "text": "In pairs, write a program that fetches data from an API using both promises and async/await. Compare the code and discuss the pros and cons of each approach.",
                "purpose": "Promote collaborative learning and practical application of asynchronous programming techniques."
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
                "purpose": "Identify and discuss common challenges in learning React.",
                "choices": ["Component Model", "State Management", "JSX"]
              },
              {
                "type": "Open-Ended",
                "text": "Describe a scenario where using stateful components is more appropriate than stateless components.",
                "purpose": "Encourage students to think critically about component design in React."
              },
              {
                "type": "Hands-On Exercise",
                "text": "Create a small React application that utilizes both stateful and stateless components. Discuss the design decisions and trade-offs with your peers.",
                "purpose": "Promote practical application and discussion on component design in React."
              },
              {
                "type": "Code Analysis",
                "text": "Analyze an existing React application and identify the use of stateful and stateless components. Discuss the reasons behind these design choices.",
                "purpose": "Encourage critical analysis and understanding of real-world React applications."
              },
              {
                "type": "Group Discussion",
                "text": "Discuss how JSX improves or complicates the process of writing UI components compared to traditional HTML and JavaScript.",
                "purpose": "Stimulate discussion on the benefits and challenges of using JSX in React development."
              }
            ]
          }
        ]
      }
    ],
    "Topic Title": "Advanced HTML and CSS"
  }
  \`\`\`
  
  ### Example Output:
  \`\`\`json
  {
    "prompts": [
      {
        "type": "Poll",
        "text": "Which CSS layout technique do you prefer: Grid or Flexbox?",
        "purpose": "Encourage discussion on the pros and cons of CSS Grid and Flexbox.",
        "choices": ["Grid", "Flexbox"]
      },
      {
        "type": "Open-Ended",
        "text": "Describe a scenario where using CSS Grid is more advantageous than Flexbox.",
        "purpose": "Encourage students to think critically about the use cases for CSS Grid."
      },
      {
        "type": "Group Activity",
        "text": "In small groups, create a responsive layout using both Grid and Flexbox, then compare the results. Discuss the challenges and benefits encountered with each method.",
        "purpose": "Promote hands-on learning and collaborative discussion on the practical applications of Grid and Flexbox."
      },
      {
        "type": "Debate",
        "text": "Form two groups and debate the statement: 'CSS Grid should be the default layout technique for modern web design.'",
        "purpose": "Stimulate critical thinking and understanding of different perspectives on layout techniques."
      },
      {
        "type": "Case Study",
        "text": "Analyze a complex website layout and identify where Grid and Flexbox have been used. Discuss why the developers might have chosen each technique for different parts of the layout.",
        "purpose": "Encourage practical analysis and understanding of real-world applications of CSS layout techniques."
      }
    ]
  }
  \`\`\`
  `;

  const userPrompt = {
    "Course Title": courseTitle,
    "Target Learners": targetLearners,
    "Number of Hour-long Class Sessions": classSessions,
    "Prerequisite Knowledge": prerequisiteKnowledge,
    "Current Description": courseDescription,
    "Course Objectives": courseObjectives,
    "Course Skills": courseSkills,
    "Current Syllabus": syllabus,
    Topic: topic,
  };

  const response = await callOpenAIChat([], JSON.stringify(userPrompt), JSON.stringify(systemPrompt));
  const prompts = response.prompts;
  console.log(JSON.stringify(prompts, null, 2));
  return prompts;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      courseTitle,
      targetLearners,
      hours,
      prerequisiteKnowledge,
      courseDescription,
      courseObjectives,
      courseSkills,
      syllabus,
      topic,
    } = req.body;

    const prompts = await generateMorePromptsForTopic(
      courseTitle,
      targetLearners,
      hours,
      prerequisiteKnowledge,
      courseDescription,
      courseObjectives,
      courseSkills,
      syllabus,
      topic
    );
    return res.status(200).json({
      prompts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({});
  }
}
export default fbAuth(handler);
