import { Box, SxProps, Theme } from "@mui/material";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { Semester, SemesterStudentVoteStat } from "src/instructorsTypes";
import { User } from "src/knowledgeTypes";
import { ICourseTag } from "src/types/ICourse";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { CoursesResult } from "../layouts/StudentsLayout";
import { DashboradToolbar } from "./Dashobard/DashboradToolbar";

// import { Semester } from "../../instructorsTypes";
// import { ICourseTag } from "../../types/ICourse";
// import { CoursesResult } from "../layouts/StudentsLayout";

type DashboardProps = {
  user: User | null;
  onClose: () => void;
  sx?: SxProps<Theme>;
};

export const Dashboard = ({ user, sx, onClose }: DashboardProps) => {
  const db = getFirestore();

  const [allCourses, setAllCourses] = useState<CoursesResult>({});
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [currentSemester, setCurrentSemester] = useState<ICourseTag | null>(null);
  const [allSemesters, setAllSemesters] = useState<Semester[]>([]);

  // const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!user) return console.warn("Not user found, wait please");
    if (!user.uname) return;

    if (user.role !== "STUDENT" /*  && queryUname !== user.uname */) return;
    console.log("fetching");
    const getSemesters = async () => {
      const semestersRef = collection(db, "semesterStudentVoteStats");
      const q = query(semestersRef, where("uname", "==", user.uname));
      const semesterStudentDocs = await getDocs(q);
      if (!semesterStudentDocs.docs.length) {
        // there is not semesters by that user
        return;
      }

      const semestersStudent = semesterStudentDocs.docs.map(change => {
        const semesterData: SemesterStudentVoteStat = change.data() as SemesterStudentVoteStat;
        return {
          id: change.id,
          data: semesterData,
        };
      });

      // will get ids
      const semestersIds = semestersStudent.map(cur => cur.data.tagId);
      // will get courses
      const semestersDocsPromises = semestersIds.map((semesterId: string) => {
        const nodeRef = doc(db, "semesters", semesterId);
        return getDoc(nodeRef);
      });
      const semesterDocs = await Promise.all(semestersDocsPromises);

      const allSemesters = semesterDocs.map(cur => cur.data()).flatMap(c => (c as Semester) || []);

      const coursesResult = allSemesters.reduce((acu: CoursesResult, cur: Semester) => {
        const tmpValues = acu[cur.title] ?? [];
        return { ...acu, [cur.title]: [...tmpValues, `${cur.cTitle} ${cur.pTitle}`] };
      }, {});

      const semester = allSemesters.map(cur => cur.title);

      // if (!semester.length) {
      //   router.push(ROUTES.instructorsSettings);
      // }
      setAllSemesters(allSemesters);
      setAllCourses(coursesResult);
      setSelectedSemester(semester[0]);
    };

    getSemesters();
  }, [db, user]);

  const semesters = useMemo(() => Object.keys(allCourses), [allCourses]);

  useEffect(() => {
    if (!user) return;
    if (!selectedSemester) return setCourses([]);

    const newCourses = getCourseBySemester(selectedSemester, allCourses);
    setCourses(newCourses);
    setSelectedCourse(newCourses[0]);
  }, [allCourses, selectedSemester, user]);

  useEffect(() => {
    if (!user) return;
    if (!selectedCourse) return;

    const semesterFound = allSemesters.find(course => `${course.cTitle} ${course.pTitle}` === selectedCourse);
    if (!semesterFound) {
      setCurrentSemester(null);
    } else {
      setCurrentSemester({
        cTagId: semesterFound.cTagId,
        cTitle: semesterFound.cTitle,
        pTagId: semesterFound.pTagId,
        pTitle: semesterFound.pTitle,
        tagId: semesterFound.tagId,
        title: semesterFound.title,
        uTagId: semesterFound.uTagId,
        uTitle: semesterFound.uTitle,
      });
    }
  }, [allSemesters, selectedCourse, user]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: ({ palette: { mode } }) =>
          mode === "dark" ? DESIGN_SYSTEM_COLORS.baseBlack : DESIGN_SYSTEM_COLORS.gray200,
        ...sx,

        zIndex: 999,
      }}
    >
      <DashboradToolbar
        courses={courses}
        selectedCourse={selectedCourse}
        onChangeSelectedCourseHandler={setSelectedCourse}
        semesters={semesters}
        currentSemester={currentSemester}
        selectedSemester={selectedSemester}
        onChangeSelecedSemesterHandler={setSelectedSemester}
        user={user}
        onClose={onClose}
      />

      <div>selected page</div>
      <button onClick={onClose}>......................Close</button>
    </Box>
  );
};
const getCourseBySemester = (semester: string | undefined, courses: { [key: string]: string[] }): string[] => {
  if (!semester) return [];
  return courses[semester] ?? [];
};
