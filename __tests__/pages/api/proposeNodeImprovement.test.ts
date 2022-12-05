jest.mock("src/utils/helpers", () => {
  const original = jest.requireActual("src/utils/helpers");
  return {
    ...original,
    detach: jest.fn().mockImplementation(async (callback: any) => {
      return callback();
    }),
  };
});

import { faker } from "@faker-js/faker";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import HttpMock, { MockResponse } from "node-mocks-http";
import { initFirebaseClientSDK } from "src/lib/firestoreClient/firestoreClient.config";
import { createCredit } from "testUtils/fakers/credit";
import { createReputationPoints, createWeeklyReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();

import { admin, db } from "src/lib/firestoreServer/admin";
import proposeNodeImprovementHandler from "src/pages/api/proposeNodeImprovement";
import { IInstitution } from "src/types/IInstitution";
import { INode } from "src/types/INode";
import { INotification } from "src/types/INotification";
import { IPendingPropNum } from "src/types/IPendingPropNum";
import { IReputation } from "src/types/IReputationPoint";
import { ITag } from "src/types/ITag";
import { IUser } from "src/types/IUser";
import { firstWeekMonthDays } from "src/utils";
import { createInstitution } from "testUtils/fakers/institution";
import { createNode, createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { createUser, getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

import { getTypesenseClient } from "@/lib/typesense/typesense.config";

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

  const institutions = [
    createInstitution({
      domain: "@1cademy.com",
    }),
  ];

  const users = [
    getDefaultUser({
      institutionName: institutions[0].name,
    }),
  ];
  const nodes = [
    getDefaultNode({
      admin: users[0],
    }),
  ];

  users.push(
    createUser({
      sNode: nodes[0],
      tag: nodes[0],
      institutionName: institutions[0].name,
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

  const node3 = createNode({
    admin: users[0],
    isTag: false,
    corrects: 1,
    parents: [nodes[1]],
    tags: [],
  });

  nodes.push(node3);

  // node to be a tag and we need this to check if its getting reputation and 1Cademy node (default node) also getting reputation
  const node4 = createNode({
    admin: users[0],
    isTag: true,
    corrects: 1,
  });
  nodes.push(node4);

  const node5 = createNode({
    admin: users[0],
    isTag: true,
    corrects: 1,
    parents: [node3],
  });
  nodes.push(node5);
  node3.children.push({
    node: String(node5.documentId),
    title: node5.title,
    label: "",
    type: "Concept",
  });

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
      tags: [],
      parents: [nodes[0]],
      children: [nodes[2]],
    }),
    createNodeVersion({
      node: nodes[2],
      accepted: false,
      proposer: users[0],
      corrects: 1,
      tags: [],
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
    new MockData(institutions, "institutions"),

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

    new MockData([], "othMonReputations"),
    new MockData([], "othWeekReputations"),
    new MockData([], "othersReputations"),
    new MockData([], "actionTracks"),
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
            tagIds: [nodes[0].documentId, node4.documentId],
            tags: [nodes[0].title, node4.title],
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

    it("edge case to check if api is not messup sub childrens", async () => {
      const _node5 = await db.collection("nodes").doc(String(node5.documentId)).get();
      const node5Data = _node5.data() as INode;
      const subChildren = node5Data?.children || [];
      expect(subChildren.length).toEqual(0);
    });

    it("increase reputation of proposer all time", async () => {
      const oldReputation = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(reputations[0][positiveField as keyof IReputation]),
        0
      );
      const reputationResult = await db
        .collection("monthlyReputations")
        .where("uname", "==", users[0].uname)
        .where("tagId", "==", node4.documentId)
        .get();
      const reputationDocData = reputationResult.docs[0].data() as IReputation;
      const newReputation = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(reputationDocData[positiveField as keyof IReputation]),
        0
      );
      expect(newReputation).toEqual(oldReputation + 1);
    });

    it("increase reputation of proposer monthly", async () => {
      const { firstMonthDay } = firstWeekMonthDays();
      const reputationResult = await db
        .collection("monthlyReputations")
        .where("uname", "==", users[0].uname)
        .where("tagId", "==", node4.documentId)
        .where("firstMonthDay", "==", firstMonthDay)
        .get();
      const reputationDocData = reputationResult.docs[0].data() as IReputation;
      const newReputation = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(reputationDocData[positiveField as keyof IReputation]),
        0
      );
      expect(newReputation).toEqual(1);
    });

    it("increase reputation of proposer weekly", async () => {
      const { firstWeekDay } = firstWeekMonthDays();
      const reputationResult = await db
        .collection("weeklyReputations")
        .where("uname", "==", users[0].uname)
        .where("tagId", "==", node4.documentId)
        .where("firstWeekDay", "==", firstWeekDay)
        .get();
      const reputationDocData = reputationResult.docs[0].data() as IReputation;
      const newReputation = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(reputationDocData[positiveField as keyof IReputation]),
        0
      );
      expect(newReputation).toEqual(1);
    });

    it("increase reputation of proposer all time (1Cademy)", async () => {
      const reputationResult = await db
        .collection("monthlyReputations")
        .where("uname", "==", users[0].uname)
        .where("tagId", "==", nodes[0].documentId)
        .get();
      const reputationDocData = reputationResult.docs[0].data() as IReputation;
      const newReputation = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(reputationDocData[positiveField as keyof IReputation]),
        0
      );
      expect(newReputation).toEqual(1);
    });

    it("increase reputation of proposer monthly (1Cademy)", async () => {
      const { firstMonthDay } = firstWeekMonthDays();
      const reputationResult = await db
        .collection("monthlyReputations")
        .where("uname", "==", users[0].uname)
        .where("tagId", "==", nodes[0].documentId)
        .where("firstMonthDay", "==", firstMonthDay)
        .get();
      const reputationDocData = reputationResult.docs[0].data() as IReputation;
      const newReputation = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(reputationDocData[positiveField as keyof IReputation]),
        0
      );
      expect(newReputation).toEqual(1);
    });

    it("increase reputation of proposer weekly (1Cademy)", async () => {
      const { firstWeekDay } = firstWeekMonthDays();
      const reputationResult = await db
        .collection("weeklyReputations")
        .where("uname", "==", users[0].uname)
        .where("tagId", "==", nodes[0].documentId)
        .where("firstWeekDay", "==", firstWeekDay)
        .get();
      const reputationDocData = reputationResult.docs[0].data() as IReputation;
      const newReputation = positiveFields.reduce(
        (carry: number, positiveField: string) => carry + Number(reputationDocData[positiveField as keyof IReputation]),
        0
      );
      expect(newReputation).toEqual(1);
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

    it("contribution should be updated", async () => {
      let contribution = 1;
      const user = await db.collection("users").doc(String(users[0].documentId)).get();
      const userData = user.data() as IUser;
      expect(userData.totalPoints).toEqual(contribution);

      const institution = await db.collection("institutions").doc(String(institutions[0].documentId)).get();
      const institutionData = institution.data() as IInstitution;
      expect(institutionData.totalPoints).toEqual(contribution);

      const node = await db.collection("nodes").doc(String(nodes[2].documentId)).get();
      const nodeData = node.data() as INode;

      expect(nodeData.contribNames.includes(users[0].uname)).toEqual(true);
      expect(nodeData.contributors.hasOwnProperty(users[0].uname)).toEqual(true);
      expect(nodeData.contributors[users[0].uname].reputation).toEqual(contribution);

      expect(nodeData.institNames.includes(users[0].deInstit)).toEqual(true);
      expect(nodeData.institutions.hasOwnProperty(users[0].deInstit)).toEqual(true);
      expect(nodeData.institutions[users[0].deInstit].reputation).toEqual(contribution);
    });

    describe("if version getting accepted now", () => {
      describe("if its an improvement", () => {
        it("increase version points of node admin", async () => {
          const nodeDoc = await db.collection("nodes").doc(String(nodes[2].documentId)).get();
          expect(nodeDoc.data()?.versions).toBeGreaterThan(0);
          expect(nodeDoc.data()?.adminPoints).toBeGreaterThan(0);
          expect(nodeDoc.data()?.maxVersionRating).toBeGreaterThan(0);
        });

        it("node title updated in typesense", async () => {
          const typesense = getTypesenseClient();
          const tsNodeData: any = await typesense
            .collections("nodes")
            .documents(String(nodes[2].documentId))
            .retrieve();
          expect(tsNodeData.title).toEqual("RANDOM TITLE");
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

        it("actionTracks based on sections", async () => {
          const actionTracks = (await db.collection("actionTracks").get()).docs;
          expect(actionTracks.length).toEqual(1);

          expect(actionTracks[0].data().doer).toEqual(users[0].uname);
        });
      });
    });
  });
});
