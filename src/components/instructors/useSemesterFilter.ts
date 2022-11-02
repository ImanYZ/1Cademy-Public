import { useEffect, useState } from "react";
const MOCK_SEMESTERS: string[] = [
  "Winter-2022",
  "Spring-2022",
  "Fall-2022",
  "Summer-2022",
  "Winter-2021",
  "Summer-2021",
];
// const MOCK_COURSER = ["SI 106 Introduction to ...", "Winter 2022", "Fall 2021", "Winter 2021", "Summer 2021"];

const MOCK_COURSES: { [key: string]: string[] } = {
  "Winter-2022": ["SI 106 Introduction", "SI 107 Introduction", "SI 108 Introduction", "SI 109 Introduction"],
  "Spring-2022": ["EF 206 Introduction", "EF 207 Introduction", "EF 208 Introduction", "EF 209 Introduction"],
  "Fall-2022": [
    "SG 308 Introduction",
    "SG 307 Introduction",
    "SG 309 Introduction",
    "SG 310 Introduction",
    "SG 311 Introduction",
  ],
  "Summer-2022": ["MD 507 Introduction", "MD 508 Introduction"],
  "Winter-2021": [],
  "Summer-2021": ["TS 408 Introduction", "TS 409 Introduction", "TS 410 Introduction", "TS 411 Introduction"],
};

const getCourseBySemester = (semester: string | undefined, courses: { [key: string]: string[] }): string[] => {
  if (!semester) return [];
  return courses[semester] ?? [];
};

const getFirstCourse = (semester: string | undefined, courses: { [key: string]: string[] }): string | undefined => {
  const coursesBySemester = getCourseBySemester(semester, courses);
  return coursesBySemester[0] ?? undefined;
};

export const useSemesterFilter = () => {
  const [semesters /* setSemesters */] = useState<string[]>(MOCK_SEMESTERS);
  const [selectedSemester, setSelectedSemester] = useState<string | undefined>(MOCK_SEMESTERS[0] ?? undefined);
  const [courses, setCourses] = useState<any[]>(getCourseBySemester(selectedSemester, MOCK_COURSES));
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(
    getFirstCourse(selectedSemester, MOCK_COURSES)
  );

  // TODO: create useEffect to load semesters

  useEffect(() => {
    if (!selectedSemester) setCourses([]);

    const newCourses = getCourseBySemester(selectedSemester, MOCK_COURSES);
    setCourses(newCourses);
  }, [selectedSemester]);

  return {
    semesters,
    selectedSemester,
    setSelectedSemester,
    courses,
    selectedCourse,
    setSelectedCourse,
  };
};
