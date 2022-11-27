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
import { createReputationPoints } from "testUtils/fakers/reputation-point";
initFirebaseClientSDK();

import { admin, db } from "src/lib/firestoreServer/admin";
import proposeChildNodeHandler, { IProposeChildNodePayload } from "src/pages/api/proposeChildNode";
import { IInstitution } from "src/types/IInstitution";
import { INode } from "src/types/INode";
import { INodeLink } from "src/types/INodeLink";
import { INodeType } from "src/types/INodeType";
import { INodeVersion } from "src/types/INodeVersion";
import { IPendingPropNum } from "src/types/IPendingPropNum";
import { IQuestionChoice } from "src/types/IQuestionChoice";
import { IReputation } from "src/types/IReputationPoint";
import { IUser } from "src/types/IUser";
import { IUserNode } from "src/types/IUserNode";
import { getTypedCollections } from "src/utils";
import { createInstitution } from "testUtils/fakers/institution";
import { createNode, createNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { createUser, getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

import { getTypesenseClient } from "@/lib/typesense/typesense.config";

describe("POST /api/proposeChildNode", () => {
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
      tags: [nodes[0]],
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
      isStudied: true, // for test edge case
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

  // adding reputation to default user, its required for auth middleware
  const reputations = [
    createReputationPoints({
      tag: nodes[0],
      user: users[0],
    }),
  ];

  const usersCollection = new MockData(users, "users");
  const creditsCollection = new MockData(credits, "credits");
  const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");

  const reputationsCollection = new MockData(reputations, "reputations");
  const notificationsCollection = new MockData([], "notifications");

  // TODO: need to check reputations, community points, tags, questionVersions, practice

  const collects = [
    usersCollection,
    creditsCollection,
    nodeVersionsCollection,
    reputationsCollection,
    notificationsCollection,
    new MockData(institutions, "institutions"),
    new MockData([], "monthlyReputations"),
    new MockData([], "weeklyReputations"),
    new MockData([], "othersReputations"),
    new MockData([], "othMonReputations"),
    new MockData([], "othWeekReputations"),

    new MockData([], "comPoints"),
    new MockData([], "comMonthlyPoints"),
    new MockData([], "comWeeklyPoints"),
    new MockData([], "comOthersPoints"),
    new MockData([], "comOthMonPoints"),
    new MockData([], "comOthWeekPoints"),

    new MockData([], "notificationNums"),
    new MockData([], "practice"),
    new MockData([], "questionVersions"),
    new MockData([], "userConceptVersions"),
    new MockData([], "userNodesLog"),
    new MockData([], "userQuestionVersions"),
    new MockData([], "userVersionsLog"),
    new MockData([], "tags"),
  ];

  const nodesCollection = new MockData(nodes, "nodes");
  collects.push(nodesCollection);
  const userNodesCollection = new MockData(userNodes, "userNodes");
  collects.push(userNodesCollection);

  let accessToken: string = "";

  describe("child node version should have choices array if child's nodeType=Question", () => {
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
            parentId: String(nodes[0].documentId),
            parentType: nodes[0].nodeType,
            nodeType: "Question" as INodeType,
            children: [],
            title: "Question?",
            content: "Question Contents....",
            parents: [
              {
                node: String(nodes[0].documentId),
                title: nodes[0].title,
                label: "",
                nodeType: nodes[0].nodeType,
              } as INodeLink,
            ],
            proposal: "reason of proposing this question",
            referenceIds: [],
            references: [],
            referenceLabels: [],
            summary: "summary of proposal",
            subType: null, // not implemented yet
            tagIds: [String(nodes[0].documentId)],
            tags: [nodes[0].title],
            choices: [
              {
                choice: "mock choice 1",
                correct: true,
                feedback: "You got it right!",
              } as IQuestionChoice,
            ], // only comes with NodeType=Question
          },
        } as IProposeChildNodePayload,
      });

      res = HttpMock.createResponse();
      await proposeChildNodeHandler(req, res as any);
    });

    afterAll(async () => {
      await deleteAllUsers();
      await Promise.all(collects.map(collect => collect.clean()));
    });

    it("childType=Question", async () => {
      expect(res._getStatusCode()).toEqual(200);
      const { versionsColl } = getTypedCollections({
        nodeType: "Question",
      });
      const nodeVersionsResult = await db.collection(versionsColl.id).orderBy("createdAt", "desc").limit(1).get();
      const questionVersionNode = nodeVersionsResult.docs[0].data() as INodeVersion;
      expect(questionVersionNode.choices?.length).toEqual(1);
    });
  });

  describe("check if version is approved ( versionNetVote (its child node in this case) >= parentNodeNetVote / 2 )", () => {
    describe("if its not approved then", () => {
      let res: MockResponse<any>;

      beforeAll(async () => {
        nodes[0].corrects = 10;
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
              parentId: String(nodes[0].documentId),
              parentType: nodes[0].nodeType,
              nodeType: "Question" as INodeType,
              children: [],
              title: "Question?",
              content: "Question Contents....",
              parents: [
                {
                  node: String(nodes[0].documentId),
                  title: nodes[0].title,
                  label: "",
                  nodeType: nodes[0].nodeType,
                } as INodeLink,
              ],
              proposal: "reason of proposing this question",
              referenceIds: [],
              references: [],
              referenceLabels: [],
              summary: "summary of proposal",
              subType: null, // not implemented yet
              tagIds: [String(nodes[0].documentId)],
              tags: [nodes[0].title],
              choices: [
                {
                  choice: "mock choice 1",
                  correct: true,
                  feedback: "You got it right!",
                } as IQuestionChoice,
              ], // only comes with NodeType=Question
            },
          } as IProposeChildNodePayload,
        });

        res = HttpMock.createResponse();
        await proposeChildNodeHandler(req, res as any);
      });

      afterAll(async () => {
        nodes[0].corrects = 1;
        await deleteAllUsers();
        await Promise.all(collects.map(collect => collect.clean()));
      });

      it("increase reputation of proposer and add nodeId, accepted=false and childType=payload.nodeType", async () => {
        const { versionsColl } = getTypedCollections({
          nodeType: nodes[0].nodeType,
        });
        const nodeVersionsResult = await db.collection(versionsColl.id).orderBy("createdAt", "desc").limit(1).get();
        const nodeVersion = nodeVersionsResult.docs[0].data() as INodeVersion;
        expect(nodeVersion.accepted).toEqual(false);
        expect(nodeVersion.childType).toEqual("Question" as INodeType);

        const reputationResult = await db
          .collection("reputations")
          .where("uname", "==", users[0].uname)
          .where("tagId", "==", users[0].tagId)
          .get();
        const reputationDocData = reputationResult.docs[0].data() as IReputation;
        const oldReputation = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(reputations[0][positiveField as keyof IReputation]),
          0
        );
        const newReputation = positiveFields.reduce(
          (carry: number, positiveField: string) =>
            carry + Number(reputationDocData[positiveField as keyof IReputation]),
          0
        );
        expect(newReputation).toEqual(oldReputation + 1);
      });

      let newNodeVersionId: string;

      it("increment versions count of parent node", async () => {
        const oldVersionCount = nodes[0].versions;
        const parentNodeDoc = await db.collection("nodes").doc(String(nodes[0].documentId)).get();
        const parentNodeDocData = parentNodeDoc.data() as INode;
        expect(parentNodeDocData.versions).toEqual(oldVersionCount + 1);
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

      it("create version doc (if approved it would be under new node and if not it would be under parent node with childType)", async () => {
        const { versionsColl } = getTypedCollections({
          nodeType: nodes[0].nodeType,
        });
        const nodeVersionsResult = await db.collection(versionsColl.id).orderBy("createdAt", "desc").limit(1).get();
        expect(nodeVersionsResult.docs.length).toEqual(1);
        const nodeVersion = nodeVersionsResult.docs[0]?.data() as INodeVersion;
        newNodeVersionId = nodeVersionsResult.docs[0].id;
        expect(nodeVersion.childType).toEqual("Question" as INodeType);
      });

      it("create user node version for proposer and set correct=true", async () => {
        const { userVersionsColl } = getTypedCollections({
          nodeType: nodes[0].nodeType,
        });
        const nodeVersionsResult = await db
          .collection(userVersionsColl.id)
          .where("version", "==", newNodeVersionId)
          .where("user", "==", users[0].uname)
          .limit(1)
          .get();
        expect(nodeVersionsResult.docs.length).toEqual(1);
        expect(nodeVersionsResult.docs[0].data().correct).toBeTruthy();
      });

      it("create user node version log for proposer", async () => {
        const nodeVersionsResult = await db
          .collection("userVersionsLog")
          .where("version", "==", newNodeVersionId)
          .where("user", "==", users[0].uname)
          .limit(1)
          .get();
        expect(nodeVersionsResult.docs.length).toEqual(1);
        expect(nodeVersionsResult.docs[0].data().correct).toBeTruthy();
      });

      it("create notification for proposer, should have aType=newChild and set oType=Propo if version not get accepted and oType=PropoAccept if version get accepted", async () => {
        const notifications = await db.collection("notifications").get();
        expect(notifications.docs.length).toEqual(1);
        expect(notifications.docs[0].data().oType).toEqual("Propo");
        expect(notifications.docs[0].data().aType).toEqual("newChild");
      });
    });

    describe("if its approved then", () => {
      let res: MockResponse<any>;

      beforeAll(async () => {
        nodes[0].corrects = 1;
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
              parentId: String(nodes[0].documentId),
              parentType: nodes[0].nodeType,
              nodeType: "Question" as INodeType,
              children: [],
              title: "Question?",
              content: "Question Contents....",
              parents: [
                {
                  node: String(nodes[0].documentId),
                  title: nodes[0].title,
                  label: "",
                  nodeType: nodes[0].nodeType,
                } as INodeLink,
              ],
              proposal: "reason of proposing this question",
              referenceIds: [],
              references: [],
              referenceLabels: [],
              summary: "summary of proposal",
              subType: null, // not implemented yet
              tagIds: [String(nodes[0].documentId)],
              tags: [nodes[0].title],
              choices: [
                {
                  choice: "mock choice 1",
                  correct: true,
                  feedback: "You got it right!",
                } as IQuestionChoice,
              ], // only comes with NodeType=Question
            },
          } as IProposeChildNodePayload,
        });

        res = HttpMock.createResponse();
        await proposeChildNodeHandler(req, res as any);
      });

      afterAll(async () => {
        await deleteAllUsers();
        await Promise.all(collects.map(collect => collect.clean()));
      });

      let newNodeId: string;
      let newNodeVersionId: string;

      it("increase reputation of proposer and add nodeId (new node id), accepted=true and nodeType=payload.nodeType", async () => {
        const { versionsColl } = getTypedCollections({
          nodeType: "Question",
        });
        const nodeVersionsResult = await db.collection(versionsColl.id).orderBy("createdAt", "desc").limit(1).get();
        const nodeVersion = nodeVersionsResult.docs[0].data() as INodeVersion;
        newNodeId = nodeVersion.node;
        newNodeVersionId = nodeVersionsResult.docs[0].id;
        expect(nodeVersion.accepted).toEqual(true);

        const reputationResult = await db
          .collection("reputations")
          .where("uname", "==", users[0].uname)
          .where("tagId", "==", users[0].tagId)
          .get();
        const reputationDocData = reputationResult.docs[0].data() as IReputation;
        const oldReputation = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(reputations[0][positiveField as keyof IReputation]),
          0
        );
        const newReputation = positiveFields.reduce(
          (carry: number, positiveField: string) =>
            carry + Number(reputationDocData[positiveField as keyof IReputation]),
          0
        );
        expect(newReputation).toEqual(oldReputation + 1);
      });

      it("node title updated in typesense", async () => {
        const typesense = getTypesenseClient();
        const tsNodeData: any = await typesense.collections("nodes").documents(newNodeId).retrieve();
        expect(tsNodeData.title).toEqual("Question?");
      });

      it("create new node with given data", async () => {
        const newNode = await db.collection("nodes").doc(newNodeId).get();
        expect(newNode.exists).toEqual(true);
      });

      it("new node should have choices property if its NodeType=Question and createPractice (skipping practice test for now as its not implemented)", async () => {
        const newNode = await db.collection("nodes").doc(newNodeId).get();
        const newNodeData = newNode.data() as INode;
        expect(newNodeData?.choices?.length).toEqual(1);
      });

      it("add child in children array of parent node", async () => {
        const parentNodeData = (await db.collection("nodes").doc(String(nodes[0].documentId)).get()).data() as INode;
        expect(parentNodeData.children.findIndex(child => child.node === newNodeId) !== -1).toBeTruthy();
      });

      it("single all user nodes for parent node and flag them isStudied=false because, its a major change", async () => {
        const userNodes = await db.collection("userNodes").where("node", "==", String(nodes[0].documentId)).get();
        for (const userNode of userNodes.docs) {
          const userNodeData = userNode.data() as IUserNode;
          expect(userNodeData.isStudied).toBeFalsy();
        }
      });

      it("create user node for new node and set user=proposer, isStudied=true, correct=true, open=true, visible=true", async () => {
        const userNodes = await db.collection("userNodes").where("node", "==", newNodeId).get();
        const userNodeData = userNodes.docs[0].data() as IUserNode;
        expect(userNodeData.user).toEqual(users[0].uname);
        expect(userNodeData.isStudied).toBeTruthy();
        expect(userNodeData.correct).toBeTruthy();
        expect(userNodeData.open).toBeTruthy();
        expect(userNodeData.visible).toBeTruthy();
      });

      it("create user node log for new node", async () => {
        const userNodesLogs = await db.collection("userNodesLog").where("node", "==", newNodeId).get();
        expect(userNodesLogs.docs.length).toEqual(1);
      });

      it("create version doc (if approved it would be under new node and if not it would be under parent node with childType)", async () => {
        const { versionsColl } = getTypedCollections({
          nodeType: "Question",
        });
        const nodeVersionsResult = await db.collection(versionsColl.id).orderBy("createdAt", "desc").limit(1).get();
        expect(nodeVersionsResult.docs.length).toEqual(1);
      });

      it("create user node version for proposer and set correct=true", async () => {
        const { userVersionsColl } = getTypedCollections({
          nodeType: "Question",
        });
        const nodeVersionsResult = await db
          .collection(userVersionsColl.id)
          .where("version", "==", newNodeVersionId)
          .where("user", "==", users[0].uname)
          .limit(1)
          .get();
        expect(nodeVersionsResult.docs.length).toEqual(1);
        expect(nodeVersionsResult.docs[0].data().correct).toBeTruthy();
      });

      it("create user node version log for proposer", async () => {
        const nodeVersionsResult = await db
          .collection("userVersionsLog")
          .where("version", "==", newNodeVersionId)
          .where("user", "==", users[0].uname)
          .limit(1)
          .get();
        expect(nodeVersionsResult.docs.length).toEqual(1);
        expect(nodeVersionsResult.docs[0].data().correct).toBeTruthy();
      });

      it("create notification for proposer, should have aType=newChild and set oType=Propo if version not get accepted and oType=PropoAccept if version get accepted", async () => {
        const notifications = await db.collection("notifications").get();
        expect(notifications.docs.length).toEqual(1);
        expect(notifications.docs[0].data().oType).toEqual("PropoAccept");
        expect(notifications.docs[0].data().aType).toEqual("newChild");
      });

      it("contribution should be updated", async () => {
        let contribution = 1;
        const user = await db.collection("users").doc(String(users[0].documentId)).get();
        const userData = user.data() as IUser;
        expect(userData.totalPoints).toEqual(contribution);

        const institution = await db.collection("institutions").doc(String(institutions[0].documentId)).get();
        const institutionData = institution.data() as IInstitution;
        expect(institutionData.totalPoints).toEqual(contribution);

        const node = await db.collection("nodes").doc(newNodeId).get();
        const nodeData = node.data() as INode;

        expect(nodeData.contribNames.includes(users[0].uname)).toEqual(true);
        expect(nodeData.contributors.hasOwnProperty(users[0].uname)).toEqual(true);
        expect(nodeData.contributors[users[0].uname].reputation).toEqual(contribution);

        expect(nodeData.institNames.includes(users[0].deInstit)).toEqual(true);
        expect(nodeData.institutions.hasOwnProperty(users[0].deInstit)).toEqual(true);
        expect(nodeData.institutions[users[0].deInstit].reputation).toEqual(contribution);
      });
    });
  });
});
