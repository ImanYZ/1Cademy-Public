import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { Box, Button, Divider, Paper, Stack, Typography, useTheme } from "@mui/material";
import Image from "next/image";
import React from "react";
import { User } from "src/knowledgeTypes";
import { ICourseTag, ISemester } from "src/types/ICourse";

import { SemesterSelect } from "@/components/instructors/SemesterSelect";
import OptimizedAvatar from "@/components/OptimizedAvatar";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import Logo1Cademy from "../../../../public/full-logo.svg";
import { ToolbarView } from "../dashboard/DashboardWrapper";

type DashboardToolbarProps = {
  user: User | null;
  semesters: ISemester[];
  courses: any[];
  selectedCourse: string | null;
  currentSemester: ICourseTag | null;
  view: ToolbarView;
  onChangeCurrentSemesterHandler: (semester: ICourseTag | null) => void;
  onChangeSelectedCourseHandler: (newSemester: string | null) => void;
  onChangeToolbarView: (view: ToolbarView) => void;
  onClose: () => void;
};

export const DashboradToolbar = ({
  user,
  semesters,
  courses,
  selectedCourse,
  currentSemester,
  onChangeCurrentSemesterHandler,
  onChangeSelectedCourseHandler,
  onChangeToolbarView,
  onClose,
  view,
}: DashboardToolbarProps) => {
  const {
    palette: { mode },
  } = useTheme();
  if (!user) return null;
  return (
    <Paper
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "100%",
        p: "16px",
        bgcolor: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
      }}
    >
      <Stack spacing={"16px"}>
        <Image src={Logo1Cademy.src} alt="1Logo" width={"100%"} height={"64px"} />
        <Stack
          direction={"row"}
          spacing={"6px"}
          p="6px"
          sx={{
            cursor: "pointer",
            background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
            paddingY: "10px",
            paddingX: "5px",
            border: theme => (theme.palette.mode === "dark" ? "solid 1px #303134" : "solid 1px #D0D5DD"),
            borderRadius: "16px",
          }}
        >
          <OptimizedAvatar
            imageUrl={user.imageUrl}
            renderAsAvatar={true}
            contained={false}
            name={`${user.fName} ${user.lName}`}
          />
          <Box>
            <Typography p="0">
              {user.fName} {user.lName}
            </Typography>
            <Typography
              fontWeight={500}
              sx={{
                fontSize: "12px",
                color: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray500,
              }}
            >
              {user.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1).toLocaleLowerCase()}` : ""}
            </Typography>
          </Box>
        </Stack>
        <Box>
          <Stack
            onClick={() => onChangeToolbarView("DASHBOARD")}
            direction={"row"}
            spacing={"16px"}
            sx={{
              borderRadius: "16px",
              p: "8px 16px ",
              cursor: "pointer",
              transition: "background-color 300ms ease-out",
              backgroundColor:
                view === "DASHBOARD"
                  ? mode === "dark"
                    ? DESIGN_SYSTEM_COLORS.notebookO900
                    : DESIGN_SYSTEM_COLORS.primary50
                  : undefined,
              ":hover": {
                backgroundColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookO900 : DESIGN_SYSTEM_COLORS.primary50,
              },
              mb: "8px",
            }}
          >
            <HomeRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.orange400 }} />
            <Typography fontWeight={500}>Dashboard</Typography>
          </Stack>
          <Stack
            onClick={() => onChangeToolbarView("PRACTICE")}
            direction={"row"}
            spacing={"16px"}
            sx={{
              borderRadius: "16px",
              p: "8px 16px ",
              cursor: "pointer",
              transition: "background-color 300ms ease-out",
              backgroundColor:
                view === "PRACTICE"
                  ? mode === "dark"
                    ? DESIGN_SYSTEM_COLORS.notebookO900
                    : DESIGN_SYSTEM_COLORS.primary50
                  : undefined,
              ":hover": {
                backgroundColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookO900 : DESIGN_SYSTEM_COLORS.primary50,
              },
            }}
          >
            <InsightsRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.orange400 }} />
            <Typography fontWeight={500}>Practise</Typography>
          </Stack>
        </Box>
        <Divider />

        <SemesterSelect
          semesters={semesters}
          setCurrentSemester={onChangeCurrentSemesterHandler}
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={onChangeSelectedCourseHandler}
          isMovil={false}
          role={user.role}
          currentSemester={currentSemester}
        />
      </Stack>
      <Button
        onClick={onClose}
        sx={{
          color: DESIGN_SYSTEM_COLORS.primary800,
          justifyContent: "flex-start",
          p: "10px 18px",
        }}
        fullWidth
      >
        <ArrowForwardIosRoundedIcon fontSize="small" sx={{ mr: "8px" }} />
        Go to Notebook
      </Button>
    </Paper>
  );
};
