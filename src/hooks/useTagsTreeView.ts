import { collection, DocumentChange, DocumentData, getFirestore, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";

export const useTagsTreeView = () => {
  const [tagsTreeView, setTagsTreeView] = useState<any>({});

  const applyTagRemove = (oldAllTags: any, nodeId: string /*, dagreLoaded*/) => {
    if (nodeId in oldAllTags) {
      // remove tag from parents
      for (let parentTagId of oldAllTags[nodeId].tagIds) {
        oldAllTags[parentTagId].children = oldAllTags[parentTagId].children.filter(tgId => tgId !== nodeId);
      }

      // remove tag from children
      for (let childTagId of oldAllTags[nodeId].children) {
        oldAllTags[childTagId].tagIds = oldAllTags[childTagId].tagIds.filter(tgId => tgId !== nodeId);
      }

      // remove tag from oldAllTags
      delete oldAllTags[nodeId];

      // remove tag from dag (algorithm to draw graphs), is necessary  to recalculate the draw
      // if (dagreLoaded && dag1[0].hasNode("Tag" + nodeId)) {
      //   dag1[0].removeNode("Tag" + nodeId);
      // }
    }
  };

  const applyTagUpdate = (oldAllTags: any, nodeId: string, tagData: DocumentData) => {
    oldAllTags[nodeId].title = tagData.title;
    oldAllTags[nodeId].tagIds = oldAllTags[nodeId].tagIds || [];
    // Handle tags change.
    for (let tagIdx = 0; tagIdx < tagData.tagIds.length; tagIdx++) {
      const tagId = tagData.tagIds[tagIdx];
      const tag = tagData.tags[tagIdx];
      if (oldAllTags[nodeId].tagIds && !oldAllTags[nodeId].tagIds.includes(tagId)) {
        oldAllTags[nodeId].tagIds.push(tagId);
        oldAllTags[nodeId].tags.push(tag);
        if (tagId in oldAllTags) {
          oldAllTags[tagId].children.push(nodeId);
        } else {
          oldAllTags[tagId] = {
            nodeId: tagId,
            title: tag,
            children: [nodeId],
            checked: false,
            tags: []
          };
        }
      }
    }
    for (let oldTagId of oldAllTags[nodeId].tagIds) {
      if (!tagData.tagIds.includes(oldTagId)) {
        oldAllTags[nodeId].tagIds = oldAllTags[nodeId].tagIds.filter((tgId: any) => tgId !== oldTagId);
        oldAllTags[oldTagId].children = oldAllTags[oldTagId].children.filter((tgId: any) => tgId !== nodeId);
      }
    }
  };

  const applyTagAdd = (oldAllTags: any, nodeId: string, tagData: DocumentData) => {
    oldAllTags[nodeId] = {
      title: tagData.title,
      checked: false,
      nodeId,
      tagIds: tagData.tagIds,
      children: []
    };
    for (let parentTagIdx = 0; parentTagIdx < tagData.tagIds.length; parentTagIdx++) {
      const parentTagId = tagData.tagIds[parentTagIdx];
      const parentTag = tagData.tags[parentTagIdx];
      if (parentTagId in oldAllTags) {
        oldAllTags[parentTagId].children.push(nodeId);
      } else {
        oldAllTags[parentTagId] = {
          nodeId: parentTagId,
          title: parentTag,
          checked: false,
          tags: [],
          children: [nodeId]
        };
      }
    }
  };

  const applyTagsTreeViewChanges = (oldTags: any, docChanges: DocumentChange<DocumentData>[] /*, dagreLoaded*/) => {
    let oldAllTagsCopy = { ...oldTags };
    for (let change of docChanges) {
      const cType = change.type;
      const tagData = change.doc.data();
      const nodeId = tagData.node;
      if (tagData.deleted || cType === "removed") {
        // applyTagRemove(oldAllTagsCopy, nodeId, dagreLoaded);
        applyTagRemove(oldAllTagsCopy, nodeId);
      } else {
        if (nodeId in oldAllTagsCopy) {
          applyTagUpdate(oldAllTagsCopy, nodeId, tagData);
        } else {
          applyTagAdd(oldAllTagsCopy, nodeId, tagData);
        }
      }
    }
    return oldAllTagsCopy;
  };

  useEffect(() => {
    console.log("get data");
    const db = getFirestore();
    const tagsRef = collection(db, "tags");
    const q = query(tagsRef);

    console.log("subscribe");
    const unsubscribe = onSnapshot(q, snapshot => {
      const docChanges = snapshot.docChanges();
      if (!docChanges.length) return;
      console.log("there is changes");
      const newTagsTreeView = applyTagsTreeViewChanges(tagsTreeView, docChanges);
      console.log(newTagsTreeView);
      setTagsTreeView(newTagsTreeView);
    });

    return () => unsubscribe();

    // if (firebase) {
    //   // Create the query to load the tag and listen for modifications.
    //   const tagsQuery = firebase.collection("tags");
    //   // Start listening to the query.
    //   // creates listener between client and database
    //   // looks for any changes for data for tagsQuery
    //   const tagsSnapshot = tagsQuery.onSnapshot(function (snapshot) {
    //     const docChanges = snapshot.docChanges();
    //     // made the useEffect independent from oldAllTags
    //     if (docChanges.length > 0) {
    //       // ************************************
    //       // implement this in recoil
    //       // ************************************
    //       //  whenever updating based on pre existing value, we are using useState's function updater feature
    //       // allTags - mirror of tags collection
    //       setAllTags((oAllTags) => {
    //         return applyAllTagChanges(oAllTags, docChanges, false);
    //       });
    //     }
    //   });
    //   // kills snapshot before duplicating it or unmounting component
    //   return () => tagsSnapshot();
    // }
  }, []);

  return [tagsTreeView, setTagsTreeView];
};
