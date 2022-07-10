import { db } from "@/lib/admin";

function nodesData() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  const nodesDocs = await db.collection("nodes").where("deleted", "==", false).get();
  if (nodesDocs.docs.length === 0) {
    res.writeHeader(404, { "Content-Type": "text/xml" });
    res.write("No Nodes Exist!");
    res.end();
  } else {
    if (nodesDocs.docs.length > 0) {
      const createCsvWriter = require("csv-writer").createObjectCsvWriter;
      const csvWriter = createCsvWriter({
        path: "nodesData.csv",
        header: [
          { id: "id", title: "id" },
          { id: "admin", title: "admin" },
          { id: "changedAt", title: "changedAt" },
          { id: "children", title: "children" },
          { id: "childrenLength", title: "childrenLength" },
          { id: "choices", title: "choices" },
          { id: "choicesLength", title: "choicesLength" },
          { id: "closedHeight", title: "closedHeight" },
          { id: "comments", title: "comments" },
          { id: "content", title: "content" },
          { id: "corrects", title: "corrects" },
          { id: "createdAt", title: "createdAt" },
          { id: "deleted", title: "deleted" },
          { id: "height", title: "height" },
          { id: "maxVersionRating", title: "maxVersionRating" },
          { id: "nodeImage", title: "nodeImage" },
          { id: "nodeType", title: "nodeType" },
          { id: "parents", title: "parents" },
          { id: "parentsLength", title: "parentsLength" },
          { id: "references", title: "references" },
          { id: "referencesLength", title: "referencesLength" },
          { id: "studied", title: "studied" },
          { id: "tags", title: "tags" },
          { id: "tagsLength", title: "tagsLength" },
          { id: "title", title: "title" },
          { id: "updatedAt", title: "updatedAt" },
          { id: "versions", title: "versions" },
          { id: "viewers", title: "viewers" },
          { id: "wrongs", title: "wrongs" }
        ]
      });
      const data = [];
      for (let nodeDoc of nodesDocs.docs) {
        console.log({ node: nodeDoc.id });
        const nodeData = nodeDoc.data();
        nodeData.id = nodeDoc.id;
        if ("changedAt" in nodeData && nodeData.changedAt) {
          nodeData.changedAt = nodeData.changedAt.toDate();
        }
        if ("createdAt" in nodeData && nodeData.createdAt) {
          nodeData.createdAt = nodeData.createdAt.toDate();
        }
        if ("updatedAt" in nodeData && nodeData.updatedAt) {
          nodeData.updatedAt = nodeData.updatedAt.toDate();
        }
        if ("children" in nodeData && nodeData.children) {
          nodeData.childrenLength = nodeData.children.length;
          nodeData.children = JSON.stringify(nodeData.children);
        } else {
          nodeData.children = "";
          nodeData.childrenLength = 0;
        }
        if ("choices" in nodeData && nodeData.choices) {
          nodeData.choicesLength = nodeData.choices.length;
          nodeData.choices = JSON.stringify(nodeData.choices);
        } else {
          nodeData.choices = "";
          nodeData.choicesLength = 0;
        }
        if ("parents" in nodeData && nodeData.parents) {
          nodeData.parentsLength = nodeData.parents.length;
          nodeData.parents = JSON.stringify(nodeData.parents);
        } else {
          nodeData.parents = "";
          nodeData.parentsLength = 0;
        }
        if ("references" in nodeData && nodeData.references) {
          nodeData.referencesLength = nodeData.references.length;
          nodeData.references = JSON.stringify(nodeData.references);
        } else {
          nodeData.references = "";
          nodeData.referencesLength = 0;
        }
        if ("tags" in nodeData && nodeData.tags) {
          nodeData.tagsLength = nodeData.tags.length;
          nodeData.tags = JSON.stringify(nodeData.tags);
        } else {
          nodeData.tags = "";
          nodeData.tagsLength = 0;
        }
        data.push(nodeData);
      }
      csvWriter
        .writeRecords(data)
        .then(() => console.log("The CSV file was written successfully."))
        .catch(err => console.log("Error:", err));
    }
  }
  return {
    props: {}
  };
}

export default nodesData;
