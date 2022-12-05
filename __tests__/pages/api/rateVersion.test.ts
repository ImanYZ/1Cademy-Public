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

import { DocumentSnapshot } from "firebase-admin/firestore";
import { admin, db } from "src/lib/firestoreServer/admin";
import rateVersionHandler, { IRateVersionPayload } from "src/pages/api/rateVersion";
import { IInstitution } from "src/types/IInstitution";
import { INode } from "src/types/INode";
import { INodeLink } from "src/types/INodeLink";
import { INodeVersion } from "src/types/INodeVersion";
import { INotification } from "src/types/INotification";
import { ITag } from "src/types/ITag";
import { IUser } from "src/types/IUser";
import { IUserNode } from "src/types/IUserNode";
import { getTypedCollections } from "src/utils";
import { createInstitution } from "testUtils/fakers/institution";
import { createNode, createNodeVersion, createUserNodeVersion, getDefaultNode } from "testUtils/fakers/node";
import { createUser, getDefaultUser } from "testUtils/fakers/user";
import { createUserNode } from "testUtils/fakers/userNode";
import deleteAllUsers from "testUtils/helpers/deleteAllUsers";
import { MockData } from "testUtils/mockCollections";

import { getTypesenseClient } from "@/lib/typesense/typesense.config";

describe("POST /api/rateVersion", () => {
  describe("if version was previously accepted", () => {
    let res: MockResponse<any>;

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
      // 2nd user's accepted proposal with more rating
      createNodeVersion({
        node: nodes[0],
        accepted: true,
        proposer: users[1],
        corrects: 3,
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
      createReputationPoints({
        tag: nodes[0],
        user: users[1],
      }),
    ];

    const usersCollection = new MockData(users, "users");
    const creditsCollection = new MockData(credits, "credits");
    const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");

    const reputationsCollection = new MockData(reputations, "reputations");
    const notificationsCollection = new MockData([], "notifications");

    const collects = [
      usersCollection,
      creditsCollection,
      nodeVersionsCollection,
      reputationsCollection,
      notificationsCollection,
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
      new MockData([], "userConceptVersions"),
      new MockData([], "userNodesLog"),
      new MockData([], "userVersionsLog"),
      new MockData([], "tags"),
      new MockData(institutions, "institutions"),

      new MockData(
        [
          {
            documentId: users[0].documentId,
            state: "online",
            last_online: new Date(),
          },
          {
            documentId: users[1].documentId,
            state: "online",
            last_online: new Date(),
          },
        ],
        "status"
      ),
      new MockData([], "actionTracks"),
    ];

    const nodesCollection = new MockData(nodes, "nodes");
    collects.push(nodesCollection);
    const userNodesCollection = new MockData(userNodes, "userNodes");
    collects.push(userNodesCollection);

    let accessToken: string = "";

    beforeAll(async () => {
      const user = await auth.createUser({
        email: users[0].email,
        password: mockPassword,
        disabled: false,
        emailVerified: true,
      });
      users[0].userId = user.uid;

      const user2 = await auth.createUser({
        email: users[1].email,
        password: mockPassword,
        disabled: false,
        emailVerified: true,
      });
      const r = await signInWithEmailAndPassword(getAuth(), users[1].email, mockPassword);
      accessToken = await r.user.getIdToken(false);
      users[1].userId = user2.uid;

      await Promise.all(collects.map(collect => collect.populate()));

      const req: any = HttpMock.createRequest({
        method: "POST",
        headers: {
          authorization: "Bearer " + accessToken,
        },
        body: {
          nodeId: String(nodes[0].documentId),
          versionId: String(nodeVersions[0].documentId),
          nodeType: nodes[0].nodeType,
          award: false,
          correct: true,
          wrong: false,
        } as IRateVersionPayload,
      });

      res = HttpMock.createResponse();
      await rateVersionHandler(req, res as any);
    });

    afterAll(async () => {
      await deleteAllUsers();
      await Promise.all(collects.map(collect => collect.clean()));
    });

    let nodeData: INode;

    it("select admin based on maxRating", async () => {
      nodeData = (await db.collection("nodes").doc(String(nodes[0].documentId)).get()).data() as INode;
      expect(nodeData.admin).toEqual(users[1].uname);
    });

    it("update node if admin was changed or/and maxVersionRating was changed", async () => {
      expect(nodeData.maxVersionRating).toEqual(3);
    });

    // TODO: need to comment this when we use setImmediate
    it("single a user nodes with major=false", async () => {
      const userNodes = await db
        .collection("userNodes")
        .where("user", "==", String(users[1].documentId))
        .where("node", "==", String(nodes[0].documentId))
        .get();
      const userNodeData = userNodes.docs[0].data() as IUserNode;
      expect(userNodeData.nodeChanges?.maxVersionRating).toEqual(3);
    });

    it("contribution should be updated", async () => {
      const user = await db.collection("users").doc(String(users[0].documentId)).get();
      const userData = user.data() as IUser;
      expect(userData.totalPoints).toEqual(1);

      const institution = await db.collection("institutions").doc(String(institutions[0].documentId)).get();
      const institutionData = institution.data() as IInstitution;
      expect(institutionData.totalPoints).toEqual(1);

      const node = await db.collection("nodes").doc(String(nodes[0].documentId)).get();
      const nodeData = node.data() as INode;

      expect(nodeData.contribNames.includes(users[0].uname)).toEqual(true);
      expect(nodeData.contributors.hasOwnProperty(users[0].uname)).toEqual(true);
      expect(nodeData.contributors[users[0].uname].reputation).toEqual(1);

      expect(nodeData.institNames.includes(users[0].deInstit)).toEqual(true);
      expect(nodeData.institutions.hasOwnProperty(users[0].deInstit)).toEqual(true);
      expect(nodeData.institutions[users[0].deInstit].reputation).toEqual(1);
    });

    describe("create notification", () => {
      it("if version was previously accepted oType=AccProposal", async () => {
        const notifications = await db.collection("notifications").where("uname", "==", users[1].uname).get();
        const notification = notifications.docs[0].data() as INotification;
        expect(notification.oType).toEqual("AccProposal");
        expect(notification.aType).toEqual("Correct");
      });
    });
  });

  describe("if version getting accepted now", () => {
    describe("if its an improvement", () => {
      let res: MockResponse<any>;

      const institutions = [
        createInstitution({
          domain: "@1cademy.com",
        }),
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

      // 3rd node
      nodes.push(
        createNode({
          admin: users[1],
          isTag: false,
          corrects: 1,
          parents: [nodes[1]],
        })
      );

      nodes[1].children.push({
        node: nodes[2].documentId,
        title: nodes[2].title,
        label: "",
        type: nodes[2].nodeType,
      } as INodeLink);

      nodes[0].children.push({
        node: String(nodes[1].documentId),
        title: nodes[1].title,
        type: nodes[1].nodeType,
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
        }),
        // 2nd user's non accepted proposal with more rating
        createNodeVersion({
          node: nodes[1],
          accepted: false,
          proposer: users[1],
          corrects: 3,
          tags: [nodes[0]],
          parents: [nodes[0]],
          children: [nodes[2]],
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
        createReputationPoints({
          tag: nodes[0],
          user: users[1],
        }),
      ];

      const usersCollection = new MockData(users, "users");
      const creditsCollection = new MockData(credits, "credits");
      const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");

      const reputationsCollection = new MockData(reputations, "reputations");
      const notificationsCollection = new MockData([], "notifications");

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
        new MockData([], "userConceptVersions"),
        new MockData([], "userNodesLog"),
        new MockData([], "userVersionsLog"),
        new MockData(tags, "tags"),

        new MockData(
          [
            {
              documentId: users[0].documentId,
              state: "online",
              last_online: new Date(),
            },
            {
              documentId: users[1].documentId,
              state: "online",
              last_online: new Date(),
            },
          ],
          "status"
        ),
        new MockData([], "actionTracks"),
      ];

      const nodesCollection = new MockData(nodes, "nodes");
      collects.push(nodesCollection);
      const userNodesCollection = new MockData(userNodes, "userNodes");
      collects.push(userNodesCollection);

      let accessToken: string = "";

      beforeAll(async () => {
        const user = await auth.createUser({
          email: users[0].email,
          password: mockPassword,
          disabled: false,
          emailVerified: true,
        });
        users[0].userId = user.uid;

        const user2 = await auth.createUser({
          email: users[1].email,
          password: mockPassword,
          disabled: false,
          emailVerified: true,
        });
        const r = await signInWithEmailAndPassword(getAuth(), users[1].email, mockPassword);
        accessToken = await r.user.getIdToken(false);
        users[1].userId = user2.uid;

        await Promise.all(collects.map(collect => collect.populate()));

        const req: any = HttpMock.createRequest({
          method: "POST",
          headers: {
            authorization: "Bearer " + accessToken,
          },
          body: {
            nodeId: String(nodes[1].documentId),
            versionId: String(nodeVersions[1].documentId),
            nodeType: nodes[1].nodeType,
            award: false,
            correct: true,
            wrong: false,
          } as IRateVersionPayload,
        });

        res = HttpMock.createResponse();
        await rateVersionHandler(req, res as any);
      });

      afterAll(async () => {
        await deleteAllUsers();
        await Promise.all(collects.map(collect => collect.clean()));
      });

      let nodeData: INode;

      it("select admin based on maxRating", async () => {
        nodeData = (await db.collection("nodes").doc(String(nodes[1].documentId)).get()).data() as INode;
        expect(nodeData.admin).toEqual(users[1].uname);
      });

      it("update node props (admin and props that are present in version)", async () => {
        expect(nodeData.title).toEqual(nodeVersions[1].title);
      });

      it("node title updated in typesense", async () => {
        const typesense = getTypesenseClient();
        const tsNodeData: any = await typesense.collections("nodes").documents(String(nodes[1].documentId)).retrieve();
        expect(tsNodeData.title).toEqual(nodeVersions[1].title);
      });

      it("create/set delete=false on tag doc that was tagged in this node and communities reputation docs", async () => {
        const tagDoc = await db.collection("tags").doc(String(tags[0].documentId)).get();
        const tagDocData = tagDoc.data() as ITag;
        expect(tagDocData.deleted).toEqual(false);
      });

      // TODO: not checking reference type node and isTag=true
      it("if node title has been changed, change it every where title can be present (tags, nodes.children[x].title, nodes.parents[x].title, community docs and reputation docs)", async () => {
        const parentNode = await db.collection("nodes").doc(String(nodes[0].documentId)).get();
        const parentNodeData = parentNode.data() as INode;
        const childNode = await db.collection("nodes").doc(String(nodes[2].documentId)).get();
        const childNodeData = childNode.data() as INode;
        expect(parentNodeData.children[0].title).toEqual(nodeVersions[1].title);
        expect(childNodeData.parents[0].title).toEqual(nodeVersions[1].title);
      });

      it("contribution should be updated", async () => {
        let contribution = 4;
        const user = await db.collection("users").doc(String(users[1].documentId)).get();
        const userData = user.data() as IUser;
        expect(userData.totalPoints).toEqual(contribution);

        const institution = await db.collection("institutions").doc(String(institutions[0].documentId)).get();
        const institutionData = institution.data() as IInstitution;
        expect(institutionData.totalPoints).toEqual(contribution);

        const node = await db.collection("nodes").doc(String(nodes[1].documentId)).get();
        const nodeData = node.data() as INode;

        expect(nodeData.contribNames.includes(users[1].uname)).toEqual(true);
        expect(nodeData.contributors.hasOwnProperty(users[1].uname)).toEqual(true);
        expect(nodeData.contributors[users[1].uname].reputation).toEqual(contribution);

        expect(nodeData.institNames.includes(users[1].deInstit)).toEqual(true);
        expect(nodeData.institutions.hasOwnProperty(users[1].deInstit)).toEqual(true);
        expect(nodeData.institutions[users[1].deInstit].reputation).toEqual(contribution);
      });

      // Not checking these soon I will detach this with main process
      /* it("add {node id,title,nodeType} in parentNode.children and signal all parent nodes as major=true", async () => {
      
      })

      it("add {node id, title, nodeType} in childNode.parents and signal all child nodes as major=true", async () => {
      
      })

      it("remove {node id,title,nodeType} from removedParentNode.children and signal all removed parent nodes as major=true", async () => {
      
      })

      it("remove {node id,title,nodeType} from removedChildNode.parents and signal all removed child nodes as major=true", async () => {
      
      }) */

      describe("create notification", () => {
        it("if version was not previously accepted then set oType=Proposal", async () => {
          const notifications = await db.collection("notifications").where("uname", "==", users[1].uname).get();
          const notification = notifications.docs[0].data() as INotification;
          expect(notification.oType).toEqual("Proposal");
        });

        it("aType values according voting action", async () => {
          const notifications = await db.collection("notifications").where("uname", "==", users[1].uname).get();
          const notification = notifications.docs[0].data() as INotification;
          expect(notification.aType).toEqual("Accept");
        });
      });

      it("actionTracks based on sections", async () => {
        const actionTracks = (await db.collection("actionTracks").get()).docs;
        expect(actionTracks.length).toEqual(1);

        expect(actionTracks[0].data().doer).toEqual(users[1].uname);
        expect(actionTracks[0].data().receivers.includes(users[1].uname)).toBeTruthy();
      });
    });

    describe("if its not an improvement and a child node", () => {
      let res: MockResponse<any>;

      const institutions = [
        createInstitution({
          domain: "@1cademy.com",
        }),
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

      // 3rd node
      nodes.push(
        createNode({
          admin: users[1],
          isTag: false,
          corrects: 1,
          parents: [nodes[1]],
        })
      );

      nodes[1].children.push({
        node: nodes[2].documentId,
        title: nodes[2].title,
        label: "",
        type: nodes[2].nodeType,
      } as INodeLink);

      nodes[0].children.push({
        node: String(nodes[1].documentId),
        title: nodes[1].title,
        type: nodes[1].nodeType,
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
        // to check delete=true edge case
        createUserNode({
          user: users[0],
          node: nodes[1],
          correct: true,
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
        }),
        // 2nd user's non accepted proposal with more rating
        createNodeVersion({
          node: nodes[1],
          accepted: false,
          proposer: users[1],
          childType: "Question",
          corrects: 3,
          tags: [nodes[0]],
          parents: [nodes[0]],
          children: [nodes[2]],
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
        createReputationPoints({
          tag: nodes[0],
          user: users[1],
        }),
      ];

      const usersCollection = new MockData(users, "users");
      const creditsCollection = new MockData(credits, "credits");
      const nodeVersionsCollection = new MockData(nodeVersions, "conceptVersions");

      const reputationsCollection = new MockData(reputations, "reputations");
      const notificationsCollection = new MockData([], "notifications");

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
        new MockData([], "userConceptVersions"),
        new MockData([], "userNodesLog"),
        new MockData([], "userVersionsLog"),
        new MockData([], "questionVersions"),
        new MockData([], "userQuestionVersions"),

        new MockData(tags, "tags"),

        new MockData(
          [
            {
              documentId: users[0].documentId,
              state: "online",
              last_online: new Date(),
            },
            {
              documentId: users[1].documentId,
              state: "online",
              last_online: new Date(),
            },
          ],
          "status"
        ),

        new MockData(
          [
            createUserNodeVersion({
              node: nodes[1],
              user: users[1],
              version: nodeVersions[1],
              correct: true,
            }),
          ],
          "userConceptVersions"
        ),
        new MockData([], "actionTracks"),
      ];

      const nodesCollection = new MockData(nodes, "nodes");
      collects.push(nodesCollection);
      const userNodesCollection = new MockData(userNodes, "userNodes");
      collects.push(userNodesCollection);

      let accessToken: string = "";

      beforeAll(async () => {
        const user = await auth.createUser({
          email: users[0].email,
          password: mockPassword,
          disabled: false,
          emailVerified: true,
        });
        users[0].userId = user.uid;

        const user2 = await auth.createUser({
          email: users[1].email,
          password: mockPassword,
          disabled: false,
          emailVerified: true,
        });
        const r = await signInWithEmailAndPassword(getAuth(), users[1].email, mockPassword);
        accessToken = await r.user.getIdToken(false);
        users[1].userId = user2.uid;

        await Promise.all(collects.map(collect => collect.populate()));

        const req: any = HttpMock.createRequest({
          method: "POST",
          headers: {
            authorization: "Bearer " + accessToken,
          },
          body: {
            nodeId: String(nodes[1].documentId),
            versionId: String(nodeVersions[1].documentId),
            nodeType: nodes[1].nodeType,
            award: false,
            correct: true,
            wrong: false,
          } as IRateVersionPayload,
        });

        res = HttpMock.createResponse();
        await rateVersionHandler(req, res as any);
      });

      afterAll(async () => {
        await deleteAllUsers();
        await Promise.all(collects.map(collect => collect.clean()));
      });

      let nodeData: INode;

      it("select admin based on maxRating", async () => {
        nodeData = (await db.collection("nodes").doc(String(nodes[1].documentId)).get()).data() as INode;
        expect(nodeData.admin).toEqual(users[1].uname);
      });

      let newNode: DocumentSnapshot<any>;

      it("create a new node", async () => {
        newNode = (await db.collection("nodes").orderBy("createdAt", "desc").limit(1).get()).docs[0];
        const newNodeData = newNode.data() as INode;
        expect(newNodeData.title).toEqual(nodeVersions[1].title);
      });

      it("add parent node (node where this new node was proposed as version) in new node", async () => {
        const newNodeData = newNode.data() as INode;
        expect(newNodeData.parents[0].node).toEqual(nodes[1].documentId);
      });

      it("created node's title in typesense", async () => {
        const typesense = getTypesenseClient();
        const tsNodeData: any = await typesense.collections("nodes").documents(newNode.id).retrieve();
        expect(tsNodeData.title).toEqual(nodeVersions[1].title);
      });

      let newNodeVersion: DocumentSnapshot<any>;

      it("create version for new node that is accepted", async () => {
        const newNodeData = newNode.data() as INode;
        const { versionsColl } = getTypedCollections({
          nodeType: newNodeData.nodeType,
        });
        const newNodeVersions = await db.collection(versionsColl.id).where("node", "==", newNode.id).get();
        expect(newNodeVersions.docs.length).toEqual(1);
        newNodeVersion = newNodeVersions.docs[0];
      });

      it("create user version in relative nodeType user version collection", async () => {
        const newNodeData = newNode.data() as INode;
        const { userVersionsColl } = getTypedCollections({
          nodeType: newNodeData.nodeType,
        });
        const newUserNodeVersions = await db
          .collection(userVersionsColl.id)
          .where("version", "==", newNodeVersion.id)
          .where("user", "==", users[1].uname)
          .get();
        expect(newUserNodeVersions.docs.length).toEqual(1);
      });

      it("create practice if childType was Question (we are not testing it right now)", async () => {
        const practices = await db
          .collection("practice")
          .where("node", "==", newNode.id)
          .where("user", "==", users[1].uname)
          .get();
        expect(practices.docs.length).toEqual(1);
      });

      // Not checking this soon I will detach this with main process
      /* it("signal user nodes where child was proposed as major=true", async () => {
      
      }) */

      describe("if version is approved and it has childType", () => {
        it("flag version as deleted", async () => {
          const { versionsColl } = getTypedCollections({
            nodeType: nodes[1].nodeType,
          });
          const versions = await db.collection(versionsColl.id).where("node", "==", nodes[1].documentId).get();
          const versionData = versions.docs[0].data() as INodeVersion;
          expect(versionData.deleted).toEqual(true);
        });

        it("flag user version as deleted", async () => {
          const { userVersionsColl } = getTypedCollections({
            nodeType: nodes[1].nodeType,
          });
          const userVersions = await db
            .collection(userVersionsColl.id)
            .where("version", "==", nodeVersions[1].documentId)
            .where("user", "==", users[1].uname)
            .get();
          const versionData = userVersions.docs[0].data() as INodeVersion;
          expect(versionData.deleted).toEqual(true);
        });
      });

      it("contribution should be updated", async () => {
        let contribution = 2;
        const user = await db.collection("users").doc(String(users[1].documentId)).get();
        const userData = user.data() as IUser;
        expect(userData.totalPoints).toEqual(contribution);

        const institution = await db.collection("institutions").doc(String(institutions[0].documentId)).get();
        const institutionData = institution.data() as IInstitution;
        expect(institutionData.totalPoints).toEqual(contribution);

        const node = await db.collection("nodes").doc(String(nodes[1].documentId)).get();
        const nodeData = node.data() as INode;

        expect(nodeData.contribNames.includes(users[1].uname)).toEqual(true);
        expect(nodeData.contributors.hasOwnProperty(users[1].uname)).toEqual(true);
        expect(nodeData.contributors[users[1].uname].reputation).toEqual(contribution);

        expect(nodeData.institNames.includes(users[1].deInstit)).toEqual(true);
        expect(nodeData.institutions.hasOwnProperty(users[1].deInstit)).toEqual(true);
        expect(nodeData.institutions[users[1].deInstit].reputation).toEqual(contribution);
      });

      describe("create notification", () => {
        it("if version was not previously accepted then set oType=Proposal", async () => {
          const notifications = await db.collection("notifications").where("uname", "==", users[1].uname).get();
          const notification = notifications.docs[0].data() as INotification;
          expect(notification.oType).toEqual("Proposal");
        });

        it("aType values according voting action", async () => {
          const notifications = await db.collection("notifications").where("uname", "==", users[1].uname).get();
          const notification = notifications.docs[0].data() as INotification;
          expect(notification.aType).toEqual("Accept");
        });
      });

      it("actionTracks based on sections", async () => {
        const actionTracks = (await db.collection("actionTracks").get()).docs;
        expect(actionTracks.length).toEqual(1);

        expect(actionTracks[0].data().doer).toEqual(users[1].uname);
        expect(actionTracks[0].data().receivers.includes(users[1].uname)).toBeTruthy();
      });
    });
  });
});
