require("dotenv").config();
import { App, cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

import { getNodeReferences } from "./helper";
import indexCollection from "./populateIndex";
import { NodeFireStore, TypesenseNodesSchema, TypesenseProcessedReferences } from "./types";

// Retrieve Job-defined env vars
const { CLOUD_RUN_TASK_ATTEMPT = 0 } = process.env;
// Retrieve User-defined env vars
const CLOUD_RUN_TASK_INDEX = parseInt(process.env.CLOUD_RUN_TASK_INDEX || "0");

const firebaseApp: App = initializeApp({
  credential: cert({
    type: process.env.ONECADEMYCRED_TYPE,
    project_id: process.env.ONECADEMYCRED_PROJECT_ID,
    private_key_id: process.env.ONECADEMYCRED_PRIVATE_KEY_ID,
    private_key: process.env.ONECADEMYCRED_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.ONECADEMYCRED_CLIENT_EMAIL,
    client_id: process.env.ONECADEMYCRED_CLIENT_ID,
    auth_uri: process.env.ONECADEMYCRED_AUTH_URI,
    token_uri: process.env.ONECADEMYCRED_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.ONECADEMYCRED_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.ONECADEMYCRED_CLIENT_X509_CERT_URL,
    storageBucket: process.env.ONECADEMYCRED_STORAGE_BUCKET,
    databaseURL: process.env.ONECADEMYCRED_DATABASE_URL,
  } as any),
});

export const db = getFirestore(firebaseApp);

const getUsersFromFirestore = async () => {
  let users: { name: string; username: string; imageUrl: string }[] = [];
  const usersDocs = await db.collection("users").get();
  for (let userDoc of usersDocs.docs) {
    const userData = userDoc.data();
    const name = `${userData.fName || ""} ${userData.lName || ""}`;
    users.push({ name, username: userDoc.id, imageUrl: userData.imageUrl });
  }
  return users;
};

const getInstitutionsFirestore = async () => {
  const institutionDocs = await db.collection("institutions").get();
  return institutionDocs.docs.map(institutionDoc => {
    const institutionData = institutionDoc.data();
    const institutionName: string = institutionData.name || "";
    return { id: institutionDoc.id, name: institutionName, logoURL: institutionData.logoURL };
  });
};

const getNodeTags = (nodeData: NodeFireStore) => {
  const tags: string[] = [];
  if (nodeData.tagIds) {
    for (let tagIdx = 0; tagIdx < nodeData.tagIds.length; tagIdx++) {
      tags.push((nodeData.tags as string[])[tagIdx]);
    }
  } else {
    const tagsField = nodeData.tags as {
      node: string;
      title?: string;
    }[];
    for (let tag of tagsField) {
      if (tag.node && tag.title) {
        tags.push(tag.title);
      }
    }
  }
  return tags;
};

const getInstitutionsName = (nodeData: NodeFireStore) => {
  const institutions: string[] = [];
  const institObjs = Object.keys(nodeData.institutions || {});

  for (let name of institObjs) {
    institutions.push(name);
  }

  return institutions;
};

const getContributorsName = (nodeData: NodeFireStore): string[] => {
  const contributorsNodes = Object.entries(nodeData.contributors || {});

  const contributors = contributorsNodes.map(el => el[0]);
  return contributors;
};

const getNodesData = (
  nodeDocs: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
): TypesenseNodesSchema[] => {
  const getContributorsFromNode = (nodeData: NodeFireStore) => {
    return Object.entries(nodeData.contributors || {})
      .map(
        cur =>
          ({ ...cur[1], username: cur[0] } as {
            fullname: string;
            imageUrl: string;
            reputation: number;
            username: string;
          })
      )
      .sort((a, b) => (b.reputation = a.reputation))
      .map(contributor => ({
        fullName: contributor.fullname,
        imageUrl: contributor.imageUrl,
        username: contributor.username,
      }));
  };

  const getInstitutionsFromNode = (nodeData: NodeFireStore) => {
    return Object.entries(nodeData.institutions || {})
      .map(cur => ({ name: cur[0], reputation: cur[1].reputation || 0 }))
      .sort((a, b) => b.reputation - a.reputation)
      .map(institution => ({ name: institution.name }));
  };

  return nodeDocs.docs.map((nodeDoc): TypesenseNodesSchema => {
    const nodeData = nodeDoc.data() as NodeFireStore;
    const contributors = getContributorsFromNode(nodeData);
    const contributorsNames = getContributorsName(nodeData);
    const institutions = getInstitutionsFromNode(nodeData);
    const institutionsNames = getInstitutionsName(nodeData);
    const tags = getNodeTags(nodeData);
    const references = getNodeReferences(nodeData);

    const titlesReferences = references.map(cur => cur.title || "").filter(cur => cur);
    const labelsReferences = references.map(cur => cur.label).filter(cur => cur);

    return {
      changedAt: nodeData.changedAt.toDate().toISOString(),
      changedAtMillis: nodeData.changedAt?.toMillis() || 0,
      choices: nodeData.choices,
      content: nodeData.content || "",
      contribNames: nodeData.contribNames || [],
      institNames: nodeData.institNames || [],
      contributors,
      contributorsNames,
      corrects: nodeData.corrects || 0,
      mostHelpful: (nodeData.corrects || 0) - (nodeData.wrongs || 0),
      id: nodeDoc.id,
      institutions,
      institutionsNames,
      labelsReferences,
      nodeImage: nodeData.nodeImage,
      nodeType: nodeData.nodeType,
      isTag: nodeData.isTag || false,
      tags,
      title: nodeData.title || "",
      titlesReferences,
      updatedAt: nodeData.updatedAt?.toMillis() || 0,
      wrongs: nodeData.wrongs || 0,
    };
  });
};

const retrieveNode = async (nodeId: string): Promise<NodeFireStore | null> => {
  const nodeDoc = await db.collection("nodes").doc(nodeId).get();
  const nodeData = nodeDoc.data();

  if (!nodeDoc.exists || !nodeData) {
    return null;
  }
  return nodeData as NodeFireStore;
};

const getReferencesData = async (nodeDocs: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>) => {
  const references = nodeDocs.docs
    .map(nodeDoc => {
      const nodeData = nodeDoc.data() as NodeFireStore;
      const data = getNodeReferences(nodeData);
      return data;
    })
    .flat();

  const fullReferences = await Promise.all(
    references.map(async reference => {
      const nodeReference = await retrieveNode(reference.node);
      return {
        node: reference.node,
        title: nodeReference?.title || "",
        label: reference.label,
      };
    })
  );

  const processedReferences: TypesenseProcessedReferences[] = fullReferences.reduce(
    (referencesSet: TypesenseProcessedReferences[], currentReference): TypesenseProcessedReferences[] => {
      const indexReference = referencesSet.findIndex(cur => cur.title === currentReference.title);
      const processedReference: TypesenseProcessedReferences = {
        title: currentReference.title,
        data: [{ label: currentReference.label, node: currentReference.node }],
      };
      if (indexReference < 0) return [...referencesSet, processedReference];
      referencesSet[indexReference].data = [...referencesSet[indexReference].data, ...processedReference.data];
      return referencesSet;
    },
    []
  );

  return { processedReferences };
};

const fillInstitutionsIndex = async (forceReIndex?: boolean) => {
  const data = await getInstitutionsFirestore();
  const fields: CollectionFieldSchema[] = [
    { name: "id", type: "string" },
    { name: "name", type: "string" },
  ];

  await indexCollection("institutions", fields, data, forceReIndex);
};

const fillUsersIndex = async (forceReIndex?: boolean) => {
  const data = await getUsersFromFirestore();
  const fields: CollectionFieldSchema[] = [
    { name: "username", type: "string" },
    { name: "name", type: "string" },
    { name: "imageUrl", type: "string" },
  ];
  await indexCollection("users", fields, data, forceReIndex);
};

const fillNodesIndex = async (
  nodeDocs: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  forceReIndex?: boolean
) => {
  const data = getNodesData(nodeDocs);
  const fields: CollectionFieldSchema[] = [
    { name: "changedAtMillis", type: "int64" },
    { name: "content", type: "string" },
    { name: "contributorsNames", type: "string[]" },
    { name: "mostHelpful", type: "int32" },
    { name: "corrects", type: "int32" },
    { name: "labelsReferences", type: "string[]" },
    { name: "institutionsNames", type: "string[]" },
    { name: "nodeType", type: "string" },
    { name: "tags", type: "string[]" },
    { name: "title", type: "string" },
    { name: "titlesReferences", type: "string[]" },
    { name: "isTag", type: "bool" },
    { name: "institNames", type: "string[]" },
  ];

  await indexCollection("nodes", fields, data, forceReIndex);
};

const fillReferencesIndex = async (
  nodeDocs: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  forceReIndex?: boolean
) => {
  const { processedReferences } = await getReferencesData(nodeDocs);

  const fieldsProcessedReferences: CollectionFieldSchema[] = [{ name: "title", type: "string" }];
  if (!processedReferences.length) {
    return;
  }
  await indexCollection("processedReferences", fieldsProcessedReferences, processedReferences, forceReIndex);
};

const main = async () => {
  console.log(`Starting Task #${CLOUD_RUN_TASK_INDEX}, Attempt #${CLOUD_RUN_TASK_ATTEMPT}...`);
  console.log(`Begin indexing at ${new Date().toISOString()}`);
  // if (CLOUD_RUN_TASK_INDEX === 0) {
  console.log("Index users tasks");
  await fillUsersIndex(true);
  // }
  // if (CLOUD_RUN_TASK_INDEX === 1) {
  console.log("Index Institutions task");
  await fillInstitutionsIndex(true);
  // }
  // if (CLOUD_RUN_TASK_INDEX === 2) {
  console.log("Index Nodes and References task");
  const nodeDocs = await db.collection("nodes").get();
  await fillNodesIndex(nodeDocs, true);
  await fillReferencesIndex(nodeDocs, true);
  // }
  console.log(`End indexing at ${new Date().toISOString()}`);
  console.log(`Completed Task #${CLOUD_RUN_TASK_INDEX}.`);
};

// Start script
console.log("going to start the script");
main().catch(err => {
  console.log("Error occurred in typesense indexer:", err);
  console.error(err);
  process.exit(1); // Retry Job Task by exiting the process
});
