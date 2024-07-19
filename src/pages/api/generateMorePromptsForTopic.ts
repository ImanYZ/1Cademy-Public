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
9. **Topic:** [The specified Topic goes here]

### Example Input:

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
          "purpose": "Encourage students to discuss different applications and their potential impacts.",
          "choices": ["Healthcare", "Finance", "Marketing", "Other"]
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
          "purpose": "Identify and discuss common challenges in data manipulation with Pandas.",
          "choices": ["Missing values", "Incorrect data types", "Duplicate data", "Other"]
        },
        {
          "type": "Open-Ended",
          "text": "Describe a scenario where you had to clean and transform data. What challenges did you face?",
          "purpose": "Encourage students to share their experiences and strategies for data cleaning."
        }
      ]
    }
  ],
  "Topic": "Data Manipulation with Pandas"
}
\`\`\`

### Example Output:

\`\`\`json
{
  "prompts": [
    {
      "type": "Poll",
      "text": "Do you prefer using the 'apply' function or vectorized operations for data transformation in Pandas?",
      "purpose": "Encourage students to discuss the efficiency and readability of different data transformation methods in Pandas.",
      "choices": ["apply function", "vectorized operations"]
    },
    {
      "type": "Open-Ended",
      "text": "What strategies do you use to handle missing data in Pandas?",
      "purpose": "Encourage students to share their approaches to handling missing data and discuss the pros and cons of each method."
    },
    {
      "type": "Poll",
      "text": "Which Pandas function do you find most useful for data manipulation: 'groupby', 'pivot', or 'melt'?",
      "purpose": "Stimulate discussion on the versatility and use cases of different Pandas functions for data manipulation.",
      "choices": ["groupby", "pivot", "melt"]
    },
    {
      "type": "Open-Ended",
      "text": "Describe a complex data transformation you have performed using Pandas. What challenges did you encounter and how did you overcome them?",
      "purpose": "Encourage students to share detailed experiences and problem-solving strategies in data manipulation."
    },
    {
      "type": "Poll",
      "text": "Do you think learning Pandas is essential for data science? Why or why not?",
      "purpose": "Foster a discussion on the importance and relevance of Pandas in the data science toolkit.",
      "choices": ["Yes", "No"]
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
