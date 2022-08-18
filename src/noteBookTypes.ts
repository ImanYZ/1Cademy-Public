import { Timestamp } from "firebase/firestore"

import { KnowledgeChoice } from "./knowledgeTypes"
import { UserNodesData } from "./nodeBookTypes"
import { NodeType } from "./types"

export type NodeFireStore = {
    aChooseUname: boolean;
    aFullname: string;
    aImgUrl?: string;
    admin: string;
    bookmarks?: number;
    changedAt: Timestamp;
    children: {
        node: string;
        label: string;
        title: string
    }[];
    choices: KnowledgeChoice[];
    closedHeight?: number;
    comments: number;
    content: string;
    contribNames: string[];
    contributors: {
        [key: string]: {
            chooseUname: boolean;
            fullname: string;
            imageUrl: string;
            reputation: number;
        };
    };
    corrects: number;
    createdAt: Timestamp;
    deleted: boolean;
    height: number;
    institNames: string[];
    institutions: {
        [key: string]: { reputation?: number };
    };
    isTag: boolean;
    maxVersionRating?: number;
    nodeImage?: string;
    nodeType: NodeType;
    parents: { node: string; label: string; title: string }[];
    referenceIds: string[];
    referenceLabels: string[];
    references: string[];
    studied: number;
    tagIds: string[];
    tags: string[];
    title: string;
    updatedAt: Timestamp;
    versions?: number;
    viewers?: number;
    wrongs: number;
}

export type UserNodeChanges = { cType: string, uNodeId: string, uNodeData: UserNodesData }

export type NodesData = { cType: string, nId: string, nData: NodeFireStore, } | null

export type FullNodeData = Omit<UserNodesData, 'changedAt' | 'createdAt' | 'updatedAt'> &
    Omit<NodeFireStore, 'changedAt' | 'createdAt' | 'updatedAt'> &
{
    editable: boolean,
    left: number,
    openHeight?: number,
    top: number,
    userNodeId: string,
    nodeChangeType: string /*'added' | ''*/
    userNodeChangeType: string /*'added' | ''*/
    firstVisit: Date,
    lastVisit: Date,
    changedAt: Date,
    createdAt: Date,
    updatedAt: Date,
}
