import { db } from "../../../src/lib/firestoreServer/admin";
import { IComPoint } from "../../../src/types/IComPoint";
import { INode, INodeVoteActionType } from "../../../src/types/INode";
import { INodeLink } from "../../../src/types/INodeLink";
import { INodeType } from "../../../src/types/INodeType";
import { IReputation } from "../../../src/types/IReputationPoint";
import { IUserNode } from "../../../src/types/IUserNode";
import { UpDownVoteNode } from "../../../src/utils/upDownVoteNode";
import { createComMonthlyPoints, createComPoints, createComWeeklyPoints } from "../../../testUtils/fakers/com-point";
import { createNode, createNodeVersion, getDefaultNode } from "../../../testUtils/fakers/node";
import {
  createMonthlyReputationPoints,
  createReputationPoints,
  createWeeklyReputationPoints,
} from "../../../testUtils/fakers/reputation-point";
import { createUser, getDefaultUser } from "../../../testUtils/fakers/user";
import { createUserNode } from "../../../testUtils/fakers/userNode";
import { MockData } from "../../../testUtils/mockCollections";

describe("UpDownVoteNode", () => {
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

  const negativeFields = [
    // for Concept nodes
    "cnWrongs",
    // for Code nodes
    "cdWrongs",
    // for Question nodes
    "qWrongs",
    //  for Profile nodes
    "pWrongs",
    //  for Sequel nodes
    "sWrongs",
    //  for Advertisement nodes
    "aWrongs",
    //  for Reference nodes
    "rfWrongs",
    //  for News nodes
    "nWrongs",
    //  for Idea nodes
    "iWrongs",
    //  for Relation nodes
    "mWrongs",
  ];

  const communityPointCollections = ["comPoints", "comMonthlyPoints", "comWeeklyPoints"];
  const otherCommunityPointCollections = ["comOthersPoints", "comOthMonPoints", "comOthWeekPoints"];
  const reputationPointCollections = ["reputations", "monthlyReputations", "weeklyReputations"];
  const otherReputationPointCollections = ["othersReputations", "othMonReputations", "othWeekReputations"];

  describe("Case 1: Upvote", () => {
    const users = [getDefaultUser({}), createUser({}), createUser({})];
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
    const reputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const monthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
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
    // default user reputation from others
    const otherReputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherMonthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherWeeklyReputationPoints = [
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

    // default user community points
    const comPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    // default user other community points
    const otherComPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];

    const userNodes = [
      createUserNode({
        node: nodes[0],
        user: users[0],
      }),
    ];
    const nodeVersions = [];
    // default node version
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[0],
        proposer: users[0],
        // corrects: 0
      })
    );
    // mock node version (user's own first accepted proposal)
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[1],
        proposer: users[1],
        // corrects: 1 // this was required to have correct calculation
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
    ];

    beforeEach(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
    });

    afterEach(async () => {
      await Promise.all(collects.map(collect => collect.clean()));
    });

    it("voting on node (self-vote)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[1].fName} ${users[1].fName}`,
        uname: users[1].uname,
        imageUrl: users[1].imageUrl,
        chooseUname: users[1].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Correct" as INodeVoteActionType,
      });
      for (const communityPointCollection of communityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection] + 1);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection]);
      }
      for (const communityPointCollection of otherCommunityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection]);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection]);
      }

      for (const pointCollect of reputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect] + 1);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect]);
      }
      for (const pointCollect of otherReputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect]);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect]);
      }
    });

    it("voting on node (others)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};

      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[2].fName} ${users[2].fName}`,
        uname: users[2].uname,
        imageUrl: users[2].imageUrl,
        chooseUname: users[2].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Correct" as INodeVoteActionType,
      });
      // const comPoints = (await db.collection("comPoints").where("tagId", "==", nodes[0].documentId).get()).docs[0].data()
      // console.log(comPoints, 'comPoints after')
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection] + 1);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection]);
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect] + 1);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect]);
      }
    });
  });

  describe("Case 2: Downvote", () => {
    const users = [getDefaultUser({}), createUser({}), createUser({})];
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
    const reputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const monthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
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
    // default user reputation from others
    const otherReputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherMonthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherWeeklyReputationPoints = [
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

    // default user community points
    const comPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    // default user other community points
    const otherComPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];

    const userNodes = [
      createUserNode({
        node: nodes[0],
        user: users[0],
      }),
    ];
    const nodeVersions = [];
    // default node version
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[0],
        proposer: users[0],
        // corrects: 0
      })
    );
    // mock node version (user's own first accepted proposal)
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[1],
        proposer: users[1],
        // corrects: 1 // this was required to have correct calculation
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
    ];

    beforeEach(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
    });

    afterEach(async () => {
      await Promise.all(collects.map(collect => collect.clean()));
    });

    it("voting on node (self-vote)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[1].fName} ${users[1].fName}`,
        uname: users[1].uname,
        imageUrl: users[1].imageUrl,
        chooseUname: users[1].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Wrong" as INodeVoteActionType,
      });
      for (const communityPointCollection of communityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection]);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection] + 1);
      }
      for (const communityPointCollection of otherCommunityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection]);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection]);
      }

      for (const pointCollect of reputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect]);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect] + 1);
      }
      for (const pointCollect of otherReputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect]);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect]);
      }
    });

    it("voting on node (others)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};

      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[2].fName} ${users[2].fName}`,
        uname: users[2].uname,
        imageUrl: users[2].imageUrl,
        chooseUname: users[2].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Wrong" as INodeVoteActionType,
      });
      // const comPoints = (await db.collection("comPoints").where("tagId", "==", nodes[0].documentId).get()).docs[0].data()
      // console.log(comPoints, 'comPoints after')
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection]);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection] + 1);
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect]);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect] + 1);
      }
    });
  });

  describe("Case 3: Upvote and Remove Downvote", () => {
    const users = [getDefaultUser({}), createUser({}), createUser({})];
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
    const reputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const monthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
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
    // default user reputation from others
    const otherReputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherMonthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherWeeklyReputationPoints = [
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

    // default user community points
    const comPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    // default user other community points
    const otherComPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];

    const userNodes = [
      createUserNode({
        node: nodes[0],
        user: users[0],
      }),
    ];
    const nodeVersions = [];
    // default node version
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[0],
        proposer: users[0],
        // corrects: 0
      })
    );
    // mock node version (user's own first accepted proposal)
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[1],
        proposer: users[1],
        // corrects: 1 // this was required to have correct calculation
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
          wrong: users[0].uname !== user.uname ? true : false,
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
    ];

    beforeEach(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
    });

    afterEach(async () => {
      await Promise.all(collects.map(collect => collect.clean()));
    });

    it("voting on node (self-vote)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[1].fName} ${users[1].fName}`,
        uname: users[1].uname,
        imageUrl: users[1].imageUrl,
        chooseUname: users[1].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Correct" as INodeVoteActionType,
      });
      for (const communityPointCollection of communityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection] + 1);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection] - 1);
      }
      for (const communityPointCollection of otherCommunityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection]);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection]);
      }

      for (const pointCollect of reputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect] + 1);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect] - 1);
      }
      for (const pointCollect of otherReputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect]);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect]);
      }
    });

    it("voting on node (others)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};

      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[2].fName} ${users[2].fName}`,
        uname: users[2].uname,
        imageUrl: users[2].imageUrl,
        chooseUname: users[2].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Correct" as INodeVoteActionType,
      });
      // const comPoints = (await db.collection("comPoints").where("tagId", "==", nodes[0].documentId).get()).docs[0].data()
      // console.log(comPoints, 'comPoints after')
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection] + 1);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection] - 1);
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect] + 1);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect] - 1);
      }
    });
  });

  describe("Case 4: Remove Upvote and Downvote", () => {
    const users = [getDefaultUser({}), createUser({}), createUser({})];
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
    const reputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const monthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
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
    // default user reputation from others
    const otherReputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherMonthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherWeeklyReputationPoints = [
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

    // default user community points
    const comPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    // default user other community points
    const otherComPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];

    const userNodes = [
      createUserNode({
        node: nodes[0],
        user: users[0],
      }),
    ];
    const nodeVersions = [];
    // default node version
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[0],
        proposer: users[0],
        // corrects: 0
      })
    );
    // mock node version (user's own first accepted proposal)
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[1],
        proposer: users[1],
        // corrects: 1 // this was required to have correct calculation
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
          correct: users[0].uname !== user.uname ? true : false,
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
    ];

    beforeEach(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
    });

    afterEach(async () => {
      await Promise.all(collects.map(collect => collect.clean()));
    });

    it("voting on node (self-vote)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[1].fName} ${users[1].fName}`,
        uname: users[1].uname,
        imageUrl: users[1].imageUrl,
        chooseUname: users[1].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Wrong" as INodeVoteActionType,
      });
      for (const communityPointCollection of communityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection] - 1);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection] + 1);
      }
      for (const communityPointCollection of otherCommunityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection]);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection]);
      }

      for (const pointCollect of reputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect] - 1);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect] + 1);
      }
      for (const pointCollect of otherReputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect]);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect]);
      }
    });

    it("voting on node (others)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};

      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[2].fName} ${users[2].fName}`,
        uname: users[2].uname,
        imageUrl: users[2].imageUrl,
        chooseUname: users[2].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Wrong" as INodeVoteActionType,
      });
      // const comPoints = (await db.collection("comPoints").where("tagId", "==", nodes[0].documentId).get()).docs[0].data()
      // console.log(comPoints, 'comPoints after')
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection] - 1);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection] + 1);
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect] - 1);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect] + 1);
      }
    });
  });

  describe("Case 5: Remove Upvote", () => {
    const users = [getDefaultUser({}), createUser({}), createUser({})];
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
    const reputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const monthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
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
    // default user reputation from others
    const otherReputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherMonthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherWeeklyReputationPoints = [
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

    // default user community points
    const comPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    // default user other community points
    const otherComPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];

    const userNodes = [
      createUserNode({
        node: nodes[0],
        user: users[0],
      }),
    ];
    const nodeVersions = [];
    // default node version
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[0],
        proposer: users[0],
        // corrects: 0
      })
    );
    // mock node version (user's own first accepted proposal)
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[1],
        proposer: users[1],
        // corrects: 1 // this was required to have correct calculation
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
          correct: users[0].uname !== user.uname ? true : false,
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
    ];

    beforeEach(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
    });

    afterEach(async () => {
      await Promise.all(collects.map(collect => collect.clean()));
    });

    it("voting on node (self-vote)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[1].fName} ${users[1].fName}`,
        uname: users[1].uname,
        imageUrl: users[1].imageUrl,
        chooseUname: users[1].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Correct" as INodeVoteActionType,
      });
      for (const communityPointCollection of communityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection] - 1);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection]);
      }
      for (const communityPointCollection of otherCommunityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection]);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection]);
      }

      for (const pointCollect of reputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect] - 1);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect]);
      }
      for (const pointCollect of otherReputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect]);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect]);
      }
    });

    it("voting on node (others)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};

      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[2].fName} ${users[2].fName}`,
        uname: users[2].uname,
        imageUrl: users[2].imageUrl,
        chooseUname: users[2].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Correct" as INodeVoteActionType,
      });
      // const comPoints = (await db.collection("comPoints").where("tagId", "==", nodes[0].documentId).get()).docs[0].data()
      // console.log(comPoints, 'comPoints after')
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection] - 1);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection]);
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect] - 1);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect]);
      }
    });
  });

  describe("Case 6: Remove Downvote", () => {
    const users = [getDefaultUser({}), createUser({}), createUser({})];
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
    const reputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const monthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
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
    // default user reputation from others
    const otherReputationPoints = [
      createReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherMonthlyReputationPoints = [
      createMonthlyReputationPoints({
        user: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
      createMonthlyReputationPoints({
        user: users[1],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherWeeklyReputationPoints = [
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

    // default user community points
    const comPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const comWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    // default user other community points
    const otherComPoints = [
      createComPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComMonthlyPoints = [
      createComMonthlyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];
    const otherComWeeklyPoints = [
      createComWeeklyPoints({
        admin: users[0],
        tag: nodes[0],
        // cnCorrects: 1
      }),
    ];

    const userNodes = [
      createUserNode({
        node: nodes[0],
        user: users[0],
      }),
    ];
    const nodeVersions = [];
    // default node version
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[0],
        proposer: users[0],
        // corrects: 0
      })
    );
    // mock node version (user's own first accepted proposal)
    nodeVersions.push(
      createNodeVersion({
        accepted: true,
        node: nodes[1],
        proposer: users[1],
        // corrects: 1 // this was required to have correct calculation
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
          wrong: users[0].uname !== user.uname ? true : false,
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
    ];

    beforeEach(async () => {
      await Promise.all(collects.map(collect => collect.populate()));
    });

    afterEach(async () => {
      await Promise.all(collects.map(collect => collect.clean()));
    });

    it("voting on node (self-vote)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[1].fName} ${users[1].fName}`,
        uname: users[1].uname,
        imageUrl: users[1].imageUrl,
        chooseUname: users[1].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Wrong" as INodeVoteActionType,
      });
      for (const communityPointCollection of communityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection]);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection] - 1);
      }
      for (const communityPointCollection of otherCommunityPointCollections) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection]);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection]);
      }

      for (const pointCollect of reputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect]);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect] - 1);
      }
      for (const pointCollect of otherReputationPointCollections) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect]);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect]);
      }
    });

    it("voting on node (others)", async () => {
      // postive values for community point collections
      let _communityPointsPVEs: { [key: string]: number } = {};
      // negative values for community point collections
      let _communityPointsNVEs: { [key: string]: number } = {};

      // negative values for reputation point collections
      let _reputationPointsPVEs: { [key: string]: number } = {};
      // negative values for reputation point collections
      let _reputationPointsNVEs: { [key: string]: number } = {};

      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _communityPointsPVEs[communityPointCollection] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _communityPointsNVEs[communityPointCollection] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(pointCollect).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        _reputationPointsPVEs[pointCollect] = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        _reputationPointsNVEs[pointCollect] = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
      }
      await UpDownVoteNode({
        fullname: `${users[2].fName} ${users[2].fName}`,
        uname: users[2].uname,
        imageUrl: users[2].imageUrl,
        chooseUname: users[2].chooseUname,
        nodeId: nodes[1].documentId,
        actionType: "Wrong" as INodeVoteActionType,
      });
      // const comPoints = (await db.collection("comPoints").where("tagId", "==", nodes[0].documentId).get()).docs[0].data()
      // console.log(comPoints, 'comPoints after')
      for (const communityPointCollection of [...communityPointCollections, ...otherCommunityPointCollections]) {
        const pointData: IComPoint = (
          await db.collection(communityPointCollection).where("tagId", "==", nodes[0].documentId).get()
        ).docs[0].data() as IComPoint;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IComPoint]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IComPoint]),
          0
        );
        expect(expectedPositive).toEqual(_communityPointsPVEs[communityPointCollection]);
        expect(expectedNegative).toEqual(_communityPointsNVEs[communityPointCollection] - 1);
      }

      for (const pointCollect of [...reputationPointCollections, ...otherReputationPointCollections]) {
        const pointData: IReputation = (
          await db
            .collection(pointCollect)
            .where("uname", "==", users[1].uname)
            .where("tagId", "==", nodes[0].documentId)
            .get()
        ).docs[0].data() as IReputation;
        const expectedPositive = positiveFields.reduce(
          (carry: number, positiveField: string) => carry + Number(pointData[positiveField as keyof IReputation]),
          0
        );
        const expectedNegative = negativeFields.reduce(
          (carry: number, negativeField: string) => carry + Number(pointData[negativeField as keyof IReputation]),
          0
        );
        expect(expectedPositive).toEqual(_reputationPointsPVEs[pointCollect]);
        expect(expectedNegative).toEqual(_reputationPointsNVEs[pointCollect] - 1);
      }
    });
  });

  describe("Sub Logics", () => {
    describe("Delete node if downvotes are more than upvotes", () => {
      const users = [getDefaultUser({}), createUser({}), createUser({})];
      const nodes: INode[] = [];
      const defaultNode = getDefaultNode({
        admin: users[0],
      });
      // this node would be used for testing edge cases
      const node1 = createNode({
        admin: users[1],
        tags: [defaultNode],
        isTag: true,
        parents: [defaultNode],
        nodeType: "Reference" as INodeType,
      });
      defaultNode.children.push({
        node: node1.documentId,
        title: node1.title,
        label: "",
        nodeType: node1.nodeType,
      } as INodeLink);
      const node2 = createNode({
        admin: users[1],
        tags: [defaultNode, node1],
        parents: [node1],
        references: [node1],
      });
      node1.children.push({
        node: node2.documentId,
        title: node2.title,
        label: "",
        nodeType: node2.nodeType,
      } as INodeLink);
      /*
      NODE0      <--      NODE1      <--      NODE2
                          Tags:               Tags:
                            NODE0              NODE0
                                               NODE1
      */
      nodes.push(defaultNode, node1, node2);

      // default user reputation
      const reputationPoints = [
        createReputationPoints({
          user: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
        createReputationPoints({
          user: users[1],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const monthlyReputationPoints = [
        createMonthlyReputationPoints({
          user: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
        createMonthlyReputationPoints({
          user: users[1],
          tag: nodes[0],
          // cnCorrects: 1
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
      // default user reputation from others
      const otherReputationPoints = [
        createReputationPoints({
          user: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
        createReputationPoints({
          user: users[1],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const otherMonthlyReputationPoints = [
        createMonthlyReputationPoints({
          user: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
        createMonthlyReputationPoints({
          user: users[1],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const otherWeeklyReputationPoints = [
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

      // default user community points
      const comPoints = [
        createComPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const comMonthlyPoints = [
        createComMonthlyPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const comWeeklyPoints = [
        createComWeeklyPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      // default user other community points
      const otherComPoints = [
        createComPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const otherComMonthlyPoints = [
        createComMonthlyPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const otherComWeeklyPoints = [
        createComWeeklyPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];

      const userNodes = [
        createUserNode({
          node: nodes[0],
          user: users[0],
        }),
      ];
      const nodeVersions = [];
      // default node version
      nodeVersions.push(
        createNodeVersion({
          accepted: true,
          node: nodes[0],
          proposer: users[0],
          // corrects: 0
        })
      );
      // mock node version (user's own first accepted proposal)
      nodeVersions.push(
        createNodeVersion({
          accepted: true,
          node: nodes[1],
          proposer: users[1],
          // corrects: 1 // this was required to have correct calculation
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
            wrong: users[0].uname !== user.uname ? true : false,
          })
        );
        userNodes.push(
          createUserNode({
            node: nodes[2],
            user: user,
            isStudied: true, // to test nodetype: reference edge case
          })
        );
      }

      const usersCollection = new MockData(users, "users");
      const nodesCollection = new MockData(nodes, "nodes");
      const referenceVersionsCollection = new MockData(nodeVersions, "referenceVersions");
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

      const collects = [
        usersCollection,
        nodesCollection,
        referenceVersionsCollection,
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
      ];

      beforeAll(async () => {
        await Promise.all(collects.map(collect => collect.populate()));
        await UpDownVoteNode({
          fullname: `${users[1].fName} ${users[1].fName}`,
          uname: users[0].uname,
          imageUrl: users[0].imageUrl,
          chooseUname: users[0].chooseUname,
          nodeId: node1.documentId,
          actionType: "Wrong" as INodeVoteActionType,
        });
      });

      afterAll(async () => {
        await Promise.all(collects.map(collect => collect.clean()));
      });

      it("flag all user nodes as delete related to node", async () => {
        const userNodeDocs = (await db.collection("userNodes").where("node", "==", nodes[1].documentId).get()).docs;
        for (const userNodeDoc of userNodeDocs) {
          expect(userNodeDoc.data().deleted).toBeTruthy();
        }
      });

      it("remove it from parents (for each) -> children property and signal all usernodes for each parent for nodeChanges", async () => {
        const node0Data: INode = (
          await db.collection("nodes").doc(String(defaultNode.documentId)).get()
        ).data() as INode;
        const node1AsChild = node0Data.children.find(child => child.node === node1.documentId);
        expect(node1AsChild).toBeUndefined();
      });

      it("remove it from children (for each) -> parents property and signal all usernodes for each child for nodeChanges", async () => {
        const node2Data: INode = (await db.collection("nodes").doc(String(node2.documentId)).get()).data() as INode;
        const node1AsParent = node2Data.parents.find(parent => parent.node === node1.documentId);
        expect(node1AsParent).toBeUndefined();
      });

      it("if node is a tag: remove its id from tagIds of every node that has tagged this node", async () => {
        const node2Data: INode = (await db.collection("nodes").doc(String(node2.documentId)).get()).data() as INode;
        const node1AsTag = node2Data.tagIds.find(tagId => tagId === node1.documentId);
        expect(node1AsTag).toBeUndefined();
      });

      // TODO: remove community points (weekly, monthly and all-time) documents related to this community

      it("if node is a tag: remove community points (weekly, monthly and all-time) documents related to this community", async () => {
        for (const commPointColName of communityPointCollections) {
          const community = (await db.collection(commPointColName).where("tagId", "==", node1.documentId).get()).docs;
          expect(community.length).toEqual(0);
        }
        for (const commPointColName of otherCommunityPointCollections) {
          const community = (await db.collection(commPointColName).where("tagId", "==", node1.documentId).get()).docs;
          expect(community.length).toEqual(0);
        }
      });

      it("if node type is reference: remove node id (references, referenceIds and referenceLabels) from each node that this node's id in referenceIds", async () => {
        const referencedInDocs = (
          await db.collection("nodes").where("referenceIds", "array-contains", node1.documentId).get()
        ).docs;
        expect(referencedInDocs.length).toEqual(0);
      });

      it("if node type is reference: mark isStudied=false for each node that had reference of this node", async () => {
        const userNode = (
          await db.collection("userNodes").where("node", "==", node2.documentId).get()
        ).docs[0].data() as IUserNode;
        expect(userNode.isStudied).toBeFalsy();
      });

      it("if deleted then signal all usernodes that node is deleted", async () => {
        const userNodeDocs = (await db.collection("userNodes").where("node", "==", node1.documentId).get()).docs;
        for (const userNodeDoc of userNodeDocs) {
          const userNodeDocData = userNodeDoc.data() as IUserNode;
          expect(userNodeDocData.deleted).toBeTruthy();
        }
      });
    });

    describe("if node is not deleted then", () => {
      const users = [getDefaultUser({}), createUser({}), createUser({})];
      const nodes: INode[] = [];
      const defaultNode = getDefaultNode({
        admin: users[0],
      });
      // this node would be used for testing edge cases
      const node1 = createNode({
        admin: users[1],
        tags: [defaultNode],
        isTag: true,
        parents: [defaultNode],
        nodeType: "Concept" as INodeType,
      });
      defaultNode.children.push({
        node: node1.documentId,
        title: node1.title,
        label: "",
        nodeType: node1.nodeType,
      } as INodeLink);
      const node2 = createNode({
        admin: users[1],
        tags: [defaultNode, node1],
        parents: [node1],
      });
      node1.children.push({
        node: node2.documentId,
        title: node2.title,
        label: "",
        nodeType: node2.nodeType,
      } as INodeLink);
      /*
      NODE0      <--      NODE1      <--      NODE2
                          Tags:               Tags:
                            NODE0              NODE0
                                               NODE1
      */
      nodes.push(defaultNode, node1, node2);

      // default user reputation
      const reputationPoints = [
        createReputationPoints({
          user: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
        createReputationPoints({
          user: users[1],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const monthlyReputationPoints = [
        createMonthlyReputationPoints({
          user: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
        createMonthlyReputationPoints({
          user: users[1],
          tag: nodes[0],
          // cnCorrects: 1
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
      // default user reputation from others
      const otherReputationPoints = [
        createReputationPoints({
          user: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
        createReputationPoints({
          user: users[1],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const otherMonthlyReputationPoints = [
        createMonthlyReputationPoints({
          user: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
        createMonthlyReputationPoints({
          user: users[1],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const otherWeeklyReputationPoints = [
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

      // default user community points
      const comPoints = [
        createComPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const comMonthlyPoints = [
        createComMonthlyPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const comWeeklyPoints = [
        createComWeeklyPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      // default user other community points
      const otherComPoints = [
        createComPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const otherComMonthlyPoints = [
        createComMonthlyPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];
      const otherComWeeklyPoints = [
        createComWeeklyPoints({
          admin: users[0],
          tag: nodes[0],
          // cnCorrects: 1
        }),
      ];

      const userNodes = [
        createUserNode({
          node: nodes[0],
          user: users[0],
        }),
      ];
      const nodeVersions = [];
      // default node version
      nodeVersions.push(
        createNodeVersion({
          accepted: true,
          node: nodes[0],
          proposer: users[0],
          // corrects: 0
        })
      );
      // mock node version (user's own first accepted proposal)
      nodeVersions.push(
        createNodeVersion({
          accepted: true,
          node: nodes[1],
          proposer: users[1],
          // corrects: 1 // this was required to have correct calculation
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
            wrong: users[0].uname !== user.uname ? true : false,
          })
        );
        userNodes.push(
          createUserNode({
            node: nodes[2],
            user: user,
            isStudied: true, // to test nodetype: reference edge case
          })
        );
      }

      const usersCollection = new MockData(users, "users");
      const nodesCollection = new MockData(nodes, "nodes");
      const referenceVersionsCollection = new MockData(nodeVersions, "referenceVersions");
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

      const statusDocs = [];
      for (const user of users) {
        statusDocs.push({
          documentId: user.uname,
          last_online: new Date(),
          state: "online",
        });
      }

      const userStatus = new MockData(statusDocs, "status");

      const collects = [
        usersCollection,
        nodesCollection,
        referenceVersionsCollection,
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
        userStatus,
      ];

      beforeAll(async () => {
        await Promise.all(collects.map(collect => collect.populate()));
        await UpDownVoteNode({
          fullname: `${users[0].fName} ${users[0].fName}`,
          uname: users[0].uname,
          imageUrl: users[0].imageUrl,
          chooseUname: users[0].chooseUname,
          nodeId: node1.documentId,
          actionType: "Correct" as INodeVoteActionType,
        });
      });

      afterAll(async () => {
        await Promise.all(collects.map(collect => collect.clean()));
      });

      it("update votes data in each user node related to this node", async () => {
        const userNodeDocs = (await db.collection("userNodes").where("node", "==", node1.documentId).get()).docs;
        for (const userNodeDoc of userNodeDocs) {
          const userNodeData = userNodeDoc.data() as IUserNode;
          if (userNodeData.user === users[0].uname) continue; // voter get other changes on his nodes
          expect(userNodeData?.nodeChanges?.corrects).toEqual(1);
        }
      });

      // TODO: need to check notifications list and notificationNum

      /* it("increase notifications count for proposers", async () => {
        // where("nodeId", "==", node1.documentId)
        const notifications = (await db.collection("notifications").get()).docs;
        console.log(notifications.length, "notifications.length")
      }); */
    });
  });
});
