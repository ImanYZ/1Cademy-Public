// import "./ComLeaderboard.css";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box } from "@mui/material";
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
  pendingProposalsLoaded: boolean;
};

const CommunityLeaderboard = ({ userTagId, pendingProposalsLoaded }: CommunityLeaderboardProps) => {
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

  // const [pendingProposalsLoaded /*setPendingProposalsLoaded*/] = useState(true);
  const [comPointsLoaded, setComPointsLoaded] = useState(false);
  const [comPointsMonthlyLoaded, setComPointsMonthlyLoaded] = useState(false);
  const [comPointsWeeklyLoaded, setComPointsWeeklyLoaded] = useState(false);
  const [comPointsOthersLoaded, setComPointsOthersLoaded] = useState(false);
  const [, /** comPointsOthersMonthlyLoaded*/ setComPointsOthersMonthlyLoaded] = useState(false);

  useEffect(() => {
    if (db && userTagId && pendingProposalsLoaded) {
      // console.log("[Com 1]:In reputationsOthersMonthlyLoaded useEffect");
      loadReputationsData(db, true, "All Time", userTagId, setComPointsDict, setComPointsLoaded);
    }
  }, [db, pendingProposalsLoaded, setComPointsLoaded, userTagId]);

  useEffect(() => {
    if (db && userTagId && comPointsLoaded) {
      // console.log("[Com 2]:In comPointsLoaded useEffect");
      loadReputationsData(db, true, "Monthly", userTagId, setComPointsMonthlyDict, setComPointsMonthlyLoaded);
    }
  }, [db, comPointsLoaded, userTagId]);

  useEffect(() => {
    if (db && userTagId && comPointsMonthlyLoaded) {
      // console.log("[Com 3]:In comPointsMonthlyLoaded useEffect");
      loadReputationsData(db, true, "Weekly", userTagId, setComPointsWeeklyDict, setComPointsWeeklyLoaded);
    }
  }, [db, comPointsMonthlyLoaded, userTagId]);

  useEffect(() => {
    if (db && userTagId && comPointsWeeklyLoaded) {
      // console.log("[Com 4]:In comPointsWeeklyLoaded useEffect");
      loadReputationsData(db, true, "Others", userTagId, setComPointsOthersDict, setComPointsOthersLoaded);
    }
  }, [db, comPointsWeeklyLoaded, userTagId]);

  useEffect(() => {
    if (db && userTagId && comPointsOthersLoaded) {
      // console.log("[Com 5]:In comPointsOthersLoaded useEffect");
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
    // console.log("COM POINTS comPsDict, ", comPsDict);
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
    // console.log("COM POINTS, ", comPs);
    setComPoints(comPs.slice(0, 9));
  }, []);

  useEffect(() => {
    if (comLeaderboardType === "All Time") {
      // console.log("[Com 6]:comPointsDict", comPointsDict);
      loadReputationPoints(comPointsDict);
    }
  }, [comLeaderboardType, comPointsDict]);

  useEffect(() => {
    if (comLeaderboardType === "Monthly") {
      // console.log("[Com 7]:");
      loadReputationPoints(comPointsMonthlyDict);
    }
  }, [comLeaderboardType, comPointsMonthlyDict]);

  useEffect(() => {
    if (comLeaderboardType === "Weekly") {
      // console.log("[Com 8]:");
      loadReputationPoints(comPointsWeeklyDict);
    }
  }, [comLeaderboardType, comPointsWeeklyDict]);

  useEffect(() => {
    if (comLeaderboardType === "Self-votes") {
      // console.log("[Com 9]:");
      loadReputationPoints(comPointsDict, comPointsOthersDict);
    }
  }, [comLeaderboardType, comPointsDict, comPointsOthersDict]);

  useEffect(() => {
    if (comLeaderboardType === "Others' Votes") {
      // console.log("[Com 10]:");
      loadReputationPoints(comPointsOthersDict);
    }
  }, [comLeaderboardType, comPointsOthersDict]);

  useEffect(() => {
    if (comLeaderboardType === "Others Monthly") {
      // console.log("[Com 11]:");
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
      // style={{ border: "solid 2px red" }}
    >
      {/* <div id="ComLeaderboardSidebarOverlap"></div> */}
      <div id="ComLeaderboardMinimizer">
        <MemoizedMetaButton onClick={openComLeaderboard}>
          <Box sx={{ paddingRight: "5px" }}>{comLeaderboardOpen ? <ArrowForwardIcon /> : <ArrowBackIcon />}</Box>
        </MemoizedMetaButton>
      </div>
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
        style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "16px" }}
      >
        <div id="ComLeaderbaordChanger">
          <MemoizedMetaButton onClick={openComLeaderboardTypes}>
            <Box sx={{ display: "flex", gap: "10px", alignItems: "center", paddingY: "5px", paddingLeft: "5px" }}>
              <div id="ComLeaderbaordChangerIcon">🏆</div>
              <div id="ComLeaderbaordChangerText">{comLeaderboardType}</div>
            </Box>
          </MemoizedMetaButton>
        </div>
        <Box
          className="ComLeaderbaordItems"
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            height: "inherit",
          }}
        >
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
            <Image className="" src={LoadingImg} alt="Loading" />
          )}
        </Box>
      </div>
    </div>
  );
};

export const MemoizedCommunityLeaderboard = React.memo(CommunityLeaderboard);
