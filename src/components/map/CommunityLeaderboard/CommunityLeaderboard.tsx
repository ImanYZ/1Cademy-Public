// import "./ComLeaderboard.css";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getFirestore } from "firebase/firestore";
import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";

// import { User } from "src/knowledgeTypes";
// import { tagId } from "../../../store/AuthAtoms";
import { loadReputationsData } from "@/lib/utils/Map.utils";

// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useRecoilValue } from "recoil";
import LoadingImg from "../../../../public/1Cademy_Loading_Dots.gif";
import { MemoizedMetaButton } from "../MetaButton";
import MultipleChoiceBtn from "../Sidebar/MultipleChoiceBtn";
import { MemoizedComLeaderboardChip } from "./ComLeaderboardChip/ComLeaderboardChip";
// import { loadReputationsData } from "../MapUtils";
// import MetaButton from "../MetaButton/MetaButton";
// import MultipleChoiceBtn from "../MetaButton/MultipleChoiceBtn/MultipleChoiceBtn";
// import ComLeaderboardChip from "./ComLeaderboardChip/ComLeaderboardChip";

const comLBTypes = ["Weekly", "Monthly", "All Time", "Self-votes", "Others' Votes", "Others Monthly"];
// type CommunityLeaderboardProps = {};
// props: CommunityLeaderboardProps

type CommunityLeaderboardProps = {
  userTagId: string;
};

