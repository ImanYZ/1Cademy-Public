import { db } from "@/lib/firestoreServer/admin";
import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { sendGPTPrompt, sendGPTPromptJSON } from "src/utils/assistant-helpers";

const extractJSON = (text: string, regex = false) => {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (end === -1 || start === -1) {
      return null;
    }
    const jsonArrayString = text.slice(start, end + 1);
    return JSON.parse(jsonArrayString);
  } catch (error) {
    return null;
  }
};
const generateProposalsJSON = async (
  originalPrompt: string,
  paragraphs: string[],
  proposalsJSONString: any = {},
  evalObj: any = {}
): Promise<any> => {
  let prompt = originalPrompt + "\n\nThe following triple-quoted text includes three paragraphs of a passage:\n";
  prompt += "'''\n";
  prompt += paragraphs.join("\n\n");
  prompt += "\n'''";
  prompt += "\n\nWe'd like to focus on the last paragraph.\n\n";

  prompt +=
    "Carefully respond a JSON object with the following schema to improve/expand the 1Cademy knowledge graph, based on the last paragraph:\n";
  prompt += "{\n";
  prompt += '"improvements" : [An array of improvements to existing nodes based on the above paragraph.]';
  prompt += '"child_nodes" : [An array of new child nodes based on the above paragraph.]';
  prompt += "}\n";
  prompt +=
    "Each item in each array should represent an object that proposes an improvement to an existing node OR a new child node.\n";
  prompt +=
    "If a node about the exact same topic of the above paragraph already exists and you decide to propose an improvement to the existing node, the object (array item) you generate should have the following structure:\n";
  prompt += "{\n";
  prompt += '"node": "The id of the node you would like to improve.",\n';
  prompt += '"old_title": "The current title of the node.",\n';
  prompt +=
    '"new_title": "The improved title of the node, if there is any room for improving its title, otherwise it should be the same as the old title.",\n';
  prompt +=
    '"content": "The improved content of the node, if there is any room for improving its content, otherwise it would be the same as the old content",\n';
  prompt +=
    '"addedParents": [An array of objects each with the structure {"node": "Parent node id", "title": "Parent node title"} that you would like to add as the parents of this node that the node does not currently have.],\n';
  prompt +=
    '"addedChildren": [An array of objects each with the structure {"node": "Child node id", "title": "Child node title"} that you would like to add as the children of this node that the node does not currently have.],\n';
  prompt +=
    '"removedParents": [An array of objects each with the structure {"node": "Parent node id", "title": "Parent node title"} that you would like to remove from the array of parents of this node.],\n';
  prompt +=
    '"removedChildren": [An array of objects each with the structure {"node": "Child node id", "title": "Child node title"} that you would like to remove from the array of children of this node.]\n';
  prompt +=
    '"reasoning": "Your reasoning for making these improvements to the title, content, parents, and/or children of this node.",\n';
  prompt += '"sentences": [An array of sentences from the original paragraph that you used for this proposal.]\n';
  prompt += "}\n\n";
  prompt +=
    "If you decide to propose a new child node, the object (array item) you generate should have the following structure:\n";
  prompt += "{\n";
  prompt += '"title": "The title of the child node.",\n';
  prompt += '"content": "The content of the child node.",\n';
  prompt += '"nodeType": "The type of the child node, either Concept or Relation.",\n';
  prompt +=
    '"parents": [An array of objects each with the structure {"node": "Parent node id", "title": "Parent node title"} as the parents (direct prerequisites) of this node.],\n';
  prompt += '"reasoning": "Your reasoning for proposing this new child node with this title, content, and parents.",\n';
  prompt += '"sentences": [An array of sentences from the original paragraph that you used for this proposal.]\n';
  prompt +=
    "}\n Note that your proposals should be only based on the last paragraph of the above text. Do not go beyond the knowledge provided by the paragraph.";
  if (evalObj?.evaluation === "Reject" && evalObj?.reasoning) {
    prompt += "\nYou previously generated the following JSON object:\n";
    prompt += proposalsJSONString;
    prompt +=
      "\n\nPlease generate a new JSON object by improving upon your previous JSON object based on the following feedback you received:\n";
    prompt += evalObj.reasoning;
  }

  const response: string = await sendGPTPromptJSON([
    {
      content: prompt,
      role: "user",
    },
  ]);
  try {
    const extractedJSON = extractJSON(response);
    if (!extractedJSON) throw new Error(`JSON not found`);
    return extractedJSON;
  } catch (err) {
    return await generateProposalsJSON(originalPrompt, paragraphs, proposalsJSONString, evalObj);
  }
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { paragraphs } = req.body;
    console.log("paragraphs", paragraphs);
    const nodeDocs = await db
      .collection("nodes")
      .where("nodeType", "in", ["Concept", "Relation"])
      .where("tags", "array-contains-any", ["Economy", "Economics"])
      .where("deleted", "==", false)
      .get();
    if (nodeDocs.docs.length <= 0) {
      throw new Error("No nodes in this tag");
    }
    const nodesArray = [];
    const nodesHashMap: { [key: string]: any } = {};
    for (let nodeDoc of nodeDocs.docs) {
      const nodeData = nodeDoc.data();
      if (!nodeData.tags.includes("Cryptoeconomics") && !nodeData.title.includes("References")) {
        const nodeDetails = {
          id: nodeDoc.id,
          title: nodeData.title,
          content: nodeData.content,
          nodeType: nodeData.nodeType,
          children: nodeData.children.map((child: { node: string; title: string }) => ({
            node: child.node,
            title: child.title,
          })),
          parents: nodeData.parents.map((parent: { node: string; title: string }) => ({
            node: parent.node,
            title: parent.title,
          })),
        };
        nodesArray.push(nodeDetails);
        nodesHashMap[nodeDoc.id] = nodeDetails;
      }
    }
    console.log("nodesArray", nodesArray);

    let originalPrompt = "'''\n";
    originalPrompt += "1Cademy is a knowledge graph with the following characteristics:\n";
    originalPrompt += "- Each node represents a unique piece of knowledge.\n";
    originalPrompt += "- Each node is standalone; that is, it is meaningful without referring to other nodes.\n";
    originalPrompt += "- Each node is indivisible; dividing it would result in loss of meaning.\n";
    originalPrompt += "- The source of each link is termed a 'parent' and its destination a 'child.'\n";
    originalPrompt +=
      "- Each link between two nodes represents a direct prerequisite relationship, meaning it is impossible to learn a child before learning its parent.\n";
    originalPrompt += "- If node A is a child of node B, then node B is a parent (prerequisite) of node A.\n";
    originalPrompt +=
      "- The prerequisite links are unidirectional, implying that if node A is a parent of node B, node B cannot be a parent of node A.\n";
    originalPrompt +=
      "- The graph is acyclic; for instance, if node A is a parent of node B and node B is a parent of node C, node C cannot be a parent of node A.\n";
    originalPrompt += "- Each node can have one or multiple parents; and zero, one, or multiple children.\n";
    originalPrompt += "- Each node is of one of these two types:\n";
    originalPrompt += "   - Concept: defines a granular unit of knowledge.\n";
    originalPrompt +=
      "   - Relation: explains the relationships between two or more linked Concept nodes without defining any of them.\n";
    originalPrompt +=
      "- The title and content of each node are written in Markdown and mathematical formulas in them are written in MathJax and enclosed in dollar signs.\n";
    originalPrompt += "'''\n\n";

    originalPrompt +=
      "We have a JSON array of all the nodes in 1Cademy. In this JSON array, each item represents a node, including its properties:\n";
    originalPrompt += "- title: the node title\n";
    originalPrompt += "- content: the node content\n";
    // prompt +=
    //   "- nodeImage: the URL of an image added to the node; if the node has no image, it would get an empty string,\n";
    originalPrompt += "- nodeType: the type of the node, which can be either Concept or Relation.\n";
    originalPrompt +=
      '- children: [an array of objects each with the structure {"node": "Child node id", "title": "Child node title"} for each child node under this node],\n';
    originalPrompt +=
      '- parents: [an array of objects each with the structure {"node": "Parent node id", "title": "Parent node title"} for each parent node that this node is under],\n';
    // prompt +=
    //   "- referenceIds: an array of Reference node ids that this node is citing\n";
    // prompt +=
    //   "- referenceLabels: an array of labels (such as page numbers, sections of books or papers, webpage URLs of websites, and time-frames of voice or video files) for Reference nodes that this node is citing corresponding to referenceIds\n";
    // prompt +=
    //   "- references: an array of Reference node titles that this node is citing corresponding to referenceIds\n";
    // prompt += "- tagIds: an array of node ids tagged on this node\n";
    // prompt +=
    //   "- tags: an array of node titles tagged on this node corresponding to tagIds\n";
    originalPrompt += "The JSON array is as follows:\n";
    originalPrompt += JSON.stringify(nodesArray, null, 2);
    const response = await generateProposalsJSON(
      originalPrompt,
      paragraphs.map((p: { text: string; ids: string[] }) => p.text)
    );
    //add the type of the nodes to the children (added ones only) and to the parents (added ones only)
    response.child_nodes = response.child_nodes.filter((newChild: any) => newChild.parents.length > 0);
    for (let improvement of response.improvements) {
      for (let child of improvement.addedChildren || []) {
        child.type = nodesHashMap[child.node].nodeType;
      }
      for (let child of improvement.addedParents || []) {
        child.type = nodesHashMap[child.node].nodeType;
      }
    }
    console.log(paragraphs.map((p: { text: string; ids: string[] }) => p.text));

    console.log(JSON.stringify(response));
    return res.status(200).json(response);
  } catch (error) {}
}
export default fbAuth(handler);
