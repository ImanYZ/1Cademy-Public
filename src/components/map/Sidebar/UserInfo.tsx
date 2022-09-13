// import "./UserInfo.css";

import { getDocs, getFirestore, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
// import { useRecoilValue } from "recoil";
// import LoadingImg from "../../../../../assets/1Cademy_Loading_Dots.gif";
// import {
//   firebaseState,
//   usernameState,
//   // tagState
// } from "../../../../../store/AuthAtoms";
// // import {
// //   selectedUserChooseUnameState,
// //   selectedUserFullnameState,
// //   selectedUserImageURLState,
// //   selectedUserState,
// // } from "../../../../../store/MapAtoms";
// import justADate from "../../../../../utils/justADate";
// import shortenNumber from "../../../../../utils/shortenNumber";
// import RoundImage from "../../../../PublicComps/RoundImage/RoundImage";
import { useNodeBook } from "../../../context/NodeBookContext";
import { getTypedCollections } from "../../../lib/utils/getTypedCollections";
import { justADate } from "../../../lib/utils/justADate";
import shortenNumber from "../../../lib/utils/shortenNumber";
import { NodeType } from "../../../types";
import ProposalItem from "../ProposalsList/ProposalItem/ProposalItem";
import RoundImage from "../RoundImage";
import { MemoizedSidebarTabs } from "../SidebarTabs/SidebarTabs";
import UseInfoTrends from "./UseInfoTrends";
// import { getTypedCollections } from "../../getTypedCollections";
// import ProposalItem from "../../Proposals/ProposalsList/ProposalItem/ProposalItem";
// import SidebarTabs from "../../SidebarTabs/SidebarTabs";
// import UseInfoTrends from "./UseInfoTrends/UseInfoTrends";

const NODE_TYPE_ARRAY: NodeType[] = [
  "Concept",
  "Code",
  "Relation",
  "Question",
  "Profile",
  "Sequel",
  "Advertisement",
  "Reference",
  "News",
  "Idea",
];

const UserInfo = (props: any) => {
  // const firebase = useRecoilValue(firebaseState);
  // const username = useRecoilValue(usernameState);
  // // const tag = useRecoilValue(tagState);
  // // const selectedUser = useRecoilValue(selectedUserState);
  // // const selectedUserImageURL = useRecoilValue(selectedUserImageURLState);
  // // const selectedUserFullname = useRecoilValue(selectedUserFullnameState);
  // // const selectedUserChooseUname = useRecoilValue(selectedUserChooseUnameState);
  const db = getFirestore();
  const [{ user }] = useAuth();
  const { nodeBookState } = useNodeBook();

  const [proposals, setProposals] = useState<any[]>([]);
  const [proposalsPerDay, setProposalsPerDay] = useState<any[]>([]);
  // // const [proposalsTaggedPerDay, setProposalsTaggedPerDay] = useState([]);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [sUserObj /*setSUserObj*/] = useState<any | null>(null);

  // useEffect(() => {
  //   if (firebase && sUserObj && "deInstit" in sUserObj && !("instLogo" in sUserObj)) {
  //     const fetchInstitution = async () => {
  //       const institutionsDocs = await firebase
  //         .firestore()
  //         .collection("institutions")
  //         .where("name", "==", sUserObj.deInstit)
  //         .get();
  //       for (let institutionDoc of institutionsDocs.docs) {
  //         const institutionData = institutionDoc.data();
  //         setSUserObj(oldSUserObj => {
  //           return { ...oldSUserObj, instLogo: institutionData.logoURL };
  //         });
  //       }
  //     };
  //     fetchInstitution();
  //   }
  // }, [firebase && sUserObj]);

  const tabsItems = useMemo(() => {
    return !user
      ? []
      : [
          {
            title: "Nodes",
            content: (
              <>
                {/* <div className="ChartTitle">Nodes Contributed</div> */}
                <UseInfoTrends proposalsPerDay={proposalsPerDay} theme={user.theme || ""} />
              </>
            ),
          },
          {
            title: "Proposals",
            content: (
              <>
                <div className="ChartTitle">Proposals in chronological order</div>
                {proposals.map((proposal, idx) => {
                  return (
                    proposal.title && (
                      <ProposalItem
                        key={idx}
                        proposal={proposal}
                        openLinkedNode={props.openLinkedNode}
                        showTitle={true}
                      />
                    )
                  );
                })}
              </>
            ),
          },
        ];
  }, [proposals, proposalsPerDay, props.openLinkedNode, user]);

  const fetchProposals = useCallback(async () => {
    if (!nodeBookState.selectedUser) return;
    if (!user) return;

    setIsRetrieving(true);
    const versions: { [key: string]: any } = {};
    // const versionsTagged = {};
    for (let nodeType of NODE_TYPE_ARRAY) {
      const { versionsColl, userVersionsColl } = getTypedCollections(db, nodeType);

      if (!versionsColl || !userVersionsColl) continue;

      const versionCollectionRef = query(
        versionsColl,
        where("proposer", "==", nodeBookState.selectedUser.username),
        where("deleted", "==", false)
      );

      // const versionsQuery = versionsColl.where("proposer", "==", selectedUser).where("deleted", "==", false);
      // const versionsData = await versionsQuery.get();
      const versionsData = await getDocs(versionCollectionRef);
      let versionId;
      const userVersionsRefs: any[] = [];
      versionsData.forEach(versionDoc => {
        const versionData = versionDoc.data();
        // let relatedTag = false;
        // for (let tag of versionData.tags) {
        //   if (tag.title === tag.title) {
        //     relatedTag = true;
        //     break;
        //   }
        // }
        // if (relatedTag) {
        //   versionsTagged[versionDoc.id] = {
        //     ...versionData,
        //     id: versionDoc.id,
        //     createdAt: versionData.createdAt.toDate(),
        //     award: false,
        //     correct: false,
        //     wrong: false,
        //   };
        //   delete versionsTagged[versionDoc.id].deleted;
        //   delete versionsTagged[versionDoc.id].updatedAt;
        // }
        versions[versionDoc.id] = {
          ...versionData,
          id: versionDoc.id,
          createdAt: versionData.createdAt.toDate(),
          award: false,
          correct: false,
          wrong: false,
        };
        delete versions[versionDoc.id].deleted;
        delete versions[versionDoc.id].updatedAt;
        const userVersionCollectionRef = query(
          userVersionsColl,
          where("version", "==", versionDoc.id),
          where("user", "==", user.uname)
        );
        userVersionsRefs.push(userVersionCollectionRef);
      });

      if (userVersionsRefs.length > 0) {
        await Promise.all(
          userVersionsRefs.map(async userVersionsRef => {
            const userVersionsDocs = await getDocs(userVersionsRef);
            userVersionsDocs.forEach((userVersionsDoc: any) => {
              const userVersion = userVersionsDoc.data();
              versionId = userVersion.version;
              delete userVersion.version;
              delete userVersion.updatedAt;
              delete userVersion.createdAt;
              delete userVersion.user;
              versions[versionId] = {
                ...versions[versionId],
                ...userVersion,
              };
            });
          })
        );
      }
    }
    // let orderredProposals = Object.values(versionsTagged).sort(
    //   (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    // );
    // setProposals(orderredProposals);
    // let proposalsPerDayDict = {};
    // for (let propo of orderredProposals) {
    //   let dateValue = justADate(new Date(propo.createdAt));
    //   if (dateValue in proposalsPerDayDict) {
    //     proposalsPerDayDict[dateValue].num++;
    //     proposalsPerDayDict[dateValue].netVotes +=
    //       propo.corrects - propo.wrongs;
    //   } else {
    //     proposalsPerDayDict[dateValue] = {
    //       num: 1,
    //       netVotes: propo.corrects - propo.wrongs,
    //     };
    //   }
    // }
    // let proposalsPerDayList = [];
    // for (let dateValue of Object.keys(proposalsPerDayDict)) {
    //   proposalsPerDayList.push({
    //     date: new Date(dateValue),
    //     num: proposalsPerDayDict[dateValue].num,
    //     netVotes: proposalsPerDayDict[dateValue].netVotes,
    //     averageVotes:
    //       proposalsPerDayDict[dateValue].netVotes /
    //       proposalsPerDayDict[dateValue].num,
    //   });
    // }
    // setProposalsTaggedPerDay(proposalsPerDayList);

    const orderredProposals = Object.values(versions).sort(
      (a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))
    );
    const proposalsPerDayDict: { [key: string]: any } = {};
    for (let propo of orderredProposals) {
      let dateValue = justADate(new Date(propo.createdAt)).toISOString();
      if (dateValue in proposalsPerDayDict) {
        proposalsPerDayDict[dateValue].num++;
        proposalsPerDayDict[dateValue].netVotes += propo.corrects - propo.wrongs;
      } else {
        proposalsPerDayDict[dateValue] = {
          num: 1,
          netVotes: propo.corrects - propo.wrongs,
        };
      }
    }
    const proposalsPerDayList = [];
    for (let dateValue of Object.keys(proposalsPerDayDict)) {
      proposalsPerDayList.push({
        date: new Date(dateValue),
        num: proposalsPerDayDict[dateValue].num,
        netVotes: proposalsPerDayDict[dateValue].netVotes,
        averageVotes: proposalsPerDayDict[dateValue].netVotes / proposalsPerDayDict[dateValue].num,
      });
    }
    setProposals(orderredProposals);
    setProposalsPerDay(proposalsPerDayList);
    setIsRetrieving(false);
  }, [db, nodeBookState.selectedUser, user]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     if (firebase) {
  //       const userDoc = await firebase.db.collection("users").doc(selectedUser).get();
  //       if (userDoc.exists) {
  //         let userReputationData = {};
  //         const userData = userDoc.data();
  //         const userReputationDoc = await firebase.db
  //           .collection("reputations")
  //           .where("uname", "==", selectedUser)
  //           .where("tagId", "==", userData.tag.node)
  //           .limit(1)
  //           .get();
  //         if (userReputationDoc.docs.length > 0) {
  //           userReputationData = userReputationDoc.docs[0].data();
  //           delete userReputationData.uname;
  //           delete userData.tag;
  //         }
  //         if ("deInstit" in userData && !("instLogo" in userData)) {
  //           const institutionsDocs = await firebase.db
  //             .collection("institutions")
  //             .where("name", "==", userData.deInstit)
  //             .get();
  //           if (institutionsDocs.docs.length > 0) {
  //             const institutionData = institutionsDocs.docs[0].data();
  //             userData.instLogo = institutionData.logoURL;
  //           }
  //         }
  //         setSUserObj({ ...userReputationData, ...userData });
  //       }
  //     }
  //   };
  //   fetchUserData();
  // }, [firebase, selectedUser]);

  if (!nodeBookState.selectedUser) return null; // TODO manage this case

  return (
    <>
      <div id="MiniUserPrifileHeader">
        <div id="MiniUserPrifileAboveProfilePicture"></div>
        <div id="MiniUserPrifileFullProfileLink"></div>
        <RoundImage imageUrl={nodeBookState.selectedUser.imageUrl} alt="1Cademist Profile Picture" />
        <div id="MiniUserPrifileIdentity">
          <div id="MiniUserPrifileName">
            {nodeBookState.selectedUser.chooseUname
              ? nodeBookState.selectedUser.username
              : nodeBookState.selectedUser.fullName}
          </div>
          {sUserObj && (
            <>
              <div id="MiniUserPrifiletag">
                <i className="material-icons grey-text">local_offer</i>
                <span>{sUserObj.tag}</span>
              </div>
              <div id="MiniUserPrifileInstitution">
                <img src={sUserObj.instLogo} alt={sUserObj.deInstit + " logo"} width="25px" />
                <span>{sUserObj.deInstit}</span>
              </div>
              <div id="MiniUserPrifileTotalPoints">
                <i className="material-icons DoneIcon green-text">done</i>
                <span>{shortenNumber(sUserObj.totalPoints, 2, false)}</span>
              </div>
            </>
          )}
        </div>
      </div>
      <div id="MiniUserPrifilePointsContainer">
        {sUserObj && (
          <>
            <div className="MiniUserProfilePoints LeftPoints">
              <i className="material-icons amber-text">local_library</i>
              <span className="ToolbarValue">{shortenNumber(sUserObj.cnCorrects - sUserObj.cnWrongs, 2, false)}</span>
            </div>
            <div className="MiniUserProfilePoints">
              <i className="material-icons amber-text">share</i>
              <span className="ToolbarValue">{shortenNumber(sUserObj.mCorrects - sUserObj.mWrongs, 2, false)}</span>
            </div>
            <div className="MiniUserProfilePoints">
              <i className="material-icons amber-text">help_outline</i>
              <span className="ToolbarValue">{shortenNumber(sUserObj.qCorrects - sUserObj.qWrongs, 2, false)}</span>
            </div>
            <div className="MiniUserProfilePoints LeftPoints">
              <i className="material-icons material-icons--outlined amber-text">emoji_objects</i>
              <span className="ToolbarValue">{shortenNumber(sUserObj.iCorrects - sUserObj.iWrongs, 2, false)}</span>
            </div>
            <div className="MiniUserProfilePoints">
              <i className="material-icons amber-text">code</i>
              <span className="ToolbarValue">{shortenNumber(sUserObj.cdCorrects - sUserObj.cdWrongs, 2, false)}</span>
            </div>
            <div className="MiniUserProfilePoints">
              <i className="material-icons amber-text">menu_book</i>
              <span className="ToolbarValue">{shortenNumber(sUserObj.rfCorrects - sUserObj.rfWrongs, 2, false)}</span>
            </div>
          </>
        )}
      </div>
      <div id="SidebarBody">
        {!isRetrieving ? (
          <MemoizedSidebarTabs tabsTitle="User Mini-profile tabs" tabsItems={tabsItems} />
        ) : (
          <div className="CenterredLoadingImageSidebar">
            <h1>Loading...</h1>
            {/* <img className="CenterredLoadingImage" src={LoadingImg} alt="Loading" /> */}
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(UserInfo);
