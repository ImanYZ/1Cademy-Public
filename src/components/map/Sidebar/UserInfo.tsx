import CodeIcon from "@mui/icons-material/Code";
import DoneIcon from "@mui/icons-material/Done";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ShareIcon from "@mui/icons-material/Share";
import { Box } from "@mui/material";
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import LoadingImg from "../../../../public/1Cademy_Loading_Dots.gif";
import { useAuth } from "../../../context/AuthContext";
import { useNodeBook } from "../../../context/NodeBookContext";
import { getTypedCollections } from "../../../lib/utils/getTypedCollections";
import { justADate } from "../../../lib/utils/justADate";
import shortenNumber from "../../../lib/utils/shortenNumber";
import { NodeType } from "../../../types";
import OptimizedAvatar from "../../OptimizedAvatar";
import ProposalItem from "../ProposalsList/ProposalItem/ProposalItem";
import RoundImage from "../RoundImage";
import { MemoizedSidebarTabs } from "../SidebarTabs/SidebarTabs";
import UseInfoTrends from "./UseInfoTrends";

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
  const [{ user, settings }] = useAuth();
  const { nodeBookState } = useNodeBook();

  const [proposals, setProposals] = useState<any[]>([]);
  const [proposalsPerDay, setProposalsPerDay] = useState<any[]>([]);
  // // const [proposalsTaggedPerDay, setProposalsTaggedPerDay] = useState([]);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [sUserObj, setSUserObj] = useState<any | null>(null);

  useEffect(() => {
    // get institutions and update instLogo from setSUserObj
    if (!db || !sUserObj) return;

    if ("deInstit" in sUserObj && !("instLogo" in sUserObj)) {
      console.log("useEffect:", sUserObj);
      const fetchInstitution = async () => {
        const institutionsQuery = query(collection(db, "institutions"), where("name", "==", sUserObj.deInstit));

        const institutionsDocs = await getDocs(institutionsQuery);

        // const institutionsDocs = await firebase
        //   .firestore()
        //   .collection("institutions")
        //   .where("name", "==", sUserObj.deInstit)
        //   .get();
        for (let institutionDoc of institutionsDocs.docs) {
          const institutionData = institutionDoc.data();
          setSUserObj((oldSUserObj: any) => {
            return { ...oldSUserObj, instLogo: institutionData.logoURL };
          });
        }
      };
      fetchInstitution();
    }
  }, [db, sUserObj]);

  const tabsItems = useMemo(() => {
    return !user
      ? []
      : [
          {
            title: "Nodes",
            content: (
              <>
                {/* <div className="ChartTitle">Nodes Contributed</div> */}
                <UseInfoTrends proposalsPerDay={proposalsPerDay} theme={settings.theme || ""} />
              </>
            ),
          },
          {
            title: "Proposals",
            content: (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
              </Box>
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (!db) return;
      if (!nodeBookState.selectedUser) return;

      const userRef = doc(db, "users", nodeBookState.selectedUser.username);
      const userDoc = await getDoc(userRef);

      // const userDoc = await firebase.db.collection("users").doc(selectedUser).get();
      if (userDoc.exists()) {
        let userReputationData: any = {};
        const userData = userDoc.data();

        const reputationQuery = query(
          collection(db, "reputations"),
          where("uname", "==", nodeBookState.selectedUser.username),
          where("tagId", "==", userData.tagId),
          limit(1)
        );
        const userReputationDoc = await getDocs(reputationQuery);
        // const userReputationDoc = await firebase.db
        //   .collection("reputations")
        //   .where("uname", "==", selectedUser)
        //   .where("tagId", "==", userData.tag.node)
        //   .limit(1)
        //   .get();
        if (userReputationDoc.docs.length > 0) {
          userReputationData = userReputationDoc.docs[0].data();
          delete userReputationData.uname;
          delete userData.tag;
        }
        if ("deInstit" in userData && !("instLogo" in userData)) {
          const institutionsQuery = query(collection(db, "institutions"), where("name", "==", userData.deInstit));
          const institutionsDocs = await getDocs(institutionsQuery);
          // const institutionsDocs = await firebase.db
          //   .collection("institutions")
          //   .where("name", "==", userData.deInstit)
          //   .get();
          if (institutionsDocs.docs.length > 0) {
            const institutionData = institutionsDocs.docs[0].data();
            userData.instLogo = institutionData.logoURL;
          }
        }
        setSUserObj({ ...userReputationData, ...userData });
      }
    };
    fetchUserData();
  }, [db, nodeBookState.selectedUser]);

  if (!nodeBookState.selectedUser) return null; // TODO manage this case passing through props selected user

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
                <LocalOfferIcon className="material-icons grey-text" />
                <span>{sUserObj.tag}</span>
              </div>
              <div id="MiniUserPrifileInstitution" style={{ display: "flex", gap: "5px" }}>
                {/* <img src={sUserObj.instLogo} alt={sUserObj.deInstit + " logo"} width="25px" /> */}
                <OptimizedAvatar
                  imageUrl={sUserObj.instLogo}
                  name={sUserObj.deInstit + " logo"}
                  sx={{ width: "25px", height: "25px" }}
                  renderAsAvatar={false}
                />
                <span>{sUserObj.deInstit}</span>
              </div>
              <div id="MiniUserPrifileTotalPoints">
                <DoneIcon className="material-icons DoneIcon green-text" />
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
              {/* <i className="material-icons amber-text">local_library</i> */}
              <LocalLibraryIcon className="material-icons amber-text" />
              <span className="ToolbarValue">
                {shortenNumber(sUserObj.cnCorrects || 0 - sUserObj.cnWrongs || 0, 2, false)}
              </span>
            </div>
            <div className="MiniUserProfilePoints">
              {/* <i className="material-icons amber-text">share</i> */}
              <ShareIcon className="material-icons amber-text" />
              <span className="ToolbarValue">
                {shortenNumber(sUserObj.mCorrects || 0 - sUserObj.mWrongs || 0, 2, false)}
              </span>
            </div>
            <div className="MiniUserProfilePoints">
              {/* <i className="material-icons amber-text">help_outline</i> */}
              <HelpOutlineIcon className="material-icons amber-text" />
              <span className="ToolbarValue">
                {shortenNumber(sUserObj.qCorrects || 0 - sUserObj.qWrongs || 0, 2, false)}
              </span>
            </div>
            <div className="MiniUserProfilePoints LeftPoints">
              {/* <i className="material-icons material-icons--outlined amber-text">emoji_objects</i> */}
              <EmojiObjectsIcon className="material-icons material-icons--outlined amber-text" />
              <span className="ToolbarValue">
                {shortenNumber(sUserObj.iCorrects || 0 - sUserObj.iWrongs || 0, 2, false)}
              </span>
            </div>
            <div className="MiniUserProfilePoints">
              {/* <i className="material-icons amber-text">code</i> */}
              <CodeIcon className="material-icons amber-text" />
              <span className="ToolbarValue">
                {shortenNumber(sUserObj.cdCorrects || 0 - sUserObj.cdWrongs || 0, 2, false)}
              </span>
            </div>
            <div className="MiniUserProfilePoints">
              {/* <i className="material-icons amber-text">menu_book</i> */}
              <MenuBookIcon className="material-icons amber-text" />
              <span className="ToolbarValue">
                {shortenNumber(sUserObj.rfCorrects || 0 - sUserObj.rfWrongs || 0, 2, false)}
              </span>
            </div>
          </>
        )}
      </div>
      <div id="SidebarBody">
        {!isRetrieving ? (
          <MemoizedSidebarTabs tabsTitle="User Mini-profile tabs" tabsItems={tabsItems} />
        ) : (
          <div className="CenterredLoadingImageSidebar">
            <img className="CenterredLoadingImage" src={LoadingImg.src} alt="Loading" />
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(UserInfo);
