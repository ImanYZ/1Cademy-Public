import { ICourseTag, IInstructor, ISemester, ISemesterStudentStat, ISemesterStudentVoteStat } from "./types/ICourse";

export type Instructor = IInstructor;

export type CourseTag = ICourseTag;

export type SemesterStudentVoteStat = ISemesterStudentVoteStat & {
  links: number;
  nodes: number;
};

export type SemesterStudentStat = ISemesterStudentStat;

export type Semester = ISemester;
