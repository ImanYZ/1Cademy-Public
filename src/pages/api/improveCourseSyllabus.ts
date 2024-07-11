import { NextApiRequest, NextApiResponse } from "next";
import { callOpenAIChat } from "./openAI/helpers";
import fbAuth from "src/middlewares/fbAuth";

const improveCourseSyllabus = async (
  courseTitle: string,
  targetLearners: string,
  classSessions: number,
  prerequisiteKnowledge: string,
  courseDescription: string,
  courseObjectives: string[],
  courseSkills: string[],
  syllabus: any[]
) => {
  const systemPrompt = `You are an expert in curriculum design and optimization. Given the course title, description, target learners, their prerequisite knowledge, number of hour-long class sessions, objectives, skills, and current syllabus, your task is to provide very specific improvements to the syllabus to ensure that the topics are focused, consistent in size, and appropriate for the target students to achieve the course objectives. You can suggest adding, modifying, or deleting topics or categories to enhance the course's effectiveness. Your response should not include anything other than a JSON object. Please take your time to think carefully before responding.
Your recommended actions will be reviewed by a supervisory team. For every helpful recommended action, we will pay you $10 and for every unhelpful one, you'll lose $10.

**Input:**

1. **Course Title:** [Course Title goes here]
2. **Course Description:** [Course Description goes here]
3. **Target Learners:** [Target Learners Description goes here]
4. **Number of Hour-long Class Sessions:** [Number of Class Sessions goes here]
5. **Prerequisite Knowledge:** [Description of the Prerequisite Knowledge for taking this course]
6. **Objectives:** [Course Objectives go here]
7. **Skills:** [Skills Gained from the Course go here]
8. **Current Syllabus:** [Current Syllabus goes here]

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
  - \`new_topic\` or \`new_category\`: Specifies the new content for the topic or category, including:
    - \`description\`: A clear and concise description.
    - \`objectives\`: An array of strings detailing the objectives.
    - \`skills\`: An array of strings detailing the skills.
    - \`prerequisiteKnowledge\`: An array of strings detailing the prerequisite knowledge.
    - \`prompts\`: An array of objects for encouraging social learning, including "Poll" or "Open-Ended" questions.
- For \`modify\` actions:
  - \`category\`: Specifies the category where the topic is located (if applicable).
  - \`old_topic\` or \`old_category\`: Specifies the topic or category to modify.
  - \`new_topic\` or \`new_category\`: Specifies the new content for the topic or category, including:
    - \`description\`: A clear and concise description.
    - \`objectives\`: An array of strings detailing the objectives.
    - \`skills\`: An array of strings detailing the skills.
    - \`prerequisiteKnowledge\`: An array of strings detailing the prerequisite knowledge.
    - \`prompts\`: An array of objects for encouraging social learning, including "Poll" or "Open-Ended" questions.
- For \`divide\` actions:
  - \`category\`: Specifies the category where the topic is located (if applicable).
  - \`old_topic\` or \`old_category\`: Specifies the topic or category to divide.
  - \`new_topics\` or \`new_categories\`: Specifies the new subtopics or subcategories, each including:
    - \`description\`: A clear and concise description.
    - \`objectives\`: An array of strings detailing the objectives.
    - \`skills\`: An array of strings detailing the skills.
    - \`prerequisiteKnowledge\`: An array of strings detailing the prerequisite knowledge.
    - \`prompts\`: An array of objects for encouraging social learning, including "Poll" or "Open-Ended" questions.
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
  "Prerequisite Knowledge": [
    "Basic programming skills in Python",
    "Familiarity with data structures and algorithms",
    "Basic understanding of statistics"
  ],
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
      "objectives": [
        "Understand the scope and importance of data science",
        "Identify key applications of data science"
      ],
      "skills": ["Understanding Data Science"],
      "prerequisiteKnowledge": [],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which application of data science do you find most fascinating?",
          "choices": ["Healthcare", "Finance", "Marketing", "Other"],
          "purpose": "Encourage students to discuss different applications and their potential impacts."
        },
        {
          "type": "Open-Ended",
          "text": "How can data science be applied in your field of study?",
          "purpose": "Encourage students to explore and share specific applications of data science in their areas of interest."
        }
      ]
    },
    {
      "topic": "Data Manipulation with Pandas",
      "hours": 2,
      "difficulty": "Medium",
      "description": "Techniques for manipulating data using the Pandas library.",
      "objectives": [
        "Load and inspect datasets using Pandas",
        "Perform data cleaning and transformation"
      ],
      "skills": ["Data Manipulation"],
      "prerequisiteKnowledge": ["Basic programming skills in Python"],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which data manipulation operation do you find most challenging?",
          "choices": ["Filtering data", "Sorting data", "Merging data", "Other"],
          "purpose": "Identify and discuss common challenges in data manipulation with Pandas."
        },
        {
          "type": "Open-Ended",
          "text": "Describe a scenario where you had to clean and transform data. What challenges did you face?",
          "purpose": "Encourage students to share their experiences and strategies for data cleaning."
        }
      ]
    },
    {
      "topic": "Data Visualization with Matplotlib",
      "hours": 2,
      "difficulty": "Medium",
      "description": "Creating visual representations of data using Matplotlib.",
      "objectives": [
        "Create basic plots using Matplotlib",
        "Customize plots to improve readability and presentation"
      ],
      "skills": ["Data Visualization"],
      "prerequisiteKnowledge": ["Basic programming skills in Python"],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which type of plot do you find most useful for data analysis?",
          "choices": ["Line plot", "Bar chart", "Scatter plot", "Other"],
          "purpose": "Encourage discussion on the use cases of different plot types."
        },
        {
          "type": "Open-Ended",
          "text": "Share an example where data visualization helped you understand a complex dataset.",
          "purpose": "Encourage students to discuss the benefits of data visualization in data analysis."
        }
      ]
    },
    {
      "topic": "Descriptive Statistics",
      "hours": 1,
      "difficulty": "Easy",
      "description": "Basic concepts of descriptive statistics.",
      "objectives": [
        "Calculate measures of central tendency and dispersion",
        "Interpret statistical summaries"
      ],
      "skills": ["Descriptive Statistics"],
      "prerequisiteKnowledge": ["Basic understanding of statistics"],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which measure of central tendency do you find most useful?",
          "choices": ["Mean", "Median", "Mode", "Other"],
          "purpose": "Encourage discussion on the applications of different measures of central tendency."
        },
        {
          "type": "Open-Ended",
          "text": "How would you explain the importance of standard deviation to someone without a statistics background?",
          "purpose": "Encourage students to simplify and communicate statistical concepts."
        }
      ]
    },
    {
      "topic": "Inferential Statistics",
      "hours": 2,
      "difficulty": "Medium",
      "description": "Introduction to inferential statistics.",
      "objectives": [
        "Understand sampling distributions",
        "Perform hypothesis testing"
      ],
      "skills": ["Inferential Statistics"],
      "prerequisiteKnowledge": ["Basic understanding of statistics"],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which aspect of inferential statistics do you find most challenging?",
          "choices": ["Sampling distributions", "Hypothesis testing", "Confidence intervals", "Other"],
          "purpose": "Identify and discuss common challenges in understanding inferential statistics."
        },
        {
          "type": "Open-Ended",
          "text": "Describe a scenario where you would use hypothesis testing. What steps would you follow?",
          "purpose": "Encourage students to apply inferential statistics in real-world scenarios."
        }
      ]
    },
    {
      "topic": "Introduction to Machine Learning",
      "hours": 1,
      "difficulty": "Medium",
      "description": "Basic concepts and techniques of machine learning.",
      "objectives": [
        "Understand key machine learning concepts",
        "Identify different types of machine learning algorithms"
      ],
      "skills": ["Machine Learning"],
      "prerequisiteKnowledge": ["Basic programming skills in Python"],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which machine learning algorithm are you most interested in learning about?",
          "choices": ["Decision Trees", "Neural Networks", "Support Vector Machines", "Other"],
          "purpose": "Gauge student interest in different machine learning algorithms."
        },
        {
          "type": "Open-Ended",
          "text": "Explain a real-world problem that could be solved using machine learning.",
          "purpose": "Encourage students to think about practical applications of machine learning."
        }
      ]
    },
    {
      "topic": "Linear Regression",
      "hours": 1,
      "difficulty": "Medium",
      "description": "Introduction to linear regression models.",
      "objectives": [
        "Understand the principles of linear regression",
        "Implement a linear regression model"
      ],
      "skills": ["Linear Regression"],
      "prerequisiteKnowledge": ["Basic understanding of statistics", "Introduction to Machine Learning"],
      "prompts": [
        {
          "type": "Poll",
          "text": "What aspect of linear regression do you find most challenging?",
          "choices": ["Assumptions", "Model fitting", "Interpretation of results", "Other"],
          "purpose": "Identify and discuss common challenges in understanding linear regression."
        },
        {
          "type": "Open-Ended",
          "text": "Describe a scenario where linear regression could be used to make predictions.",
          "purpose": "Encourage students to apply linear regression to real-world problems."
        }
      ]
    },
    {
      "topic": "Classification Algorithms",
      "hours": 1,
      "difficulty": "Medium",
      "description": "Overview of classification algorithms.",
      "objectives": [
        "Understand different classification techniques",
        "Implement basic classification models"
      ],
      "skills": ["Classification Algorithms"],
      "prerequisiteKnowledge": ["Basic programming skills in Python", "Introduction to Machine Learning"],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which classification algorithm do you find most interesting?",
          "choices": ["K-Nearest Neighbors", "Support Vector Machines", "Naive Bayes", "Other"],
          "purpose": "Gauge student interest in different classification algorithms."
        },
        {
          "type": "Open-Ended",
          "text": "Explain a scenario where a classification algorithm could be used to solve a problem.",
          "purpose": "Encourage students to think about practical applications of classification algorithms."
        }
      ]
    },
    {
      "topic": "Clustering Algorithms",
      "hours": 1,
      "difficulty": "Medium",
      "description": "Introduction to clustering algorithms.",
      "objectives": [
        "Understand different clustering techniques",
        "Implement basic clustering models"
      ],
      "skills": ["Clustering Algorithms"],
      "prerequisiteKnowledge": ["Basic programming skills in Python", "Introduction to Machine Learning"],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which clustering algorithm do you find most useful?",
          "choices": ["K-Means", "Hierarchical Clustering", "DBSCAN", "Other"],
          "purpose": "Gauge student interest in different clustering algorithms."
        },
        {
          "type": "Open-Ended",
          "text": "Describe a scenario where clustering could be used to group data.",
          "purpose": "Encourage students to think about practical applications of clustering algorithms."
        }
      ]
    },
    {
      "topic": "Conclusion and Future Directions",
      "hours": 1,
      "difficulty": "Easy",
      "description": "Summary of course content and future directions in data science.",
      "objectives": [
        "Summarize key takeaways from the course",
        "Identify potential future developments in data science"
      ],
      "skills": ["Understanding Future Directions"],
      "prerequisiteKnowledge": [],
      "prompts": [
        {
          "type": "Poll",
          "text": "Which topic from the course do you want to explore further?",
          "choices": ["Data Cleaning", "Data Visualization", "Machine Learning", "Other"],
          "purpose": "Identify topics of interest for future learning."
        },
        {
          "type": "Open-Ended",
          "text": "What do you see as the future of data science in your field?",
          "purpose": "Encourage students to think about and discuss the future impact of data science."
        }
      ]
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
        "objectives": [
          "Understand the importance of data cleaning",
          "Implement basic data cleaning techniques"
        ],
        "skills": ["Data Cleaning", "Data Preprocessing"],
        "prerequisiteKnowledge": ["Basic programming skills in Python"],
        "prompts": [
          {
            "type": "Poll",
            "text": "Which data cleaning technique do you find most useful?",
            "choices": ["Removing duplicates", "Handling missing values", "Correcting errors", "Other"],
            "purpose": "Encourage discussion on the effectiveness of different data cleaning techniques."
          },
          {
            "type": "Open-Ended",
            "text": "Describe a scenario where data cleaning significantly improved the quality of your analysis.",
            "purpose": "Encourage students to share their experiences and the impact of data cleaning."
          }
        ]
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
          "objectives": [
            "Load and inspect datasets using Pandas",
            "Perform basic data manipulation tasks"
          ],
          "skills": ["Basic Data Manipulation"],
          "prerequisiteKnowledge": ["Basic programming skills in Python"],
          "prompts": [
            {
              "type": "Poll",
              "text": "Which basic data manipulation task do you find most challenging?",
              "choices": ["Filtering data", "Sorting data", "Merging data", "Other"],
              "purpose": "Identify and discuss common challenges in basic data manipulation with Pandas."
            },
            {
              "type": "Open-Ended",
              "text": "Describe a scenario where you used Pandas to perform a basic data manipulation task.",
              "purpose": "Encourage students to share their experiences with basic data manipulation tasks."
            }
          ]
        },
        {
          "topic": "Advanced Data Manipulation with Pandas",
          "hours": 1,
          "difficulty": "Medium",
          "description": "Advanced techniques for data manipulation using Pandas.",
          "objectives": [
            "Perform complex data manipulation tasks using Pandas",
            "Optimize data processing with Pandas"
          ],
          "skills": ["Advanced Data Manipulation"],
          "prerequisiteKnowledge": ["Basic programming skills in Python", "Introduction to Pandas"],
          "prompts": [
            {
              "type": "Poll",
              "text": "Which advanced data manipulation technique do you find most useful?",
              "choices": ["Pivot tables", "Group by operations", "Time series analysis", "Other"],
              "purpose": "Encourage discussion on the effectiveness of different advanced data manipulation techniques."
            },
            {
              "type": "Open-Ended",
              "text": "Describe a scenario where advanced data manipulation significantly improved your analysis.",
              "purpose": "Encourage students to share their experiences with advanced data manipulation techniques."
            }
          ]
        }
      ],
      "rationale": "To ensure each topic is focused and manageable for beginners."
    },
    {
      "action": "delete",
      "type": "topic",
      "category": null,
      "topic": "Conclusion and Future Directions",
      "rationale": "This topic is too vague and can be integrated into the final sessions of each module."
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
        "objectives": [
          "Calculate and interpret measures of central tendency and dispersion",
          "Summarize data using descriptive statistics"
        ],
        "skills": ["Descriptive Statistics"],
        "prerequisiteKnowledge": ["Basic understanding of statistics"],
        "prompts": [
          {
            "type": "Poll",
            "text": "Which descriptive statistic do you find most useful?",
            "choices": ["Mean", "Median", "Standard deviation", "Other"],
            "purpose": "Encourage discussion on the usefulness of different descriptive statistics."
          },
          {
            "type": "Open-Ended",
            "text": "Describe a scenario where descriptive statistics helped you understand your data better.",
            "purpose": "Encourage students to share their experiences with descriptive statistics."
          }
        ]
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
        "objectives": [
          "Perform hypothesis testing",
          "Interpret results from inferential statistical analyses"
        ],
        "skills": ["Inferential Statistics"],
        "prerequisiteKnowledge": ["Basic understanding of statistics"],
        "prompts": [
          {
            "type": "Poll",
            "text": "Which inferential statistic do you find most challenging?",
            "choices": ["T-test", "ANOVA", "Regression analysis", "Other"],
            "purpose": "Identify and discuss common challenges in understanding inferential statistics."
          },
          {
            "type": "Open-Ended",
            "text": "Describe a scenario where inferential statistics could be used to make decisions.",
            "purpose": "Encourage students to think about and apply inferential statistics in real-world scenarios."
          }
        ]
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
        "objectives": [
          "Apply machine learning concepts in a practical project",
          "Implement and evaluate a simple machine learning model"
        ],
        "skills": ["Implementing Machine Learning Models"],
        "prerequisiteKnowledge": ["Introduction to Machine Learning"],
        "prompts": [
          {
            "type": "Poll",
            "text": "Which part of the machine learning project do you find most challenging?",
            "choices": ["Data preprocessing", "Model selection", "Evaluation metrics", "Other"],
            "purpose": "Identify and discuss common challenges in implementing a machine learning project."
          },
          {
            "type": "Open-Ended",
            "text": "Describe your experience with implementing a machine learning model. What challenges did you face?",
            "purpose": "Encourage students to share their experiences with implementing machine learning models."
          }
        ]
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
          "choices": ["Arrow functions", "Promises", "Async/Await", "Other"],
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
              "choices": ["Grid", "Flexbox", "Both", "Other"],
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
              "choices": ["Promises", "Async/Await", "Both", "Other"],
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
              "choices": ["Component state management", "JSX", "Props", "Other"],
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
              "choices": ["React hooks", "Context API", "Redux", "Other"],
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
          "choices": ["Express.js", "Koa", "NestJS", "Other"],
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
              "choices": ["Asynchronous programming", "Middleware", "Routing", "Other"],
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
              "choices": ["Statelessness", "Resource-based URLs", "HTTP methods", "Other"],
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
              "choices": ["Scalability", "Flexibility", "Both", "Other"],
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
              "choices": ["JWT", "OAuth", "SAML", "Other"],
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
          "choices": ["XSS", "CSRF", "SQL injection", "Other"],
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
              "choices": ["XSS", "CSRF", "SQL injection", "Other"],
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
              "choices": ["Input validation", "Sanitization", "Security headers", "Other"],
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
              "choices": ["Yes", "No", "Depends on the application", "Other"],
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
      "new_category": {
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
            "choices": ["Jenkins", "GitHub Actions", "CircleCI", "Other"],
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
                "choices": ["Automation", "Monitoring", "Both", "Other"],
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
                "choices": ["Yes", "No", "Depends on the project", "Other"],
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
                "choices": ["AWS", "Azure", "Google Cloud", "Other"],
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
      },
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
          "objectives": [
            "Implement state management using Redux",
            "Understand the Redux workflow"
          ],
          "skills": [
            "State Management with Redux",
            "Redux Workflow"
          ],
          "prerequisiteKnowledge": [
            "Introduction to React",
            "JavaScript programming basics"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Do you find using Redux for state management in React applications easy or challenging?",
              "choices": ["Easy", "Challenging", "Depends on the project", "Other"],
              "purpose": "Gauge students' comfort level with using Redux for state management."
            },
            {
              "type": "Open-Ended",
              "text": "Describe a scenario where Redux is essential for state management.",
              "purpose": "Encourage students to think about and discuss scenarios where Redux is particularly useful."
            }
          ]
        },
        {
          "topic": "State Management with Context API",
          "hours": 1,
          "difficulty": "Medium",
          "description": "Managing state in React applications using the Context API.",
          "objectives": [
            "Implement state management using Context API",
            "Understand the benefits and limitations of Context API"
          ],
          "skills": [
            "State Management with Context API",
            "Context API Limitations"
          ],
          "prerequisiteKnowledge": [
            "Introduction to React",
            "JavaScript programming basics"
          ],
          "prompts": [
            {
              "type": "Poll",
              "text": "Do you prefer using Context API over Redux for state management in React applications? Why or why not?",
              "choices": ["Yes", "No", "Depends on the project", "Other"],
              "purpose": "Encourage discussion on the pros and cons of using Context API versus Redux."
            },
            {
              "type": "Open-Ended",
              "text": "Explain a scenario where Context API is more beneficial than Redux for state management.",
              "purpose": "Encourage students to think critically about the use cases for Context API."
            }
          ]
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
        "objectives": [
          "Understand the principles of GraphQL",
          "Implement a GraphQL API"
        ],
        "skills": ["GraphQL"],
        "prerequisiteKnowledge": [
          "RESTful API Design",
          "Understanding of client-server architecture"
        ],
        "prompts": [
          {
            "type": "Poll",
            "text": "Do you prefer using GraphQL over RESTful APIs? Why or why not?",
            "choices": ["Yes", "No", "Depends on the project", "Other"],
            "purpose": "Encourage discussion on the pros and cons of using GraphQL versus RESTful APIs."
          },
          {
            "type": "Open-Ended",
            "text": "Describe a scenario where GraphQL would be more beneficial than RESTful APIs.",
            "purpose": "Encourage students to think critically about the use cases for GraphQL."
          }
        ]
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
    "Prerequisite Knowledge": prerequisiteKnowledge,
    "Current Description": courseDescription,
    "Course Objectives": courseObjectives,
    "Course Skills": courseSkills,
    "Current Syllabus": syllabus,
  };

  const response = await callOpenAIChat([], JSON.stringify(userPrompt), JSON.stringify(systemPrompt));
  const suggestions = response.suggestions;
  console.log(JSON.stringify(suggestions, null, 2));
  return suggestions;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      courseTitle,
      courseDescription,
      targetLearners,
      syllabus,
      courseObjectives,
      prerequisiteKnowledge,
      courseSkills,
      hours,
    } = req.body;
    const suggestions = await improveCourseSyllabus(
      courseTitle,
      targetLearners,
      hours,
      prerequisiteKnowledge,
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
