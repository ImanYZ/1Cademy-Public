// import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowRightRoundedIcon from "@mui/icons-material/ArrowRightRounded";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { CourseTag } from "src/instructorsTypes";
import { ISemester, ISemesterStudent } from "src/types/ICourse";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { Z_INDEX } from "@/lib/utils/constants";

import { UserRole } from "../../knowledgeTypes";
import { UserProfileSkeleton } from "./skeletons/UserProfileSkeleton";

type SemesterSelectProps = {
  semesters: ISemester[];
  courses: string[];
  selectedCourse: string | null;
  setSelectedCourse: any;
  currentSemester: CourseTag | null;
  isMovil: boolean;
  role: UserRole;
  uname?: string;
  setCurrentSemester: (semester: CourseTag | null) => void;
  isCollapsed: boolean;
};

export const SemesterSelect = ({
  semesters,
  setCurrentSemester,
  courses,
  selectedCourse,
  setSelectedCourse,
  currentSemester,
  isMovil,
  role,
  uname,
  isCollapsed,
}: SemesterSelectProps) => {
  const db = getFirestore();
  const {
    palette: { mode },
  } = useTheme();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  const [student, setStudent] = useState<ISemesterStudent | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const onChangeSemester = (event: SelectChangeEvent) => {
    const semester = semesters.find(semester => semester.tagId === event.target.value);
    if (!semester) return;

    const { documentId, pTagId, uTagId, title, uTitle, cTitle, pTitle, tagId, cTagId } = semester;
    const semesterMapped = {
      documentId,
      pTagId,
      uTagId,
      title,
      uTitle,
      cTitle,
      pTitle,
      tagId,
      cTagId,
    };
    setCurrentSemester(semesterMapped);
    setSelectedCourse(null);
  };

  const onChangeCourse = (newAlignment: string | null) => {
    if (newAlignment) {
      setSelectedCourse(newAlignment);
    }
  };
  useEffect(() => {
    if (!currentSemester || !uname) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const getStudenData = async () => {
      const semesterRef = doc(db, "semesters", currentSemester.tagId);
      const semesterDoc = await getDoc(semesterRef);
      if (!semesterDoc.exists()) {
        setIsLoading(false);
        return;
      }

      const student = (semesterDoc.data() as ISemester).students.find(student => student.uname === uname);
      setStudent(student);
      setIsLoading(false);
      // setStudent(studentDoc.docs.)
    };
    getStudenData();
  }, [currentSemester, db, uname]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: { xs: "6px", md: "20px" },
        justifyContent: { xs: "center", sm: "space-between" },
      }}
    >
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: { xs: "16px", md: "16px" } }}>
        <FormControl size={"small"}>
          <InputLabel id="semester-filter-labels">Semester</InputLabel>
          <Select
            labelId="semester-filter-labels"
            id="semester-filter"
            value={currentSemester ? currentSemester.tagId : ""}
            label="Semester"
            onChange={onChangeSemester}
            fullWidth
            MenuProps={{
              style: { zIndex: Z_INDEX.dashboard + 1 },
            }}
          >
            {semesters.map((cur, idx) => (
              <MenuItem key={idx} value={cur.tagId}>
                {cur.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
          <Typography fontSize={"14px"} fontWeight={"500"} flex={1}>
            Dashboard
          </Typography>
          <Button
            sx={{
              minWidth: "auto",
              backgroundColor: mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookO900 : DESIGN_SYSTEM_COLORS.primary100,
              borderRadius: "8px",
              ":hover": {
                opacity: "0.9",
              },
            }}
          >
            <AddRoundedIcon sx={{ fontSize: "14px" }} />
          </Button>
        </Stack> */}
        {!isMovil && (
          <Stack spacing={"12px"}>
            {courses.map((course, idx) => (
              <Button
                key={idx}
                aria-label="left aligned"
                onClick={() => onChangeCourse(course)}
                sx={{
                  p: isCollapsed ? "6px 4px" : "",
                  minWidth: "0px",
                  whiteSpace: " nowrap",
                  border: "none",
                  backgroundColor:
                    selectedCourse === course
                      ? mode === "dark"
                        ? DESIGN_SYSTEM_COLORS.notebookO900
                        : DESIGN_SYSTEM_COLORS.primary50
                      : "transparerent",

                  color:
                    selectedCourse === course
                      ? DESIGN_SYSTEM_COLORS.primary600
                      : mode === "dark"
                      ? DESIGN_SYSTEM_COLORS.gray300
                      : DESIGN_SYSTEM_COLORS.gray700,
                  borderBottom: `1px solid ${
                    selectedCourse === course ? DESIGN_SYSTEM_COLORS.primary600 : DESIGN_SYSTEM_COLORS.notebookG500
                  }}`,
                }}
                fullWidth
              >
                <Stack
                  direction={"row"}
                  spacing={"4px"}
                  alignItems={"center"}
                  sx={{ textOverflow: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }}
                >
                  {!isCollapsed && <ArrowRightRoundedIcon fontSize="medium" />}
                  <Typography color={"inherit"} fontSize={isCollapsed ? "12px" : "14px"}>
                    {course}
                  </Typography>
                </Stack>
              </Button>
            ))}
          </Stack>
        )}
      </Box>

      {role === "INSTRUCTOR" && (
        <>
          {isLoading && <UserProfileSkeleton mobile={matches} />}
          {!isLoading && student && (
            <Box
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: matches ? "column-reverse" : "row",
                alignItems: "center",
                gap: matches ? "8px" : "32px",
                marginTop: matches ? "8px" : "0",
                color: theme => theme.palette.common.gray,
              }}
            >
              <Typography
                sx={{ fontWeight: "700", fontSize: "16px" }}
              >{`${student.fName} ${student.lName}`}</Typography>
              <Tooltip title={`${student.fName} ${student.lName}`}>
                <Box>
                  <Image
                    src={student.imageUrl ?? ""}
                    alt={"name"}
                    width="55px"
                    height="55px"
                    quality={40}
                    objectFit="cover"
                    style={{
                      borderRadius: "50%",
                    }}
                  />
                </Box>
              </Tooltip>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
