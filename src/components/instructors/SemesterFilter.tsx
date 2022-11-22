import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  ToggleButton,
  ToggleButtonGroup,
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

  const onChangeCourse2 = (event: SelectChangeEvent) => {
    setSelectedCourse(event.target.value as string);
  };

  const onChangeCourse = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
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
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "space-between", sm: "flex-start" },
          gap: { xs: "16px", md: "16px" },
        }}
      >
        <FormControl size={matches ? "small" : "medium"}>
          <InputLabel id="semester-filter-label">Semester</InputLabel>
          <Select
            labelId="semester-filter-label"
            id="semester-filter"
            value={selectedSemester ?? ""}
            label="Semester"
            onChange={onChangeSemester}
            sx={{ width: "140px" }}
          >
            {semesters.map((cur, idx) => (
              <MenuItem key={idx} value={cur}>
                {cur}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!isMovil && (
          <ToggleButtonGroup
            value={selectedCourse}
            exclusive
            onChange={onChangeCourse}
            aria-label="text alignment"
            sx={{ width: { sm: "500px", lg: "700px", xl: "1000px" }, overflowY: "auto" }}
            className="scroll-styled"
          >
            {courses.map((cur, idx) => (
              <ToggleButton
                key={idx}
                value={cur}
                aria-label="left aligned"
                sx={{ border: "solid 1px rgb(185 185 185)", whiteSpace: " nowrap" }}
              >
                {cur}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
        {isMovil && (
          <FormControl size={matches ? "small" : "medium"}>
            <InputLabel id="course-filter-label">Courses</InputLabel>
            <Select
              labelId="course-filter-label"
              id="course-filter"
              value={selectedCourse ?? ""}
              label="Course"
              onChange={onChangeCourse2}
              sx={{ width: "140px" }}
            >
              {courses.map((cur, idx) => (
                <MenuItem key={idx} value={cur}>
                  {cur}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
