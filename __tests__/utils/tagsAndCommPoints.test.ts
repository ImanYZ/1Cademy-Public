import { db } from "../../src/lib/firestoreServer/admin";
import { comPointTypes, tagsAndCommPoints } from "../../src/utils/tagsAndCommPoints";
import {
  comMonthlyPointsData,
  comOthersPointsData,
  comOthMonPointsData,
  comOthWeekPointsData,
  comPointsData,
  comWeeklyPointsData,
  tagsData,
} from "../../testUtils/mockCollections";

describe("tagsAndCommPoints", () => {
  const nodeId = "r98BjyFDCe4YyLA3U8ZE";
  beforeEach(async () => {});

  afterEach(async () => {
    await tagsData.clean();
    await comPointsData.clean();
    await comMonthlyPointsData.clean();
    await comOthersPointsData.clean();
    await comOthMonPointsData.clean();
    await comOthWeekPointsData.clean();
    await comWeeklyPointsData.clean();
  });

  describe("For tags collection", () => {
    it("should invoke the callBack function for each tag document where node == nodeId", async () => {
      await tagsData.populate();
      const allTagDocumentsForThisNode = await db.collection("tags").where("node", "==", nodeId).get();

      const callBack = jest.fn();
      await tagsAndCommPoints({ nodeId, callBack });

      // the call back should have been called.
      expect(callBack).toBeCalled();

      // the call back should have been called with the collection name = tags
      const callsForTagsCollection = callBack.mock.calls.filter(mockCall => {
        return mockCall?.[0]?.collectionName === "tags";
      });
      expect(callsForTagsCollection.length).toEqual(allTagDocumentsForThisNode.docs.length);
    });

    it("should invoke the callBack function with an object in paramter that contains the collection name == tags and other details.", async () => {
      await tagsData.populate();
      const allTagDocumentsForThisNode = await db.collection("tags").where("node", "==", nodeId).get();

      const callBack = jest.fn();
      await tagsAndCommPoints({ nodeId, callBack });

      // the call back should have been called.
      expect(callBack).toBeCalled();

      // the call back should have been called with the collection name = tags
      const callsForTagsCollection = callBack.mock.calls.filter(mockCall => {
        return mockCall?.[0]?.collectionName === "tags";
      });

      callsForTagsCollection.forEach(mockCall => {
        const { collectionName, tagDoc } = mockCall[0];

        expect(collectionName).toBe("tags");

        // find the document with exact same id. and it should exist;
        const foundDoc = allTagDocumentsForThisNode.docs.find(doc => doc.id === tagDoc.id);
        expect(foundDoc).toBeTruthy();
      });

      // expect(callsForTagsCollection.length).toEqual(allTagDocumentsForThisNode.docs.length);
    });
  });

  describe("For comPointsData collection", () => {
    it("should invoke the callBack function for each comPointsData document where tagId == nodeId", async () => {
      await comPointsData.populate();
      const allComPointsForThisTagId = await db.collection("comPointsData").where("tagId", "==", nodeId).get();

      const callBack = jest.fn();
      await tagsAndCommPoints({ nodeId, callBack });

      // the call back should have been called.
      expect(callBack).toBeCalled();

      // the call back should have been called with the collection name = tags
      const callsForTagsCollection = callBack.mock.calls.filter(mockCall => {
        return mockCall?.[0]?.collectionName === "comPointsData";
      });
      expect(callsForTagsCollection.length).toEqual(allComPointsForThisTagId.docs.length);
    });

    it("should invoke the callBack function with an object in paramter that contains the collection name == tags and other details.", async () => {
      await comPointsData.populate();
      const allComPointsForThisTagId = await db.collection("comPointsData").where("tagId", "==", nodeId).get();

      const callBack = jest.fn();
      await tagsAndCommPoints({ nodeId, callBack });

      // the call back should have been called.
      expect(callBack).toBeCalled();

      // the call back should have been called with the collection name = tags
      const callsForTagsCollection = callBack.mock.calls.filter(mockCall => {
        return mockCall?.[0]?.collectionName === "comPointsData";
      });

      callsForTagsCollection.forEach(mockCall => {
        const { collectionName, tagDoc } = mockCall[0];

        expect(collectionName).toBe("comPointsData");

        // find the document with exact same id. and it should exist;
        const foundDoc = allComPointsForThisTagId.docs.find(doc => doc.id === tagDoc.id);
        expect(foundDoc).toBeTruthy();
      });
    });
  });

  it("Should invoke the call back with collection Name and null values if the data for that collection does not exist", async () => {
    // as the database is empty and so it should always invoke the call back with null values.

    const callBack = jest.fn();
    await tagsAndCommPoints({ nodeId, callBack });

    // the call back should have been called.
    expect(callBack).toBeCalled();

    callBack.mock.calls.forEach(mockCall => {
      const { collectionName, tagData } = mockCall[0];

      const includesCollection = comPointTypes.includes(collectionName);
      expect(includesCollection).toBe(true);
      expect(tagData).toBeNull();
    });
  });
});
