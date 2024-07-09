import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { askGemini } from "./gemini/GeminiAPI";

const generateCourseSyllabus = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  prerequisiteKnowledge: string,
  courseDescription: string,
  courseObjectives: string[],
  courseSkills: string[]
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, description, target learners, their prerequisite knowledge, number of hour-long class sessions, objectives, and skills, your task is to generate a detailed syllabus for the course. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.

**Input:**

1. **Course Title:** [Course Title goes here]
2. **Course Description:** [Course Description goes here]
3. **Target Learners:** [Target Learners Description goes here]
4. **Number of Hour-long Class Sessions:** [Number of Class Sessions goes here]
5. **Prerequisite Knowledge:** [Description of the Prerequisite Knowledge for taking this course]
6. **Objectives:** [Course Objectives go here]
7. **Skills:** [Skills Gained from the Course go here]

**Output:**

Generate a detailed syllabus that includes categories and topics. Each topic should have clear, concise, and informative descriptions. The objectives and knowledge gained from each topic should contribute to the overall learning objectives of the course. Each topic should represent the exact learning objectives that the learners will achieve after completing the course.

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
12. Ensure the objectives and knowledge gained from each topic contribute to the overall learning objectives of the course.
13. Ensure each topic represents the exact learning objectives that the learners will achieve after completing the course.
14. Include a "description" field for every category.
15. Include an "objectives" field, as an array of strings, for every category.
16. Include a "skills" field, as an array of strings, for every category.
17. Include a "prerequisiteKnowledge" field, as an array of strings, for every category.
18. Include a "prompts" field, as an array of objects, for every category and topic. Prompts are specific types of questions that encourage social learning.

Prompts can be of two types:

