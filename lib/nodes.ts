// import { firestore } from "firebase-admin";
import geoip from "geoip-lite";

import {
  KnowledgeNode,
  KnowledgeNodeContributor,
  KnowledgeNodeInstitution,
  LinkedKnowledgeNode,
  NodeFireStore
} from "../src/knowledgeTypes";
import { admin, batchSet, commitBatch, db } from "./admin";

export const getAllNodeParamsForStaticProps = async () => {
  return [];
};

// export const getNodesByIds = async (nodeIds: string[]): Promise<SimpleNode[]> => {
//   if (nodeIds.length === 0) {
//     return [];
//   }

//   const nodeDocs = await db.collection("nodes").where(firestore.FieldPath.documentId(), "in", nodeIds).get();

//   const simpleNodes = nodeDocs.docs
//     .map(nodeDoc => {
//       const nodeData = nodeDoc.data() as NodeFireStore;
//       return {
//         ...nodeData,
//         id: nodeDoc.id,
//         tags: getNodeTags(nodeData)
//       };
//     })
//     .map((nodeData): SimpleNode => {
//       const tags = getNodeTags(nodeData).map(tag => tag.title || "");
//       // .filter(tag => tag)
//       // .map(tag => ({ title: tag }));
//       const contributors = Object.entries(nodeData.contributors || {})
//         .map(cur => cur[1] as { fullname: string; imageUrl: string; reputation: number })
//         .sort((a, b) => (b.reputation = a.reputation))
//         .map(contributor => ({ fullName: contributor.fullname, imageUrl: contributor.imageUrl }));

//       const institutions = Object.entries(nodeData.institutions || {})
//         .map(cur => ({ name: cur[0], reputation: cur[1].reputation || 0 }))
//         .sort((a, b) => b.reputation - a.reputation)
//         .map(institution => ({ name: institution.name }));

//       return {
//         id: nodeData.id,
//         title: nodeData.title,
//         content: nodeData.content,
//         choices: nodeData.choices || [],
//         nodeType: nodeData.nodeType,
//         nodeImage: nodeData.nodeImage,
//         changedAt: nodeData.changedAt.toDate().toISOString(),
//         corrects: nodeData.corrects,
//         wrongs: nodeData.wrongs,
//         tags,
//         contributors,
//         institutions
//       };
//     });

//   return simpleNodes;
// };

// Retrieve all helpful data about the node corresponding to nodeId.
// const contentHTML = await getNodeHTMLContent(nodeData.content);
// In onecademy database, we have:
// "references" with the structure {node: ..., title: ..., label: ...}
// and "tags" with the structure {node: ..., title: ...}.
// In onecademy-dev database, we refactorred the structure of references and tags.
// There, we have the following arrays for references and tags; in each set of
// arrays, there is a one-to-one correspondance between the items with the same index:
// references: an array of reference node titles that this node is citing
// referenceIds: an array of reference node ids that this node is citing
// referenceLabels: an array lables indicating how this reference node is veing cited
// tags: an array of tag node titles that this node is citing
// tagIds: an array of tag node ids that this node is citing
// Because we have not migrated 1Cademy.com in production to the new data structure
// yet, we should cover both structures for now. Later, after deploying the new
// version of 1Cademy.com, we will rewrite this part of the code.
const retrieveNode = async (nodeId: string): Promise<NodeFireStore | null> => {
  const nodeDoc = await db.collection("nodes").doc(nodeId).get();
  const nodeData = nodeDoc.data();

  if (!nodeDoc.exists || !nodeData) {
    return null;
  }
  return nodeData as NodeFireStore;
};

const convertDateFieldsToString = (
  nodeData: NodeFireStore
): { updatedAt?: string; changedAt?: string; createdAt?: string } => {
  return {
    updatedAt: nodeData.updatedAt?.toDate().toISOString(),
    changedAt: nodeData.changedAt?.toDate().toISOString(),
    createdAt: nodeData.createdAt?.toDate().toISOString()
  };
};

