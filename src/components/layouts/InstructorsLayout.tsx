import { Typography, useMediaQuery, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { User, UserSettings } from "src/knowledgeTypes";
import { ICourseTag } from "src/types/ICourse";

import LoadingImg from "../../../public/animated-icon-1cademy.gif";
import { useAuth } from "../../context/AuthContext";
import { Instructor } from "../../instructorsTypes";
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
};

type Props = {
  children: (props: InstructorsLayoutPageProps) => ReactNode;
};
export type InstructorLayoutPage<P = InstructorsLayoutPageProps, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: InstructorLayoutPage) => ReactNode;
};
export const InstructorsLayout: FC<Props> = ({ children }) => {
  const [{ user, settings }] = useAuth();
  console.log("InstructorsLayout", { user });
  const theme = useTheme();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<CoursesResult>({});
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [currentSemester, setCurrentSemester] = useState<ICourseTag | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const db = getFirestore();
  const router = useRouter();

  useEffect(() => {
    const allowAccessByRole = async () => {
      if (!user) return;

      const role = user?.role;
      if (!role) return router.push(ROUTES.dashboard);
      if (!["INSTRUCTOR", "STUDENT"].includes(role)) return router.push(ROUTES.dashboard);
      if (role === "STUDENT") return router.push(ROUTES.dashboard);
      // in this case is instructor he can see all
    };
    allowAccessByRole();
  }, [router, user]);

  useEffect(() => {
    if (!user) return console.warn("Not user found, wait please");

    const instructorsRef = collection(db, "instructors");
    const q = query(instructorsRef, where("uname", "==", user.uname));

    const killSnapshot = onSnapshot(
      q,
      async snapshot => {
        const docChanges = snapshot.docChanges();

        setIsLoading(false);
        if (!docChanges.length) {
          console.log("no instructor");
          return null;
        }

        const intructor = docChanges[0].doc.data() as Instructor;
        console.log("snapshot:instructor:", intructor);
        setInstructor(intructor);
        const newAllCourses = getCoursesByInstructor(intructor);
        console.log("snapshot:courses:", newAllCourses);
        const newSemesters = Object.keys(newAllCourses);
        console.log("snapshot:semester:", newSemesters);

        if (!newSemesters.length) {
          router.push(ROUTES.instructorsSettings);
        }

        const lastSemester = newSemesters.slice(-1)[0];
        console.log("snapshot:lastSemester", lastSemester);

        setSemesters(prevSemester => {
          setSelectedSemester(selectedSemester => {
            if (!selectedSemester) {
              console.log("snapshot:setSelected first semester", newSemesters[0]);

              return newSemesters[0];
            }
            if (!prevSemester.includes(lastSemester)) {
              console.log("snapshot:setSelected last semester", lastSemester);

              return lastSemester;
            }

            return selectedSemester;
          });
          return newSemesters;
        });
        setAllCourses(newAllCourses);
      },
      error => {
        console.error(error);
        setIsLoading(false);
      }
    );

    return () => killSnapshot();
  }, [db, router, user]);

  useEffect(() => {
    if (!selectedSemester) return setCourses([]);
    const newCourses = getCourseBySemester(selectedSemester, allCourses);
    setCourses(newCourses);
    setSelectedCourse(newCourses[0]);
  }, [allCourses, selectedSemester]);

  useEffect(() => {
    if (!instructor) return;
    if (!selectedCourse) return;
    const current = selectCourse(selectedCourse, instructor);

    setCurrentSemester(current ?? null);
  }, [instructor, selectedCourse]);

  const onNewCourse = () => {
    setSelectedCourse(null);
    if (router.route === ROUTES.instructorsSettings) return;
    router.push(ROUTES.instructorsSettings);
  };

  const filteredOptions = semesters.length ? OPTIONS : [SETTING_OPTION];

  if (isLoading)
    return (
      <Box
        className="CenterredLoadingImageContainer"
        sx={{ background: theme => (theme.palette.mode === "dark" ? "#28282A" : "#F5F5F5") }}
      >
        <Image
          className="CenterredLoadingImage"
          loading="lazy"
          src={LoadingImg}
          alt="Loading"
          width={250}
          height={250}
        />
      </Box>
    );

  if (!user) return <Typography>No user</Typography>;
  return (
    <Box
      sx={{
        background: theme => (theme.palette.mode === "light" ? "#F5F5F5" : "#28282A"),
        minHeight: "100vh",
      }}
    >
      {!isMovil && <HeaderNavbar options={filteredOptions} user={user} onNewCourse={onNewCourse} />}
      {isMovil && <HeaderNavbarMovil options={filteredOptions} user={user} onNewCourse={onNewCourse} />}

      <Box sx={{ width: "100%", py: "10px", m: "auto", px: { xs: "10px", md: "20px" } }}>
        <SemesterFilter
          semesters={semesters}
          selectedSemester={selectedSemester}
          setSelectedSemester={setSelectedSemester}
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          isMovil={isMovil}
          role={user.role}
          currentSemester={currentSemester}
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
const getCoursesByInstructor = (instructor: Instructor): CoursesResult => {
  return instructor.courses.reduce((acu: CoursesResult, cur) => {
    const tmpValues = acu[cur.title] ?? [];
    return { ...acu, [cur.title]: [...tmpValues, `${cur.cTitle} ${cur.pTitle}`] };
  }, {});
};
const selectCourse = (description: string, instructor: Instructor): ICourseTag | undefined => {
  return instructor.courses.find(course => `${course.cTitle} ${course.pTitle}` === description);
};
