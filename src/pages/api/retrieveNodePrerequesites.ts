import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { db } from "@/lib/firestoreServer/admin";
import { INode } from "src/types/INode";

type RetrieveNodePrerequesitesProps = { courseId: string; nodeId: string; topic: string; type: "parents" | "children" };

const compareNodes = async (courseNodes: any, nodes: any): Promise<any[]> => {
  const nonMatchingObjects: any[] = [];
  const courseNodeTitles = new Set(courseNodes.map((node: any) => node.title));

  for (const node of nodes) {
    if (!courseNodeTitles.has(node.title) && (node.type === "Concept" || node.type === "Relation")) {
      const nodeDoc = await db.collection("nodes").doc(node.node).get();
      const nodeData = nodeDoc.data() as INode;

      if (nodeData?.deleted) continue;

      nonMatchingObjects.push({
        ...node,
        nodeType: node.type,
        content: nodeData?.content,
        nodeSlug: nodeData?.nodeSlug,
      });
    }
  }

  return nonMatchingObjects;
};

const makeNodesTree = async (courseNode: any, nodes: any): Promise<any[]> => {
  const prerequisites = [];
  for (const node of nodes) {
    if (node.type === "Concept" || node.type === "Relation") {
      const nodeDoc = await db.collection("nodes").doc(node.node).get();
      const nodeData = nodeDoc.data() as INode;
      if (nodeData?.deleted) continue;
      prerequisites.push({
        ...node,
        nodeType: node.type,
        content: nodeData?.content,
        nodeSlug: nodeData?.nodeSlug,
      });
    }
    if (prerequisites.length > 0) {
      courseNode["nodes"] = prerequisites;
    }
  }
  return courseNode;
};

const findPrerequisitesNodes = async (courseNodes: any[], type: string): Promise<any[]> => {
  for (const courseNode of courseNodes) {
    const nodeDoc = await db.collection("nodes").doc(courseNode.node).get();
    if (!nodeDoc.exists) continue;
    const nodeData = nodeDoc.data() as INode;

    if (courseNode["nodes"]?.length > 0) {
      console.log("Nodes in node");
      await findPrerequisitesNodes(courseNode["nodes"], type);
    } else {
      const relatedNodes = type === "parents" ? nodeData.parents : nodeData.children;
      await makeNodesTree(courseNode, relatedNodes);
    }
  }
  return courseNodes;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseId, nodeId, topic, type }: RetrieveNodePrerequesitesProps = req.body;
    const courseRef = db.collection("coursesAI").doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      throw new Error("Course not found");
    }

    const courseData = courseDoc.data() as FirebaseFirestore.DocumentData;
    const nodeDoc = await db.collection("nodes").doc(nodeId).get();
    const nodeData = nodeDoc.data();

    if (!nodeData) {
      throw new Error("Node not found");
    }

    const courseNode = courseData.nodes[topic].find((node: any) => node.node === nodeId);

    if (!courseNode) {
      throw new Error("Course node not found in the specified topic");
    }

    const courseNodes = type === "parents" ? courseNode.parents : courseNode.children;
    const nodesForCompare = type === "parents" ? nodeData.parents : nodeData.children;
    const comparedNodes = await compareNodes(courseNodes, nodesForCompare);
    const prerequisitesNodes = await findPrerequisitesNodes([...courseNodes, ...comparedNodes], type);
    return res.status(200).json({ nodes: prerequisitesNodes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({});
  }
}

export default fbAuth(handler);
