import AddRoundedIcon from "@mui/icons-material/AddRounded";
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
import { ICourseTag, ISemester, ISemesterStudent } from "src/types/ICourse";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { UserRole } from "../../knowledgeTypes";
import { UserProfileSkeleton } from "./skeletons/UserProfileSkeleton";

type SemesterFilterProps = {
  semesters: string[];
  selectedSemester: string | null;
  setSelectedSemester: any;
  courses: string[];
  selectedCourse: string | null;
  setSelectedCourse: any;
  currentSemester: ICourseTag | null;
  isMovil: boolean;
  role: UserRole;
  uname?: string;
};

export const SemesterFilter = ({
  semesters,
  selectedSemester,
  setSelectedSemester,
  courses,
  selectedCourse,
  setSelectedCourse,
  currentSemester,
  isMovil,
  role,
  uname,
}: SemesterFilterProps) => {
  console.log("selectedSemester", selectedSemester, currentSemester);
  const db = getFirestore();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  const [student, setStudent] = useState<ISemesterStudent | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const onChangeSemester = (event: SelectChangeEvent) => {
    setSelectedSemester(event.target.value as string);
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
      <Box sx={{ maxWidth: "170px", display: "flex", flexDirection: "column", gap: { xs: "16px", md: "16px" } }}>
        <FormControl size={"small"}>
          <InputLabel id="semester-filter-labels">Semester</InputLabel>
          <Select
            labelId="semester-filter-labels"
            id="semester-filter"
            value={selectedSemester ?? ""}
            label="Semester"
            onChange={onChangeSemester}
            fullWidth
            sx={{ "& 	.MuiSelect-root": { position: "absolute", zIndex: 99999 } }}
          >
            {semesters.map((cur, idx) => (
              <MenuItem key={idx} value={cur}>
                {cur}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
          <Typography fontSize={"14px"} fontWeight={"500"} flex={1}>
            Dashboard
          </Typography>
          <Button sx={{ p: "7px", backgroundColor: DESIGN_SYSTEM_COLORS.notebookO900 }}>
            <AddRoundedIcon sx={{ fontSize: "14px" }} />
          </Button>
        </Stack>
        {!isMovil && (
          <Stack spacing={"12px"}>
            {courses.map((course, idx) => (
              <Button
                key={idx}
                value={course}
                aria-label="left aligned"
                onClick={() => onChangeCourse(course)}
                sx={{
                  whiteSpace: " nowrap",
                  p: "6px",
                  border: "none",

                  backgroundColor: selectedCourse === course ? DESIGN_SYSTEM_COLORS.notebookO900 : "transparerent",
                  color: selectedCourse === course ? DESIGN_SYSTEM_COLORS.primary600 : DESIGN_SYSTEM_COLORS.gray300,
                  borderBottom: `1px solid ${
                    selectedCourse === course ? DESIGN_SYSTEM_COLORS.primary600 : DESIGN_SYSTEM_COLORS.notebookG500
                  }}`,
                  "& .MuiButton-root": {
                    borderRadius: "4px 4px 0px 0px",
                    justifyContent: "flex-start",
                  },
                }}
                fullWidth
              >
                <Stack
                  direction={"row"}
                  spacing={"4px"}
                  alignItems={"center"}
                  sx={{ textOverflow: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }}
                >
                  <ArrowRightRoundedIcon fontSize="medium" />
                  <Typography color={"inherit"} fontSize={"14px"}>
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
