import { commitBatch, db, TWriteOperation, writeTransaction } from "../../src/lib/firestoreServer/admin";
import { getAllUserNodes } from "../../src/utils/getAllUserNodes";
import { signalAllUserNodesChanges } from "../../src/utils/signalAllUserNodesChanges";
import { statusData, userNodesData as userNodesMockData, usersData } from "../../testUtils/mockData";

describe("signalAllUserNodesChanges", () => {
  const nodeId = "FJfzAX7zbgQS8jU5XcEk";

  beforeEach(async () => {
    await usersData.populate();
    await userNodesMockData.populate();
    await statusData.populate();
  });

  afterEach(async () => {
    await usersData.clean();
    await userNodesMockData.clean();
    await statusData.clean();
  });

  it("should signal the node changes to all the online users (or last_online < 24 hours) associated with the node. - BATCH", async () => {
    let writeCounts = 0;
    const batch = db.batch();
    let { userNodesRefs, userNodesData }: any = await getAllUserNodes({ nodeId });

    const nodeChanges = {
      title: "updated title",
    };

    const [newBatch] = await signalAllUserNodesChanges({
      batch,
      writeCounts,
      userNodesRefs,
      userNodesData,
      nodeChanges,
      major: false,
      deleted: false,
    });
    await commitBatch(newBatch);

    // all the users with the given node Id who are online or were last online in previous 24 hours,
    // should get their userNodes have the node changes.

    for (let userNodeRef of userNodesRefs) {
      const userNodeData = (await userNodeRef.get()).data();
      const userStatusRef = await db.collection("status").doc(userNodeData.user).get();
      if (userStatusRef.exists) {
        const userStatusData: any = userStatusRef.data();
        const { state, last_online } = userStatusData;
        if (state === "online" || new Date(last_online).getTime() + 24 * 60 * 60 > new Date().getTime()) {
          //if the user is online or was online in last 24 hours
          expect(userNodeData?.nodeChanges).toEqual(expect.objectContaining(nodeChanges));
        } else {
          // if the user is offline for more than 24 hours
          expect(userNodeData?.nodeChanges).not.toBeDefined();
        }
      }
    }
  });

  it("should signal the node changes to all the online users (or last_online < 24 hours) associated with the node. - TRANSACTION", async () => {
    let { userNodesRefs, userNodesData }: any = await getAllUserNodes({ nodeId });

    const nodeChanges = {
      title: "updated title",
    };

    const tWriteOperations: TWriteOperation[] = [];
    await db.runTransaction(async t => {
      await signalAllUserNodesChanges({
        t,
        tWriteOperations,
        userNodesRefs,
        userNodesData,
        nodeChanges,
        major: false,
        deleted: false,
      });
    });

    await writeTransaction(tWriteOperations);

    // all the users with the given node Id who are online or were last online in previous 24 hours,
    // should get their userNodes have the node changes.

    for (let userNodeRef of userNodesRefs) {
      const userNodeData = (await userNodeRef.get()).data();
      const userStatusRef = await db.collection("status").doc(userNodeData.user).get();
      if (userStatusRef.exists) {
        const userStatusData: any = userStatusRef.data();
        const { state, last_online } = userStatusData;
        if (state === "online" || new Date(last_online).getTime() + 24 * 60 * 60 > new Date().getTime()) {
          //if the user is online or was online in last 24 hours
          expect(userNodeData?.nodeChanges).toEqual(expect.objectContaining(nodeChanges));
        } else {
          // if the user is offline for more than 24 hours
          expect(userNodeData?.nodeChanges).not.toBeDefined();
        }
      }
    }
  });

  it("should signal the major changes to all the users associated with the node. - BATCH", async () => {
    let writeCounts = 0;
    const batch = db.batch();
    let { userNodesRefs, userNodesData }: any = await getAllUserNodes({ nodeId });

    const [newBatch] = await signalAllUserNodesChanges({
      batch,
      writeCounts,
      userNodesRefs,
      userNodesData,
      nodeChanges: {},
      major: true,
      deleted: false,
    });
    await commitBatch(newBatch);

    for (let userNodeRef of userNodesRefs) {
      const userNodeData = (await userNodeRef.get()).data();
      expect(userNodeData?.isStudied).toBe(false);
    }
  });

  it("should signal the major changes to all the users associated with the node. - TRANSACTION", async () => {
    let { userNodesRefs, userNodesData }: any = await getAllUserNodes({ nodeId });

    const tWriteOperations: TWriteOperation[] = [];

    await db.runTransaction(async t => {
      await signalAllUserNodesChanges({
        t,
        tWriteOperations,
        userNodesRefs,
        userNodesData,
        nodeChanges: {},
        major: true,
        deleted: false,
      });
    });

    await writeTransaction(tWriteOperations);

    for (let userNodeRef of userNodesRefs) {
      const userNodeData = (await userNodeRef.get()).data();
      expect(userNodeData?.isStudied).toBe(false);
    }
  });

  it("should signal the delete changes to all the users associated with the node. - BATCH", async () => {
    let writeCounts = 0;
    const batch = db.batch();
    let { userNodesRefs, userNodesData }: any = await getAllUserNodes({ nodeId });

    const [newBatch] = await signalAllUserNodesChanges({
      batch,
      writeCounts,
      userNodesRefs,
      userNodesData,
      nodeChanges: {},
      major: false,
      deleted: true,
    });
    await commitBatch(newBatch);

    for (let userNodeRef of userNodesRefs) {
      const userNodeData = (await userNodeRef.get()).data();
      expect(userNodeData?.deleted).toBe(true);
    }
  });

  it("should signal the delete changes to all the users associated with the node. - TRANSACTION", async () => {
    let { userNodesRefs, userNodesData }: any = await getAllUserNodes({ nodeId });

    const tWriteOperations: TWriteOperation[] = [];

    await db.runTransaction(async t => {
      await signalAllUserNodesChanges({
        t,
        tWriteOperations,
        userNodesRefs,
        userNodesData,
        nodeChanges: {},
        major: false,
        deleted: true,
      });
    });

    await writeTransaction(tWriteOperations);

    for (let userNodeRef of userNodesRefs) {
      const userNodeData = (await userNodeRef.get()).data();
      expect(userNodeData?.deleted).toBe(true);
    }
  });
});
