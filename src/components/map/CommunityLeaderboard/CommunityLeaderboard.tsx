import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Box, Stack, Typography } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { loadReputationsData } from "@/lib/utils/Map.utils";

import { DESIGN_SYSTEM_COLORS } from "../../../lib/theme/colors";
import MultipleChoiceBtn from "../Sidebar/MultipleChoiceBtn";
import { MemoizedComLeaderboardChip } from "./ComLeaderboardChip/ComLeaderboardChip";

export const COMMUNITY_LEADERBOARD_TYPES: { [key: string]: string } = {
  Weekly: "This Week Points",
  Monthly: "This Month Points",
  "All Time": "All Time Points",
  "Self-votes": "Self-votes",
  "Others' Votes": "Points by Others",
  "Others Monthly": "Monthly Points by Others",
};

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
    // console.log("dd1");
    if (db && userTagId && pendingProposalsLoaded) {
      loadReputationsData(db, true, "All Time", userTagId, setComPointsDict, setComPointsLoaded);
    }
  }, [db, disabled, pendingProposalsLoaded, setComPointsLoaded, userTagId]);

  useEffect(() => {
    if (disabled) return;
    // console.log("dd2");
    if (db && userTagId && comPointsLoaded) {
      loadReputationsData(db, true, "Monthly", userTagId, setComPointsMonthlyDict, setComPointsMonthlyLoaded);
    }
  }, [db, comPointsLoaded, userTagId, disabled]);

  useEffect(() => {
    if (disabled) return;
    // console.log("dd3");
    if (db && userTagId && comPointsMonthlyLoaded) {
      loadReputationsData(db, true, "Weekly", userTagId, setComPointsWeeklyDict, setComPointsWeeklyLoaded);
    }
  }, [db, comPointsMonthlyLoaded, userTagId, disabled]);

  useEffect(() => {
    if (disabled) return;
    // console.log("dd4");
    if (db && userTagId && comPointsWeeklyLoaded) {
      loadReputationsData(db, true, "Others", userTagId, setComPointsOthersDict, setComPointsOthersLoaded);
    }
  }, [db, comPointsWeeklyLoaded, userTagId, disabled]);

  // console.log("userTagId", userTagId);

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
      // console.log("[Com 7]:");
      loadReputationPoints(comPointsMonthlyDict);
    }
  }, [comLeaderboardType, comPointsMonthlyDict, disabled, loadReputationPoints]);

  useEffect(() => {
    if (disabled) return;
    if (comLeaderboardType === "Weekly") {
      // console.log("[Com 8]:");
      loadReputationPoints(comPointsWeeklyDict);
    }
  }, [comLeaderboardType, comPointsWeeklyDict, disabled, loadReputationPoints]);

  useEffect(() => {
    if (disabled) return;
    if (comLeaderboardType === "Self-votes") {
      // console.log("[Com 9]:", { comPointsDict, comPointsOthersDict });
      loadReputationPoints(comPointsDict, comPointsOthersDict);
    }
  }, [comLeaderboardType, comPointsDict, comPointsOthersDict, disabled, loadReputationPoints]);

  useEffect(() => {
    if (disabled) return;
    if (comLeaderboardType === "Others' Votes") {
      // console.log("[Com 10]:");
      loadReputationPoints(comPointsOthersDict);
    }
  }, [comLeaderboardType, comPointsOthersDict, disabled, loadReputationPoints]);

  useEffect(() => {
    if (disabled) return;
    if (comLeaderboardType === "Others Monthly") {
      // console.log("[Com 11]:");
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
    (comLType: string) => () => {
      setComLeaderboardType(comLType);
      setComLeaderboardTypeOpen(false);
    },
    []
  );

  const choices = useMemo(
    () =>
      Object.keys(COMMUNITY_LEADERBOARD_TYPES).map(key => {
        return { label: COMMUNITY_LEADERBOARD_TYPES[key], choose: changeComLeaderboard(key) };
      }),
    [changeComLeaderboard]
  );

  return (
    <Box
      id="ComLeaderboardMain"
      sx={{
        width: { xs: comLeaderboardOpen ? "100%" : "35px", sm: comLeaderboardOpen ? "88%" : "35px" },
        height: "68px",
        display: "flex",
        alignItems: "center",
        position: "fixed",
        right: "0px",
        bottom: "0px",
        zIndex: 1,
        opacity: disabled ? 0.8 : 1,
        transition: "width 1s ease-in-out",
      }}
    >
      <Stack
        id="ComLeaderboardMinimizer"
        onClick={openComLeaderboard}
        alignItems={"center"}
        justifyContent={"center"}
        spacing={"6px"}
        sx={{
          minWidth: "36px",
          width: "36px",
          height: "68px",
          cursor: "pointer",
          borderRadius: "8px 0px 0px 8px",
          backgroundColor: ({ palette }) =>
            palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
        }}
      >
        <Box sx={{ fontSize: "18px" }}>🏆</Box>
        <Box>
          {comLeaderboardOpen ? (
            <ArrowForwardIosIcon
              sx={{
                color: theme => (theme.palette.mode === "dark" ? "#CACACA" : "#98A2B3"),
                fontSize: "20px",
              }}
            />
          ) : (
            <ArrowForwardIosIcon
              sx={{
                transform: "rotate(180deg)",
                color: theme => (theme.palette.mode === "dark" ? "#CACACA" : "#98A2B3"),
                fontSize: "20px",
              }}
            />
          )}
        </Box>
      </Stack>

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
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          background: theme =>
            theme.palette.mode === "dark" ? theme.palette.common.darkBackground : theme.palette.common.lightBackground,
        }}
      >
        <Box
          sx={{
            p: "12px 16px",
            display: "flex",
            cursor: "pointer",
            alignItems: "center",
            width: "150px",
          }}
          onClick={openComLeaderboardTypes}
        >
          <Typography sx={{ fontSize: "12px", fontWeight: 500 }}>
            {COMMUNITY_LEADERBOARD_TYPES[comLeaderboardType]}
          </Typography>
          {comLeaderboardTypeOpen ? (
            <ExpandMore
              sx={{
                color: theme => (theme.palette.mode === "dark" ? "#eaecf0" : "#475467"),
                fontSize: "20px",
              }}
            />
          ) : (
            <ExpandLess
              sx={{
                color: theme => (theme.palette.mode === "dark" ? "#eaecf0" : "#475467"),
                fontSize: "20px",
              }}
            />
          )}
        </Box>
        <Box
          className="scroll-styled"
          sx={{
            width: "100%",
            paddingRight: "80px",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "10px",
            height: "inherit",
            overflowX: "auto",
            overflowY: "hidden",
          }}
        >
          {comLeaderboardTypeOpen && (
            <MultipleChoiceBtn
              choices={choices}
              onClose={openComLeaderboardTypes}
              comLeaderboardType={comLeaderboardType}
            />
          )}
          {!comPoints.length && (
            <Typography
              sx={{
                color: ({ palette }) =>
                  palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray600 : DESIGN_SYSTEM_COLORS.gray200,
              }}
            >
              There are no points yet
            </Typography>
          )}
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
