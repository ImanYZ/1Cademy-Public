import { useMediaQuery, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "firebase/firestore";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { User, UserSettings } from "src/knowledgeTypes";
import { ICourseTag } from "src/types/ICourse";

import LoadingImg from "../../../public/animated-icon-1cademy.gif";
import { useAuth } from "../../context/AuthContext";
import { Semester, SemesterStudentVoteStat } from "../../instructorsTypes";
import ROUTES from "../../lib/utils/routes";
import HeaderNavbar from "../instructors/HeaderNavbar";
import HeaderNavbarMovil from "../instructors/HeaderNavbarMovil";
import { SemesterFilter } from "../instructors/SemesterFilter";

export type Option = {
  id: string;
  label: string;
  title: string;
  route: string;
};

const SETTING_OPTION: Option = { id: "05", label: "SETTINGS", title: "SETTINGS", route: "/instructors/settings" };

const OPTIONS: Option[] = [
  { id: "02", label: "DASHBOARD", title: "DASHBOARD", route: "/instructors/dashboard" },
  { id: "03", label: "STUDENTS", title: "STUDENTS", route: "/instructors/students" },
  // { id: "05", label: "SETTINGS", title: "SETTINGS", route: "/instructors/settings" },
  SETTING_OPTION,
];

type InstructorsLayoutPageProps = {
  selectedSemester: string | null;
  selectedCourse: string | null;
  user: User;
  currentSemester: ICourseTag | null;
  settings: UserSettings;
  isLoading: boolean;
  setIsLoading: (newIsLoading: boolean) => void;
  queryUname: string;
};

type Props = {
  children: (props: InstructorsLayoutPageProps) => ReactNode;
};
export type InstructorLayoutPage<P = InstructorsLayoutPageProps, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: InstructorLayoutPage) => ReactNode;
};
export const StudentsLayout: FC<Props> = ({ children }) => {
  const [{ user, settings }] = useAuth();
  const theme = useTheme();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));

  const [allCourses, setAllCourses] = useState<CoursesResult>({});
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [currentSemester, setCurrentSemester] = useState<ICourseTag | null>(null);
  const [allSemesters, setAllSemesters] = useState<Semester[]>([]);
  const [queryUname, setQueryUname] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const db = getFirestore();
  const router = useRouter();

  useEffect(() => {
    const uname = router.query["uname"] as string;
    setQueryUname(uname);
  }, [router.query]);

  useEffect(() => {
    if (!queryUname) return;
    const allowAccessByRole = async () => {
      if (!user) return;

      const role = user?.role;

      if (!role) return router.push(ROUTES.notebook);

      if (!["INSTRUCTOR", "STUDENT"].includes(role)) return router.push(ROUTES.notebook);

      if (role === "STUDENT" && router.route !== ROUTES.instructorsDashboardStudents) return router.back();

      if (role === "STUDENT" && queryUname && user.uname !== queryUname)
        return router.push(`${ROUTES.instructorsDashboard}/${user.uname}`);
    };
    allowAccessByRole();
  }, [queryUname, router, user, user?.role]);

  useEffect(() => {
    if (!queryUname) return;
    if (!user) return console.warn("Not user found, wait please");
    if (user.role === "STUDENT" && queryUname !== user.uname) return;

    const getSemesters = async () => {
      const semestersRef = collection(db, "semesterStudentVoteStats");
      const q = query(semestersRef, where("uname", "==", queryUname));
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

      if (!semester.length) {
        router.push(ROUTES.instructorsSettings);
      }

      setAllSemesters(allSemesters);
      setAllCourses(coursesResult);
      setSelectedSemester(semester[0]);
    };

    getSemesters();
  }, [db, queryUname, router, user]);

  useEffect(() => {
    if (!queryUname) return;
    if (!selectedSemester) return setCourses([]);

    const newCourses = getCourseBySemester(selectedSemester, allCourses);
    setCourses(newCourses);
    setSelectedCourse(newCourses[0]);
  }, [allCourses, queryUname, selectedSemester]);

  useEffect(() => {
    if (!queryUname) return;
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
  }, [allSemesters, queryUname, selectedCourse, user]);

  const semesters = useMemo(() => Object.keys(allCourses), [allCourses]);

  const onNewCourse = () => {
    setSelectedCourse(null);
    if (router.route === ROUTES.instructorsSettings) return;
    router.push(ROUTES.instructorsSettings);
  };

  const filteredOptions = semesters.length ? OPTIONS : [SETTING_OPTION];

  if (!user || !queryUname)
    return (
      <div className="CenterredLoadingImageContainer">
        <Image
          className="CenterredLoadingImage"
          loading="lazy"
          src={LoadingImg}
          alt="Loading"
          width={250}
          height={250}
        />
      </div>
    );

  return (
    <Box
      sx={{
        background: theme => (theme.palette.mode === "light" ? "#F5F5F5" : "#28282A"),
        minHeight: "100vh",
      }}
    >
      {!isMovil && <HeaderNavbar options={filteredOptions} user={user} onNewCourse={onNewCourse} />}
      {isMovil && <HeaderNavbarMovil options={filteredOptions} user={user} onNewCourse={onNewCourse} />}
      <Box
        sx={{
          width: "100%",
          py: "10px",
          m: "auto",
          px: { xs: "10px", md: "20px" },
        }}
      >
        <SemesterFilter
          semesters={semesters}
          selectedSemester={selectedSemester}
          setSelectedSemester={setSelectedSemester}
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          currentSemester={currentSemester}
          isMovil={isMovil}
          role={user.role}
          uname={queryUname}
        />
      </Box>

      {children({
        selectedSemester,
        selectedCourse,
        user,
        currentSemester,
        isLoading,
        setIsLoading: (newIsLoading: boolean) => setIsLoading(newIsLoading),
        settings,
        queryUname,
      })}
    </Box>
  );
};

const getCourseBySemester = (semester: string | undefined, courses: { [key: string]: string[] }): string[] => {
  if (!semester) return [];
  return courses[semester] ?? [];
};

type CoursesResult = {
  [key: string]: string[];
};
