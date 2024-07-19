import { NextApiRequest, NextApiResponse } from "next";

import fbAuth from "src/middlewares/fbAuth";
import { askGemini } from "./gemini/GeminiAPI";
import { DEFINITION_OF_1CADEMY } from "./retrieveNodesForCourse";
import { db } from "@/lib/firestoreServer/admin";

const searchJSONForTopic = async (
  nodesArray: any[],
  courseTitle: string,
  courseDescription: string,
  targetLearners: string,
  syllabus: any[],
  topic: string
) => {
  let prompt =
    "Task Summary:\n" +
    "Search through the JSON array of nodes in 1Cademy and find a maximum of ten most related nodes to the topic '" +
    topic +
    "' in the course syllabus.\n" +
    "For every helpful search result we will pay you $10 and for every irrelevant one, you'll lose $10.\n" +
    "Return the results in a specified JSON format.\n\n" +
    DEFINITION_OF_1CADEMY +
    "{\n" +
    '  "nodes": ' +
    JSON.stringify(nodesArray, null, 2) +
    "}\n\n" +
    "The course title is: " +
    courseTitle +
    "\n\n" +
    "The course is described in the following triple-quoted text:\n" +
    "'''\n" +
    courseDescription +
    "\n'''\n\n" +
    "The target learners of the course are: " +
    targetLearners +
    "\n\n" +
    "The course syllabus is as follows:\n" +
    "```\n" +
    JSON.stringify(syllabus, null, 2) +
    "\n```\n\n" +
    "Task Instructions:\n" +
    "1. **Search**: Identify a maximum of ten nodes in the JSON array that most relate to '" +
    topic +
    "' in the syllabus of a course.\n" +
    "2. **Ensure Uniqueness**: The retrieved nodes should have unique titles.\n" +
    "3. **Output**: Respond with a JSON object following this schema:\n" +
    "{\n" +
    '  "related_nodes": ["Node 1 title", "Node 2 title", "Node 3 title", "..."]\n' +
    "}\n" +
    "Please take your time to think carefully before responding.";

  // const startTime = Date.now();
  const response = await askGemini([], prompt);
  // const endTime = Date.now();
  const searchObj = response.related_nodes;
  // const executionTime = endTime - startTime;
  // console.log("Execution time:", executionTime, "ms");
  return searchObj;
};

const retrieveNodesForTopic = async (
  tags: string[],
  courseTitle: string,
  courseDescription: string,
  targetLearners: string,
  references: string[],
  syllabus: any[],
  topic: string
) => {
  const nodeDocs = await db
    .collection("nodes")
    .where("nodeType", "in", ["Concept", "Relation"])
    .where("tags", "array-contains-any", tags)
    .get();
  const nodesArray: any = [];
  const nodeHash: { [key: string]: any } = {};
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
        nodeHash[nodeData.title] = { ...nodeData, node: nodeDoc.id };
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

  const searchResults = await searchJSONForTopic(
    nodesArray,
    courseTitle,
    courseDescription,
    targetLearners,
    syllabus,
    topic
  );
  let output = [];
  console.log("searchResults", searchResults);
  const nodes = [];
  for (let nodeTitle of searchResults) {
    if (nodeHash[nodeTitle]) {
      nodes.push(nodeHash[nodeTitle]);
    }
  }
  return nodes;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseId, tags, courseTitle, courseDescription, targetLearners, references, syllabus, topic } = req.body;

    const nodes = await retrieveNodesForTopic(
      tags,
      courseTitle,
      courseDescription,
      targetLearners,
      references,
      syllabus,
      topic
    );
    await db.runTransaction(async (t: any) => {
      const courseDoc = await t.get(db.collection("coursesAI").doc(courseId));
      const courseData = courseDoc.data();
      if (!!courseData?.nodes) {
        courseData.nodes[topic] = nodes;
      } else {
        courseData.nodes = { [topic]: nodes };
      }
      t.update(courseDoc.ref, courseData);
    });

    console.log("nodes ==>", nodes);

    return res.status(200).json({});
  } catch (error) {
    console.log(error);
    return res.status(500).json({});
  }
}

export default fbAuth(handler);
