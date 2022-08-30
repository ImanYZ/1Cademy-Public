import { NextApiRequest, NextApiResponse } from "next";

import { checkRestartBatchWriteCounts, commitBatch, db } from "../../lib/firestoreServer/admin";

const addTagIdToSingleCollection = async ({ batch, collectionName, nodeIds, writeCounts }: any) => {
  let newBatch = batch;
  const collsDocs = await db.collection(collectionName).get();
  for (let collDoc of collsDocs.docs) {
    const collRef = db.collection(collectionName).doc(collDoc.id);
    const collData = collDoc.data();
    let title = collData.tag;
    switch (title) {
      case "Life Science":
        title = "Life Science / Biology";
        break;
      case "Deep Feedforward Networks (Multilayer Perceptrons)":
        title = "Deep Feedforward Networks (MLP = Multi-Layer Perceptrons)";
        break;
      case "Computing Science":
        title = "Computing Sciences";
        break;
      case "The Bulletin of Mathematical Biology papers related to Fatality of COVID-19":
        title = "Bioinformatics for COVID-19";
        break;
      case "Python programming language":
        title = "Python Programming Language";
        break;
      case "K-nearest Neighbors":
        title = "K-nearest Neighbors (k-NN)";
        break;
      case "Branches of Science":
        title = "Categories of Science";
        break;
      case "Sub-fields (and focuses) of psychology":
        title = "Sub-fields of psychology";
        break;
      case "Psychological effects of COVID-19 pandemic":
        title = "Psychological Effects of COVID-19 Pandemic";
        break;
      case " Diabetes & Metabolic Syndrome: Clinical Research & Reviews Papers for Virology":
        title =
          " Diabetes & Metabolic Syndrome: Clinical Research & Reviews Papers for COVID-19 Virology";
        break;
    }
    if (
      [
        "Epistemological Orientations of Induction and Deduction",
        "Focus of Epidemiological studies on SARS-CoV",
      ].includes(title)
    ) {
      newBatch.delete(collRef);
      [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
    } else {
      if (!(title in nodeIds)) {
        console.log("A tag node with title: " + title + " does not exist!");
      } else {
        newBatch.update(collRef, { tagId: nodeIds[title] });
        [newBatch, writeCounts] = await checkRestartBatchWriteCounts(newBatch, writeCounts);
      }
    }
  }
  return [newBatch, writeCounts];
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let batch = db.batch();
    let writeCounts = 0;

    const nodesDocs = await db.collection("nodes").get();
    const nodeIds: any = {};
    for (let nodeDoc of nodesDocs.docs) {
      const nodeData = nodeDoc.data();
      if (nodeData.isTag) {
        nodeIds[nodeData.title] = nodeDoc.id;
      }
    }


    const collNames = ["credits", "practiceCompletion", "practiceLog", "presentations"];
    for (let collName of collNames) {
      [batch, writeCounts] = await addTagIdToSingleCollection({ batch, collectionName: collName, nodeIds, writeCounts });
    }

    await commitBatch(batch);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;