import { Box, SxProps, Theme } from "@mui/material";
import {
  collection,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  Query,
  query,
  Unsubscribe,
  where,
} from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Instructor, Semester, SemesterStudentVoteStat } from "src/instructorsTypes";

import { CoursesResult } from "@/components/layouts/StudentsLayout";

import { User } from "../../../knowledgeTypes";
import { ICourseTag } from "../../../types/ICourse";
import { NoDataMessage } from "../../instructors/NoDataMessage";
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

export const DashboardWrapper = ({ user, onClose, sx }: DashboardWrapperProps) => {
  const db = getFirestore();

  // const [semesters, setSemesters] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<CoursesResult>({});
  const [allSemesters, setAllSemesters] = useState<Semester[]>([]);

  const [, /* instructor */ setInstructor] = useState<Instructor | null>(null);

  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [currentSemester, setCurrentSemester] = useState<ICourseTag | null>(null);

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

        setAllSemesters(allSemesters);
        setAllCourses(coursesResult);
        // setSelectedSemester(semester[0]);
      }),
    [allSemesters, db]
  );

  const semestersByInstructorSnapshot = (q: Query<DocumentData>) =>
    onSnapshot(
      q,
      async snapshot => {
        const docChanges = snapshot.docChanges();

        // setIsLoading(false);
        // if (!docChanges.length) {
        //   return null;
        // }

        const intructor = docChanges[0].doc.data() as Instructor;
        setInstructor(intructor);
        const allCourses = getCoursesByInstructor(intructor);
        const semestersIds = Object.keys(allCourses);

        const semesters = await getSemesterByIds(db, semestersIds);

        // if (!newSemesters.length) {
        //   router.push(ROUTES.instructorsSettings);
        // }

        // const lastSemester = newSemesters.slice(-1)[0];

        // setSemesters(prevSemester => {
        //   setSelectedSemester(selectedSemester => {
        //     if (!selectedSemester) {
        //       return newSemesters[0];
        //     }
        //     if (!prevSemester.includes(lastSemester)) {
        //       return lastSemester;
        //     }

        //     return selectedSemester;
        //   });
        //   return newSemesters;
        // });
        setAllSemesters(semesters);
        setAllCourses(allCourses);
      },
      (error: any) => {
        console.error(error);
        setIsLoading(false);
      }
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
  }, [db, semesterByStudentSnapthot, user]);

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
    <Box sx={{ ...sx, p: "100px", display: "grid", gridTemplateColumns: "200px auto", border: "solid 2px yellow" }}>
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
      <Box sx={{ width: "100%", border: "solid 2px royalBlue" }}>
        {currentSemester ? (
          <Dashboard user={user} currentSemester={currentSemester} />
        ) : (
          <NoDataMessage message="No data in this semester" />
        )}
        <Box>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima adipisci, amet quidem et nulla quas omnis
          corrupti, deserunt soluta repellat ex, fugit molestias dolor doloribus quis. Eos modi voluptates iure!
          <button onClick={onClose}>......................Close</button>
        </Box>
      </Box>
    </Box>
  );
};
const getCoursesByInstructor = (instructor: Instructor): CoursesResult => {
  return instructor.courses.reduce((acu: CoursesResult, cur) => {
    const tmpValues = acu[cur.title] ?? [];
    return { ...acu, [cur.title]: [...tmpValues, `${cur.cTitle} ${cur.pTitle || "- " + cur.uTitle}`] };
  }, {});
};

const getCourseBySemester = (semester: string | undefined, courses: { [key: string]: string[] }): string[] => {
  if (!semester) return [];
  return courses[semester] ?? [];
};

const getSemesterByIds = async (db: Firestore, semesterIds: string[]) => {
  // const semestersIds = semestersStudent.map(cur => cur.data.tagId);

  const semestersDocsPromises = semesterIds.map((semesterId: string) => {
    const nodeRef = doc(db, "semesters", semesterId);
    return getDoc(nodeRef);
  });
  const semesterDocs = await Promise.all(semestersDocsPromises);
  const allSemesters = semesterDocs.map(cur => cur.data()).flatMap(c => (c as Semester) || []);
  return allSemesters;
};
