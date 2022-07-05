import React from 'react'

import { ProposalInput } from '../src/knowledgeTypes'

export const buildProposal = ({ children, content, nodeImage, parents, referenceIds, referenceLabels, references, tagIds, tags, title, node, reason }: ProposalInput) => {
    return {
        accepted: false,
        addedInstitContris: false,
        awards: 0,
        children,           // FORM
        chooseUname: false,
        content,            // FORM
        contributors: [],
        corrects: 0,
        createdAt: new Date(),
        deleted: false,
        fullname: 'UNKNOWN UNKNOWN',
        imageUrl: 'UNKNOWN',
        institutions: [],
        newChild: true,     // IF THEY PROPOSE A NEW NODE, true; IF THEY PROPOSE AN IMPROVEMENT TO AN EXISTING NODE, false.
        node,               // FORM: THE ID OF THE NODE WHERE THEY PROPOSE THIS CHILD?IMPROVEMENT
        nodeImage,          // FORM
        parents,            //FORM
        referenceIds,       // FORM
        referenceLabels,    // FORM
        references,         // FORM
        summary: reason,    // FORM:REASONING FOR WHY THEY PROPOSE THIS CHANGE.
        tagIds,             // FORM
        tags,               // FORM
        title,              // FORM
        updatedAt: new Date(),
        viewers: 0,
        wrongs: 0,
    }
}
