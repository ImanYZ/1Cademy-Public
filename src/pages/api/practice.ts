import { NextApiRequest, NextApiResponse } from "next";

import {
  admin,
  db
} from "../../lib/firestoreServer/admin";

const get_ancestors = ({ nodeId, nodes, ancestors }: any) => {
  if (nodeId in ancestors) {
    return ancestors[nodeId];
  }
  ancestors[nodeId] = [];
  const node = nodes.find((n: any) => n.id === nodeId);
  for (let parent of node.parents) {
    if (!ancestors[nodeId].includes(parent.node)) {
      ancestors[nodeId].push(parent.node);
      ancestors[parent.node] = get_ancestors({ nodeId: parent.node, nodes, ancestors });
      for (let ancestor of ancestors[parent.node]) {
        if (!ancestors[nodeId].includes(ancestor)) {
          ancestors[nodeId].push(ancestor);
        }
      }
    }
  }
  return ancestors[nodeId];
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let available_flashcards: any[] = [];
    let nodes: any[] = [];
    let ancestors: any = {};
    let ordered_ancestors_nums: any[] = [];
    let theNode;
    let fCard: any;
    const flashcardsQuery = db
      .collection("practice")
      .where("user", "==", req.body.data.user.userData.uname)
      .where("tagId", "==", req.body.data.user.userData.tagId);
    const flashcardsDocs = await flashcardsQuery.get();
    const nodesQuery = db
      .collection("nodes")
      .where("deleted", "==", false)
      .where("tagIds", "array-contains", req.body.data.user.userData.tagId);
    const nodesDocs = await nodesQuery.get();
    for (let node of nodesDocs.docs) {
      nodes.push({ ...node.data(), id: node.id });
    }
    const question_ids = [];
    flashcardsDocs.forEach((flashcard) => {
      // Select only those where enough time has passed since last presentation.
      const fData: any = { ...flashcard.data(), id: flashcard.id };
      if (new Date() >= fData.nextDate.toDate()) {
        question_ids.push(fData.node);
        ancestors[fData.node] = get_ancestors({ nodeId: fData.node, nodes, ancestors });
        ordered_ancestors_nums.push([fData.node, ancestors[fData.node].length]);
        available_flashcards.push(fData);
      }
    });
    ordered_ancestors_nums.sort((a, b) => a[1] - b[1]);
    fCard = available_flashcards.find((f: any) => f.node === ordered_ancestors_nums[0][0]);
    theNode = nodes.find((n: any) => n.id === fCard.node);
    const userNodeQuery = db
      .collection("userNodes")
      .where("node", "==", fCard.node)
      .where("user", "==", req.body.data.user.userData.uname)
      .limit(1);
    const userNodeDocs = await userNodeQuery.get();
    const userNodeData = userNodeDocs.docs[0].data();
    theNode = {
      id: fCard.node,
      choices: theNode.choices.map((c: any) => {
        return { choice: c.choice };
      }),
      content: theNode.content,
      corrects: theNode.corrects,
      nodeImage: theNode.nodeImage,
      nodeVideo: theNode.nodeVideo,
      nodeAudio: theNode.nodeAudio,
      studied: theNode.studied,
      title: theNode.title,
      wrongs: theNode.wrongs,
      correct: userNodeData.correct,
      isStudied: userNodeData.isStudied,
      wrong: userNodeData.wrong,
    };
    const currentTimestamp = admin.firestore.Timestamp.fromDate(new Date());
    // This is required to only check answers after this timestamp in do_check_answer().
    const flashcardRef = db.collection("practice").doc(fCard.id);
    await flashcardRef.set({
      lastPresented: currentTimestamp,
      updatedAt: currentTimestamp,
    });
    return res.json({
      flashcardId: fCard.id,
      question: theNode,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;