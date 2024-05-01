import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firestoreServer/admin";
//import fbAuth from "src/middlewares/fbAuth";

const hashMapById: any = {};

const replacePartOfTitle = (title: string, path: string[]) => {
  if (title?.includes(":")) {
    title = title.split(":")[1].trim();
  } else if (title?.includes(path[0] + " " + "in")) {
    title = title.replace(path[0] + " " + "in", "");
  } else if (title?.includes(path[0])) {
    title = title.replace(path[0], "");
  } else {
    title = title?.replace("Writing", "");
  }
  return title.trim();
};

const findSteps = (node: any) => {
  let latestChild = node?.children[0];
  for (let i = 1; i <= 2; i++) {
    const grandChildDoc = hashMapById[latestChild?.node];
    latestChild = grandChildDoc?.children[0];
  }
  return latestChild?.title?.includes("Steps of");
};

const generateArticleTypesFromNodes = (node: any, parent: any = {}, path: string[] = []) => {
  let structuredData: any = {};
  if (!parent) {
    structuredData[replacePartOfTitle(node.title, path)] = {};
    parent = structuredData[replacePartOfTitle(node.title, path)];
  }
  if (node.children.length > 0) {
    node.children.forEach((child: any) => {
      const childDoc = hashMapById[child.node];
      if (!child.title.includes("Types of")) {
        if (Array.isArray(parent)) {
          parent.push(childDoc?.title);
        } else {
          const checkSteps = findSteps(childDoc);
          if (checkSteps) {
            parent[replacePartOfTitle(child.title, path)] = [];
          } else {
            parent[replacePartOfTitle(child.title, path)] = {};
          }
          generateArticleTypesFromNodes(childDoc, parent[replacePartOfTitle(child.title, path)], [
            path.length === 0 ? child.title : path[0],
          ]);
        }
      } else {
        generateArticleTypesFromNodes(childDoc, parent, [path.length === 0 ? child.title : path[0]]);
      }
    });
  }
  return parent;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const nodes = await db
      .collection("nodes")
      .where("deleted", "==", false)
      .where("tags", "array-contains-any", ["Written Content"])
      .get();
    nodes.docs.forEach(doc => {
      hashMapById[doc.id] = doc.data();
    });
    const firstDoc = nodes.docs.find(doc => doc.data().title === "Types of Written Content");
    const firstData = firstDoc?.data();
    const generateResponse = await generateArticleTypesFromNodes(firstData, null);
    return res.status(200).json(generateResponse);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

export default handler;
