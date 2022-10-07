import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { comPointTypes, getTypedCollections, NODE_TYPES, reputationTypes } from "src/utils";
import { createCredit } from "testUtils/fakers/credit";
import {
  createMonthlyReputationPoints,
  createReputationPoints,
  createWeeklyReputationPoints,
} from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();
import { IUser } from "src/types/IUser";
import { IUserNodeLog } from "src/types/IUserNodeLog";
import { IUserNodeVersionLog } from "src/types/IUserNodeVersionLog";
import { createComMonthlyPoints, createComPoints, createComWeeklyPoints } from "testUtils/fakers/com-point";
import { createMessage } from "testUtils/fakers/message";
import { createNotification } from "testUtils/fakers/notification";
import { createPresentation } from "testUtils/fakers/presentation";
import { createPresNode } from "testUtils/fakers/presNodes";
import {
  createUserBackgroundLog,
  createUserClosedSidebarLog,
  createUserClustersLog,
  createUserLeaderboardLog,
  createUserNodePartsLog,
  createUserNodeSelectLog,
  createUserOpenSidebarLog,
  createUserSearchLog,
  createUserThemeLog,
  createUserUserInfoLog,
  createUserUsersStatusLog,
} from "testUtils/fakers/userLogs";

import { admin, db } from "../../../src/lib/firestoreServer/admin";
import changeUsernameHandler from "../../../src/pages/api/changeUsername";
import { INodeType } from "../../../src/types/INodeType";
import {
  createNode,
  createNodeVersion,
  createUserNodeVersion,
  createUserNodeVersionLog,
  getDefaultNode,
} from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import { createUserNode, createUserNodeLog } from "../../../testUtils/fakers/userNode";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";

