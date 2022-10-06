import { faker } from "@faker-js/faker";
import { INode } from "src/types/INode";
import { IUser } from "src/types/IUser";
import { IUserBackgroundLog } from "src/types/IUserBackgroundLog";
import { IUserClosedSidebarLog } from "src/types/IUserClosedSidebarLog";
import { IUserClustersLog } from "src/types/IUserClusterLog";
import { IUserLeaderboardLog } from "src/types/IUserLeaderboardLog";
import { IUserNodePartsLog } from "src/types/IUserNodePartsLog";
import { IUserNodeSelect } from "src/types/IUserNodeSelect";
import { IUserOpenSidebarLog } from "src/types/IUserOpenSidebarLog";
import { IUserSearchLog } from "src/types/IUserSearchLog";
import { IUserThemeLog } from "src/types/IUserThemeLog";
import { IUserUserInfoLog } from "src/types/IUserUserInfoLog";
import { IUserUsersStatusLog } from "src/types/IUserUsersStatusLog";

type IFakeUserBackgroundLogParams = {
  documentId?: string;
  user?: IUser;
};

export function createUserBackgroundLog(params: IFakeUserBackgroundLogParams): IUserBackgroundLog {
  const { documentId, user } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    uname: user ? user.uname : faker.internet.userName(),
    background: "Color",
    createdAt: new Date(),
  };
}

type IFakeUserClosedSidebarLogParams = {
  documentId?: string;
  user?: IUser;
};

type IFakeUserClustersLogParams = {
  documentId?: string;
  user?: IUser;
};

type IFakeUserLeaderboardLogParams = {
  documentId?: string;
  user?: IUser;
};

type IFakeUserNodePartsLogParams = {
  documentId?: string;
  user?: IUser;
  node?: INode;
};

type IFakeUserOpenSidebarLogParams = {
  documentId?: string;
  user?: IUser;
};

type IFakeUserSearchLogParams = {
  documentId?: string;
  user?: IUser;
};

type IFakeUserThemeLogParams = {
  documentId?: string;
  user?: IUser;
};

type IFakeUserUserInfoLogParams = {
  documentId?: string;
  user?: IUser;
};

type IFakeUserUsersStatusLogParams = {
  documentId?: string;
  user?: IUser;
};

type IFakeUserNodeSelectParams = {
  documentId?: string;
  user?: IUser;
  node?: INode;
};

export function createUserClosedSidebarLog(params: IFakeUserClosedSidebarLogParams): IUserClosedSidebarLog {
  const { documentId, user } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    createdAt: new Date(),
    sidebarType: "Search",
    uname: user ? user.uname : faker.internet.userName(),
  };
}

export function createUserClustersLog(params: IFakeUserClustersLogParams): IUserClustersLog {
  const { documentId, user } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    open: false,
    uname: user ? user.uname : faker.internet.userName(),
    createdAt: new Date(),
  };
}

export function createUserLeaderboardLog(params: IFakeUserLeaderboardLogParams): IUserLeaderboardLog {
  const { documentId, user } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    type: "Monthly",
    uname: user ? user.uname : faker.internet.userName(),
    createdAt: new Date(),
  };
}

export function createUserNodePartsLog(params: IFakeUserNodePartsLogParams): IUserNodePartsLog {
  const { documentId, user, node } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    partType: "Tags",
    nodeId: node ? String(node.documentId) : faker.datatype.uuid(),
    uname: user ? user.uname : faker.internet.userName(),
    createdAt: new Date(),
  };
}

export function createUserOpenSidebarLog(params: IFakeUserOpenSidebarLogParams): IUserOpenSidebarLog {
  const { documentId, user } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    sidebarType: "Search",
    uname: user ? user.uname : faker.internet.userName(),
    createdAt: new Date(),
  };
}

export function createUserSearchLog(params: IFakeUserSearchLogParams): IUserSearchLog {
  const { documentId, user } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    queryStr: "1Cademy",
    uname: user ? user.uname : faker.internet.userName(),
    createdAt: new Date(),
  };
}

export function createUserThemeLog(params: IFakeUserThemeLogParams): IUserThemeLog {
  const { documentId, user } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    theme: "Light",
    uname: user ? user.uname : faker.internet.userName(),
    createdAt: new Date(),
  };
}

export function createUserUserInfoLog(params: IFakeUserUserInfoLogParams): IUserUserInfoLog {
  const { documentId, user } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    uInfo: user ? user.uname : faker.internet.userName(),
    uname: user ? user.uname : faker.internet.userName(),
    createdAt: new Date(),
  };
}

export function createUserUsersStatusLog(params: IFakeUserUsersStatusLogParams): IUserUsersStatusLog {
  const { documentId, user } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    open: false,
    uname: user ? user.uname : faker.internet.userName(),
    createdAt: new Date(),
  };
}

export function createUserNodeSelectLog(params: IFakeUserNodeSelectParams): IUserNodeSelect {
  const { documentId, user, node } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    nodeId: node ? String(node.documentId) : faker.datatype.uuid(),
    uname: user ? user.uname : faker.internet.userName(),
    createdAt: new Date(),
  };
}
