import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next/types";
import { askGemini } from "./gemini/GeminiAPI";
import fbAuth from "src/middlewares/fbAuth";

const jsonNodeStructure =
  "JSON Node Structure:\n" +
  "We have a JSON array of the nodes in 1Cademy. Each node in the JSON array includes the following properties:\n" +
  "{\n" +
  '  "title": "The node title",\n' +
  '  "content": "The node content",\n' +
  '  "nodeType": "The type of the node, which can be either Concept or Relation.",\n' +
  '  "children": [An array of objects each with the structure {"title": "Child node title"} for each child node under this node.],\n' +
  '  "parents": [An array of objects each with the structure {"title": "Parent node title"} for each parent node that this node is under.]\n' +
  // '  "nodeImage": "The URL of an image added to the node; if the node has no image, it would get an empty string",\n' +
  // '  "referenceIds": [An array of Reference node ids that this node is citing]\n' +
  // '  "referenceLabels": [An array of labels (such as page numbers, sections of books or papers, webpage URLs of websites, and time-frames of voice or video files) for Reference nodes that this node is citing corresponding to referenceIds]\n' +
  // '  "references": [An array of Reference node titles that this node is citing corresponding to referenceIds]\n" +
  // '  "tagIds": [An array of node ids tagged on this node]\n' +
  // '  "tags": [An array of node titles tagged on this node corresponding to tagIds]\n' +
  "}\n\n";

let DEFINITION_OF_1CADEMY =
  "1Cademy Definition:\n" +
  "1Cademy is a knowledge graph with the following characteristics:\n" +
  "- Each node represents a unique piece of knowledge.\n" +
  "- Each node is standalone; that is, it is meaningful without referring to other nodes.\n" +
  "- Each node is indivisible; dividing it would result in loss of meaning.\n" +
  "- The source of each link is termed a 'parent' and its destination is called a 'child.'\n" +
  "- Each link between two nodes represents a direct prerequisite relationship, meaning it is difficult to learn a child before learning its parent.\n" +
  "- If node A is a child of node B, then node B is a parent (prerequisite) of node A.\n" +
  "- The prerequisite links are unidirectional, implying that if node A is a parent of node B, node B cannot be a parent of node A.\n" +
  "- The graph is acyclic; for instance, if node A is a parent of node B and node B is a parent of node C, node C cannot be a parent of node A.\n" +
  "- Each node can have one or multiple parents; and zero, one, or multiple children.\n" +
  "- Each node is of one of these two types:\n" +
  "   - Concept: defines a granular unit of knowledge.\n" +
  "   - Relation: explains the relationships between two or more linked Concept nodes without defining any of them.\n" +
  "- The title and content of each node are written in Markdown and mathematical formulas in them are written in MathJax and enclosed in dollar signs.\n" +
  "\n\n" +
  jsonNodeStructure +
  "The JSON array is as follows:\n";

const convertSyllabusToRelatedNodesString = (
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
): string => {
  return JSON.stringify(
    {
      related_nodes: syllabus.map((item: any) => {
        if (item.hasOwnProperty("topic")) {
          return {
            ...item,
            nodes: ["Node 1 title", "Node 2 title", "Node 3 title", "..."],
          };
        } else {
          return {
            category: item.category,
            topics: item.topics.map((topic: { topic: string; hours: number; difficulty: string }) => {
              return {
                ...topic,
                nodes: ["Node 1 title", "Node 2 title", "Node 3 title", "..."],
              };
            }),
          };
        }
      }),
    },
    null,
    2
  );
};

const searchJSONForCourse = async (
  nodesArray: any[],
  courseTitle: string,
  courseDecription: string,
  targetLearners: string,
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
  let prompt =
    "Task Summary:\n" +
    "Search through the JSON array of nodes in 1Cademy and find a maximum of ten most related nodes to each topic in the syllabus of a course. Return the results in a specified JSON format.\n\n" +
    DEFINITION_OF_1CADEMY +
    "{\n" +
    '"nodes": ' +
    JSON.stringify(nodesArray, null, 2) +
    // JSON.stringify(nodesArray.slice(0, 2), null, 2) +
    "}\n\n" +
    "The course title is: " +
    courseTitle +
    "\n\n" +
    "The course is described in the following triple-quoted text:\n" +
    "'''\n" +
    courseDecription +
    "\n'''\n\n" +
    "The target learners of the course are: " +
    targetLearners +
    "\n\n" +
    "The course syllabus is as follows:\n" +
    "```\n" +
    JSON.stringify(syllabus, null, 2) +
    "\n```\n\n" +
    "Task Instructions:\n" +
    "1. **Search**: Identify a maximum of ten nodes in the JSON array that most relate to each topic in the syllabus of a course.\n" +
    "2. **Ensure Uniqueness**: The titles assigned to each topic should be unique.\n" +
    "3. **Output**: Respond with a JSON object following this schema:\n" +
    convertSyllabusToRelatedNodesString(syllabus) +
    "\n" +
    "Please take your time to think carefully before responding.";

  const response: string = await askGemini([], prompt);
  const searchObj = JSON.parse(response).related_nodes;
  // console.log("searchObj:", searchObj);
  return searchObj;
};

const retrieveNodesForCourse = async (
  tags: string[],
  courseTitle: string,
  courseDescription: string,
  targetLearners: string,
  references: string[],
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
  const nodeDocs = await db
    .collection("nodes")
    .where("nodeType", "in", ["Concept", "Relation"])
    .where("tags", "array-contains-any", tags)
    .get();
  const nodesArray = [];
  for (let nodeDoc of nodeDocs.docs) {
    const nodeData = nodeDoc.data();
    if (!nodeData.deleted && !nodeData.title.includes("References")) {
      let foundCitation = false;
      for (let reference of references) {
        if (nodeData.references.includes(reference)) {
          foundCitation = true;
          break;
        }
      }
      if (foundCitation) {
        nodesArray.push({
          title: nodeData.title,
          content: nodeData.content,
          nodeType: nodeData.nodeType,
          children: nodeData.children.map((child: any) => ({
            title: child.title,
          })),
          parents: nodeData.parents.map((parent: any) => ({
            title: parent.title,
          })),
        });
      }
    }
  }

  console.log(nodesArray.length + " Nodes retrieved.");

  let searchResults = await searchJSONForCourse(nodesArray, courseTitle, courseDescription, targetLearners, syllabus);
  console.log("searchResults:", searchResults);
  const nodes = nodesArray.filter(node => searchResults.includes(node.title));
  return nodes;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { tags, courseTitle, courseDescription, targetLearners, references, syllabus } = req.body;
    const nodes = await retrieveNodesForCourse(
      tags,
      courseTitle,
      courseDescription,
      targetLearners,
      references,
      syllabus
    );
    console.log("response", nodes);
    return res.status(200).json({
      nodes,
    });
  } catch (error) {
    console.log(error);
  }
}
export default fbAuth(handler);
