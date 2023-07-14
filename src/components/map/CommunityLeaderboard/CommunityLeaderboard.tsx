import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Box } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { loadReputationsData } from "@/lib/utils/Map.utils";

import MultipleChoiceBtn from "../Sidebar/MultipleChoiceBtn";
import { MemoizedComLeaderboardChip } from "./ComLeaderboardChip/ComLeaderboardChip";

const comLBTypes = ["Weekly", "Monthly", "All Time", "Self-votes", "Others' Votes", "Others Monthly"];

type CommunityLeaderboardProps = {
  userTagId: string;
  pendingProposalsLoaded: boolean;
  comLeaderboardOpen: boolean;
  setComLeaderboardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
};

const CommunityLeaderboard = ({
  userTagId,
  pendingProposalsLoaded,
  comLeaderboardOpen,
  setComLeaderboardOpen,
  disabled = false,
}: CommunityLeaderboardProps) => {
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
  // const [comLeaderboardOpen, setComLeaderboardOpen] = useState(false);

  // const [pendingProposalsLoaded /*setPendingProposalsLoaded*/] = useState(true);
  const [comPointsLoaded, setComPointsLoaded] = useState(false);
  const [comPointsMonthlyLoaded, setComPointsMonthlyLoaded] = useState(false);
  const [comPointsWeeklyLoaded, setComPointsWeeklyLoaded] = useState(false);
  const [comPointsOthersLoaded, setComPointsOthersLoaded] = useState(false);
  const [, /** comPointsOthersMonthlyLoaded*/ setComPointsOthersMonthlyLoaded] = useState(false);

  useEffect(() => {
    if (disabled) return;
    if (db && userTagId && pendingProposalsLoaded) {
      loadReputationsData(db, true, "All Time", userTagId, setComPointsDict, setComPointsLoaded);
    }
  }, [db, disabled, pendingProposalsLoaded, setComPointsLoaded, userTagId]);

  useEffect(() => {
    if (disabled) return;
    if (db && userTagId && comPointsLoaded) {
      loadReputationsData(db, true, "Monthly", userTagId, setComPointsMonthlyDict, setComPointsMonthlyLoaded);
    }
  }, [db, comPointsLoaded, userTagId, disabled]);

  useEffect(() => {
    if (disabled) return;
    if (db && userTagId && comPointsMonthlyLoaded) {
      loadReputationsData(db, true, "Weekly", userTagId, setComPointsWeeklyDict, setComPointsWeeklyLoaded);
    }
  }, [db, comPointsMonthlyLoaded, userTagId, disabled]);

  useEffect(() => {
    if (disabled) return;
    if (db && userTagId && comPointsWeeklyLoaded) {
      loadReputationsData(db, true, "Others", userTagId, setComPointsOthersDict, setComPointsOthersLoaded);
    }
  }, [db, comPointsWeeklyLoaded, userTagId, disabled]);

  useEffect(() => {
    if (disabled) return;
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
  }, [db, comPointsOthersLoaded, userTagId, disabled]);

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
    if (disabled) return;
    if (comLeaderboardType === "All Time") {
      loadReputationPoints(comPointsDict);
    }
  }, [comLeaderboardType, comPointsDict, disabled, loadReputationPoints]);

  useEffect(() => {
    if (disabled) return;
    if (comLeaderboardType === "Monthly") {
      loadReputationPoints(comPointsMonthlyDict);
    }
  }, [comLeaderboardType, comPointsMonthlyDict, disabled, loadReputationPoints]);

  useEffect(() => {
    if (disabled) return;
    if (comLeaderboardType === "Weekly") {
      loadReputationPoints(comPointsWeeklyDict);
    }
  }, [comLeaderboardType, comPointsWeeklyDict, disabled, loadReputationPoints]);

  useEffect(() => {
    if (disabled) return;
    if (comLeaderboardType === "Self-votes") {
      loadReputationPoints(comPointsDict, comPointsOthersDict);
    }
  }, [comLeaderboardType, comPointsDict, comPointsOthersDict, disabled, loadReputationPoints]);

  useEffect(() => {
    if (disabled) return;
    if (comLeaderboardType === "Others' Votes") {
      loadReputationPoints(comPointsOthersDict);
    }
  }, [comLeaderboardType, comPointsOthersDict, disabled, loadReputationPoints]);

  useEffect(() => {
    if (disabled) return;
    if (comLeaderboardType === "Others Monthly") {
      loadReputationPoints(comPointsOthersMonthlyDict);
    }
  }, [comLeaderboardType, comPointsOthersMonthlyDict, disabled, loadReputationPoints]);

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
      sx={{ width: { xs: "100%", sm: "88%" }, opacity: disabled ? 0.8 : 1 }}
    >
      <Box id="ComLeaderboardMinimizer">
        <Box
          onClick={openComLeaderboard}
          sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}
        >
          <Box sx={{ color: "ButtonHighlight", fontSize: "18px" }}>🏆</Box>
          <Box>
            {comLeaderboardOpen ? (
              <ArrowForwardIosIcon
                sx={{
                  color: theme => (theme.palette.mode === "dark" ? "#CACACA" : "#98A2B3"),
                }}
              />
            ) : (
              <ArrowForwardIosIcon
                sx={{
                  transform: "rotate(180deg)",
                  color: theme => (theme.palette.mode === "dark" ? "#CACACA" : "#98A2B3"),
                }}
              />
            )}
          </Box>
        </Box>
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
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: { xs: "5px", md: "16px" },
          background: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.darkBackground : theme.palette.common.lightBackground,
        }}
      >
        <Box
          sx={{
            display: "flex",
            cursor: "pointer",
            alignItems: "center",
            marginLeft: "10px",
          }}
          id="ComLeaderbaordChanger"
          onClick={openComLeaderboardTypes}
        >
          <div id="ComLeaderbaordChangerText">{comLeaderboardType}</div>
          {comLeaderboardTypeOpen ? (
            <ExpandMore
              sx={{
                color: theme => (theme.palette.mode === "dark" ? "#eaecf0" : "#475467"),
              }}
            />
          ) : (
            <ExpandLess
              sx={{
                color: theme => (theme.palette.mode === "dark" ? "#eaecf0" : "#475467"),
              }}
            />
          )}
        </Box>
        <Box
          className="ComLeaderbaordItems"
          sx={{
            width: "100%",
            paddingRight: "80px",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "10px",
            height: "inherit",
          }}
        >
          {comLeaderboardTypeOpen && (
            <MultipleChoiceBtn
              choices={choices}
              onClose={openComLeaderboardTypes}
              comLeaderboardType={comLeaderboardType}
            />
          )}
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