describe("POST /api/changeUsername", () => {
  const users = [getDefaultUser({})];
  const nodes = [
    getDefaultNode({
      admin: users[0],
    }),
  ];

  users.push(
    createUser({
      sNode: nodes[0],
      tag: nodes[0],
    })
  );

  // setting default community to default user
  users[0].tag = nodes[0].title;
  users[0].tagId = String(nodes[0].documentId);

  const userNodes = [
    createUserNode({
      node: nodes[0],
      correct: true,
    }),
  ];
  const nodeVersions = [
    // first accepted proposal
    createNodeVersion({
      node: nodes[0],
      accepted: true,
      proposer: users[0],
      corrects: 1,
    }),
  ];

  const credits = [
    createCredit({
      credits: 100,
      tag: nodes[0],
    }),
  ];

  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);

  // comPoints, comMonthlyPoints, comWeeklyPoints, comOthersPoints, comOthMonPoints, comOthWeekPoints
  const comPoints = [
    createComPoints({
      admin: users[0],
      tag: nodes[0],
    }),
  ];
  const comMonthlyPoints = [
    createComMonthlyPoints({
      admin: users[0],
      currentDate: new Date(),
      tag: nodes[0],
    }),
  ];
  const comWeeklyPoints = [
    createComWeeklyPoints({
      admin: users[0],
      currentDate: new Date(),
      tag: nodes[0],
    }),
  ];

  const comOthersPoints = [
    createComPoints({
      admin: users[0],
      tag: nodes[0],
    }),
  ];
  const comOthMonPoints = [
    createComMonthlyPoints({
      admin: users[0],
      currentDate: new Date(),
      tag: nodes[0],
    }),
  ];
  const comOthWeekPoints = [
    createComWeeklyPoints({
      admin: users[0],
      currentDate: new Date(),
      tag: nodes[0],
    }),
  ];

  // reputations, monthlyReputations, weeklyReputations, othersReputations, othMonReputations, othWeekReputations
  // adding reputation to default user, its required for auth middleware
  const reputations = [
    createReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];
  const monthlyReputations = [
    createMonthlyReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];
  const weeklyReputations = [
    createWeeklyReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];
  const othersReputations = [
    createReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];
  const othMonReputations = [
    createMonthlyReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];
  const othWeekReputations = [
    createWeeklyReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];

  const usersCollection = new MockData(users, "users");
  const creditsCollection = new MockData(credits, "credits");
  const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");

  const reputationsCollection = new MockData(reputations, "reputations");
  const monthlyReputationsCollection = new MockData(monthlyReputations, "monthlyReputations");
  const weeklyReputationsCollection = new MockData(weeklyReputations, "weeklyReputations");
  const othersReputationsCollection = new MockData(othersReputations, "othersReputations");
  const othMonReputationsCollection = new MockData(othMonReputations, "othMonReputations");
  const othWeekReputationsCollection = new MockData(othWeekReputations, "othWeekReputations");

  const comPointsCollection = new MockData(comPoints, "comPoints");
  const comMonthlyPointsCollection = new MockData(comMonthlyPoints, "comMonthlyPoints");
  const comWeeklyPointsCollection = new MockData(comWeeklyPoints, "comWeeklyPoints");
  const comOthersPointsCollection = new MockData(comOthersPoints, "comOthersPoints");
  const comOthMonPointsCollection = new MockData(comOthMonPoints, "comOthMonPoints");
  const comOthWeekPointsCollection = new MockData(comOthWeekPoints, "comOthWeekPoints");

  const notificationsCollection = new MockData(
    [
      createNotification({
        user: users[0],
        node: nodes[0],
        proposer: users[0],
        aType: "Accepted",
        oType: "AccProposal",
        checked: false,
      }),
    ],
    "notifications"
  );

  const presentations = [
    createPresentation({
      tag: nodes[0],
      user: users[0],
    }),
  ];
  const presentationsCollection = new MockData(presentations, "presentations");

  const presNodes = [
    createPresNode({
      user: users[0],
      node: nodes[0],
      presentation: presentations[0],
    }),
  ];
  const presNodesCollection = new MockData(presNodes, "presNodes");

  const userBackgroundLogCollection = new MockData(
    [
      createUserBackgroundLog({
        user: users[0],
      }),
    ],
    "userBackgroundLog"
  );

  const userClosedSidebarLogCollection = new MockData(
    [
      createUserClosedSidebarLog({
        user: users[0],
      }),
    ],
    "userClosedSidebarLog"
  );

  const userClustersLogCollection = new MockData(
    [
      createUserClustersLog({
        user: users[0],
      }),
    ],
    "userClustersLog"
  );

  const userLeaderboardLogCollection = new MockData(
    [
      createUserLeaderboardLog({
        user: users[0],
      }),
    ],
    "userLeaderboardLog"
  );

  const userNodePartsLogCollection = new MockData(
    [
      createUserNodePartsLog({
        user: users[0],
        node: nodes[0],
      }),
    ],
    "userNodePartsLog"
  );

  const userNodeSelectLogCollection = new MockData(
    [
      createUserNodeSelectLog({
        user: users[0],
        node: nodes[0],
      }),
    ],
    "userNodeSelectLog"
  );

  const userOpenSidebarLogCollection = new MockData(
    [
      createUserOpenSidebarLog({
        user: users[0],
      }),
    ],
    "userOpenSidebarLog"
  );

  const userSearchLogCollection = new MockData(
    [
      createUserSearchLog({
        user: users[0],
      }),
    ],
    "userSearchLog"
  );

  const userThemeLogCollection = new MockData(
    [
      createUserThemeLog({
        user: users[0],
      }),
    ],
    "userThemeLog"
  );

  const userUserInfoLogCollection = new MockData(
    [
      createUserUserInfoLog({
        user: users[0],
      }),
    ],
    "userUserInfoLog"
  );

  const userUsersStatusLogCollection = new MockData(
    [
      createUserUsersStatusLog({
        user: users[0],
      }),
    ],
    "userUsersStatusLog"
  );

  const messagesCollection = new MockData(
    [
      createMessage({
        user: users[0],
        tag: nodes[0],
      }),
    ],
    "messages"
  );

  const collects = [
    usersCollection,
    creditsCollection,
    nodeVersionsCollection,

    reputationsCollection,
    monthlyReputationsCollection,
    weeklyReputationsCollection,
    othersReputationsCollection,
    othMonReputationsCollection,
    othWeekReputationsCollection,

    comPointsCollection,
    comMonthlyPointsCollection,
    comWeeklyPointsCollection,
    comOthersPointsCollection,
    comOthMonPointsCollection,
    comOthWeekPointsCollection,

    notificationsCollection,
    presentationsCollection,
    presNodesCollection,

    userBackgroundLogCollection,
    userClosedSidebarLogCollection,
    userClustersLogCollection,
    userLeaderboardLogCollection,
    userNodePartsLogCollection,
    userNodeSelectLogCollection,
    userOpenSidebarLogCollection,
    userSearchLogCollection,
    userThemeLogCollection,
    userUserInfoLogCollection,
    userUsersStatusLogCollection,

    messagesCollection,
  ];

  const userNodesLogs: IUserNodeLog[] = [];
  const userVersionsLogs: IUserNodeVersionLog[] = [];

  for (const NODE_TYPE of NODE_TYPES) {
    const { versionsColl, userVersionsColl } = getTypedCollections({
      nodeType: NODE_TYPE,
    });
    const node = createNode({
      admin: users[0],
      corrects: 1,
      tags: [nodes[0]],
      nodeType: NODE_TYPE as INodeType,
    });
    nodes.push(node);

    const nodeVersion = createNodeVersion({
      node,
      accepted: true,
      proposer: users[0],
      tags: [nodes[0]],
      corrects: 1,
    });

    collects.push(new MockData([nodeVersion], versionsColl.id));

    const userNodeVersion = createUserNodeVersion({
      node,
      user: users[0],
      correct: true,
      version: nodeVersion,
    });

    collects.push(new MockData([userNodeVersion], userVersionsColl.id));

    const userNode = createUserNode({
      node,
      correct: true,
      bookmarked: false,
      isStudied: false,
      user: users[0],
    });
    userNodes.push(userNode);

    userNodesLogs.push(
      createUserNodeLog({
        userNode,
      })
    );

    userVersionsLogs.push(
      createUserNodeVersionLog({
        userNodeVersion,
      })
    );
  }

  const nodesCollection = new MockData(nodes, "nodes");
  collects.push(nodesCollection);
  const userNodesCollection = new MockData(userNodes, "userNodes");
  collects.push(userNodesCollection);
  const userNodesLogCollection = new MockData(userNodesLogs, "userNodesLog");
  collects.push(userNodesLogCollection);
  const userVersionsLogsCollection = new MockData(userVersionsLogs, "userVersionsLog");
  collects.push(userVersionsLogsCollection);

  let accessToken: string = "";

  beforeAll(async () => {
    const user = await auth.createUser({
      email: users[0].email,
      password: mockPassword,
      disabled: false,
      emailVerified: true,
    });
    const r = await signInWithEmailAndPassword(getAuth(), users[0].email, mockPassword);
    accessToken = await r.user.getIdToken(false);
    users[0].userId = user.uid;

    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  describe("check if username is valid (ideal username should not have .,/,__) otherwise throw error with 400", () => {
    it(".", async () => {
      const body = {
        data: {
          newUname: users[0].uname + ".U",
        },
      };

      const req: any = HttpMock.createRequest({
        method: "POST",
        body,
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const res = HttpMock.createResponse();
      await changeUsernameHandler(req, res as any);

      expect(res._getStatusCode()).toEqual(400);
    });

    it("/", async () => {
      const body = {
        data: {
          newUname: users[0].uname + "/U",
        },
      };

      const req: any = HttpMock.createRequest({
        method: "POST",
        body,
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const res = HttpMock.createResponse();
      await changeUsernameHandler(req, res as any);

      expect(res._getStatusCode()).toEqual(400);
    });

    it("__", async () => {
      const body = {
        data: {
          newUname: users[0].uname + "__U",
        },
      };

      const req: any = HttpMock.createRequest({
        method: "POST",
        body,
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const res = HttpMock.createResponse();
      await changeUsernameHandler(req, res as any);

      expect(res._getStatusCode()).toEqual(400);
    });
  });

  it("check if new user equal old one ignore change username (need change this behaviour)", async () => {
    const body = {
      data: {
        newUname: users[0].uname,
      },
    };

    const req: any = HttpMock.createRequest({
      method: "POST",
      body,
      headers: {
        authorization: "Bearer " + accessToken,
      },
    });

    const res = HttpMock.createResponse();
    await changeUsernameHandler(req, res as any);

    expect(res._getStatusCode()).toEqual(200);
  });

  it("check if new username already exist for someone else, throw error and respond with 500", async () => {
    const body = {
      data: {
        newUname: users[1].uname,
      },
    };

    const req: any = HttpMock.createRequest({
      method: "POST",
      body,
      headers: {
        authorization: "Bearer " + accessToken,
      },
    });

    const res = HttpMock.createResponse();
    await changeUsernameHandler(req, res as any);

    expect(res._getStatusCode()).toEqual(500);
  });

  describe("should be able to change username if request is valid", () => {
    const newUsername = users[0].uname + "U";
    beforeAll(async () => {
      const body = {
        data: {
          newUname: newUsername,
        },
      };

      const req: any = HttpMock.createRequest({
        method: "POST",
        body,
        headers: {
          authorization: "Bearer " + accessToken,
        },
      });

      const res = HttpMock.createResponse();
      await changeUsernameHandler(req, res as any);

      expect(res._getStatusCode()).toEqual(200);
    });

    it("create a new doc with new username in users collection and copy all of fields from old doc to new", async () => {
      const userData = (await db.collection("users").doc(newUsername).get()).data() as IUser;
      expect(userData).not.toBeUndefined();
      expect(userData.uname).toEqual(newUsername);
    });

    it("delete old user doc", async () => {
      const userData = (await db.collection("users").doc(users[0].uname).get()).data() as IUser;
      expect(userData).toBeUndefined();
    });

    describe("change old username in each collection that has usernames:", () => {
      it("{nodeType}Versions, user{nodeType}Versions, {nodeType}VersionsComments (not implemented), user{nodeType}VersionsComments (not implemented)", async () => {
        for (const NODE_TYPE of NODE_TYPES) {
          const { versionsColl, userVersionsColl } = getTypedCollections({
            nodeType: NODE_TYPE,
          });
          expect((await versionsColl.where("proposer", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
          expect((await userVersionsColl.where("user", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
        }
      });

      it("userNodes, userNodesLog, userVersionsLog, practice (not implemented), practiceCompletion (not implemented), practiceLog (not implemented)", async () => {
        expect((await db.collection("userNodes").where("user", "==", newUsername).get()).docs.length).toBeGreaterThan(
          0
        );
        expect(
          (await db.collection("userNodesLog").where("user", "==", newUsername).get()).docs.length
        ).toBeGreaterThan(0);
        expect(
          (await db.collection("userVersionsLog").where("user", "==", newUsername).get()).docs.length
        ).toBeGreaterThan(0);
      });

      it("comPoints, comMonthlyPoints, comWeeklyPoints, comOthersPoints, comOthMonPoints, comOthWeekPoints", async () => {
        for (const comPointType of comPointTypes) {
          expect(
            (await db.collection(comPointType).where("admin", "==", newUsername).get()).docs.length
          ).toBeGreaterThan(0);
        }
      });

      it("reputations, monthlyReputations, weeklyReputations, othersReputations, othMonReputations, othWeekReputations", async () => {
        for (const reputationType of reputationTypes) {
          expect(
            (await db.collection(reputationType).where("uname", "==", newUsername).get()).docs.length
          ).toBeGreaterThan(0);
        }
      });

      it("notifications, presentations, presNodes, userBackgroundLog, userClosedSidebarLog, userClustersLog, userLeaderboardLog, userComLeaderboardLog (not implemented), userNodePartsLog, userOpenSidebarLog, userSearchLog, userThemeLog, userUserInfoLog, userUsersStatusLog", async () => {
        const colNames = [
          "notifications",
          "presNodes",
          "presentations",
          "userBackgroundLog",
          "userClosedSidebarLog",
          "userClustersLog",
          "userLeaderboardLog",
          // "userComLeaderboardLog", (no implemented)
          "userNodePartsLog",
          "userNodeSelectLog",
          "userOpenSidebarLog",
          "userSearchLog",
          "userThemeLog",
          "userUserInfoLog",
          "userUsersStatusLog",
        ];
        for (const colName of colNames) {
          expect((await db.collection(colName).where("uname", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
        }
      });

      it("messages", async () => {
        expect(
          (await db.collection("messages").where("username", "==", newUsername).get()).docs.length
        ).toBeGreaterThan(0);
      });

      it("notifications (for proposer)", async () => {
        expect(
          (await db.collection("notifications").where("proposer", "==", newUsername).get()).docs.length
        ).toBeGreaterThan(0);
      });

      it("userUserInfoLog (for uInfo)", async () => {
        expect(
          (await db.collection("userUserInfoLog").where("uInfo", "==", newUsername).get()).docs.length
        ).toBeGreaterThan(0);
      });

      it("userUserInfoLog (for uInfo)", async () => {
        expect(
          (await db.collection("userUserInfoLog").where("uInfo", "==", newUsername).get()).docs.length
        ).toBeGreaterThan(0);
      });

      it("nodes", async () => {
        expect((await db.collection("nodes").where("admin", "==", newUsername).get()).docs.length).toBeGreaterThan(0);
      });
    });

    it("update newUsername as displayName in firebase auth user", async () => {
      const _user = await admin.auth().getUserByEmail(users[0].email);
      expect(_user.displayName).toEqual(newUsername);
    });
  });
});
