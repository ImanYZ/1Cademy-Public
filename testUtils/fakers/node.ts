import { faker } from "@faker-js/faker";
import { Timestamp } from "firebase-admin/firestore";
import { IQuestionChoice } from "src/types/IQuestionChoice";
import { IUserNodeVersion } from "src/types/IUserNodeVersion";
import { IUserNodeVersionLog } from "src/types/IUserNodeVersionLog";

import { INode } from "../../src/types/INode";
import { INodeContributor } from "../../src/types/INodeContributor";
import { INodeInstitution } from "../../src/types/INodeInstitution";
import { INodeLink } from "../../src/types/INodeLink";
import { INodeType } from "../../src/types/INodeType";
import { INodeVersion } from "../../src/types/INodeVersion";
import { IUser } from "../../src/types/IUser";
import { IUserNode } from "../../src/types/IUserNode";

type IFakeNodeOptions = {
  documentId?: string;
  nodeType?: INodeType;
  nodeImage?: string;
  corrects?: number;
  wrongs?: number;
  versions?: INodeVersion[];
  tags?: INode[];
  userNodes?: IUserNode[];
  references?: INode[];
  parents?: INode[];
  children?: INode[];
  isTag?: boolean;
  proposers?: IUser[];
  admin?: IUser;
  choices?: IQuestionChoice[];
};

type IFakeNodeVersionOptions = {
  documentId?: string;
  childType?: INodeType;
  proposer?: IUser;
  corrects?: number;
  wrongs?: number;
  node?: INode;
  tags?: INode[];
  references?: INode[];
  parents?: INode[];
  children?: INode[];
  accepted?: boolean;
  addedParents?: boolean;
  removedParents?: boolean;
  viewers?: number;
  choices?: IQuestionChoice[];
};

export function createNode(params: IFakeNodeOptions): INode {
  let contributors: { [key: string]: INodeContributor } = {};
  let contribNames: string[] = [];
  let institNames: string[] = [];
  let institutions: { [key: string]: INodeInstitution } = {};
  if (params.proposers) {
    for (const proposer of params.proposers) {
      if (!contribNames.includes(proposer.uname)) {
        contribNames.push(proposer.uname);
        contributors[proposer.uname] = {
          chooseUname: proposer.chooseUname ? proposer.chooseUname : false,
          fullname: `${proposer.fName} ${proposer.lName}`,
          imageUrl: proposer.imageUrl,
          reputation: 0, // TODO: add according community
        } as INodeContributor;
      }
      if (!institNames.includes(proposer.deInstit)) {
        institNames.push(proposer.deInstit);
        institutions[proposer.deInstit] = {
          reputation: 0, // TODO: add reputation of instituate according community
        };
      }
    }
  }

  const { choices } = params;

  return {
    documentId: params.documentId ? params.documentId : faker.datatype.uuid(),
    aChooseUname: params.admin ? params.admin.chooseUname : faker.datatype.boolean(),
    aImgUrl: params.admin ? params.admin.imageUrl : faker.image.imageUrl(),
    aFullname: params.admin ? `${params.admin.fName} ${params.admin.lName}` : faker.datatype.string(),
    admin: params.admin ? params.admin.uname : faker.internet.userName(),
    corrects: typeof params.corrects !== "undefined" ? params.corrects : 0,
    wrongs: typeof params.wrongs !== "undefined" ? params.wrongs : 0,
    nodeType: params.nodeType ? params.nodeType : ("Concept" as INodeType),
    contribNames,
    contributors,
    title: faker.datatype.string(),
    isTag: params.isTag ? params.isTag : false,
    nodeImage: params.nodeImage ? params.nodeImage : "",
    comments: faker.datatype.number({ precision: 0 }),
    deleted: false,
    content: faker.datatype.string(),
    choices: choices ? choices : [],
    viewers: params.userNodes ? params.userNodes.length : 0,
    versions: params.versions ? params.versions.length : 0,
    tags: params.tags ? params.tags.map(tag => tag.title) : [],
    tagIds: params.tags ? params.tags.map(tag => String(tag.documentId)) : [],
    height: faker.datatype.number({ precision: 0, max: 400 }),
    studied: params.userNodes ? params.userNodes.length : 0,
    references: params.references ? params.references.map(reference => reference.title) : [],
    referenceLabels: params.references
      ? params.references.map(() =>
          faker.datatype.number({ precision: 0, min: 0, max: 1 }) > 0 ? faker.datatype.string() : ""
        )
      : [],
    referenceIds: params.references ? params.references.map(reference => String(reference.documentId)) : [],
    parents: params.parents
      ? params.parents.map(
          parent =>
            ({
              node: parent.documentId,
              title: parent.title,
              type: parent.nodeType,
            } as INodeLink)
        )
      : [],
    children: params.children
      ? params.children.map(
          child =>
            ({
              node: child.documentId,
              title: child.title,
              type: child.nodeType,
            } as INodeLink)
        )
      : [],
    institNames,
    institutions,
    changedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    maxVersionRating: params.versions
      ? params.versions.reduce(
          (c: number, v: INodeVersion) => (c < v.corrects - v.wrongs ? v.corrects - v.wrongs : c),
          0
        )
      : 0,
  };
}

export function convertNodeToTypeSchema(node: INode, params: any = {}) {
  const netVote = node.corrects - node.wrongs;
  const updatedAt = node.updatedAt instanceof Timestamp ? node.updatedAt.toDate() : node.updatedAt;
  return {
    id: node.documentId,
    changedAtMillis: updatedAt.getUTCMilliseconds(),
    updatedAt: Math.floor(updatedAt.getTime() / 1000),
    content: node.content,
    contributorsNames: node.contribNames,
    mostHelpful: params.mostHelpful ? params.mostHelpful : 0,
    corrects: node.corrects,
    wrongs: node.wrongs,
    netVotes: netVote && !isNaN(netVote) ? netVote : 0,
    labelsReferences: node.referenceLabels,
    institutionsNames: node.institNames,
    nodeType: node.nodeType,
    tags: node.tags,
    title: node.title,
    titlesReferences: node.references,
    isTag: !!node.isTag,
    institNames: node.institNames,
    versions: node.versions,
  };
}

