import { firestore } from "firebase-admin";

import { db } from "../../src/lib/firestoreServer/admin";
import { doRemoveUnusedTags } from "../../src/utils/doRemoveUnusedTags";
import { nodesData } from "../../testUtils/mockCollections";

describe("doRemoveUnusedTags", () => {
  beforeEach(async () => {
    await Promise.all([nodesData].map(collect => collect.populate()));
  });

  afterEach(async () => {
    await Promise.all([nodesData].map(collect => collect.clean()));
  });

  it("Should set delete = true, on all the tags that don't have any nodes", async () => {
    const _nodes = nodesData.getData();

    let tagNodes: any = {};
    let deletingTagIds = [];

    for (const node of _nodes) {
      if (!node.isTag) continue;
      tagNodes[node.documentId] = 0;
      for (const _node of _nodes) {
        if (_node?.tagIds && ~_node.tagIds.indexOf(node.documentId)) {
          tagNodes[node.documentId] += 1;
          break;
        }
      }
      if (!tagNodes[node.documentId]) {
        deletingTagIds.push(node.documentId);
      }
    }

    await doRemoveUnusedTags();

    const tags = await db.collection("tags").where(firestore.FieldPath.documentId(), "in", deletingTagIds).get();

    tags.docs.forEach(tagRef => {
      const tagData = tagRef.data();
      expect(tagData.deleted).toEqual(true);
    });
  });
});
