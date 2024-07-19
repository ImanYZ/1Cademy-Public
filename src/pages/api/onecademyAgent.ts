import Cors from "cors";
import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { sendGPTPrompt, sendGPTPromptJSON } from "src/utils/assistant-helpers";
import { DEFINITION_OF_1CADEMY } from "./retrieveNodesForCourse";
import { INode } from "src/types/INode";
import { askGemini } from "./gemini/GeminiAPI";
import { callOpenAIChat } from "./openAI/helpers";
import { delay } from "@/lib/utils/utils";
import { runMiddleware } from "src/middlewares/cors";

let proposalsSchema =
  "{\n" +
  '   "improvements" : [An array of improvements to existing nodes based on the above paragraph.]\n' +
  '   "child_nodes" : [An array of new child nodes based on the above paragraph.]\n' +
  "}\n" +
  "Each item in each array should represent an object that proposes an improvement to an existing node OR a new child node.\n" +
  "If a node about the exact same topic of the above paragraph already exists and you decide to propose an improvement to the existing node, the object (array item) you generate should have the following structure:\n" +
  "{\n" +
  '   "old_title": "The current title of the node.",\n' +
  '   "new_title": "The improved title of the node, if there is any room for improving its title, otherwise it should be the same as the old title.",\n' +
  '   "content": "The improved content of the node, if there is any room for improving its content, otherwise it would be the same as the old content",\n' +
  '   "addedParents": [An array of Parent node titles, as strings, that you would like to add as the parents of this node that the node does not currently have.],\n' +
  '   "addedChildren": [An array of Child node titles, as strings, that you would like to add as the children of this node that the node does not currently have.],\n' +
  '   "removedParents": [An array of Parent node titles, as strings, that you would like to remove from the array of parents of this node.],\n' +
  '   "removedChildren": [An array of Child node titles, as strings, that you would like to remove from the array of children of this node.]\n' +
  '   "reasoning": "Your reasoning for making these improvements to the title, content, parents, and/or children of this node.",\n' +
  '   "sentences": [An array of sentences from the original paragraph that you used for this proposal.]\n' +
  "}\n\n" +
  "If you decide to propose a new child node, the object (array item) you generate should have the following structure:\n" +
  "{\n" +
  '   "title": "The title of the child node.",\n' +
  '   "content": "The content of the child node.",\n' +
  '   "nodeType": "The type of the child node, either Concept or Relation.",\n' +
  '   "parents": [An array of Parent node titles, as strings, as the parents (direct prerequisites) of this node. Note that it is required for every child node proposal to have at least one parent.],\n' +
  '   "children": [An array of Child node titles, as strings, as the children of this node. Usually a new child node does not have any children and this should be an empty array.],\n' +
  '   "reasoning": "Your reasoning for proposing this new child node with this title, content,  parents, and/or children.",\n' +
  '   "sentences": [An array of sentences from the original paragraph that you used for this proposal.]\n' +
  "}\n" +
  "Note that the proposals should be only based on the last paragraph of the above text. We should not go beyond the knowledge provided by the last paragraph.\n\n";

