import { Box } from "@mui/system";
import { getDocs, getFirestore, limit, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { UserTheme } from "src/knowledgeTypes";
import { NodeType } from "src/types";

import { getTypedCollections } from "@/lib/utils/getTypedCollections";

import referencesDarkTheme from "../../../../../public/references-dark-theme.jpg";
import referencesLightTheme from "../../../../../public/references-light-theme.jpg";
import PendingProposalList from "../PendingProposalList";
import { SidebarWrapper } from "./SidebarWrapper";

type PendingProposalSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
  username: string;
  tagId: string | undefined;
};
const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];

const PendingProposalSidebar = ({
  open,
  onClose,
  theme,
  openLinkedNode,
  username,
  tagId,
}: PendingProposalSidebarProps) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const db = getFirestore();

  useEffect(() => {
    if (!username) return;
    if (!tagId) return;

    // if (firebase) {
    const versionsSnapshots: any[] = [];
    const versions: { [key: string]: any } = {};
    for (let nodeType of NODE_TYPES_ARRAY) {
      const { versionsColl, userVersionsColl } = getTypedCollections(db, nodeType);
      if (!versionsColl || !userVersionsColl) continue;

      const versionsQuery = query(
        versionsColl,
        where("accepted", "==", false),
        where("tagIds", "array-contains", tagId),
        where("deleted", "==", false)
      );

      const versionsSnapshot = onSnapshot(versionsQuery, async snapshot => {
        const docChanges = snapshot.docChanges();
        if (docChanges.length > 0) {
          // const temporalProposals:any[] = []
          for (let change of docChanges) {
            const versionId = change.doc.id;
            const versionData = change.doc.data();
            if (change.type === "removed") {
              delete versions[versionId];
            }
            if (change.type === "added" || change.type === "modified") {
              versions[versionId] = {
                ...versionData,
                id: versionId,
                createdAt: versionData.createdAt.toDate(),
                award: false,
                correct: false,
                wrong: false,
              };
              delete versions[versionId].deleted;
              delete versions[versionId].updatedAt;

              const q = query(
                userVersionsColl,
                where("version", "==", versionId),
                where("user", "==", username),
                limit(1)
              );

              const userVersionsDocs = await getDocs(q);

              // const userVersionsDocs = await userVersionsColl
              //   .where("version", "==", versionId)
              //   .where("user", "==", user.uname)
              //   .limit(1)
              //   .get();

              for (let userVersionsDoc of userVersionsDocs.docs) {
                const userVersion = userVersionsDoc.data();
                delete userVersion.version;
                delete userVersion.updatedAt;
                delete userVersion.createdAt;
                delete userVersion.user;
                versions[versionId] = {
                  ...versions[versionId],
                  ...userVersion,
                };
              }
            }
          }
          // let unevaluatedPendingProposalsNum = 0;
          // for (let pendingP of Object.values(versions)) {
          //   if (!pendingP.correct && !pendingP.wrong) {
          //     unevaluatedPendingProposalsNum++;
          //   }
          // }
          // setPendingProposalsNum(unevaluatedPendingProposalsNum);

          const pendingProposals = { ...versions };
          const proposalsTemp = Object.values(pendingProposals);
          const orderredProposals = proposalsTemp.sort(
            (a: any, b: any) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
          );
          setProposals(orderredProposals);
          // setProposals(orderredProposals.slice(0, lastIndex));
          // setPendingProposals({ ...versions });
          // temporalProposals.push(temporalProposals)
        }
        // props.setPendingProposalsLoaded(true);
      });
      versionsSnapshots.push(versionsSnapshot);
    }
    ``;
    return () => {
      for (let vSnapshot of versionsSnapshots) {
        vSnapshot();
      }
    };
    // }
  }, [db, username, tagId]);

  return (
    <SidebarWrapper
      title="Pending Proposals"
      headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme}
      open={open}
      onClose={onClose}
      width={430}
      anchor="right"
      SidebarContent={
        <Box sx={{ paddingX: "10px", paddingTop: "10px" }}>
          <PendingProposalList proposals={proposals} openLinkedNode={openLinkedNode} />
        </Box>
      }
    />
  );
};
export const MemoizedPendingProposalSidebar = React.memo(PendingProposalSidebar, (prev, next) => {
  return prev.theme === next.theme && prev.username === next.username && prev.open === next.open;
});
