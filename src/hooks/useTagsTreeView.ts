import { collection, DocumentChange, DocumentData, getFirestore, onSnapshot, query } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

import { AllTagsTreeView } from "../components/TagsSearcher";
import { Tag } from "../knowledgeTypes";

const initializeTagsTreeView = (tags: string[]): AllTagsTreeView => {
  return tags.reduce((acu: AllTagsTreeView, cur) => {
    return {
      ...acu,
      [cur]: {
        nodeId: cur,
        title: "",
        children: [],
        tags: [],
        tagIds: [],
        checked: true,
      },
    };
  }, {});
};

export const useTagsTreeView = (chosenTags: string[] = []) => {
  const [allTagsLoaded, setAllTagsLoaded] = useState(false);
  const [tagsTreeView, setTagsTreeView] = useState<AllTagsTreeView>(initializeTagsTreeView(chosenTags));

  const resetSelectedTags = useCallback(
    () =>
      setTagsTreeView(pre => {
        const newTags = { ...pre };
        Object.keys(pre).forEach(key => {
          newTags[key] = { ...pre[key], checked: false };
        });
        return newTags;
      }),
    []
  );

  useEffect(() => {
    const db = getFirestore();
    const tagsRef = collection(db, "tags");
    const q = query(tagsRef);

    const unsubscribe = onSnapshot(q, snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return;
      setTagsTreeView(prevTagTreeView => {
        return applyTagsTreeViewChanges(prevTagTreeView, docChanges);
      });
      setAllTagsLoaded(true);
    });

    return () => unsubscribe();
  }, [setTagsTreeView]);

  return { allTags: tagsTreeView, setAllTags: setTagsTreeView, resetSelectedTags, allTagsLoaded };
};

// ------------------------------------------
// ------------------------ helpers functions

const applyTagsTreeViewChanges = (
  oldTags: AllTagsTreeView,
  docChanges: DocumentChange<DocumentData>[] /*, dagreLoaded*/
): AllTagsTreeView => {
  let oldAllTagsCopy = JSON.parse(JSON.stringify(oldTags)) as AllTagsTreeView;
  let changes = 0;

  for (let change of docChanges) {
    const cType = change.type;
    // const tagData = change.doc.data() as Tag;
    let tagData = change.doc.data() as Tag;
    tagData.tagIds = tagData.tagIds ?? [];
    tagData.tags = tagData.tags ?? [];
    const nodeId = tagData.node;
    if (tagData.deleted || cType === "removed") {
      // applyTagRemove(oldAllTagsCopy, nodeId, dagreLoaded);
      const { tags, changes: newChanges } = applyTagRemove(oldAllTagsCopy, nodeId);
      changes += newChanges;
      oldAllTagsCopy = tags;
    } else {
      if (nodeId in oldAllTagsCopy) {
        const { tags, changes: newChanges } = applyTagUpdate(oldAllTagsCopy, nodeId, tagData);
        changes += newChanges;
        oldAllTagsCopy = tags;
      } else {
        const { tags, changes: newChanges } = applyTagAdd(oldAllTagsCopy, nodeId, tagData);
        changes += newChanges;
        oldAllTagsCopy = tags;
      }
    }
  }

  return changes ? oldAllTagsCopy : oldTags; // INFO: we check changes to return the same object when there is not changes
};

type MergeTagsOutput = { tags: AllTagsTreeView; changes: number };
export const applyTagRemove = (oldAllTags: AllTagsTreeView, nodeId: string /*, dagreLoaded*/): MergeTagsOutput => {
  let changes = 0;
  if (!oldAllTags[nodeId]) return { tags: oldAllTags, changes };

  const oldAllTagsCopy = { ...oldAllTags };
  // remove tag from parents
  for (let parentTagId of oldAllTagsCopy[nodeId].tagIds) {
    changes++;
    oldAllTagsCopy[parentTagId].children = oldAllTagsCopy[parentTagId].children.filter(tgId => tgId !== nodeId);
  }

  // remove tag from children
  for (let childTagId of oldAllTagsCopy[nodeId].children) {
    changes++;
    oldAllTagsCopy[childTagId].tagIds = oldAllTagsCopy[childTagId].tagIds.filter(tgId => tgId !== nodeId);
  }

  // remove tag from oldAllTagsCopy
  delete oldAllTagsCopy[nodeId];

  // remove tag from dag (algorithm to draw graphs), is necessary  to recalculate the draw
  // if (dagreLoaded && dag1[0].hasNode("Tag" + nodeId)) {
  //   dag1[0].removeNode("Tag" + nodeId);
  // }
  return { tags: oldAllTagsCopy, changes };
};