const searchJSON = async (nodesArray: any[], paragraphs: string[]) => {
  let prompt =
    "Task Summary:\n" +
    "Search through the JSON array of nodes in 1Cademy and find a maximum of ten most related nodes to the provided paragraph.\n" +
    "For every helpful search result we will pay you $10 and for every irrelevant one, you'll lose $10.\n" +
    "Return the results in a specified JSON format.\n\n" +
    DEFINITION_OF_1CADEMY +
    "{\n" +
    '"nodes": ' +
    JSON.stringify(nodesArray, null, 2) +
    "}\n" +
    "\nThe following triple-quoted text includes " +
    getParagraphsLengthString(paragraphs) +
    " of a passage:\n" +
    "'''\n" +
    paragraphs.join("\n\n") +
    "\n'''\n\n" +
    "Task Instructions:\n" +
    "1. **Search**: Identify a maximum of ten nodes in the JSON array that most relate to the " +
    getParagraphsCountString(paragraphs) +
    ".\n" +
    "2. **Ensure Uniqueness**: The titles in the results should be unique.\n" +
    "3. **Output**: Respond with a JSON object following this schema:\n" +
    "{\n" +
    '  "related_nodes": ["Node 1 title", "Node 2 title", "Node 3 title", ...]\n' +
    "}\n\n" +
    "Example Output:\n" +
    "{\n" +
    '  "related_nodes": ["Economics", "Capitalism"]\n' +
    "}\n" +
    "Please take your time to think carefully before responding.";

  // const response = await callOpenAIChat([], prompt);
  const response = await askGemini([], prompt);
  console.log("response", response);
  const searchObj = response.related_nodes;
  console.log(JSON.stringify(searchObj, null, 2));

  return searchObj;
};
const checkAndIncrementError = async (errorCount: number) => {
  errorCount++;
  if (errorCount > 4) {
    console.log("Four or more rejecting evaluations! Exiting loop.");
    return -1;
  }
  console.log("Retrying...");
  await delay(5000);
  return errorCount;
};
const proposerAgent = async (
  nodesArray: any[],
  paragraphs: string[],
  proposalsJSONString: string = "",
  proposalsJSON: any = {},
  evalObj: any = {}
) => {
  let prompt =
    DEFINITION_OF_1CADEMY +
    "{\n" +
    '"nodes": ' +
    JSON.stringify(nodesArray, null, 2) +
    "}\n" +
    "\n\nThe following triple-quoted text includes " +
    getParagraphsLengthString(paragraphs) +
    " of a passage:\n" +
    "'''\n" +
    paragraphs.join("\n\n") +
    "\n'''" +
    //   "\n\nWe'd like to focus on the " +
    //   getParagraphsCountString(paragraphs) +
    //   "." +
    "\n\nCarefully respond a JSON object with the following schema to improve/expand the 1Cademy knowledge graph, based on the " +
    getParagraphsCountString(paragraphs) +
    ":\n" +
    proposalsSchema;
  if (
    evalObj &&
    ["Reject", "reject"].includes(evalObj.evaluation) &&
    evalObj?.reasoning &&
    (proposalsJSON?.improvements?.length > 0 || proposalsJSON?.child_nodes?.length > 0)
  ) {
    prompt +=
      "\nYou previously generated the following proposal:\n" +
      proposalsJSONString +
      "\n\nPlease generate a new JSON object by improving upon your previous proposal based on the following feedback:\n" +
      evalObj.reasoning;
  }
  prompt +=
    "\n\nPlease take your time and carefully respond a well-structured JSON object.\n" +
    "For every helpful proposal, we will pay you $10 and for every unhelpful one, you'll lose $10.";

  proposalsJSON = await callOpenAIChat([], prompt);
  // proposalsJSON = await askGemini([], prompt);
  console.log("proposalsJSON:", proposalsJSON);
  proposalsJSONString = JSON.stringify(proposalsJSON);
  return { proposalsJSONString, proposalsJSON };
};

const generateProposals = async (tags: string[], paragraphs: string[]) => {
  const nodeDocs = await db
    .collection("nodes")
    .where("nodeType", "in", ["Concept", "Relation"])
    .where("tags", "array-contains-any", tags)
    .get();
  const nodesArray = [];
  for (let nodeDoc of nodeDocs.docs) {
    const nodeData = nodeDoc.data() as INode;
    if (!nodeData.deleted && !nodeData.title.includes("References")) {
      nodesArray.push({
        title: nodeData.title,
        content: nodeData.content,
        nodeType: nodeData.nodeType,
        children: nodeData.children.map(child => child.title),
        parents: nodeData.parents.map(parent => parent.title),
      });
    }
  }

  console.log(nodesArray.length + " Nodes retrieved.");

  console.log("paragraphs", paragraphs);
  let searchResults = await searchJSON(nodesArray, paragraphs);
  // let rankedResults = await rankSearchJSON(filteredNodes, paragraphs);
  // console.log("rankedResults:", rankedResults);
  const nodes = nodesArray.filter(node => searchResults.includes(node.title));
  let proposalsJSON: any = {};
  if (nodes.length === 0) {
    console.log("No related nodes found!");
  } else {
    let evalObj: any = {};
    let proposalsJSONString: string = "";
    let errorCount = 0;
    while (!evalObj.hasOwnProperty("evaluation") || !["Accept", "accept"].includes(evalObj.evaluation)) {
      try {
        if (!evalObj.hasOwnProperty("evaluation")) {
          ({ proposalsJSONString, proposalsJSON } = await proposerAgent(nodes, paragraphs));
        } else if (["Reject", "reject"].includes(evalObj.evaluation) && evalObj?.reasoning) {
          if (proposalsJSON?.improvements?.length > 0 || proposalsJSON?.child_nodes?.length > 0) {
            ({ proposalsJSONString, proposalsJSON } = await proposerAgent(
              nodes,
              paragraphs,
              proposalsJSONString,
              proposalsJSON,
              evalObj
            ));
          } else {
            console.log("-----------------------------");
            console.log("No proposals to improve upon!");
            console.log("-----------------------------");
            break;
          }
        }
        evalObj = await reviewerAgent(nodes, paragraphs, proposalsJSONString);
        if (["Accept", "accept"].includes(evalObj.evaluation)) {
          break;
        } else {
          errorCount = await checkAndIncrementError(errorCount);
          if (errorCount === -1) {
            break;
          }
        }
      } catch (error) {
        console.error("Error in generateProposals:", error);
        errorCount = await checkAndIncrementError(errorCount);
        if (errorCount === -1) {
          break;
        }
      }
    }
  }
  return proposalsJSON;
};
const getParagraphsLengthString = (paragraphs: string[]): string => {
  const length = paragraphs.length;
  if (length === 0) {
    throw new Error("Paragraphs cannot be empty!");
  } else if (length >= 3) {
    return `${length} paragraphs`;
  } else if (length === 2) {
    return "two paragraphs";
  } else {
    return "a paragraph";
  }
};

