import ListIcon from "@mui/icons-material/List";
import { Box, Divider, IconButton, LinearProgress, Stack, styled, Typography } from "@mui/material";
import React from "react";

import { nodeTutorialReducer } from "@/lib/reducers/nodeTutorial";
import { gray200 } from "@/pages/home";

const DividerStyled = styled(props => <Divider {...props} />)(({ theme }) => ({
  borderColor: theme.palette.mode === "dark" ? "#3b3b3b" : gray200,
}));

type ProgressBarMenuProps = {
  currentStep: number;
  open: boolean;
  handleOpenProgressBar: () => void;
};

const counterStep = (nodeTutorialReducer.toString().match(/case\s+\d+/g) || []).length;

const ProgressBarMenu = ({ currentStep, handleOpenProgressBar, open }: ProgressBarMenuProps) => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: "8px",
        backgroundColor: theme => (theme.palette.mode === "dark" ? "rgb(31,31,31)" : "rgb(240,240,240)"),
        width: "180px",
        right: `${open ? "0px" : "-180px"}`,
        borderRadius: "8px 0 0 8px",
        transition: "right 300ms ease-out",
        zIndex: 99999,
        p: "8px 16px 20px 16px",
      }}
      alignItems="center"
    >
      <Stack direction={"row"} alignItems="center" spacing="8px">
        <IconButton onClick={handleOpenProgressBar}>
          <ListIcon fontSize="medium" />
        </IconButton>
        <Typography fontSize={"16px"}>Tutorial Menu</Typography>
      </Stack>
      <DividerStyled />
      <Stack direction={"row"} alignItems="center" justifyContent={"space-between"} my="10px">
        <Typography fontSize={"12px"}>Tutorials</Typography>
        <Typography fontSize={"12px"}>
          {currentStep} / {counterStep}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={45}
        color={"success"}
        sx={{
          borderRadius: "50px",
          backgroundColor: "#535353",
          height: "6px",
          "& .MuiLinearProgress-bar1Determinate": {
            backgroundColor: "#A4FD96",
          },
        }}
      />
    </Box>
  );
};

export const MemoizedProgressBarMenu = React.memo(ProgressBarMenu);