const getNodeReferences = (nodeData: NodeFireStore) => {
  const references: { node: string; title?: string; label: string }[] = [];
  //The "references" field in the DB can be an array ofra objects or an array of strings
  if (typeof (nodeData.references || [])[0] !== "object") {
    //In this case the field is an array of strings
    const referenceIds = nodeData.referenceIds || [];
    for (let refIdx = 0; refIdx < referenceIds.length; refIdx++) {
      const referenceLabels = nodeData.referenceLabels || [];
      references.push({
        node: referenceIds[refIdx],
        title: (nodeData.references as string[])[refIdx],
        label: referenceLabels[refIdx] || ""
      });
    }
  } else {
    //In this case the field is an array of objects
    const referencesField = nodeData.references as {
      node: string;
      title?: string;
      label: string;
    }[];
    for (let reference of referencesField) {
      if (reference.node && reference.title) {
        references.push({
          node: reference.node,
          title: reference.title,
          label: reference.label
        });
      }
    }
  }
  return references;
};

const getNodeTags = (nodeData: NodeFireStore) => {
  const tags: { node: string; title?: string }[] = [];
  if (nodeData.tagIds) {
    for (let tagIdx = 0; tagIdx < nodeData.tagIds.length; tagIdx++) {
      tags.push({
        node: nodeData.tagIds[tagIdx],
        title: (nodeData.tags as string[])[tagIdx]
      });
    }
  } else {
    const tagsField = nodeData.tags as {
      node: string;
      title?: string;
    }[];
    for (let tag of tagsField) {
      if (tag.node && tag.title) {
        tags.push({
          node: tag.node,
          title: tag.title
        });
      }
    }
  }
  return tags;
};

const getFullNodeTag = async (nodeData: NodeFireStore) => {
  const nodeTags = getNodeTags(nodeData);
  const convertedTags: LinkedKnowledgeNode[] = [];
  for (let tag of nodeTags) {
    const tagData = await retrieveNode(tag.node || "");
    if (!tagData) {
      continue;
    }
    convertedTags.push({
      node: tag.node,
      title: tagData.title,
      content: tagData.content,
      nodeImage: tagData.nodeImage,
      nodeType: tagData.nodeType
    });
  }

  return convertedTags
}