const CommunityLeaderboard = ({ userTagId }: CommunityLeaderboardProps) => {
  //object of all users' community Points
  // object of all users' weekly community Points
  const [comPointsWeeklyDict, setComPointsWeeklyDict] = useState({});
  // object of all users' monthly community Points
  const [comPointsMonthlyDict, setComPointsMonthlyDict] = useState({});
  // object of all users' others' community Points
  const [comPointsOthersDict, setComPointsOthersDict] = useState({});
  // object of all users' others' monthly community Points
  const [comPointsOthersMonthlyDict, setComPointsOthersMonthlyDict] = useState({});
  const db = getFirestore();

  const [comPointsDict, setComPointsDict] = useState({});
  const [comPoints, setComPoints] = useState<any[]>([]);
  const [comLeaderboardType, setComLeaderboardType] = useState("Weekly");
  const [comLeaderboardTypeOpen, setComLeaderboardTypeOpen] = useState(false);
  const [comLeaderboardOpen, setComLeaderboardOpen] = useState(true);

  const [pendingProposalsLoaded /**setPendingProposalsLoaded */] = useState(false);
  const [comPointsLoaded, setComPointsLoaded] = useState(false);
  const [comPointsMonthlyLoaded, setComPointsMonthlyLoaded] = useState(false);
  const [comPointsWeeklyLoaded, setComPointsWeeklyLoaded] = useState(false);
  const [comPointsOthersLoaded, setComPointsOthersLoaded] = useState(false);
  const [, /** comPointsOthersMonthlyLoaded*/ setComPointsOthersMonthlyLoaded] = useState(false);

  useEffect(() => {
    if (db && userTagId && pendingProposalsLoaded) {
      console.log("In reputationsOthersMonthlyLoaded useEffect");
      loadReputationsData(db, true, "All Time", userTagId, setComPointsDict, setComPointsLoaded);
    }
  }, [db, pendingProposalsLoaded, setComPointsLoaded, userTagId]);

  useEffect(() => {
    if (db && userTagId && comPointsLoaded) {
      console.log("In comPointsLoaded useEffect");
      loadReputationsData(db, true, "Monthly", userTagId, setComPointsMonthlyDict, setComPointsMonthlyLoaded);
    }
  }, [db, comPointsLoaded, userTagId]);

  useEffect(() => {
    if (db && userTagId && comPointsMonthlyLoaded) {
      console.log("In comPointsMonthlyLoaded useEffect");
      loadReputationsData(db, true, "Weekly", userTagId, setComPointsWeeklyDict, setComPointsWeeklyLoaded);
    }
  }, [db, comPointsMonthlyLoaded, userTagId]);

  useEffect(() => {
    if (db && userTagId && comPointsWeeklyLoaded) {
      console.log("In comPointsWeeklyLoaded useEffect");
      loadReputationsData(db, true, "Others", userTagId, setComPointsOthersDict, setComPointsOthersLoaded);
    }
  }, [db, comPointsWeeklyLoaded, userTagId]);

  useEffect(() => {
    if (db && userTagId && comPointsOthersLoaded) {
      console.log("In comPointsOthersLoaded useEffect");
      loadReputationsData(
        db,
        true,
        "Others Monthly",
        userTagId,
        setComPointsOthersMonthlyDict,
        setComPointsOthersMonthlyLoaded
      );
    }
  }, [db, comPointsOthersLoaded, userTagId]);

  const loadReputationPoints = useCallback((comPsDict: any, comPsDict2: any = null) => {
    const comPs = [];
    console.log("COM POINTS comPsDict, ", comPsDict);
    for (let comId in comPsDict) {
      const newComObj = { ...comPsDict[comId], tagId: comId };
      if (comPsDict2) {
        newComObj.totalPoints = comPsDict[comId].totalPoints - comPsDict2[comId].totalPoints;
        newComObj.positives = comPsDict[comId].positives - comPsDict2[comId].positives;
        newComObj.negatives = comPsDict[comId].negatives - comPsDict2[comId].negatives;
      }
      if (comPs.length === 0) {
        comPs.push(newComObj);
      } else {
        const thisTotalPoints = comPsDict[comId].totalPoints;
        const comIdx = comPs.findIndex(comP => comP.totalPoints <= thisTotalPoints);
        if (comIdx === -1) {
          comPs.push(newComObj);
        } else {
          comPs.splice(comIdx, 0, newComObj);
        }
      }
    }
    console.log("COM POINTS, ", comPs);
    setComPoints(comPs.slice(0, 9));
  }, []);

  useEffect(() => {
    if (comLeaderboardType === "All Time") {
      console.log("comPointsDict", comPointsDict);
      loadReputationPoints(comPointsDict);
    }
  }, [comLeaderboardType, comPointsDict]);

  useEffect(() => {
    if (comLeaderboardType === "Monthly") {
      loadReputationPoints(comPointsMonthlyDict);
    }
  }, [comLeaderboardType, comPointsMonthlyDict]);

  useEffect(() => {
    if (comLeaderboardType === "Weekly") {
      loadReputationPoints(comPointsWeeklyDict);
    }
  }, [comLeaderboardType, comPointsWeeklyDict]);

  useEffect(() => {
    if (comLeaderboardType === "Self-votes") {
      loadReputationPoints(comPointsDict, comPointsOthersDict);
    }
  }, [comLeaderboardType, comPointsDict, comPointsOthersDict]);

  useEffect(() => {
    if (comLeaderboardType === "Others' Votes") {
      loadReputationPoints(comPointsOthersDict);
    }
  }, [comLeaderboardType, comPointsOthersDict]);

  useEffect(() => {
    if (comLeaderboardType === "Others Monthly") {
      loadReputationPoints(comPointsOthersMonthlyDict);
    }
  }, [comLeaderboardType, comPointsOthersMonthlyDict]);

  const openComLeaderboard = useCallback(() => {
    setComLeaderboardOpen(oldCL => !oldCL);
    setComLeaderboardTypeOpen(false);
  }, []);

  const openComLeaderboardTypes = useCallback(() => {
    setComLeaderboardTypeOpen(oldCLT => !oldCLT);
  }, []);

  // // const changeComLeaderboard = useCallback((event) => {
  // //   setComLeaderboardType((oldCLT) => {
  // //     let idx = comLBTypes.findIndex((comLBT) => comLBT === oldCLT);
  // //     if (idx === -1 || idx >= comLBTypes.length - 1) {
  // //       return comLBTypes[0];
  // //     }
  // //     return comLBTypes[idx + 1];
  // //   });
  // // }, []);

  const changeComLeaderboard = useCallback(
    (comLType: any) => () => {
      setComLeaderboardType(comLType);
      setComLeaderboardTypeOpen(false);
    },
    []
  );

  const choices = useMemo(
    () =>
      comLBTypes.map(comLType => {
        return { label: comLType, choose: changeComLeaderboard(comLType) };
      }),
    [changeComLeaderboard]
  );

  return (
    <div
      id="ComLeaderboardMain"
      className={comLeaderboardOpen ? undefined : "Minimized"}
      style={{ border: "solid 2px red" }}
    >
      <div id="ComLeaderboardSidebarOverlap"></div>
      <div
        id="ComLeaderboardContainer"
        className={
          comLeaderboardType === "Self-votes"
            ? "ComLeaderboardContainerSelfVotes"
            : comLeaderboardType === "Others' Votes"
            ? "ComLeaderboardContainerOthersVotes"
            : comLeaderboardType === "Others Monthly"
            ? "ComLeaderboardContainerOthersMonthly"
            : ""
        }
      >
        <div id="ComLeaderboardMinimizer">
          <MemoizedMetaButton onClick={openComLeaderboard}>
            {comLeaderboardOpen ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          </MemoizedMetaButton>
        </div>
        <div id="ComLeaderbaordChanger">
          <MemoizedMetaButton onClick={openComLeaderboardTypes}>
            <>
              <div id="ComLeaderbaordChangerText">{comLeaderboardType}</div>
              <div id="ComLeaderbaordChangerIcon">🏆</div>
            </>
          </MemoizedMetaButton>
        </div>
        {comLeaderboardTypeOpen && <MultipleChoiceBtn choices={choices} close={openComLeaderboardTypes} />}
        {comPoints.length > 0 ? (
          comPoints.map((comObj, idx) => {
            return (
              <MemoizedComLeaderboardChip
                key={comObj.tagId}
                idx={idx}
                comTitle={comObj.tag}
                // uname={comObj.admin}
                totalPoints={comObj.adminPoints}
                // imageUrl={comObj.aImgUrl}
                // fullname={comObj.aFullname}
                // chooseUname={comObj.aChooseUname}
                // totalPoints={comObj.totalPoints}
                totalPositives={comObj.positives}
                totalNegatives={comObj.negatives}
                // reloadPermanentGrpah={props.reloadPermanentGrpah}
              />
            );
          })
        ) : (
          <div id="CenterredLoadingImageComLeaderboard">
            <Image className="CenterredLoadingImage" src={LoadingImg} alt="Loading" />
          </div>
        )}
      </div>
    </div>
  );
};

export const MemoizedCommunityLeaderboard = React.memo(CommunityLeaderboard);