- **Poll:** {"type": "Poll", "text": "The question text", "choices": [An array of choices], "purpose": "An explanation of how this question would encourage a discussion among students."}
- **Open-Ended:** {"type": "Open-Ended", "text": "The question stem", "purpose": "An explanation of how this question would encourage a discussion among students."}

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
  ]
}
\`\`\`

### Example Output:

\`\`\`json
{
  "syllabus": [
    {
      "category": "Frontend Development",
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
          "topic": "Advanced HTML and CSS",
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
          "topic": "JavaScript ES6 and Beyond",
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
          "topic": "Introduction to React",
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
          "topic": "State Management in React",
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
    },
    {
      "category": "Backend Development",
      "description": "Comprehensive coverage of backend development techniques, including server-side programming and database integration.",
      "objectives": [
        "Master server-side development with Node.js and Express.js",
        "Design and implement RESTful APIs",
        "Integrate databases with web applications"
      ],
      "skills": [
        "Node.js",
        "Express.js",
        "RESTful APIs",
        "MongoDB"
      ],
      "prerequisiteKnowledge": [
        "Basic knowledge of web servers and how they work",
        "Introduction to web development frameworks"
      ],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which backend framework do you prefer: Express.js or another framework?",
          "choices": ["Express.js", "Koa.js", "Hapi.js"],
          "purpose": "Encourage discussion on the pros and cons of using different backend frameworks."
        },
        {
          "type": "Open-Ended",
          "text": "Describe a scenario where using a NoSQL database like MongoDB is more advantageous than a SQL database.",
          "purpose": "Encourage students to think critically about database design and selection."
        }
      ],
      "topics": [
        {
          "topic": "Node.js and Express.js",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Building server-side applications using Node.js and Express.js.",
          "objectives": [
            "Set up a Node.js development environment",
            "Create RESTful services using Express.js",
            "Understand middleware and routing in Express.js"
          ],
          "skills": [
            "Node.js",
            "Express.js",
            "RESTful Services"
          ],
          "prerequisiteKnowledge": [
            "Basic knowledge of web servers",
            "JavaScript programming basics"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Which aspect of Node.js do you find most challenging?",
              "choices": ["Event-driven programming", "Asynchronous nature", "Module system"],
              "purpose": "Identify and discuss common challenges in learning Node.js."
            },
            {
              "type": "Open-Ended",
              "text": "Explain how middleware functions in Express.js improve code modularity.",
              "purpose": "Encourage students to explore the benefits of middleware in Express.js."
            }
          ]
        },
        {
          "topic": "RESTful API Design",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Designing RESTful APIs for web applications.",
          "objectives": [
            "Design and implement RESTful endpoints",
            "Understand CRUD operations and REST principles",
            "Implement API versioning and documentation"
          ],
          "skills": [
            "RESTful API Design",
            "CRUD Operations",
            "API Documentation"
          ],
          "prerequisiteKnowledge": [
            "Basic concepts of API integration",
            "Understanding of client-server architecture"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Which REST principle do you find most important?",
              "choices": ["Statelessness", "Client-Server Separation", "Uniform Interface"],
              "purpose": "Encourage discussion on the significance of different REST principles."
            },
            {
              "type": "Open-Ended",
              "text": "Describe a scenario where API versioning is crucial.",
              "purpose": "Encourage students to think critically about the importance of API versioning."
            }
          ]
        },
        {
          "topic": "Database Integration with MongoDB",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Integrating MongoDB with web applications for data storage.",
          "objectives": [
            "Set up and configure MongoDB",
            "Perform CRUD operations with MongoDB",
            "Implement data models and schemas using Mongoose"
          ],
          "skills": [
            "MongoDB",
            "Mongoose",
            "Data Modeling"
          ],
          "prerequisiteKnowledge": [
            "Basic knowledge of database management and SQL",
            "JavaScript programming basics"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Do you prefer using NoSQL databases like MongoDB over SQL databases? Why or why not?",
              "choices": ["Yes", "No", "Depends on the use case"],
              "purpose": "Encourage discussion on the pros and cons of using NoSQL databases."
            },
            {
              "type": "Open-Ended",
              "text": "Explain a scenario where using Mongoose would simplify database operations.",
              "purpose": "Encourage students to explore the benefits of using Mongoose."
            }
          ]
        },
        {
          "topic": "Authentication and Authorization",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Implementing secure authentication and authorization mechanisms.",
          "objectives": [
            "Implement user authentication using JWT",
            "Set up role-based access control",
            "Secure endpoints using middleware"
          ],
          "skills": [
            "JWT Authentication",
            "Role-Based Access Control",
            "Secure Middleware"
          ],
          "prerequisiteKnowledge": [
            "Basic knowledge of web security best practices",
            "Understanding of client-server architecture"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Which authentication method do you find most secure: JWT, OAuth, or another?",
              "choices": ["JWT", "OAuth", "Another"],
              "purpose": "Encourage discussion on the security aspects of different authentication methods."
            },
            {
              "type": "Open-Ended",
              "text": "Describe a scenario where role-based access control is essential.",
              "purpose": "Encourage students to think critically about the importance of role-based access control."
            }
          ]
        }
      ]
    },
    {
      "category": "Web Security",
      "description": "Focused exploration of web security principles and practices.",
      "objectives": [
        "Identify and mitigate common web security threats",
        "Implement secure coding practices",
        "Utilize web application firewalls"
      ],
      "skills": [
        "Web Security",
        "Secure Coding",
        "Web Application Firewalls"
      ],
      "prerequisiteKnowledge": [
        "Introductory knowledge of web security best practices",
        "Basic understanding of HTTP/HTTPS protocols"
      ],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which web security threat do you find most concerning: XSS, CSRF, or SQL injection?",
          "choices": ["XSS", "CSRF", "SQL injection"],
          "purpose": "Encourage discussion on the severity and mitigation of different web security threats."
        },
        {
          "type": "Open-Ended",
          "text": "Explain how secure coding practices can prevent SQL injection attacks.",
          "purpose": "Encourage students to explore the benefits of secure coding practices."
        }
      ],
      "topics": [
        {
          "topic": "Common Security Threats",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Identifying and mitigating common web security threats.",
          "objectives": [
            "Understand common security vulnerabilities (e.g., XSS, CSRF, SQL injection)",
            "Implement techniques to prevent and mitigate these threats",
            "Conduct security audits and code reviews"
          ],
          "skills": [
            "Threat Identification",
            "Security Mitigation",
            "Security Audits"
          ],
          "prerequisiteKnowledge": [
            "Introductory knowledge of web security best practices",
            "Basic understanding of HTTP/HTTPS protocols"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Which security vulnerability do you find most challenging to prevent: XSS, CSRF, or SQL injection?",
              "choices": ["XSS", "CSRF", "SQL injection"],
              "purpose": "Encourage discussion on the challenges of preventing different security vulnerabilities."
            },
            {
              "type": "Open-Ended",
              "text": "Describe a scenario where a CSRF attack could be particularly damaging.",
              "purpose": "Encourage students to think critically about the impact of CSRF attacks."
            }
          ]
        },
        {
          "topic": "Secure Coding Practices",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Best practices for writing secure code.",
          "objectives": [
            "Follow secure coding guidelines",
            "Implement input validation and sanitization",
            "Utilize security headers and HTTPS"
          ],
          "skills": [
            "Secure Coding",
            "Input Validation",
            "Security Headers"
          ],
          "prerequisiteKnowledge": [
            "Basic knowledge of web security best practices",
            "Understanding of client-server architecture"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Which secure coding practice do you find most effective: input validation, sanitization, or using security headers?",
              "choices": ["Input validation", "Sanitization", "Security headers"],
              "purpose": "Encourage discussion on the effectiveness of different secure coding practices."
            },
            {
              "type": "Open-Ended",
              "text": "Explain how using security headers can enhance web application security.",
              "purpose": "Encourage students to explore the benefits of using security headers."
            }
          ]
        },
        {
          "topic": "Web Application Firewalls",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Using web application firewalls to protect web applications.",
          "objectives": [
            "Understand the role of web application firewalls",
            "Configure and deploy a web application firewall",
            "Monitor and respond to security alerts"
          ],
          "skills": [
            "Web Application Firewalls",
            "Firewall Configuration",
            "Security Monitoring"
          ],
          "prerequisiteKnowledge": [
            "Basic knowledge of web security best practices",
            "Understanding of HTTP/HTTPS protocols"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Do you think web application firewalls are essential for web security? Why or why not?",
              "choices": ["Yes", "No", "Depends on the application"],
              "purpose": "Encourage discussion on the importance of web application firewalls."
            },
            {
              "type": "Open-Ended",
              "text": "Describe a scenario where a web application firewall would be crucial.",
              "purpose": "Encourage students to think critically about the use of web application firewalls."
            }
          ]
        }
      ]
    },
    {
      "category": "DevOps and Deployment",
      "description": "In-depth exploration of DevOps practices and deployment techniques.",
      "objectives": [
        "Implement CI/CD pipelines",
        "Use Docker for containerization",
        "Deploy applications on cloud platforms"
      ],
      "skills": [
        "CI/CD",
        "Docker",
        "Cloud Deployment"
      ],
      "prerequisiteKnowledge": [
        "Experience with version control systems (e.g., Git)",
        "Basic understanding of web servers and how they work"
      ],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which CI/CD tool do you prefer: Jenkins, GitHub Actions, or another?",
          "choices": ["Jenkins", "GitHub Actions", "Another"],
          "purpose": "Encourage discussion on the pros and cons of different CI/CD tools."
        },
        {
          "type": "Open-Ended",
          "text": "Explain how containerization with Docker improves deployment efficiency.",
          "purpose": "Encourage students to explore the benefits of containerization."
        }
      ],
      "topics": [
        {
          "topic": "Continuous Integration and Continuous Deployment (CI/CD)",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Practices and tools for continuous integration and deployment.",
          "objectives": [
            "Set up CI/CD pipelines using popular tools (e.g., Jenkins, GitHub Actions)",
            "Automate testing and deployment processes",
            "Monitor and troubleshoot CI/CD workflows"
          ],
          "skills": [
            "CI/CD Pipelines",
            "Automated Testing",
            "Workflow Monitoring"
          ],
          "prerequisiteKnowledge": [
            "Experience with version control systems",
            "Basic knowledge of web development tools"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Which aspect of CI/CD do you find most beneficial: automation or monitoring?",
              "choices": ["Automation", "Monitoring", "Both"],
              "purpose": "Encourage discussion on the benefits of CI/CD practices."
            },
            {
              "type": "Open-Ended",
              "text": "Describe a scenario where automating testing would significantly improve the development process.",
              "purpose": "Encourage students to explore the importance of automated testing."
            }
          ]
        },
        {
          "topic": "Containerization with Docker",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Using Docker for containerization and deployment.",
          "objectives": [
            "Create and manage Docker containers",
            "Write Dockerfiles for application deployment",
            "Use Docker Compose for multi-container applications"
          ],
          "skills": [
            "Docker Containers",
            "Dockerfiles",
            "Docker Compose"
          ],
          "prerequisiteKnowledge": [
            "Basic knowledge of web servers",
            "Understanding of client-server architecture"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Do you prefer using Docker over traditional deployment methods? Why or why not?",
              "choices": ["Yes", "No", "Depends on the application"],
              "purpose": "Encourage discussion on the pros and cons of using Docker for deployment."
            },
            {
              "type": "Open-Ended",
              "text": "Explain a scenario where Docker Compose would be particularly useful.",
              "purpose": "Encourage students to explore the benefits of using Docker Compose."
            }
          ]
        },
        {
          "topic": "Deployment on Cloud Platforms",
          "hours": 2,
          "difficulty": "Medium",
          "description": "Deploying web applications on cloud platforms.",
          "objectives": [
            "Understand different cloud service models (IaaS, PaaS, SaaS)",
            "Deploy applications on platforms like AWS, Azure, or Google Cloud",
            "Manage cloud resources and services"
          ],
          "skills": [
            "Cloud Deployment",
            "Cloud Service Management",
            "Cloud Resource Management"
          ],
          "prerequisiteKnowledge": [
            "Basic knowledge of web servers",
            "Experience with version control systems"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Which cloud platform do you prefer for deployment: AWS, Azure, or Google Cloud?",
              "choices": ["AWS", "Azure", "Google Cloud"],
              "purpose": "Encourage discussion on the pros and cons of different cloud platforms."
            },
            {
              "type": "Open-Ended",
              "text": "Describe a scenario where using a cloud platform would significantly benefit the deployment process.",
              "purpose": "Encourage students to explore the benefits of deploying on cloud platforms."
            }
          ]
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
    "Prerequisite Knowledge": prerequisiteKnowledge,
    "Course Objectives": courseObjectives,
    "Course Skills": courseSkills,
  };

  const response = await askGemini([], JSON.stringify(userPrompt) + JSON.stringify(systemPrompt));
  const syllabus = response.syllabus;
  console.log(JSON.stringify(syllabus, null, 2));
  return syllabus;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      courseTitle,
      targetLearners,
      courseDescription,
      prerequisiteKnowledge,
      courseObjectives,
      courseSkills,
      hours,
    } = req.body;
    const syllabus = await generateCourseSyllabus(
      courseTitle,
      targetLearners,
      hours,
      prerequisiteKnowledge,
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
