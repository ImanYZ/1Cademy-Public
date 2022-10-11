import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock, { MockResponse } from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { createCredit } from "testUtils/fakers/credit";
import { createReputationPoints, createWeeklyReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();

import { admin, db } from "src/lib/firestoreServer/admin";
import proposeNodeImprovementHandler from "src/pages/api/proposeNodeImprovement";
import { INode } from "src/types/INode";
// import { INodeLink } from "src/types/INodeLink";
import { INotification } from "src/types/INotification";
import { IPendingPropNum } from "src/types/IPendingPropNum";
import { IReputation } from "src/types/IReputationPoint";
import { ITag } from "src/types/ITag";
import { createNode, createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { createUser, getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

describe("POST /api/proposeNodeImprovement", () => {
  const positiveFields = [
    // for Concept nodes
    "cnCorrects",
    "cnInst",
    // for Code nodes
    "cdCorrects",
    "cdInst",
    // for Question nodes
    "qCorrects",
    "qInst",
    //  for Profile nodes
    "pCorrects",
    "pInst",
    //  for Sequel nodes
    "sCorrects",
    "sInst",
    //  for Advertisement nodes
    "aCorrects",
    "aInst",
    //  for Reference nodes
    "rfCorrects",
    "rfInst",
    //  for News nodes
    "nCorrects",
    "nInst",
    //  for Idea nodes
    "iCorrects",
    "iInst",
    //  for Relation nodes
    "mCorrects",
    "mInst",
  ];

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

  nodes.push(
    createNode({
      admin: users[0],
      isTag: true,
      corrects: 1,
      parents: [nodes[0]],
    })
  );

  nodes.push(
    createNode({
      admin: users[0],
      isTag: false,
      corrects: 1,
      parents: [nodes[1]],
      tags: [],
    })
  );

  // setting default community to default user
  users[0].tag = nodes[0].title;
  users[0].tagId = String(nodes[0].documentId);

  const userNodes = [
    createUserNode({
      user: users[0],
      node: nodes[0],
      correct: true,
    }),
    createUserNode({
      user: users[1],
      node: nodes[0],
      correct: false,
      wrong: false,
    }),
  ];

  const nodeVersions = [
    // first accepted proposal
    createNodeVersion({
      node: nodes[0],
      accepted: true,
      proposer: users[0],
      corrects: 1,
      tags: [nodes[0]],
      parents: [nodes[0]],
      children: [nodes[2]],
    }),
    createNodeVersion({
      node: nodes[2],
      accepted: false,
      proposer: users[0],
      corrects: 1,
      tags: [nodes[0]],
      parents: [nodes[0]],
      children: [nodes[1]],
    }),
  ];

  const credits = [
    createCredit({
      credits: 100,
      tag: nodes[0],
    }),
  ];

  const weeklyReputationPoints = [
    createWeeklyReputationPoints({
      user: users[0],
      tag: nodes[0],
      // cnCorrects: 1
    }),
    createWeeklyReputationPoints({
      user: users[1],
      tag: nodes[0],
      // cnCorrects: 1
    }),
  ];
  const auth = admin.auth();
  const mockPassword = faker.internet.password(16);

  // adding reputation to default user, its required for auth middleware
  const reputations = [
    createReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];

  const tags = [
    {
      documentId: faker.datatype.uuid(),
      node: String(nodes[0].documentId),
      tagIds: [],
      tags: [],
      title: nodes[0].title,
      deleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ITag,
  ];

  const usersCollection = new MockData(users, "users");
  const creditsCollection = new MockData(credits, "credits");
  const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");
  const weeklyReputationPointsCollection = new MockData(weeklyReputationPoints, "weeklyReputations");
  const reputationsCollection = new MockData(reputations, "reputations");
  const notificationsCollection = new MockData([], "notifications");

  const collects = [
    usersCollection,
    creditsCollection,
    nodeVersionsCollection,
    reputationsCollection,
    weeklyReputationPointsCollection,
    notificationsCollection,
    new MockData(tags, "tags"),

    new MockData([], "comPoints"),
    new MockData([], "comMonthlyPoints"),
    new MockData([], "comWeeklyPoints"),
    new MockData([], "comOthersPoints"),
    new MockData([], "comOthMonPoints"),
    new MockData([], "comOthWeekPoints"),

    new MockData([], "notificationNums"),
    new MockData([], "userConceptVersions"),
    new MockData([], "userVersionsLog"),

    new MockData([], "monthlyReputations"),
  ];

  const nodesCollection = new MockData(nodes, "nodes");
  collects.push(nodesCollection);
  const userNodesCollection = new MockData(userNodes, "userNodes");
  collects.push(userNodesCollection);

  let accessToken: string = "";

  describe("api/proposeNodeImprovement", () => {
    let res: MockResponse<any>;

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
      const req: any = HttpMock.createRequest({
        method: "POST",
        headers: {
          authorization: "Bearer " + accessToken,
        },
        body: {
          data: {
            ...nodes[2],
            title: "RANDOM TITLE",
            tagIds: [nodes[0].documentId],
            tags: [nodes[0].title],
            id: nodes[2].documentId,
            addedParents: [String(nodes[0].documentId)],
            addedChildren: [String(nodes[1].documentId)],
            removedParents: [String(nodes[1].documentId)],
            removedChildren: [],
          },
        },
      });

      res = HttpMock.createResponse();
      await proposeNodeImprovementHandler(req, res as any);
    });

    afterAll(async () => {
      await deleteAllUsers();
      await Promise.all(collects.map(collect => collect.clean()));
    });

    let nodeData: INode;
    it("status should be 200", async () => {
      expect(res._getStatusCode()).toEqual(200);
    });

    it("should be check changedTags=true", async () => {
      let versions = await db
        .collection("conceptVersions")
        .where("title", "==", "RANDOM TITLE")
        .where("node", "==", nodes[2].documentId)
        .where("proposer", "==", users[0].uname)
        .get();
      let versionData = versions.docs[0].data();
      expect(versionData?.changedTags).toBe(true);
    });

    it("should be check addedTags=true", async () => {
      let versions = await db
        .collection("conceptVersions")
        .where("title", "==", "RANDOM TITLE")
        .where("node", "==", nodes[2].documentId)
        .where("proposer", "==", users[0].uname)
        .get();
      let versionData = versions.docs[0].data();
      expect(versionData?.addedTags).toBe(true);
    });

    it("should be check changedTitle=true", async () => {
      let versions = await db
        .collection("conceptVersions")
        .where("title", "==", "RANDOM TITLE")
        .where("node", "==", nodes[2].documentId)
        .where("proposer", "==", users[0].uname)
        .get();
      let versionData = versions.docs[0].data();
      expect(versionData?.changedTitle).toBe(true);
    });

    it("increase reputation of proposer", async () => {
      const reputationResult = await db
        .collection("weeklyReputations")
        .where("uname", "==", users[0].uname)
        .where("tagId", "==", users[0].tagId)
        .get();
      const reputationDocData = reputationResult.docs[0].data() as IReputation;
      const oldReputation = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(reputations[0][positiveField as keyof IReputation]),
        0
      );
      const newReputation = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(reputationDocData[positiveField as keyof IReputation]),
        0
      );
      expect(newReputation).toEqual(oldReputation + 1);
    });

    it("increment notification count (pendingPropsNums) for each community member beside who is proposing version", async () => {
      const proposerPendingPropsNumDocs = (
        await db
          .collection("pendingPropsNums")
          .where("tagId", "==", nodes[0].documentId)
          .where("uname", "==", users[0].uname)
          .get()
      ).docs;
      if (proposerPendingPropsNumDocs.length) {
        const proposerPendingPropsNumDoc = proposerPendingPropsNumDocs[0].data() as IPendingPropNum;
        expect(proposerPendingPropsNumDoc.pNum).toEqual(0);
      } else {
        expect(proposerPendingPropsNumDocs.length).toEqual(0);
      }

      const otherPendingPropsNumDocs = (
        await db
          .collection("pendingPropsNums")
          .where("tagId", "==", nodes[0].documentId)
          .where("uname", "!=", users[0].uname)
          .get()
      ).docs;
      for (const otherPendingPropsNumDoc of otherPendingPropsNumDocs) {
        const otherPendingPropsNumDocData = otherPendingPropsNumDoc.data() as IPendingPropNum;
        expect(otherPendingPropsNumDocData.pNum).toEqual(1);
      }
    });

    it("increase reputation of proposer", async () => {
      const reputationResult = await db
        .collection("weeklyReputations")
        .where("uname", "==", users[0].uname)
        .where("tagId", "==", users[0].tagId)
        .get();
      const reputationDocData = reputationResult.docs[0].data() as IReputation;
      const oldReputation = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(reputations[0][positiveField as keyof IReputation]),
        0
      );
      const newReputation = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(reputationDocData[positiveField as keyof IReputation]),
        0
      );
      expect(newReputation).toEqual(oldReputation + 1);
    });
    describe("if version getting accepted now", () => {
      describe("if its an improvement", () => {
        it("increase version points of node admin", async () => {
          const nodeDoc = await db.collection("nodes").doc(String(nodes[2].documentId)).get();
          expect(nodeDoc.data()?.versions).toBeGreaterThan(0);
          expect(nodeDoc.data()?.adminPoints).toBeGreaterThan(0);
          expect(nodeDoc.data()?.maxVersionRating).toBeGreaterThan(0);
        });

        it("select admin based on maxRating", async () => {
          nodeData = (await db.collection("nodes").doc(String(nodes[2].documentId)).get()).data() as INode;
          expect(nodeData.admin).toEqual(users[0].uname);
        });

        it("update node props (admin and props that are present in version)", async () => {
          expect(nodeData.title).toEqual("RANDOM TITLE");
        });

        it("create/set delete=false on tag doc that was tagged in this node and communities reputation docs", async () => {
          const tagDoc = await db.collection("tags").doc(String(tags[0].documentId)).get();
          const tagDocData = tagDoc.data() as ITag;
          expect(tagDocData.deleted).toEqual(false);
        });

        describe("create notification", () => {
          it("if version was not previously accepted then set oType=Proposal", async () => {
            const notifications = await db.collection("notifications").where("uname", "==", users[0].uname).get();
            const notification = notifications.docs[0].data() as INotification;
            expect(notification.oType).toEqual("PropoAccept");
          });

          it("aType values according voting action", async () => {
            const notifications = await db.collection("notifications").where("uname", "==", users[0].uname).get();
            const notification = notifications.docs[0].data() as INotification;
            expect(notification.aType).toEqual([
              "changedTitle",
              "addedTags",
              "changedTags",
              "addedParents",
              "addedChildren",
              "removedParents",
            ]);
          });
        });
      });
    });
  });
});
