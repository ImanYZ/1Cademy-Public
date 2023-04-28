import { Box, SxProps, Theme } from "@mui/material";
import {
  collection,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  getFirestore,
  onSnapshot,
  Query,
  query,
  Unsubscribe,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { CourseTag, Instructor, Semester, SemesterStudentVoteStat } from "src/instructorsTypes";

import { CoursesResult } from "@/components/layouts/StudentsLayout";

import { User } from "../../../knowledgeTypes";
import { DESIGN_SYSTEM_COLORS } from "../../../lib/theme/colors";
import { ICourseTag, ISemester } from "../../../types/ICourse";
import { NoDataMessage } from "../../instructors/NoDataMessage";
import { PracticeTool } from "../../practiceTool/PracticeTool";
import { DashboradToolbar } from "../Dashobard/DashboradToolbar";
import { Dashboard } from "./Dashboard";
// import { Semester } from "../../instructorsTypes";
// import { ICourseTag } from "../../types/ICourse";
// import { CoursesResult } from "../layouts/StudentsLayout";

type DashboardWrapperProps = {
  user: User;
  onClose: () => void;
  sx?: SxProps<Theme>;
};

export type ToolbarView = "DASHBOARD" | "PRACTICE";

export const DashboardWrapper = ({ user, onClose, sx }: DashboardWrapperProps) => {
  const db = getFirestore();

  // const [semesters, setSemesters] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<CoursesResult>({});
  const [allSemesters, setAllSemesters] = useState<Semester[]>([]);

  const [instructor, setInstructor] = useState<Instructor | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [currentSemester, setCurrentSemester] = useState<CourseTag | null>(null);

  const [selectToolbarView, setSelectToolbarView] = useState<ToolbarView>("DASHBOARD");

  const [, /* isLoading */ setIsLoading] = useState(true);

  const semesterByStudentSnapthot = useCallback(
    (q: Query<DocumentData>) =>
      onSnapshot(q, async snaphot => {
        const docChanges = snaphot.docChanges();

        const semestersStudent = docChanges.map(change => {
          const semesterData: SemesterStudentVoteStat = change.doc.data() as SemesterStudentVoteStat;
          return {
            id: change.doc.id,
            data: semesterData,
          };
        });
        const semestersIds = semestersStudent.map(cur => cur.data.tagId);
        const semesters = await getSemesterByIds(db, semestersIds);
        const coursesResult = semesters.reduce((acu: CoursesResult, cur: Semester) => {
          const tmpValues = acu[cur.title] ?? [];
          return { ...acu, [cur.title]: [...tmpValues, `${cur.cTitle} ${cur.pTitle}`] };
        }, {});

        // const semester = allSemesters.map(cur => cur.title);

        setAllSemesters(semesters);
        setAllCourses(coursesResult);
        // setSelectedSemester(semester[0]);
      }),
    [db]
  );

  const semestersByInstructorSnapshot = useCallback(
    (q: Query<DocumentData>) =>
      onSnapshot(
        q,
        async snapshot => {
          const docChanges = snapshot.docChanges();
          const intructor = docChanges[0].doc.data() as Instructor;
          setInstructor(intructor);
          const allCourses = getCoursesByInstructor(intructor);
          const semestersIds = intructor.courses.map(course => course.tagId);

          const semesters = await getSemesterByIds(db, semestersIds);

          setAllSemesters(semesters);
          setAllCourses(allCourses);
        },
        (error: any) => {
          console.error(error);
          setIsLoading(false);
        }
      ),
    [db]
  );
  useEffect(() => {
    if (!user) return;
    console.log("main effect");
    let killSnapshot: Unsubscribe | null = null;
    if (user.role === "INSTRUCTOR") {
      const instructorsRef = collection(db, "instructors");
      const q = query(instructorsRef, where("uname", "==", user.uname));
      killSnapshot = semestersByInstructorSnapshot(q);
    }

    if (user.role === "STUDENT") {
      const semestersRef = collection(db, "semesterStudentVoteStats");
      const q = query(semestersRef, where("uname", "==", user.uname));
      killSnapshot = semesterByStudentSnapthot(q);
    }

    return () => {
      if (killSnapshot) killSnapshot();
    };
  }, [db, semesterByStudentSnapthot, semestersByInstructorSnapshot, user]);

  // useEffect(() => {
  //   if (!user) return;
  //   if (!selectedSemester) return setCourses([]);

  //   const newCourses = getCourseBySemester(selectedSemester, allCourses);
  //   // setCourses(newCourses);
  //   setSelectedCourse(newCourses[0]);
  // }, [allCourses, selectedSemester, user]);

  //USEEFFECT TO SELECT THE DEFAULT COURSE
  // useEffect(() => {
  //   if (!user) return;
  //   // if (!selectedCourse) return;

  //   const semesterFound = allSemesters.find(course => `${course.cTitle} ${course.pTitle}` === selectedCourse);
  //   if (!semesterFound) {
  //     setCurrentSemester(null);
  //   } else {
  //     setCurrentSemester({
  //       cTagId: semesterFound.cTagId,
  //       cTitle: semesterFound.cTitle,
  //       pTagId: semesterFound.pTagId,
  //       pTitle: semesterFound.pTitle,
  //       tagId: semesterFound.tagId,
  //       title: semesterFound.title,
  //       uTagId: semesterFound.uTagId,
  //       uTitle: semesterFound.uTitle,
  //     });
  //   }
  // }, [allSemesters, selectedCourse, user]);

  useEffect(() => {
    if (!instructor) return;
    if (!selectedCourse) return;
    const current = selectCourse(selectedCourse, instructor);

    setCurrentSemester(current ?? null);
  }, [instructor, selectedCourse]);

  console.log({ user, currentSemester });
  return (
    <Box
      sx={{
        ...sx,
        display: "grid",
        gridTemplateColumns: "200px auto",
        gridTemplateRows: "100%",
        border: "solid 2px yellow",
        background: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
      }}
    >
      <DashboradToolbar
        courses={currentSemester ? allCourses[currentSemester.title] : []}
        selectedCourse={selectedCourse}
        onChangeSelectedCourseHandler={setSelectedCourse}
        semesters={allSemesters}
        currentSemester={currentSemester}
        onChangeCurrentSemesterHandler={setCurrentSemester}
        onChangeToolbarView={setSelectToolbarView}
        user={user}
        onClose={onClose}
      />
      <Box sx={{ width: "100%", height: "100%", border: "solid 2px royalBlue", overflowY: "auto", p: "40px 32px" }}>
        {currentSemester ? (
          <>
            {selectToolbarView === "DASHBOARD" && <Dashboard user={user} currentSemester={currentSemester} />}
            {selectToolbarView === "PRACTICE" && <PracticeTool onClose={onClose} />}
          </>
        ) : (
          <NoDataMessage message="No data in this semester" />
        )}
      </Box>
    </Box>
  );
};

export const getCourseTitle = (semester: ISemester) => {
  return `${semester.cTitle} ${semester.pTitle || "- " + semester.uTitle}`;
};

const getCoursesByInstructor = (instructor: Instructor): CoursesResult => {
  return instructor.courses.reduce((acu: CoursesResult, cur) => {
    const tmpValues = acu[cur.title] ?? [];
    return { ...acu, [cur.title]: [...tmpValues, `${cur.cTitle} ${cur.pTitle || "- " + cur.uTitle}`] };
  }, {});
};

// const getCourseBySemester = (semester: string | undefined, courses: { [key: string]: string[] }): string[] => {
//   if (!semester) return [];
//   return courses[semester] ?? [];
// };

const getSemesterByIds = async (db: Firestore, semesterIds: string[]) => {
  // const semestersIds = semestersStudent.map(cur => cur.data.tagId);
  console.log({ semesterIds });
  const semestersDocsPromises = semesterIds.map((semesterId: string) => {
    const nodeRef = doc(db, "semesters", semesterId);
    return getDoc(nodeRef);
  });
  const semesterDocs = await Promise.all(semestersDocsPromises);
  const allSemesters = semesterDocs.map(cur => cur.data()).flatMap(c => (c as Semester) || []);
  console.log({ allSemesters });
  return allSemesters;
};
const selectCourse = (description: string, instructor: Instructor): ICourseTag | undefined => {
  return instructor.courses.find(course => `${course.cTitle} ${course.pTitle || "- " + course.uTitle}` === description);
};
