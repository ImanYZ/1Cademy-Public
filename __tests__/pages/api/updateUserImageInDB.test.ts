import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { IComPoint } from "src/types/IComPoint";
import { IMessage } from "src/types/IMessage";
import { INode } from "src/types/INode";
import { INodeVersion } from "src/types/INodeVersion";
import { INotification } from "src/types/INotification";
import { IUser } from "src/types/IUser";
import { getTypedCollections, NODE_TYPES } from "src/utils";
import { createComMonthlyPoints, createComPoints, createComWeeklyPoints } from "testUtils/fakers/com-point";
import { createCredit } from "testUtils/fakers/credit";
import { createMessage } from "testUtils/fakers/message";
import { createNotification } from "testUtils/fakers/notification";
import { createReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();
import { admin, db } from "../../../src/lib/firestoreServer/admin";
import updateUserImageInDBHandler from "../../../src/pages/api/updateUserImageInDB";
import { INodeType } from "../../../src/types/INodeType";
import { createNode, createNodeVersion, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import { createUserNode } from "../../../testUtils/fakers/userNode";
import deleteAllUsers from "../../../testUtils/helpers/deleteAllUsers";
import { MockData } from "../../../testUtils/mockCollections";

describe("POST /api/updateUserImageInDB", () => {
  const users = [getDefaultUser({}), createUser({})];
  const nodes = [
    getDefaultNode({
      admin: users[0],
    }),
  ];

  // setting default community to default user
  users[0].tag = nodes[0].title;
  users[0].tagId = String(nodes[0].documentId);
  // for 2nd mock user
  users[1].tag = nodes[0].title;
  users[1].tagId = String(nodes[0].documentId);

  // adding reputation to default user, its required for auth middleware
  const reputations = [
    createReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];
  // for 2nd mock user
  reputations.push(
    createReputationPoints({
      tag: nodes[0],
      user: users[1],
    })
  );

  nodes.push(
    createNode({
      admin: users[1],
      tags: [nodes[0]],
      corrects: 1,
    })
  );
  const userNodes = [
    createUserNode({
      node: nodes[0],
      correct: true,
    }),
    createUserNode({
      node: nodes[1],
      correct: false,
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
    createNodeVersion({
      node: nodes[1],
      accepted: true,
      proposer: users[1],
      corrects: 1,
    }),
  ];

  const credits = [
    createCredit({
      credits: 100,
      tag: nodes[0],
    }),
  ];

  // setting up mocks that are required for this test only
  const messages = [
    createMessage({
      content: faker.hacker.phrase(),
      tag: nodes[0],
      user: users[0],
    }),
  ];

  const notifications = [
    createNotification({
      user: users[0],
      node: nodes[0],
      proposer: users[0],
      aType: "Accepted",
      oType: "AccProposal",
      checked: false,
    }),
  ];

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

  for (const NODE_TYPE of NODE_TYPES) {
    const node = createNode({
      nodeType: NODE_TYPE as INodeType,
      admin: users[0],
    });
    nodes.push(node);
    nodeVersions.push(
      createNodeVersion({
        node,
        tags: [nodes[0]],
        proposer: users[0],
        accepted: true,
        corrects: 1,
      })
    );
  }

  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);

  const usersCollection = new MockData(users, "users");
  const nodesCollection = new MockData(nodes, "nodes");
  const creditsCollection = new MockData(credits, "credits");
  const userNodesCollection = new MockData(userNodes, "userNodes");
  // const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");
  const reputationsCollection = new MockData(reputations, "reputations");

  const messagesCollection = new MockData(messages, "messages");
  const notificationsCollection = new MockData(notifications, "notifications");

  const comPointsCollection = new MockData(comPoints, "comPoints");
  const comMonthlyPointsCollection = new MockData(comMonthlyPoints, "comMonthlyPoints");
  const comWeeklyPointsCollection = new MockData(comWeeklyPoints, "comWeeklyPoints");
  const comOthersPointsCollection = new MockData(comOthersPoints, "comOthersPoints");
  const comOthMonPointsCollection = new MockData(comOthMonPoints, "comOthMonPoints");
  const comOthWeekPointsCollection = new MockData(comOthWeekPoints, "comOthWeekPoints");

  const collects = [
    usersCollection,
    nodesCollection,
    creditsCollection,
    userNodesCollection,
    // nodeVersionsCollection,
    reputationsCollection,

    messagesCollection,
    notificationsCollection,

    comPointsCollection,
    comMonthlyPointsCollection,
    comWeeklyPointsCollection,
    comOthersPointsCollection,
    comOthMonPointsCollection,
    comOthWeekPointsCollection,
  ];

  for (const NODE_TYPE of NODE_TYPES) {
    const { versionsColl } = getTypedCollections({
      nodeType: NODE_TYPE,
    });
    collects.push(
      new MockData(
        nodeVersions.filter(
          nodeVersion => nodes.find(node => node.documentId === nodeVersion.node)?.nodeType === NODE_TYPE
        ),
        versionsColl.id
      )
    );
  }

  let accessToken: string = "";
  // let accessToken2: string = "";

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

    // 2nd Mock User
    /* const user2 = await auth.createUser({
      email: users[1].email,
      password: mockPassword,
      disabled: false,
      emailVerified: true,
    });
    const r2 = await signInWithEmailAndPassword(getAuth(), users[1].email, mockPassword);
    accessToken2 = await r2.user.getIdToken(false);
    users[1].userId = user2.uid; */

    await Promise.all(collects.map(collect => collect.populate()));
  });

  afterAll(async () => {
    await deleteAllUsers();
    await Promise.all(collects.map(collect => collect.clean()));
  });

  let imageUrl: string;

  it("find user and update image url in users collection", async () => {
    imageUrl = faker.image.imageUrl();
    const body = {
      data: {
        imageUrl,
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
    await updateUserImageInDBHandler(req, res as any);

    const userData = (await db.collection("users").doc(users[0].uname).get()).data() as IUser;
    expect(userData.imageUrl).toEqual(imageUrl);
  });

  it("change user images in each collection that have user image", async () => {
    imageUrl = faker.image.imageUrl();
    const body = {
      data: {
        imageUrl,
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
    await updateUserImageInDBHandler(req, res as any);

    const userData = (await db.collection("users").doc(users[0].uname).get()).data() as IUser;
    expect(userData.imageUrl).toEqual(imageUrl);

    expect(res._getStatusCode()).toEqual(200);
  });

  describe("change user images in each collection that have user image", () => {
    it("messages", async () => {
      const messageDocs = (await db.collection("messages").where("username", "==", users[0].uname).get()).docs;
      expect(messageDocs.length).toBeGreaterThan(0);
      for (const messageDoc of messageDocs) {
        const messageDocData = messageDoc.data() as IMessage;
        expect(messageDocData.imageUrl).toEqual(imageUrl);
      }
    });

    it("notifications", async () => {
      const notificationDocs = (await db.collection("notifications").where("uname", "==", users[0].uname).get()).docs;
      expect(notificationDocs.length).toBeGreaterThan(0);
      for (const notificationDoc of notificationDocs) {
        const notificationDocData = notificationDoc.data() as INotification;
        expect(notificationDocData.imageUrl).toEqual(imageUrl);
      }
    });

    it("comPoints, comMonthlyPoints, comWeeklyPoints, comOthersPoints, comOthMonPoints, comOthWeekPoints", async () => {
      const comPointCollects = [
        "comPoints",
        "comMonthlyPoints",
        "comWeeklyPoints",
        "comOthersPoints",
        "comOthMonPoints",
        "comOthWeekPoints",
      ];
      for (const comPointCollect of comPointCollects) {
        const comPointCollectDocs = (await db.collection(comPointCollect).where("admin", "==", users[0].uname).get())
          .docs;
        expect(comPointCollectDocs.length).toBeGreaterThan(0);
        for (const comPointCollectDoc of comPointCollectDocs) {
          const comPointCollectDocData = comPointCollectDoc.data() as IComPoint;
          expect(comPointCollectDocData.aImgUrl).toEqual(imageUrl);
        }
      }
    });

    it("{nodeType}Versions", async () => {
      for (const NODE_TYPE of NODE_TYPES) {
        const { versionsColl } = getTypedCollections({
          nodeType: NODE_TYPE,
        });
        const nodeTypeVersionDocs = (await db.collection(versionsColl.id).where("proposer", "==", users[0].uname).get())
          .docs;
        expect(nodeTypeVersionDocs.length).toBeGreaterThan(0);
        for (const nodeTypeVersionDoc of nodeTypeVersionDocs) {
          const nodeTypeVersionDocData = nodeTypeVersionDoc.data() as INodeVersion;
          expect(nodeTypeVersionDocData.imageUrl).toEqual(imageUrl);
        }
      }
    });

    it("nodes where this user is admin", async () => {
      const nodeDocs = (await db.collection("nodes").where("admin", "==", users[0].uname).get()).docs;
      expect(nodeDocs.length).toBeGreaterThan(0);
      for (const nodeDoc of nodeDocs) {
        const nodeDocData = nodeDoc.data() as INode;
        expect(nodeDocData.aImgUrl).toEqual(imageUrl);
      }
    });
  });
});