export const applyTagUpdate = (oldAllTags: AllTagsTreeView, nodeId: string, tagData: Tag): MergeTagsOutput => {
  let changes = 0;
  const isSimilar =
    oldAllTags[nodeId].title === tagData.title &&
    JSON.stringify(oldAllTags[nodeId].tagIds) === JSON.stringify(tagData.tagIds) &&
    JSON.stringify(oldAllTags[nodeId].tags) === JSON.stringify(tagData.tags);
  if (isSimilar) return { changes, tags: oldAllTags };

  const oldAllTagsCopy = { ...oldAllTags };

  // console.log("update", { old: oldAllTagsCopy[nodeId], new: tagData });
  oldAllTagsCopy[nodeId].title = tagData.title;
  oldAllTagsCopy[nodeId].tagIds = tagData.tagIds || [];
  // Handle tags change.
  for (let tagIdx = 0; tagIdx < tagData.tagIds.length; tagIdx++) {
    const tagId = tagData.tagIds[tagIdx];
    const tag = tagData.tags[tagIdx];
    if (oldAllTagsCopy[nodeId].tagIds && !oldAllTagsCopy[nodeId].tagIds.includes(tagId)) {
      changes++;
      oldAllTagsCopy[nodeId].tagIds.push(tagId);
      oldAllTagsCopy[nodeId].tags.push(tag);
      if (tagId in oldAllTagsCopy) {
        oldAllTagsCopy[tagId].children.push(nodeId);
      } else {
        // if not existe we add tag in oldAllTags
        oldAllTagsCopy[tagId] = {
          nodeId: tagId,
          title: tag,
          children: [nodeId],
          checked: false,
          tags: [],
          tagIds: [],
        };
      }
    }
  }
  for (let oldTagId of oldAllTagsCopy[nodeId].tagIds) {
    if (!tagData.tagIds.includes(oldTagId)) {
      changes++;
      oldAllTagsCopy[nodeId].tagIds = oldAllTagsCopy[nodeId].tagIds.filter((tgId: any) => tgId !== oldTagId);
      oldAllTagsCopy[oldTagId].children = oldAllTagsCopy[oldTagId].children.filter((tgId: any) => tgId !== nodeId);
    }
  }
  return { changes, tags: oldAllTagsCopy };
};

export const applyTagAdd = (oldAllTags: AllTagsTreeView, nodeId: string, tagData: Tag): MergeTagsOutput => {
  let changes = 1;
  const oldAllTagsCopy = { ...oldAllTags };
  oldAllTagsCopy[nodeId] = {
    title: tagData.title,
    checked: false,
    nodeId,
    tagIds: tagData.tagIds,
    tags: tagData.tags,
    children: [],
  };
  for (let parentTagIdx = 0; parentTagIdx < tagData.tagIds.length; parentTagIdx++) {
    const parentTagId = tagData.tagIds[parentTagIdx];
    const parentTag = tagData.tags[parentTagIdx];
    if (parentTagId in oldAllTagsCopy) {
      oldAllTagsCopy[parentTagId].children.push(nodeId);
    } else {
      oldAllTagsCopy[parentTagId] = {
        nodeId: parentTagId,
        title: parentTag,
        checked: false,
        tags: [],
        tagIds: [],
        children: [nodeId],
      };
    }
  }
  return { changes, tags: oldAllTagsCopy };
};
