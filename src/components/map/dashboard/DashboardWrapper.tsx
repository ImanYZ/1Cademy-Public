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
import { ISemester } from "../../../types/ICourse";
import { NoDataMessage } from "../../instructors/NoDataMessage";
import { PracticeTool } from "../../practiceTool/PracticeTool";
import { DashboradToolbar } from "../Dashobard/DashboradToolbar";
import { Dashboard } from "./Dashboard";
import { DashboardSettings } from "./DashboardSettings";
// import { Semester } from "../../instructorsTypes";
// import { ICourseTag } from "../../types/ICourse";
// import { CoursesResult } from "../layouts/StudentsLayout";

type DashboardWrapperProps = {
  user: User;
  onClose: () => void;
  sx?: SxProps<Theme>;
};

export type ToolbarView = "DASHBOARD" | "PRACTICE" | "SETTINGS";

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
          console.log({ allCourses });
          const semestersIds = intructor.courses.map(course => course.tagId);
          console.log({ semestersIds });
          const semesters = await getSemesterByIds(db, semestersIds);
          semesters.sort((a, b) => (b.title > a.title ? 1 : -1));
          console.log({ semesters });
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

  useEffect(() => {
    if (currentSemester) return;
    if (!allSemesters) return;
    const mostRecentSemester = allSemesters[0];
    if (!mostRecentSemester) return;

    setCurrentSemester({
      cTagId: mostRecentSemester.cTagId,
      cTitle: mostRecentSemester.cTitle,
      pTagId: mostRecentSemester.pTagId,
      pTitle: mostRecentSemester.pTitle,
      tagId: mostRecentSemester.tagId,
      title: mostRecentSemester.title,
      uTagId: mostRecentSemester.uTagId,
      uTitle: mostRecentSemester.uTitle,
    });
  }, [allCourses, allSemesters, currentSemester, instructor]);

  // select default semester and course
  useEffect(() => {
    if (!currentSemester) return;
    if (selectedCourse) return;
    const courses = allCourses[currentSemester.title];

    if (!courses) return;
    if (!instructor) return;

    const firstCourse = selectCourse(courses[0], instructor);
    if (!firstCourse) return;
    console.log({ firstCourse });
    setCurrentSemester(firstCourse);
    setSelectedCourse(courses[0]);
  }, [allCourses, currentSemester, instructor, selectedCourse]);

  // select default course when exist a semester is selected
  useEffect(() => {
    if (instructor) return;
    if (!currentSemester) return;
    const newCourses = getCourseBySemester(currentSemester?.title, allCourses);

    setSelectedCourse(newCourses[0]);
  }, [allCourses, currentSemester, instructor]);

  // will show current semester properties with selected course
  useEffect(() => {
    if (!instructor) return;
    if (!selectedCourse) return;
    const current = selectCourse(selectedCourse, instructor);
    console.log({ current });
    setCurrentSemester(current ?? null);
  }, [instructor, selectedCourse]);

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
        courses={currentSemester ? allCourses[currentSemester.tagId] ?? [] : []}
        selectedCourse={selectedCourse}
        onChangeSelectedCourseHandler={setSelectedCourse}
        semesters={allSemesters}
        currentSemester={currentSemester}
        onChangeCurrentSemesterHandler={setCurrentSemester}
        onChangeToolbarView={setSelectToolbarView}
        user={user}
        onClose={onClose}
        view={selectToolbarView}
      />
      <Box
        sx={{
          width: "100%",
          height: "100%",
          border: "solid 2px royalBlue",
          overflowY: "auto",
          overflowX: "hidden",
          p: "40px 32px",
        }}
      >
        {currentSemester && allCourses[currentSemester.tagId] ? (
          <>
            {selectToolbarView === "DASHBOARD" && <Dashboard user={user} currentSemester={currentSemester} />}
            {selectToolbarView === "PRACTICE" && (
              <PracticeTool user={user} currentSemester={currentSemester} onClose={onClose} />
            )}
            {selectToolbarView === "SETTINGS" && <DashboardSettings currentSemester={currentSemester} />}
          </>
        ) : (
          <NoDataMessage message="No data in this semester" />
        )}
      </Box>
    </Box>
  );
};

export const getCourseTitleFromSemester = (semester: ISemester) => {
  return `${semester.cTitle} ${semester.pTitle || "- " + semester.uTitle}`;
};

const getCoursesByInstructor = (instructor: Instructor): CoursesResult => {
  console.log({ instructor });
  return instructor.courses.reduce((acu: CoursesResult, cur) => {
    const tmpValues = acu[cur.title] ?? [];
    return { ...acu, [cur.tagId]: [...tmpValues, `${cur.cTitle} ${cur.pTitle || "@ " + cur.uTitle}`] };
  }, {});
};

const getCourseBySemester = (semester: string | undefined, courses: { [key: string]: string[] }): string[] => {
  if (!semester) return [];
  return courses[semester] ?? [];
};

const getSemesterByIds = async (db: Firestore, semesterIds: string[]) => {
  const semestersDocsPromises = semesterIds.map((semesterId: string) => {
    const nodeRef = doc(db, "semesters", semesterId);
    return getDoc(nodeRef);
  });
  const semesterDocs = await Promise.all(semestersDocsPromises);
  const allSemesters = semesterDocs.map(cur => cur.data()).flatMap(c => (c as Semester) || []);
  return allSemesters;
};
const selectCourse = (description: string, instructor: Instructor): CourseTag | undefined => {
  return instructor.courses.find(course => `${course.cTitle} ${course.pTitle || "@ " + course.uTitle}` === description);
};
