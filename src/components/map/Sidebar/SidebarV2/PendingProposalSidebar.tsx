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
  innerHeight?: number;
};
const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];

const PendingProposalSidebar = ({
  open,
  onClose,
  theme,
  openLinkedNode,
  username,
  tagId,
  innerHeight,
}: PendingProposalSidebarProps) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const db = getFirestore();

  useEffect(() => {
    if (!username) return;
    if (!tagId) return;

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

          const pendingProposals = { ...versions };
          const proposalsTemp = Object.values(pendingProposals);
          const orderredProposals = proposalsTemp.sort(
            (a: any, b: any) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
          );
          setProposals(orderredProposals);
        }
      });
      versionsSnapshots.push(versionsSnapshot);
    }

    return () => {
      for (let vSnapshot of versionsSnapshots) {
        vSnapshot();
      }
    };
  }, [db, username, tagId]);

  return (
    <SidebarWrapper
      title="Pending Proposals"
      headerImage={theme === "Dark" ? referencesDarkTheme : referencesLightTheme}
      open={open}
      onClose={onClose}
      width={window.innerWidth > 899 ? 430 : window.innerWidth}
      height={window.innerWidth > 899 ? 100 : 35}
      innerHeight={innerHeight}
      contentSignalState={proposals}
      SidebarContent={
        <Box sx={{ paddingX: "10px", paddingTop: "10px" }}>
          <PendingProposalList proposals={proposals} openLinkedNode={openLinkedNode} />
        </Box>
      }
    />
  );
};
export const MemoizedPendingProposalSidebar = React.memo(PendingProposalSidebar);
