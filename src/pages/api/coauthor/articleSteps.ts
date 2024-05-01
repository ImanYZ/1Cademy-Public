import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firestoreServer/admin";
//import fbAuth from "src/middlewares/fbAuth";

const replacePartOfTitle = (title: string) => {
  if (title?.includes(":")) {
    title = title.split(":")[1].trim();
  }
  return title.trim();
};

const findSteps = async (node: any) => {
  const steps: any = [];
  let childrens = node?.children;
  if (!childrens?.length) return [];
  for (const child of childrens) {
    const childNode = await db.collection("nodes").doc(child.node).get();
    const childNodeData = childNode.data();
    if (childNode) {
      const data: any = {
        name: replacePartOfTitle(childNodeData?.title),
        description: childNodeData?.content,
      };
      let childSteps: any = [];
      if (childNodeData?.children.length > 0) {
        const childNode = await db.collection("nodes").doc(childNodeData?.children[0].node).get();
        childSteps = await findSteps(childNode.data());
      }
      data["steps"] = childSteps;
      steps.push(data);
    }
  }

  return steps;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { nodeTitle } = req.body;
    const nodes = await db.collection("nodes").where("deleted", "==", false).where("title", "==", nodeTitle).get();
    let generateResponse = [];
    if (nodes.docs.length) {
      const node = nodes.docs[0]?.data();
      const childNode = await db.collection("nodes").doc(node.children[0].node).get();
      generateResponse = await findSteps(childNode.data());
    }

    return res.status(200).json(generateResponse);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export default handler;
