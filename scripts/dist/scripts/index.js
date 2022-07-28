"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_1 = require("../lib/firestoreServer/admin");
const helper_1 = require("./helper");
const populateIndex_1 = __importDefault(require("./populateIndex"));
const getUsersFromFirestore = async () => {
    let users = [];
    const usersDocs = await admin_1.db.collection("users").get();
    for (let userDoc of usersDocs.docs) {
        const userData = userDoc.data();
        const name = `${userData.fName || ""} ${userData.lName || ""}`;
        users.push({ name, username: userDoc.id, imageUrl: userData.imageUrl });
    }
    return users;
};
const getInstitutionsFirestore = async () => {
    const institutionDocs = await admin_1.db.collection("institutions").get();
    return institutionDocs.docs.map(institutionDoc => {
        const institutionData = institutionDoc.data();
        const institutionName = institutionData.name || "";
        return { id: institutionDoc.id, name: institutionName, logoURL: institutionData.logoURL };
    });
};
const getNodeTags = (nodeData) => {
    const tags = [];
    if (nodeData.tagIds) {
        for (let tagIdx = 0; tagIdx < nodeData.tagIds.length; tagIdx++) {
            tags.push(nodeData.tags[tagIdx]);
        }
    }
    else {
        const tagsField = nodeData.tags;
        for (let tag of tagsField) {
            if (tag.node && tag.title) {
                tags.push(tag.title);
            }
        }
    }
    return tags;
};
const getInstitutionsName = (nodeData) => {
    const institutions = [];
    const institObjs = Object.keys(nodeData.institutions || {});
    for (let name of institObjs) {
        institutions.push(name);
    }
    return institutions;
};
const getContributorsName = (nodeData) => {
    const contributorsNodes = Object.entries(nodeData.contributors || {});
    const contributors = contributorsNodes.map(el => el[0]);
    return contributors;
};
const getNodesData = (nodeDocs) => {
    const getContributorsFromNode = (nodeData) => {
        return Object.entries(nodeData.contributors || {})
            .map(cur => ({ ...cur[1], username: cur[0] }))
            .sort((a, b) => (b.reputation = a.reputation))
            .map(contributor => ({
            fullName: contributor.fullname,
            imageUrl: contributor.imageUrl,
            username: contributor.username
        }));
    };
    const getInstitutionsFromNode = (nodeData) => {
        return Object.entries(nodeData.institutions || {})
            .map(cur => ({ name: cur[0], reputation: cur[1].reputation || 0 }))
            .sort((a, b) => b.reputation - a.reputation)
            .map(institution => ({ name: institution.name }));
    };
    return nodeDocs.docs.map((nodeDoc) => {
        const nodeData = nodeDoc.data();
        const contributors = getContributorsFromNode(nodeData);
        const contributorsNames = getContributorsName(nodeData);
        const institutions = getInstitutionsFromNode(nodeData);
        const institutionsNames = getInstitutionsName(nodeData);
        const tags = getNodeTags(nodeData);
        const references = (0, helper_1.getNodeReferences)(nodeData);
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
            wrongs: nodeData.wrongs || 0
        };
    });
};
const retrieveNode = async (nodeId) => {
    const nodeDoc = await admin_1.db.collection("nodes").doc(nodeId).get();
    const nodeData = nodeDoc.data();
    if (!nodeDoc.exists || !nodeData) {
        return null;
    }
    return nodeData;
};
const getReferencesData = async (nodeDocs) => {
    const references = nodeDocs.docs
        .map(nodeDoc => {
        const nodeData = nodeDoc.data();
        const data = (0, helper_1.getNodeReferences)(nodeData);
        return data;
    })
        .flat();
    const fullReferences = await Promise.all(references.map(async (reference) => {
        const nodeReference = await retrieveNode(reference.node);
        return {
            node: reference.node,
            title: nodeReference?.title || "",
            label: reference.label
        };
    }));
    const processedReferences = fullReferences.reduce((referencesSet, currentReference) => {
        const indexReference = referencesSet.findIndex(cur => cur.title === currentReference.title);
        const processedReference = {
            title: currentReference.title,
            data: [{ label: currentReference.label, node: currentReference.node }]
        };
        if (indexReference < 0)
            return [...referencesSet, processedReference];
        referencesSet[indexReference].data = [...referencesSet[indexReference].data, ...processedReference.data];
        return referencesSet;
    }, []);
    return { processedReferences };
};
const fillInstitutionsIndex = async (forceReIndex) => {
    const data = await getInstitutionsFirestore();
    const fields = [
        { name: "id", type: "string" },
        { name: "name", type: "string" }
    ];
    await (0, populateIndex_1.default)("institutions", fields, data, forceReIndex);
};
const fillUsersIndex = async (forceReIndex) => {
    const data = await getUsersFromFirestore();
    const fields = [
        { name: "username", type: "string" },
        { name: "name", type: "string" },
        { name: "imageUrl", type: "string" }
    ];
    await (0, populateIndex_1.default)("users", fields, data, forceReIndex);
};
const fillNodesIndex = async (nodeDocs, forceReIndex) => {
    const data = getNodesData(nodeDocs);
    const fields = [
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
        { name: "institNames", type: "string[]" }
    ];
    await (0, populateIndex_1.default)("nodes", fields, data, forceReIndex);
};
const fillReferencesIndex = async (nodeDocs, forceReIndex) => {
    const { processedReferences } = await getReferencesData(nodeDocs);
    const fieldsProcessedReferences = [{ name: "title", type: "string" }];
    if (!processedReferences.length) {
        return;
    }
    await (0, populateIndex_1.default)("processedReferences", fieldsProcessedReferences, processedReferences, forceReIndex);
};
const main = async () => {
    await fillUsersIndex(true);
    await fillInstitutionsIndex(true);
    const nodeDocs = await admin_1.db.collection("nodes").get();
    await fillNodesIndex(nodeDocs, true);
    await fillReferencesIndex(nodeDocs, true);
};
main();
