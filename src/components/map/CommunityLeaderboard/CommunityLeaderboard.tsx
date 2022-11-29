import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { loadReputationsData } from "@/lib/utils/Map.utils";

import { MemoizedMetaButton } from "../MetaButton";
import MultipleChoiceBtn from "../Sidebar/MultipleChoiceBtn";
import { MemoizedComLeaderboardChip } from "./ComLeaderboardChip/ComLeaderboardChip";

const comLBTypes = ["Weekly", "Monthly", "All Time", "Self-votes", "Others' Votes", "Others Monthly"];

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
  const [comLeaderboardOpen, setComLeaderboardOpen] = useState(false);

  // const [pendingProposalsLoaded /*setPendingProposalsLoaded*/] = useState(true);
  const [comPointsLoaded, setComPointsLoaded] = useState(false);
  const [comPointsMonthlyLoaded, setComPointsMonthlyLoaded] = useState(false);
  const [comPointsWeeklyLoaded, setComPointsWeeklyLoaded] = useState(false);
  const [comPointsOthersLoaded, setComPointsOthersLoaded] = useState(false);
  const [, /** comPointsOthersMonthlyLoaded*/ setComPointsOthersMonthlyLoaded] = useState(false);

  useEffect(() => {
    if (db && userTagId && pendingProposalsLoaded) {
      loadReputationsData(db, true, "All Time", userTagId, setComPointsDict, setComPointsLoaded);
    }
  }, [db, pendingProposalsLoaded, setComPointsLoaded, userTagId]);

  useEffect(() => {
    if (db && userTagId && comPointsLoaded) {
      loadReputationsData(db, true, "Monthly", userTagId, setComPointsMonthlyDict, setComPointsMonthlyLoaded);
    }
  }, [db, comPointsLoaded, userTagId]);

  useEffect(() => {
    if (db && userTagId && comPointsMonthlyLoaded) {
      loadReputationsData(db, true, "Weekly", userTagId, setComPointsWeeklyDict, setComPointsWeeklyLoaded);
    }
  }, [db, comPointsMonthlyLoaded, userTagId]);

  useEffect(() => {
    if (db && userTagId && comPointsWeeklyLoaded) {
      loadReputationsData(db, true, "Others", userTagId, setComPointsOthersDict, setComPointsOthersLoaded);
    }
  }, [db, comPointsWeeklyLoaded, userTagId]);

  console.log("userTagId", userTagId);

  useEffect(() => {
    if (db && userTagId && comPointsOthersLoaded) {
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

  // TEST
  const loadReputationPoints = useCallback((comPsDict: any, comPsDict2: any = null) => {
    const comPs = [];
    for (let comId in comPsDict) {
      const newComObj = { ...comPsDict[comId], tagId: comId };
      if (comPsDict2 && comPsDict2[comId]) {
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
    comPs.sort((a, b) => b.totalPoints - a.totalPoints);
    setComPoints(comPs.slice(0, 25));
  }, []);

  useEffect(() => {
    if (comLeaderboardType === "All Time") {
      loadReputationPoints(comPointsDict);
    }
  }, [comLeaderboardType, comPointsDict, loadReputationPoints]);

  useEffect(() => {
    if (comLeaderboardType === "Monthly") {
      // console.log("[Com 7]:");
      loadReputationPoints(comPointsMonthlyDict);
    }
  }, [comLeaderboardType, comPointsMonthlyDict, loadReputationPoints]);

  useEffect(() => {
    if (comLeaderboardType === "Weekly") {
      // console.log("[Com 8]:");
      loadReputationPoints(comPointsWeeklyDict);
    }
  }, [comLeaderboardType, comPointsWeeklyDict, loadReputationPoints]);

  useEffect(() => {
    if (comLeaderboardType === "Self-votes") {
      console.log("[Com 9]:", { comPointsDict, comPointsOthersDict });
      loadReputationPoints(comPointsDict, comPointsOthersDict);
    }
  }, [comLeaderboardType, comPointsDict, comPointsOthersDict, loadReputationPoints]);

  useEffect(() => {
    if (comLeaderboardType === "Others' Votes") {
      // console.log("[Com 10]:");
      loadReputationPoints(comPointsOthersDict);
    }
  }, [comLeaderboardType, comPointsOthersDict, loadReputationPoints]);

  useEffect(() => {
    if (comLeaderboardType === "Others Monthly") {
      // console.log("[Com 11]:");
      loadReputationPoints(comPointsOthersMonthlyDict);
    }
  }, [comLeaderboardType, comPointsOthersMonthlyDict, loadReputationPoints]);

  const openComLeaderboard = useCallback(() => {
    setComLeaderboardOpen(oldCL => !oldCL);
    setComLeaderboardTypeOpen(false);
  }, []);

  const openComLeaderboardTypes = useCallback(() => {
    setComLeaderboardTypeOpen(oldCLT => !oldCLT);
  }, []);

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
    <Box
      id="ComLeaderboardMain"
      className={comLeaderboardOpen ? undefined : "Minimized"}
      sx={{ width: { xs: "100%", sm: "70%", md: "90%" } }}
    >
      <Box id="ComLeaderboardMinimizer">
        <MemoizedMetaButton onClick={openComLeaderboard}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <Box sx={{ color: "ButtonHighlight", fontSize: "18px" }}>🏆</Box>
            <Box sx={{}}>{comLeaderboardOpen ? <ArrowForwardIcon /> : <ArrowBackIcon />}</Box>
          </Box>
        </MemoizedMetaButton>
      </Box>
      <Box
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
        sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: { xs: "5px", md: "16px" } }}
      >
        <div id="ComLeaderbaordChanger">
          <MemoizedMetaButton onClick={openComLeaderboardTypes}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: { xs: "0px", md: "0px", lg: "10px", xl: "10px" },
                alignItems: "center",
                paddingY: "5px",
                paddingLeft: "5px",
              }}
            >
              <div id="ComLeaderbaordChangerText">{comLeaderboardType}</div>
            </Box>
          </MemoizedMetaButton>
        </div>
        <Box
          className="ComLeaderbaordItems"
          sx={{
            width: "100%",
            paddingRight: "80px",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            // flexWrap: "wrap",
            gap: "10px",
            height: "inherit",
          }}
        >
          {comLeaderboardTypeOpen && <MultipleChoiceBtn choices={choices} onClose={openComLeaderboardTypes} />}
          {!comPoints.length && <p>There are no points yet</p>}
          {comPoints.map((comObj, idx) => {
            return (
              <MemoizedComLeaderboardChip
                key={comObj.tagId}
                idx={idx}
                comTitle={comObj.tag}
                totalPoints={comObj.totalPoints}
                totalPositives={comObj.positives}
                totalNegatives={comObj.negatives}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export const MemoizedCommunityLeaderboard = React.memo(CommunityLeaderboard);