const getOrdinalString = (n: number): string => {
  const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"];
  return ordinals[n - 1] || `${n}th`;
};
const getParagraphsCountString = (paragraphs: string[]): string => {
  const length = paragraphs.length;
  if (length === 0) {
    throw new Error("Paragraphs cannot be empty!");
  } else {
    return `${getOrdinalString(length)} paragraph`;
  }
};

const reviewerAgent = async (nodesArray: any[], paragraphs: string[], proposalsJSONString: string) => {
  let prompt =
    DEFINITION_OF_1CADEMY +
    "{\n" +
    '"nodes": ' +
    JSON.stringify(nodesArray, null, 2) +
    "}\n" +
    "\n\nThe following triple-quoted text includes " +
    getParagraphsLengthString(paragraphs) +
    " of a passage:\n" +
    "'''\n" +
    paragraphs.join("\n\n") +
    "\n'''" +
    //   "\n\nWe'd like to focus on the " +
    //   getParagraphsCountString(paragraphs) +
    //   "." +
    "\n\nWe'd like to get high-quality proposals with the following JSON schema to improve/expand the 1Cademy knowledge graph, based on the " +
    getParagraphsCountString(paragraphs) +
    ":\n" +
    proposalsSchema +
    "One of our collaborators has submitted the following proposal:\n" +
    proposalsJSONString +
    "\n" +
    "Carefully evaluate this proposal and respond only a JSON object with the following structure:\n" +
    "{\n" +
    '   "evaluation": The value should be "Accept" if you evaluated our collaborator' +
    "'s proposal as helpful, or " +
    '   "Reject" if you evaluated their proposal as not helpful to the 1Cademy knowledge graph,\n' +
    '   "reasoning": "Your reasoning for why you decided to accept or reject the collaborator' +
    "'s proposals" +
    '"\n' +
    "}\n" +
    "Please take your time and carefully respond a well-structured JSON object.\n" +
    "Your generated evaluations will be reviewed by a supervisory team. For every helpful evaluation, we will pay you $10 and for every unhelpful one, you'll lose $10.\n";

  const reviewResponse = await callOpenAIChat([], prompt);
  // const reviewResponse = await askGemini([], prompt);
  console.log(JSON.stringify(reviewResponse, null, 2));
  return reviewResponse;
};
const cors = Cors({
  origin: "*", // Change this to your specific origin or origins
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  optionsSuccessStatus: 200, // Return status code 200 for preflight requests
});

const books = [
  {
    id: "OpenStax Psychology (2nd ed.) Textbook",
    tags: ["Psychology", "Psychology @ OpenStax"],
    references: ["OpenStax Psychology (2nd ed.) Textbook"],
  },
  {
    id: "OpenStax Microbiology Textbook",
    tags: ["Microbiology @ OpenStax", "Microbiology"],
    references: ["OpenStax Microbiology Textbook"],
  },
  {
    id: "CORE Econ - The Economy",
    tags: ["Economy", "Economics"],
    references: ["CORE Econ - The Economy"],
  },
];
async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await runMiddleware(req, res, cors);

    const payload = req.body;
    console.log("==> payload ==>", payload);
    const paragraphs = payload.paragraphs;
    const tags = ["Psychology @ OpenStax"];
    const parags = paragraphs.map((p: { content: string }) => p.content);
    const response = await generateProposals(tags, parags);
    console.log("response", response);
    // const chaptersBook = await db
    // .collection("chaptersBook")
    // .where("url", "==", "01-prosperity-inequality-01-ibn-battuta.html")
    // // .where("chapter", "!=", null)
    // // .orderBy("chapter")
    // .get();
    // for (let chapterBook of chaptersBook.docs) {
    // const chapterData = chapterBook.data();
    // if (chapterData.hasOwnProperty("paragraphs")) {
    // const parags = chapterData.paragraphs.map((p: { text: string }) => p.text);
    // console.log("response", response);
    // return res.status(200).json(response);
    // }
    // }
    // const { paragraphs } = req.body;
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}
export default handler;
