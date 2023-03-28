import ListIcon from "@mui/icons-material/List";
import { Box, Divider, IconButton, LinearProgress, Stack, styled, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { UserTutorials } from "src/nodeBookTypes";

import { gray50, gray200 } from "@/pages/home";

const DividerStyled = styled(props => <Divider {...props} />)(({ theme }) => ({
  borderColor: theme.palette.mode === "dark" ? "#3b3b3b" : gray200,
}));

type ProgressBarMenuProps = {
  userTutorial: UserTutorials;
};

// const counterStep = (nodeTutorialReducer.toString().match(/case\s+\d+/g) || []).length;

const ProgressBarMenu = ({ userTutorial }: ProgressBarMenuProps) => {
  const tutorialsTaken = useMemo(() => {
    const { ...userTutorialF } = userTutorial;

    return Object.values(userTutorialF).filter(tutorial => tutorial.done || tutorial.skipped).length;
  }, [userTutorial]);

  const tutorialsAmount = useMemo(() => {
    return Object.keys(userTutorial).length;
  }, [userTutorial]);

  return (
    <Box
      sx={{
        position: "fixed",
        top: "75px",
        backgroundColor: theme => (theme.palette.mode === "dark" ? "#1B1A1A" : gray50),
        width: "180px",
        right: `${true ? "7px" : "-180px"}`,
        borderRadius: "8px",
        transition: "right 300ms ease-out",
        zIndex: 99999,
        p: "8px 16px",
      }}
      alignItems="center"
    >
      <Stack direction={"row"} alignItems="center" spacing="8px" mb="8px">
        <IconButton size="small">
          <ListIcon fontSize="medium" />
        </IconButton>
        <Typography fontSize={"16px"}>Tutorial Menu</Typography>
      </Stack>
      <DividerStyled />
      <Stack direction={"row"} alignItems="center" justifyContent={"space-between"} my="10px">
        <Typography fontSize={"12px"}>Tutorials</Typography>
        <Typography fontSize={"12px"}>
          {tutorialsTaken} / {tutorialsAmount}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={(tutorialsTaken * 100) / tutorialsAmount}
        color={"success"}
        sx={{
          borderRadius: "50px",
          backgroundColor: theme => (theme.palette.mode === "dark" ? "#D0D5DD4D" : "#6C74824D"),
          height: "5px",
          "& .MuiLinearProgress-bar1Determinate": {
            backgroundColor: theme => (theme.palette.mode === "dark" ? "#A4FD96" : "#52AE43"),
            borderRadius: "50px",
          },
        }}
      />
    </Box>
  );
};

export const MemoizedProgressBarMenu = React.memo(ProgressBarMenu);
