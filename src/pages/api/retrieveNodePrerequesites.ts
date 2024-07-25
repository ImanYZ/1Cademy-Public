import { NextApiRequest, NextApiResponse } from "next";
import fbAuth from "src/middlewares/fbAuth";
import { db } from "@/lib/firestoreServer/admin";
import { INode } from "src/types/INode";

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

const findPrerequisitesNodes = async (courseNodes: any[], nodes: any[] = [], type: string): Promise<any[]> => {
  const latestNodes = await compareNodes(courseNodes, nodes);
  if (latestNodes.length > 0) return latestNodes;

  const newNodes: any[] = [];

  for (const courseNode of courseNodes) {
    const nodeDoc = await db.collection("nodes").doc(courseNode.node).get();
    if (!nodeDoc.exists) continue;
    const nodeData = nodeDoc.data() as INode;
    const relatedNodes = type === "parents" ? nodeData.parents : nodeData.children;
    const latestNodes = await compareNodes(courseNodes, relatedNodes || []);

    if (latestNodes.length > 0) {
      newNodes.push(...latestNodes);
    }
  }

  return newNodes;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseId, nodeId, topic, type } = req.body;
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
    const prerequisitesNodes = await findPrerequisitesNodes(courseNodes, nodeData.children, type);

    if (prerequisitesNodes.length > 0) {
      await db.runTransaction(async (t: FirebaseFirestore.Transaction) => {
        const courseDoc = await t.get(courseRef);
        const courseData = courseDoc.data() as FirebaseFirestore.DocumentData;
        const nodeIdx = courseData.nodes[topic].findIndex((node: any) => node.node === nodeId);
        courseData.nodes[topic][nodeIdx][type] = [...courseData.nodes[topic][nodeIdx][type], ...prerequisitesNodes];
        t.update(courseRef, courseData);
      });
    }
    return res.status(200).json({ nodes: prerequisitesNodes });
  } catch (error) {
    console.log(error);
    return res.status(500).json({});
  }
}

export default fbAuth(handler);
