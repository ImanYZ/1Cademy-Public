import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { Box, Button, ButtonBase, Divider, Paper, Stack, Typography, useTheme } from "@mui/material";
import Image from "next/image";
import React, { ReactNode } from "react";
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
  courses: string[];
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
  console.log({ courses, currentSemester });
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
            sx={{ width: "38px", height: "38px", alignSelf: "center" }}
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
          <DashboardToolbarViewButton
            name="Dashboard"
            view="DASHBOARD"
            active={view === "DASHBOARD"}
            IconButton={<HomeRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.orange400 }} />}
            onChangeToolbarView={() => onChangeToolbarView("DASHBOARD")}
          />
          {user.role === "STUDENT" && (
            <>
              <DashboardToolbarViewButton
                name="Practise"
                view="PRACTICE"
                active={view === "PRACTICE"}
                IconButton={<InsightsRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.orange400 }} />}
                onChangeToolbarView={() => onChangeToolbarView("PRACTICE")}
              />
            </>
          )}
          {user.role === "INSTRUCTOR" && (
            <>
              <DashboardToolbarViewButton
                name="Students"
                view="STUDENTS"
                active={view === "STUDENTS"}
                IconButton={<GroupsRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.orange400 }} />}
                onChangeToolbarView={() => onChangeToolbarView("STUDENTS")}
              />
              <DashboardToolbarViewButton
                name="Settings"
                view="SETTINGS"
                active={view === "SETTINGS"}
                IconButton={<SettingsRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.orange400 }} />}
                onChangeToolbarView={() => onChangeToolbarView("SETTINGS")}
              />
            </>
          )}
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

type DashboardToolbarViewButtonProps = {
  view: ToolbarView;
  active: boolean;
  name: string;
  IconButton: ReactNode;
  onChangeToolbarView: (view: ToolbarView) => void;
};

const DashboardToolbarViewButton = ({
  view,
  onChangeToolbarView,
  IconButton,
  name,
  active,
}: DashboardToolbarViewButtonProps) => {
  const {
    palette: { mode },
  } = useTheme();
  return (
    <ButtonBase sx={{ display: "block", width: "100%" }}>
      <Stack
        onClick={() => onChangeToolbarView(view)}
        direction={"row"}
        spacing={"16px"}
        sx={{
          borderRadius: "16px",
          p: "8px 16px ",
          cursor: "pointer",
          transition: "background-color 300ms ease-out",
          backgroundColor: active
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
        {IconButton}
        <Typography fontWeight={500}>{name}</Typography>
      </Stack>
    </ButtonBase>
  );
};
