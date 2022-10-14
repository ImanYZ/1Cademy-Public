// import "./PendingProposalList.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/material";
import React, { useCallback, useState } from "react";

// import { NodeType } from "../../../types";
// import { NODE_TYPES } from "../../../utils";
import { MemoizedMetaButton } from "../MetaButton";
import ProposalItem from "../ProposalsList/ProposalItem/ProposalItem";

// const NODE_TYPES_ARRAY: NodeType[] = ["Concept", "Code", "Reference", "Relation", "Question", "Idea"];

const ELEMENTS_PER_PAGE = 13;

type PendingProposalListProps = {
  // setPendingProposalsNum: any;
  proposals: any[];
  openLinkedNode: any;
};

const PendingProposalList = (props: PendingProposalListProps) => {
  // const [{ user }] = useAuth();
  // const db = getFirestore();

  // TODO: the pendingProposalsNum, state is shared between button and sidebar, find a way to improve that
  // const [, setPendingProposalsNum] = useState(0);
  // const [, setPendingProposalsLoaded] = useState(true);
  // const [proposals, setProposals] = useState<any[]>([]);
  const [lastIndex, setLastIndex] = useState(ELEMENTS_PER_PAGE);

  // useEffect(() => {
  //   if (!user) return;

  //   // if (firebase) {
  //   const versionsSnapshots: any[] = [];
  //   const versions: { [key: string]: any } = {};
  //   for (let nodeType of NODE_TYPES_ARRAY) {
  //     const { versionsColl, userVersionsColl } = getTypedCollections(db, nodeType);
  //     if (!versionsColl || !userVersionsColl) continue;

  //     const versionsQuery = query(
  //       versionsColl,
  //       where("accepted", "==", false),
  //       where("tagIds", "array-contains", user.tagId),
  //       where("deleted", "==", false)
  //     );

  //     const versionsSnapshot = onSnapshot(versionsQuery, async snapshot => {
  //       const docChanges = snapshot.docChanges();
  //       if (docChanges.length > 0) {
  //         // const temporalProposals:any[] = []
  //         for (let change of docChanges) {
  //           const versionId = change.doc.id;
  //           const versionData = change.doc.data();
  //           if (change.type === "removed") {
  //             delete versions[versionId];
  //           }
  //           if (change.type === "added" || change.type === "modified") {
  //             versions[versionId] = {
  //               ...versionData,
  //               id: versionId,
  //               createdAt: versionData.createdAt.toDate(),
  //               award: false,
  //               correct: false,
  //               wrong: false,
  //             };
  //             delete versions[versionId].deleted;
  //             delete versions[versionId].updatedAt;

  //             const q = query(
  //               userVersionsColl,
  //               where("version", "==", versionId),
  //               where("user", "==", user.uname),
  //               limit(1)
  //             );

  //             const userVersionsDocs = await getDocs(q);

  //             // const userVersionsDocs = await userVersionsColl
  //             //   .where("version", "==", versionId)
  //             //   .where("user", "==", user.uname)
  //             //   .limit(1)
  //             //   .get();

  //             for (let userVersionsDoc of userVersionsDocs.docs) {
  //               const userVersion = userVersionsDoc.data();
  //               delete userVersion.version;
  //               delete userVersion.updatedAt;
  //               delete userVersion.createdAt;
  //               delete userVersion.user;
  //               versions[versionId] = {
  //                 ...versions[versionId],
  //                 ...userVersion,
  //               };
  //             }
  //           }
  //         }
  //         let unevaluatedPendingProposalsNum = 0;
  //         for (let pendingP of Object.values(versions)) {
  //           if (!pendingP.correct && !pendingP.wrong) {
  //             unevaluatedPendingProposalsNum++;
  //           }
  //         }
  //         setPendingProposalsNum(unevaluatedPendingProposalsNum);

  //         const pendingProposals = { ...versions };
  //         const proposalsTemp = Object.values(pendingProposals);
  //         const orderredProposals = proposalsTemp.sort(
  //           (a: any, b: any) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
  //         );
  //         setProposals(orderredProposals);
  //         // setProposals(orderredProposals.slice(0, lastIndex));
  //         // setPendingProposals({ ...versions });
  //         // temporalProposals.push(temporalProposals)
  //       }
  //       setPendingProposalsLoaded(true);
  //     });
  //     versionsSnapshots.push(versionsSnapshot);
  //   }
  //   ``;
  //   return () => {
  //     for (let vSnapshot of versionsSnapshots) {
  //       vSnapshot();
  //     }
  //   };
  //   // }
  // }, [db, user]);

  // useEffect(() => {
  //   if (pendingProposalsLoaded) {
  //     const proposalsTemp = Object.values(pendingProposals);
  //     const orderredProposals = proposalsTemp.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  //     setProposals(orderredProposals.slice(0, lastIndex));
  //   }
  // }, [lastIndex, pendingProposals, pendingProposalsLoaded]);

  const loadOlderProposalsClick = useCallback(() => {
    if (lastIndex >= props.proposals.length) return;
    setLastIndex(lastIndex + ELEMENTS_PER_PAGE);
  }, [lastIndex, props.proposals.length]);

  return (
    <div id="PendingProposalsContainer">
      {!props.proposals.length && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h3>You don't have notifications</h3>
        </Box>
      )}

      {!!props.proposals.length && (
        <ul
          className="collection Proposals"
          style={{ display: "flex", flexDirection: "column", padding: "10px", overflow: "hidden", gap: "4px" }}
        >
          {props.proposals.slice(0, lastIndex).map((proposal, idx) => {
            return (
              <ProposalItem key={idx} proposal={proposal} openLinkedNode={props.openLinkedNode} showTitle={true} />
            );
          })}
          {/* CHECK, I changes pendingProposals to proposal */}
          {props.proposals.length > lastIndex && (
            <div id="ContinueButton">
              <MemoizedMetaButton onClick={loadOlderProposalsClick}>
                <>
                  <ExpandMoreIcon className="material-icons grey-text" />
                  Older Pending Proposals
                  <ExpandMoreIcon className="material-icons grey-text" />
                </>
              </MemoizedMetaButton>
            </div>
          )}
        </ul>
      )}
    </div>
  );
};

export default React.memo(PendingProposalList);