// Endpoint retrieving the node data and its direct parents,children and siblings
// data based on the id requested.
export const getNodeData = async (id: string): Promise<KnowledgeNode | null> => {
  const nodeData = await retrieveNode(id);

  if (!nodeData) {
    return null;
  }

  // Retrieve the content of all the direct children of the node.
  const childrenConverted: LinkedKnowledgeNode[] = [];
  for (let child of nodeData.children || []) {
    const childData = await retrieveNode(child.node || "");
    if (!childData) {
      continue;
    }
    childrenConverted.push({
      node: child.node as string,
      title: childData.title,
      content: childData.content,
      nodeImage: childData.nodeImage,
      nodeType: childData.nodeType
    });
  }
  // Retrieve the content of all the direct parents of the node.
  const parentsConverted: LinkedKnowledgeNode[] = [];
  const siblingsConverted: LinkedKnowledgeNode[] = [];
  for (let parent of nodeData.parents || []) {
    const parentData = await retrieveNode(parent.node || "");
    if (!parentData) {
      continue;
    }
    parentsConverted.push({
      node: parent.node as string,
      title: parentData.title,
      content: parentData.content,
      nodeImage: parentData.nodeImage,
      nodeType: parentData.nodeType
    });

    //Retrieve sibling nodes
    for (let children of parentData.children || []) {
      const childrenData = await retrieveNode(children.node || "");
      if (!childrenData) {
        continue;
      }
      siblingsConverted.push({
        node: children.node as string,
        title: childrenData.title,
        content: childrenData.content,
        nodeImage: childrenData.nodeImage,
        nodeType: childrenData.nodeType
      });
    }
  }
  // Retrieve the content of all the tags of the node.
  const convertedTags: LinkedKnowledgeNode[] = await getFullNodeTag(nodeData)

  // Retrieve the content of all the references of the node.
  const nodeReferences = getNodeReferences(nodeData);
  const convertedReferences: LinkedKnowledgeNode[] = [];
  for (let reference of nodeReferences) {
    const referenceData = await retrieveNode(reference.node);
    if (!referenceData) {
      continue;
    }
    convertedReferences.push({
      label: reference.label,
      node: reference.node,
      title: referenceData.title,
      content: referenceData.content,
      nodeImage: referenceData.nodeImage,
      nodeType: referenceData.nodeType
    });
  }

  // Descendingly sort the contributors array based on the reputation points.
  const contributorsNodes: KnowledgeNodeContributor[] = Object.entries(nodeData.contributors || {})
    .sort(([, aObj], [, bObj]) => {
      return (bObj.reputation || 0) - (aObj.reputation || 0);
    })
    .reduce<KnowledgeNodeContributor[]>(
      (previousValue, currentValue) => [...previousValue, { ...currentValue[1], username: currentValue[0] }],
      []
    );

  // Descendingly sort the contributors array based on the reputation points.
  const institObjs = Object.entries(nodeData.institutions || {}).sort(([, aObj], [, bObj]) => {
    return (bObj.reputation || 0) - (aObj.reputation || 0);
  });
  const institutionsNodes: KnowledgeNodeInstitution[] = [];
  for (let [name, obj] of institObjs) {
    const institutionDocs = await db.collection("institutions").where("name", "==", name).get();
    if (!institutionDocs.docs.length) continue;

    const institutionDoc = institutionDocs.docs[0];
    const logoURL = institutionDocs.docs.length > 0 ? institutionDoc.data().logoURL : "";
    institutionsNodes.push({ ...obj, logoURL, name, id: institutionDoc.id });
  }
  const {
    /* eslint-disable */
    updatedAt,
    changedAt,
    createdAt,
    tags,
    references,
    contributors,
    institutions,
    children,
    parents,
    /* eslint-enable */
    ...rest
  } = nodeData;
  nodeData;
  return {
    id,
    ...rest,
    ...convertDateFieldsToString(nodeData),
    children: childrenConverted,
    parents: parentsConverted,
    tags: convertedTags,
    references: convertedReferences,
    contributors: contributorsNodes,
    institutions: institutionsNodes,
    siblings: siblingsConverted
  };
};

// Get the user's useragent and location and log views in the database.
export const logViews = async (req: any, nodeId: string) => {
  let userAgent;
  if (req) {
    // if you are on the server and you get a 'req' property from your context
    userAgent = req.headers["user-agent"]; // get the user-agent from the headers
  } else {
    userAgent = navigator.userAgent; // if you are on the client you can access the navigator from the window object
  }
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? (forwarded as string).split(/, /)[0] : req.connection.remoteAddress;
  const geo = geoip.lookup(ip || "");
  const viewerRef = db.collection("viewers").doc();
  await batchSet(viewerRef, {
    nodeId,
    ip,
    userAgent,
    country: geo?.country,
    state: geo?.region,
    city: geo?.city
  });
  const viewNumRef = db.collection("viewNums").doc();
  await batchSet(viewNumRef, {
    nodeId,
    num: admin.firestore.FieldValue.increment(1)
  });
  const countryViewRef = db.collection("countryViews").doc();
  await batchSet(countryViewRef, {
    country: geo?.country,
    num: admin.firestore.FieldValue.increment(1)
  });
  const stateViewRef = db.collection("stateViews").doc();
  await batchSet(stateViewRef, {
    state: geo?.region,
    num: admin.firestore.FieldValue.increment(1)
  });
  const cityViewRef = db.collection("cityViews").doc();
  await batchSet(cityViewRef, {
    city: geo?.city,
    num: admin.firestore.FieldValue.increment(1)
  });
  const userAgentViewRef = db.collection("userAgentViews").doc();
  await batchSet(userAgentViewRef, {
    userAgent,
    num: admin.firestore.FieldValue.increment(1)
  });
  await commitBatch();
};
