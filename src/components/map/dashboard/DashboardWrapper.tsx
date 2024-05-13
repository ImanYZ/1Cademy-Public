import { Box, LinearProgress, Stack, SxProps, Theme, Typography } from "@mui/material";
import {
  collection,
  doc,
  DocumentData,
  Firestore,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  Query,
  query,
  Unsubscribe,
  where,
} from "firebase/firestore";
import React, {
  Dispatch,
  forwardRef,
  SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { CourseTag, Instructor, Semester, SemesterStudentVoteStat } from "src/instructorsTypes";
import { VoiceAssistant } from "src/nodeBookTypes";

import { CoursesResult } from "@/components/layouts/StudentsLayout";

import { User } from "../../../knowledgeTypes";
import { DESIGN_SYSTEM_COLORS } from "../../../lib/theme/colors";
import { OpenRightSidebar } from "../../../pages/notebook";
import { ISemester } from "../../../types/ICourse";
import { NoDataMessage } from "../../instructors/NoDataMessage";
import PracticeTool, { PracticeToolRef } from "../../practiceTool/PracticeTool";
import { DashboardToolbar } from "../Dashobard/DashboradToolbar";
import { Assignments } from "./Assignments";
import { Dashboard } from "./Dashboard";
import { DashboardSettings } from "./DashboardSettings";
import { DashboardStudents } from "./DashboardStudents";

type DashboardWrapperProps = {
  voiceAssistant: VoiceAssistant;
  setVoiceAssistant: Dispatch<SetStateAction<VoiceAssistant>>;
  user: User;
  onClose: () => void;
  openNodeHandler: (nodeId: string) => void;
  startPractice: boolean;
  setStartPractice: Dispatch<SetStateAction<boolean>>;
  root?: string;
  setDisplayRightSidebar: (newValue: OpenRightSidebar) => void;
  setUserIsAnsweringPractice: (newValue: { result: boolean }) => void;
  sx?: SxProps<Theme>;
};

export type DashboardWrapperRef = PracticeToolRef;

export type ToolbarView = "DASHBOARD" | "PRACTICE" | "SETTINGS" | "STUDENTS" | "ASSIGNMENTS";

export const DashboardWrapper = forwardRef<DashboardWrapperRef, DashboardWrapperProps>((props, ref) => {
  const {
    voiceAssistant,
    setVoiceAssistant,
    user,
    openNodeHandler,
    onClose,
    root,
    sx,
    startPractice,
    setStartPractice,
    setDisplayRightSidebar,
    setUserIsAnsweringPractice,
  } = props;
  const db = getFirestore();

  // const [semesters, setSemesters] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<CoursesResult>({});
  const [allSemesters, setAllSemesters] = useState<Semester[]>([]);
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [currentSemester, setCurrentSemester] = useState<CourseTag | null>(null);
  const [selectToolbarView, setSelectToolbarView] = useState<ToolbarView>("DASHBOARD");

  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [toolbarIsCollapsed, setToolbarIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rootFound, setRootFound] = useState<boolean>(false);

  const practiceToolRef = useRef<PracticeToolRef | null>(null);

  useImperativeHandle(ref, () => ({
    onRunPracticeTool: (start: boolean) => console.warn("here should start practice", start), // TODO: check this and remove if is not used
    onSubmitAnswer: (answers: boolean[], byVoice?: boolean) =>
      practiceToolRef.current && practiceToolRef.current.onSubmitAnswer(answers, byVoice),
    onSelectAnswers: practiceToolRef.current ? practiceToolRef.current.onSelectAnswers : () => {},
    nextQuestion: practiceToolRef.current ? practiceToolRef.current.nextQuestion : () => {},
    getQuestionParents: practiceToolRef.current ? practiceToolRef.current.getQuestionParents : () => [],
    getQuestionData: practiceToolRef.current ? practiceToolRef.current.getQuestionData : () => null,
    onSelectedQuestionAnswer: practiceToolRef.current ? practiceToolRef.current.onSelectedQuestionAnswer : () => {},
    getSubmittedAnswers: practiceToolRef.current ? practiceToolRef.current.getSubmittedAnswers : () => [],
    getAssistantInitialState: practiceToolRef.current ? practiceToolRef.current.getAssistantInitialState : () => "IDLE",
  }));

  const semesterByStudentSnapshot = useCallback(
    (q: Query<DocumentData>) =>
      onSnapshot(
        q,
        async snapshot => {
          const docChanges = snapshot.docChanges();

          const semestersStudent = docChanges.map(change => {
            const semesterData: SemesterStudentVoteStat = change.doc.data() as SemesterStudentVoteStat;
            return {
              id: change.doc.id,
              data: semesterData,
            }; //
          });
          const semestersIds = semestersStudent.map(cur => cur.data.tagId);
          const semesters = await getSemesterByIds(db, semestersIds);
          const coursesResult = semesters.reduce((acu: CoursesResult, cur: Semester) => {
            const tmpValues = acu[cur.tagId] ?? [];
            return { ...acu, [cur.tagId]: [...tmpValues, `${cur.cTitle} ${cur.pTitle || ""}`] };
          }, {});

          // const semester = allSemesters.map(cur => cur.title);
          setAllSemesters(semesters);
          setAllCourses(coursesResult);
          // setSelectedSemester(semester[0]);
          setIsLoading(false);
        },
        (error: any) => {
          console.error(error);
          setIsLoading(false);
        }
      ),
    [db]
  );

  const semestersByInstructorSnapshot = useCallback(
    (q: Query<DocumentData>) =>
      onSnapshot(
        q,
        async snapshot => {
          if (snapshot.empty) return setIsLoading(false); // TODO: manage when there is no semesters
          const docChanges = snapshot.docChanges();
          const instructor = docChanges[0].doc.data() as Instructor;
          setInstructor(instructor);

          const allCourses = getCoursesByInstructor(instructor);

          const semestersIds = instructor.courses.map(course => course.tagId);
          const semesters = await getSemesterByIds(db, semestersIds);
          semesters.sort((a, b) => (b.title > a.title ? 1 : -1));
          setAllSemesters(semesters);
          setAllCourses(allCourses);
          setIsLoading(false);
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
      killSnapshot = semesterByStudentSnapshot(q);
    }

    return () => {
      if (killSnapshot) killSnapshot();
    };
  }, [db, semesterByStudentSnapshot, semestersByInstructorSnapshot, user]);

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
    const courses = allCourses[currentSemester.tagId];

    if (!courses) return;
    if (!instructor) return;

    const firstCourse = selectCourse(courses[0], instructor);
    if (!firstCourse) return;
    setCurrentSemester(firstCourse);
    setSelectedCourse(courses[0]);
  }, [allCourses, currentSemester, instructor, selectedCourse]);

  // select default course when exist a semester is selected
  useEffect(() => {
    if (instructor) return;
    if (!currentSemester) return;

    const newCourses = getCourseBySemester(currentSemester.tagId, allCourses);

    setSelectedCourse(newCourses[0]);
  }, [allCourses, currentSemester, instructor]);

  // will show current semester properties with selected course
  useEffect(() => {
    if (!instructor) return;
    if (!selectedCourse) return;
    const current = selectCourse(selectedCourse, instructor);
    setCurrentSemester(current ?? null);
  }, [instructor, selectedCourse]);

  const onChangeView = (view: ToolbarView) => {
    setSelectedStudent(null);
    setSelectToolbarView(view);
  };

  const getSelectedStudent = useCallback(
    (uname: string) => {
      const getUser = async () => {
        const userRef = collection(db, "users");
        const q = query(userRef, where("uname", "==", uname), limit(1));

        const users = await getDocs(q);
        if (users.empty) return;

        const student = users.docs[0].data() as User;
        setSelectedStudent(student);
      };
      getUser();
    },
    [db]
  );

  const onSelectUserHandler = (uname: string, view: ToolbarView) => {
    getSelectedStudent(uname);
    setSelectToolbarView(view);
    // TODO: remove this function is not used anymore
  };

  // detect root (semester) to open practice tool automatically
  useEffect(() => {
    if (!root) return;
    const rootSemester = allSemesters.find(semester => semester.tagId === root);
    if (!rootSemester) return;
    const { cTagId, cTitle, pTagId, pTitle, tagId, title, uTagId, uTitle } = rootSemester;

    setCurrentSemester({ cTagId, cTitle, pTagId, pTitle, tagId, title, uTagId, uTitle });
    setSelectToolbarView("PRACTICE");
    setRootFound(true);
    // practiceToolRef.current?.onRunPracticeTool(true);
  }, [allSemesters, root]);

  return (
    <Box
      sx={{
        ...sx,
        display: "grid",
        gridTemplateColumns: toolbarIsCollapsed ? "80px auto" : "200px auto",
        transition: "0.2s",
        gridTemplateRows: "100%",
        // border: "solid 2px yellow",
        background: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
      }}
    >
      <DashboardToolbar
        courses={currentSemester ? allCourses[currentSemester.tagId] ?? [] : []}
        selectedCourse={selectedCourse}
        onChangeSelectedCourseHandler={setSelectedCourse}
        semesters={allSemesters}
        currentSemester={currentSemester}
        onChangeCurrentSemesterHandler={setCurrentSemester}
        onChangeToolbarView={onChangeView}
        user={user}
        onClose={onClose}
        view={selectToolbarView}
        isCollapsed={toolbarIsCollapsed}
        setIsCollapsed={setToolbarIsCollapsed}
        isLoading={isLoading}
      />
      <Box
        sx={{
          width: "100%",
          height: "100%",
          // border: "solid 2px royalBlue",
          overflowY: "auto",
          overflowX: "hidden",
          p: "40px 32px",
        }}
      >
        {isLoading && (
          <Stack spacing={"10px"} sx={{ width: "100%" }}>
            <Typography sx={{ fontSize: "20px", textAlign: "center" }}>Loading...</Typography>
            <LinearProgress />
          </Stack>
        )}
        {!isLoading && currentSemester && allCourses[currentSemester.tagId] && (
          <>
            {selectToolbarView === "DASHBOARD" && (
              <Dashboard user={selectedStudent ? selectedStudent : user} currentSemester={currentSemester} />
            )}
            {selectToolbarView === "PRACTICE" && (
              <PracticeTool
                voiceAssistant={voiceAssistant}
                setVoiceAssistant={setVoiceAssistant}
                ref={practiceToolRef}
                user={user}
                currentSemester={currentSemester}
                onClose={onClose}
                openNodeHandler={openNodeHandler}
                root={rootFound ? root : undefined}
                startPractice={startPractice}
                setStartPractice={setStartPractice}
                setDisplayRightSidebar={setDisplayRightSidebar}
                setUserIsAnsweringPractice={setUserIsAnsweringPractice}
              />
            )}
            {selectToolbarView === "SETTINGS" && <DashboardSettings currentSemester={currentSemester} />}
            {selectToolbarView === "STUDENTS" && (
              <DashboardStudents currentSemester={currentSemester} onSelectUserHandler={onSelectUserHandler} />
            )}
            {selectToolbarView === "ASSIGNMENTS" && <Assignments username={user.uname} />}
          </>
        )}
        {!isLoading && !(currentSemester && allCourses[currentSemester.tagId]) && (
          <NoDataMessage message="No data in this semester" />
        )}
      </Box>
    </Box>
  );
});

DashboardWrapper.displayName = "DashboardWrapper";

export const getCourseTitleFromSemester = (semester: ISemester) => {
  return `${semester.cTitle} ${semester.pTitle || "- " + semester.uTitle}`;
};

const getCoursesByInstructor = (instructor: Instructor): CoursesResult => {
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
