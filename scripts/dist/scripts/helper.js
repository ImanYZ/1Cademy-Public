"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNodeReferences = void 0;
const getNodeReferences = (nodeData) => {
    const references = [];
    if (!nodeData.references || nodeData.references.length === 0) {
        return [];
    }
    //The "references" field in the DB can be an array ofra objects or an array of strings
    if (typeof (nodeData.references || [])[0] !== "object") {
        //In this case the field is an array of strings
        const referenceIds = nodeData.referenceIds || [];
        for (let refIdx = 0; refIdx < referenceIds.length; refIdx++) {
            const referenceLabels = nodeData.referenceLabels || [];
            references.push({
                node: referenceIds[refIdx],
                title: nodeData.references[refIdx],
                label: referenceLabels[refIdx] || ""
            });
        }
    }
    else {
        //In this case the field is an array of objects
        const referencesField = nodeData.references;
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
exports.getNodeReferences = getNodeReferences;