export function convertNodeReferenceToTypeSchema(node: INode) {
  return {
    title: node.title,
  };
}

export function getDefaultNode(params: IFakeNodeOptions): INode {
  const { admin } = params;
  return {
    documentId: "r98BjyFDCe4YyLA3U8ZE",
    aChooseUname: admin ? admin.chooseUname : false,
    aImgUrl: admin ? admin.imageUrl : faker.image.imageUrl(),
    aFullname: admin ? `${admin.fName} ${admin.lName}` : faker.datatype.string(),
    admin: admin ? admin.uname : faker.internet.userName(),
    corrects: 0,
    wrongs: 0,
    nodeType: "Concept",
    contribNames: admin ? [`${admin.fName} ${admin.lName}`] : [],
    contributors: admin
      ? {
          [admin.uname]: {
            chooseUname: admin.chooseUname,
            fullname: `${admin.fName} ${admin.lName}`,
            imageUrl: faker.image.imageUrl(),
            reputation: admin.totalPoints,
          },
        }
      : {},
    title: "1Cademy",
    isTag: true,
    nodeImage: "",
    comments: 0,
    deleted: false,
    content:
      "1Cademy is a collaborative online community that supports interdisciplinary research and learning through content generation, mapping, evaluation, and practice.",
    viewers: 0,
    versions: 0,
    tags: [],
    tagIds: [],
    height: 177,
    studied: 0,
    references: [],
    referenceLabels: [],
    referenceIds: [],
    parents: [],
    children: [],
    institNames: ["University of Michigan - Ann Arbor"],
    institutions: {
      "University of Michigan - Ann Arbor": {
        reputation: 0,
      },
    },
    changedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    maxVersionRating: 0,
  };
}

export function createNodeVersion(params: IFakeNodeVersionOptions): INodeVersion {
  const {
    childType,
    documentId,
    proposer,
    parents,
    children,
    accepted,
    node,
    addedParents,
    removedParents,
    viewers,
    tags,
    corrects,
    wrongs,
    choices,
  } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    childType: childType,
    content: faker.hacker.phrase(),
    title: faker.hacker.phrase(),
    fullname: proposer ? `${proposer.fName} ${proposer.lName}` : faker.company.name(),
    children: children
      ? children.map(
          child =>
            ({
              node: child.documentId,
              title: child.title,
              type: child.nodeType,
            } as INodeLink)
        )
      : [],
    addedInstitContris: false,
    accepted: accepted ? accepted : false,
    imageUrl: faker.image.imageUrl(),
    chooseUname: !!proposer?.chooseUname,
    node: node ? String(node.documentId) : faker.datatype.uuid(),
    choices: choices ? choices : [],
    parents: parents
      ? parents.map(
          parent =>
            ({
              node: parent.documentId,
              title: parent.title,
              type: parent.nodeType,
            } as INodeLink)
        )
      : [],
    addedParents: !!addedParents,
    deleted: false,
    corrects: corrects ? corrects : 0,
    wrongs: wrongs ? wrongs : 0,
    proposer: proposer ? proposer.uname : faker.internet.userName(),
    viewers: viewers ? viewers : 0,
    proposal: faker.hacker.phrase(),
    removedParents: !!removedParents,
    awards: 0,
    summary: faker.hacker.phrase(),
    nodeImage: faker.image.imageUrl(),
    references: params.references ? params.references.map(reference => reference.title) : [],
    referenceLabels: params.references
      ? params.references.map(() =>
          faker.datatype.number({ precision: 0, min: 0, max: 1 }) > 0 ? faker.datatype.string() : ""
        )
      : [],
    referenceIds: params.references ? params.references.map(reference => String(reference.documentId)) : [],
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: tags ? tags.map(tag => tag.title) : [],
    tagIds: tags ? tags.map(tag => String(tag.documentId)) : [],
  };
}

type IFakeUserNodeVersionOptions = {
  documentId?: string;
  node?: INode;
  user?: IUser;
  version?: INodeVersion;
  correct?: boolean;
  wrong?: boolean;
  award?: boolean;
};

export function createUserNodeVersion(params: IFakeUserNodeVersionOptions): IUserNodeVersion {
  const { documentId, node, user, version, correct, wrong, award } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    award: !!award,
    correct: !!correct,
    wrong: !!wrong,
    version: version ? String(version.documentId) : faker.datatype.uuid(), // version id
    user: user ? String(user.documentId) : faker.datatype.uuid(),
    opened: false,
    nodeType: node ? node.nodeType : "Concept",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

type IFakeUserNodeVersionLogOptions = {
  documentId?: string;
  userNodeVersion?: IUserNodeVersion;
};

export function createUserNodeVersionLog(params: IFakeUserNodeVersionLogOptions): IUserNodeVersionLog {
  const { documentId, userNodeVersion } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    award: userNodeVersion ? userNodeVersion.award : false,
    correct: userNodeVersion ? userNodeVersion.correct : false,
    wrong: userNodeVersion ? userNodeVersion.wrong : false,
    version: userNodeVersion ? userNodeVersion.version : faker.datatype.uuid(), // version id
    user: userNodeVersion ? userNodeVersion.user : faker.datatype.uuid(),
    nodeType: userNodeVersion ? userNodeVersion.nodeType : "Concept",
    createdAt: new Date(),
  };
}
