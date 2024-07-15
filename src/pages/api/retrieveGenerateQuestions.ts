import { NextApiRequest, NextApiResponse } from "next";
import { askGemini } from "./gemini/GeminiAPI";
import { db } from "@/lib/firestoreServer/admin";

const retrieveGenerateQuestions = async (
  courseTitle: string,
  courseDescription: string,
  targetLearners: string,
  nodeId: string
) => {
  const nodeDoc = await db.collection("nodes").doc(nodeId).get();
  const node = nodeDoc.data();
  if (node && node.title && node.content && (node.nodeType === "Concept" || node.nodeType === "Relation")) {
    const questions = [];
    for (let child of node.children) {
      if (child.type === "Question") {
        questions.push({
          question_type: "Multiple Choice",
          question_text: child.title + "\n" + child.content,
          options: child.choices,
          nodeImage: node.nodeImage,
          nodeVideo: node.nodeVideo,
        });
      }
    }
    let prompt = `Task Summary:
  Generate a maximum of ten questions of various types to assess a student's understanding of a specified concept within a course with specified characteristics. The questions should vary in type (e.g., multiple-choice, true/false, short answer, and essay) to comprehensively evaluate different levels of understanding and cognitive skills. Your response should be only a JSON object with the following structure:
  {
    "questions": [
      {
        "question_type": "Multiple Choice",
        "question_text": "What is the primary function of the cell nucleus?",
        "choices": [
          {
            "choice": "To store genetic material",
            "correct": true,
            "feedback": "The nucleus stores the cell's genetic material in the form of DNA."
          },
          {
            "choice": "To produce energy",
            "correct": false,
            "feedback": "The mitochondria are responsible for producing energy in the cell."
          },
          {
            "choice": "To aid in cell movement",
            "correct": false,
            "feedback": "The cytoskeleton helps in cell movement."
          },
          {
            "choice": "To control cell metabolism",
            "correct": false,
            "feedback": "While the nucleus plays a role in regulating cell activities, the term 'control cell metabolism' is more closely related to the overall function of cellular organelles."
          }
        ]
      },
      {
        "question_type": "True/False",
        "question_text": "Photosynthesis occurs in the mitochondria of plant cells.",
        "correct_answer": "False",
        "feedback": "Photosynthesis occurs in the chloroplasts of plant cells."
      },
      {
        "question_type": "Short Answer",
        "question_text": "Explain the process of mitosis in your own words.",
        "correct_answer": "Mitosis is the process where a single cell divides into two identical daughter cells (cell division).",
        "rubric_items": [
          {
            "item": "Mention of cell division",
            "points": 0.5
          },
          {
            "item": "Explanation of phases (prophase, metaphase, anaphase, telophase)",
            "points": 1.0
          },
          {
            "item": "Identification of resulting identical daughter cells",
            "points": 0.5
          },
          {
            "item": "Use of correct scientific terminology",
            "points": 0.5
          },
          {
            "item": "Clear and concise explanation",
            "points": 0.5
          }
        ]
      },
      {
        "question_type": "Essay",
        "question_text": "Discuss the impact of climate change on marine ecosystems, providing specific examples.",
        "correct_answer": "An essay response explaining the various effects of climate change on marine life, such as coral bleaching, changes in fish migration patterns, and ocean acidification.",
        "rubric_items": [
          {
            "item": "Discussion of coral bleaching",
            "points": 1.0
          },
          {
            "item": "Explanation of changes in fish migration patterns",
            "points": 1.0
          },
          {
            "item": "Description of ocean acidification",
            "points": 1.0
          },
          {
            "item": "Use of specific examples to illustrate points",
            "points": 0.5
          },
          {
            "item": "Logical structure and coherence",
            "points": 0.5
          },
          {
            "item": "Inclusion of recent research or data",
            "points": 0.5
          }
        ]
      },
      {
        "question_type": "Matching",
        "question_text": "Match each organelle with its function.",
        "pairs": [
          {
            "term": "Mitochondria",
            "definition": "Produces energy for the cell",
            "feedback": "The mitochondria generate most of the cell's supply of ATP, used as a source of chemical energy."
          },
          {
            "term": "Ribosome",
            "definition": "Synthesizes proteins",
            "feedback": "Ribosomes are responsible for protein synthesis in the cell."
          },
          {
            "term": "Chloroplast",
            "definition": "Conducts photosynthesis",
            "feedback": "Chloroplasts capture light energy to produce sugars during photosynthesis."
          },
          {
            "term": "Golgi apparatus",
            "definition": "Modifies and packages proteins",
            "feedback": "The Golgi apparatus processes and packages proteins and lipids for secretion or delivery to other organelles."
          }
        ]
      },
      {
        "question_type": "Fill in the Blank",
        "question_text": "The powerhouse of the cell is the ____. ",
        "correct_answer": "mitochondria",
        "feedback": "The mitochondria are known as the powerhouse of the cell because they generate most of the cell's supply of ATP, used as a source of chemical energy."
      },
      {
        "question_type": "Sequence Ordering",
        "question_text": "Arrange the steps of cellular respiration in the correct order.",
        "steps": [
          {
            "step": "Glycolysis",
            "order": 1,
            "feedback": "Glycolysis is the first step in cellular respiration, occurring in the cytoplasm and breaking down glucose into pyruvate."
          },
          {
            "step": "Krebs Cycle",
            "order": 2,
            "feedback": "The Krebs cycle, or citric acid cycle, occurs in the mitochondria and processes pyruvate to produce electron carriers."
          },
          {
            "step": "Electron Transport Chain",
            "order": 3,
            "feedback": "The electron transport chain, occurring in the mitochondrial membrane, generates ATP through oxidative phosphorylation."
          }
        ]
      },
      {
        "question_type": "Case Study",
        "question_text": "Given the following case study of a patient with a metabolic disorder, identify which cellular organelle is most likely affected and explain your reasoning.",
        "case_study": "A patient presents with muscle weakness, fatigue, and lactic acidosis. Laboratory tests reveal a deficiency in ATP production.",
        "correct_answer": "The mitochondria are most likely affected. These symptoms suggest a problem with cellular energy production, which is the primary function of the mitochondria.",
        "rubric_items": [
          {
            "item": "Identification of mitochondria",
            "points": 1.0
          },
          {
            "item": "Explanation of symptoms related to ATP production",
            "points": 1.0
          },
          {
            "item": "Reference to muscle weakness and fatigue",
            "points": 0.5
          },
          {
            "item": "Connection between lactic acidosis and ATP deficiency",
            "points": 0.5
          }
        ]
      }
    ]
  }
  Please carefully design the questions to assess:
  - Learning of the concept: "${node.title}"
    - Described as: "${node.content}"
  - By "${targetLearners}"
  - In the course: "${courseTitle}"
    - Described as: "${courseDescription}"
  
  Your generated questions will be reviewed by a supervisory team. For every helpful question, we will pay you $10 and for every unhelpful one, you'll lose $10.
  `;
    const response = await askGemini([], prompt);
    const generatedQs = response.questions;
    return generatedQs;
  }
};

export function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseTitle, courseDescription, targetLearners, nodeId } = req.body;

    const questions = retrieveGenerateQuestions(courseTitle, courseDescription, targetLearners, nodeId);
    return res.status(200).json({ questions });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
}