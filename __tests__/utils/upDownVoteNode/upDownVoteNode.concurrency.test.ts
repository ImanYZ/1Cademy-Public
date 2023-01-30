jest.mock("src/utils/helpers", () => {
  const original = jest.requireActual("src/utils/helpers");
  return {
    ...original,
    detach: jest.fn().mockImplementation(async (callback: any) => {
      return callback();
    }),
  };
});

import { arrayToChunks } from "src/utils";
import { comPointTypes, repPointTypes } from "src/utils/version-helpers";
import { createInstitution } from "testUtils/fakers/institution";

import { db, TWriteOperation } from "../../../src/lib/firestoreServer/admin";
import { INodeVoteActionType } from "../../../src/types/INode";
import { UpDownVoteNode } from "../../../src/utils/upDownVoteNode";
import { createNode, createNodeVersion, getDefaultNode } from "../../../testUtils/fakers/node";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import { createUserNode } from "../../../testUtils/fakers/userNode";
import { MockData } from "../../../testUtils/mockCollections";

describe("UpDownVoteNode", () => {
  describe("Concurrent Upvote on Reputation Documents", () => {
    const institutions = [
      createInstitution({
        domain: "@1cademy.com",
      }),
    ];

    const users = [
      getDefaultUser({
        institutionName: institutions[0].name,
      }),
      createUser({
        institutionName: institutions[0].name,
      }),
      createUser({
        institutionName: institutions[0].name,
      }),
    ];
    const nodes = [
      getDefaultNode({
        admin: users[0],
      }),
    ];
    nodes.push(
      createNode({
        admin: users[0],
        tags: [nodes[0]],
      })
    );

    // default user reputation
    const reputationPoints: any = [];

    const monthlyReputationPoints: any = [];
    const weeklyReputationPoints: any = [];

    // default user reputation from others
    const otherReputationPoints: any = [];
    const otherMonthlyReputationPoints: any = [];
    const otherWeeklyReputationPoints: any = [];

    // default user community points
    const comPoints: any = [];
    const comMonthlyPoints: any = [];
    const comWeeklyPoints: any = [];
    // default user other community points
    const otherComPoints: any = [];
    const otherComMonthlyPoints: any = [];
    const otherComWeeklyPoints: any = [];

    const userNodes: any = [];
    const nodeVersions = [];
    // default node version
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[0],
        proposer: users[0],
        corrects: 0,
      })
    );
    // mock node version (user's own first accepted proposal)
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[1],
        proposer: users[1],
        corrects: 0,
      })
    );
    // adding user nodes for mock users
    for (const user of users) {
      userNodes.push(
        createUserNode({
          node: nodes[0],
          user: user,
        })
      );
      userNodes.push(
        createUserNode({
          node: nodes[1],
          user: user,
        })
      );
    }

    const usersCollection = new MockData(users, "users");
    const nodesCollection = new MockData(nodes, "nodes");
    const conceptVersionsCollection = new MockData(nodeVersions, "conceptVersions");
    const userNodesCollection = new MockData(userNodes, "userNodes");

    const comPointsCollection = new MockData(comPoints, "comPoints");
    const comMonthlyPointsCollection = new MockData(comMonthlyPoints, "comMonthlyPoints");
    const comWeeklyPointsCollection = new MockData(comWeeklyPoints, "comWeeklyPoints");
    const otherComPointsCollection = new MockData(otherComPoints, "comOthersPoints");
    const otherComMonthlyPointsCollection = new MockData(otherComMonthlyPoints, "comOthMonPoints");
    const otherComWeeklyPointsCollection = new MockData(otherComWeeklyPoints, "comOthWeekPoints");

    const reputationPointsCollection = new MockData(reputationPoints, "reputations");
    const monthlyReputationPointsCollection = new MockData(monthlyReputationPoints, "monthlyReputations");
    const weeklyReputationPointsCollection = new MockData(weeklyReputationPoints, "weeklyReputations");
    const otherReputationPointsCollection = new MockData(otherReputationPoints, "othersReputations");
    const otherMonthlyReputationPointsCollection = new MockData(otherMonthlyReputationPoints, "othMonReputations");
    const otherWeeklyReputationPointsCollection = new MockData(otherWeeklyReputationPoints, "othWeekReputations");

    const notificationsCollection = new MockData([], "notifications");
    const notificationNumsCollection = new MockData([], "notificationNums");
    const userNodesLogCollection = new MockData([], "userNodesLog");

    const collects = [
      usersCollection,
      nodesCollection,
      conceptVersionsCollection,
      userNodesCollection,
      comPointsCollection,
      comMonthlyPointsCollection,
      comWeeklyPointsCollection,
      otherComPointsCollection,
      otherComMonthlyPointsCollection,
      otherComWeeklyPointsCollection,
      reputationPointsCollection,
      monthlyReputationPointsCollection,
      weeklyReputationPointsCollection,
      otherReputationPointsCollection,
      otherMonthlyReputationPointsCollection,
      otherWeeklyReputationPointsCollection,
      notificationsCollection,
      notificationNumsCollection,
      userNodesLogCollection,
      new MockData(institutions, "institutions"),
    ];

    beforeEach(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
    });

    afterEach(async () => {
      await Promise.all(collects.map(collect => collect.clean()));
    });

    it("sending 3 up votes concurrently", async () => {
      const calls: Promise<void>[] = [];
      for (let i = 0; i < 3; i++) {
        const call = (async () => {
          const tWriteOperations: TWriteOperation[] = [];
          await db.runTransaction(async t => {
            await UpDownVoteNode({
              fullname: `${users[0].fName} ${users[0].fName}`,
              uname: users[0].uname,
              imageUrl: users[0].imageUrl,
              chooseUname: users[0].chooseUname,
              nodeId: nodes[1].documentId,
              actionType: "Correct" as INodeVoteActionType,
              t,
              tWriteOperations,
            });

            const _tWriteOperations = tWriteOperations.splice(0, 499);
            for (const operation of _tWriteOperations) {
              const { objRef, data, operationType } = operation;
              switch (operationType) {
                case "update":
                  t.update(objRef, data);
                  break;
                case "set":
                  t.set(objRef, data);
                  break;
                case "delete":
                  t.delete(objRef);
                  break;
              }
            }
          });

          const chunkedArray = arrayToChunks(tWriteOperations);

          for (let chunk of chunkedArray) {
            await db.runTransaction(async t => {
              for (let operation of chunk) {
                const { objRef, data, operationType } = operation;
                switch (operationType) {
                  case "update":
                    t.update(objRef, data);
                    break;
                  case "set":
                    t.set(objRef, data);
                    break;
                  case "delete":
                    t.delete(objRef);
                    break;
                }
              }
            });
          }
        })();
        calls.push(call);
      }

      await Promise.all(calls);

      for (const repPointType of repPointTypes) {
        const reputationSnapshot = await db.collection(repPointType).get();
        expect(reputationSnapshot.docs.length).toEqual(1);
      }

      for (const comPointType of comPointTypes) {
        const comSnapshot = await db.collection(comPointType).get();
        expect(comSnapshot.docs.length).toEqual(1);
      }
    }, 10000);
  });
});
