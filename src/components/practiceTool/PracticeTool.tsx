import { Box } from "@mui/material";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import React, {
  Dispatch,
  forwardRef,
  SetStateAction,
  startTransition,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { VoiceAssistant } from "src/nodeBookTypes";
import { ISemester } from "src/types/ICourse";
import { ISemesterStudentVoteStat } from "src/types/ICourse";

import { getDaysInAWeekWithoutGetDailyPoint } from "@/lib/utils/userStatus.utils";

import { addPracticeToolLog } from "../../client/firestore/practiceToolLog.firestore";
import { getSemesterById } from "../../client/firestore/semesters.firestore";
import { CourseTag, SimpleQuestionNode } from "../../instructorsTypes";
import { User } from "../../knowledgeTypes";
import { Post } from "../../lib/mapApi";
import { differentBetweenDays, getDateYYMMDDWithHyphens } from "../../lib/utils/date.utils";
import { ICheckAnswerRequestParams } from "../../pages/api/checkAnswer";
import { OpenRightSidebar } from "../../pages/notebook";
import CourseDetail from "./CourseDetail";
import { PracticeQuestionMemoized } from "./PracticeQuestion";

const MAX_INACTIVE_TIME = 30_000;

type PracticeToolProps = {
  voiceAssistant: VoiceAssistant;
  setVoiceAssistant: Dispatch<SetStateAction<VoiceAssistant>>;
  user: User;
  root?: string;
  currentSemester: CourseTag;
  onClose: () => void;
  openNodeHandler: (nodeId: string) => void;
  startPractice: boolean;
  setStartPractice: Dispatch<SetStateAction<boolean>>;
  setDisplayRightSidebar: (newValue: OpenRightSidebar) => void;
  setUserIsAnsweringPractice: (newValue: { result: boolean }) => void;
};

export type PracticeInfo = {
  questionsLeft: number;
  totalQuestions: number;
  completedDays: number;
  totalDays: number;
  remainingDays: number;
};

const DEFAULT_PRACTICE_INFO: PracticeInfo = {
  questionsLeft: 0,
  totalQuestions: 0,
  completedDays: 0,
  remainingDays: 0,
  totalDays: 0,
};

export type PracticeToolRef = {
  onRunPracticeTool: (start: boolean) => void;
  onSelectAnswers: (answers: boolean[]) => void;
  onSubmitAnswer: (answers: boolean[], byVoice?: boolean) => void;
  nextQuestion: () => void;
  getQuestionParents: () => string[];
  getQuestionData: () => SimpleQuestionNode | null;
  onSelectedQuestionAnswer: (index: number) => void; // -10 value is used to select the node title
  getSubmittedAnswers: () => boolean[];
  getAssistantInitialState: () => "IDLE" | "ANGRY";
};

const PracticeTool = forwardRef<PracticeToolRef, PracticeToolProps>((props, ref) => {
  const {
    voiceAssistant,
    setVoiceAssistant,
    user,
    root,
    currentSemester,
    onClose,
    openNodeHandler,
    startPractice,
    setStartPractice,
    setDisplayRightSidebar,
    setUserIsAnsweringPractice,
  } = props;
  // console.log({ currentSemester });
  const db = getFirestore();

  // const [startPractice, setStartPractice] = useState(false);
  const [questionData, setQuestionData] = useState<{ question: SimpleQuestionNode; flashcardId: string } | null>(null);
  const [practiceIsCompleted, setPracticeIsCompleted] = useState(false);
  const [practiceInfo, setPracticeInfo] = useState<PracticeInfo>(DEFAULT_PRACTICE_INFO);
  const [semesterConfig, setSemesterConfig] = useState<ISemester | null>(null);
  const [submitAnswer, setSubmitAnswer] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<boolean[]>([]);
  const [narratedAnswerIdx, setNarratedAnswerIdx] = useState(-1); // -1: nothing is selected
  const [submittedAnswers, setSubmittedAnswers] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollableWrapper = useRef<HTMLElement | null>(null);
  const timeInSecondsRef = useRef(0);
  const daysInAWeekWithoutGetDailyPointRef = useRef(0);

  const onRunPracticeTool = useCallback(() => {
    (start: boolean) => {
      if (!practiceInfo) return;

      setStartPractice(start);
    };
  }, [practiceInfo, setStartPractice]);

  const onSubmitAnswer = useCallback(
    async (answers: boolean[], byVoice = false) => {
      if (!questionData) return;

      // TODO: take time
      timeInSecondsRef.current = 0;
      setSubmitAnswer(true);
      setSubmittedAnswers(answers);
      const payload: ICheckAnswerRequestParams = {
        answers,
        flashcardId: questionData.flashcardId,
        nodeId: questionData.question.id,
        postpone: false,
      };
      await Post("/checkAnswer", payload).then(() => {});
      addPracticeToolLog(db, { user: user.uname, semesterId: currentSemester.tagId, byVoice, action: "submit" });
    },
    [currentSemester.tagId, questionData, user.uname]
  );

  const getPracticeQuestion = useCallback(
    async (byVoice = false) => {
      setLoading(true);
      const res: any = await Post("/practice", { tagId: currentSemester.tagId });
      if (res?.done) return setPracticeIsCompleted(true);

      const question = res.question as SimpleQuestionNode;
      setSubmitAnswer(false);
      setSelectedAnswers(new Array(question.choices.length).fill(false));
      setSubmittedAnswers([]);
      setQuestionData({
        ...res,
        question: {
          ...question,
          choices: question.choices.map((cur, idx) => ({ ...cur, choice: replaceTextByNumber(cur.choice, idx) })),
        },
      });
      addPracticeToolLog(db, { user: user.uname, semesterId: currentSemester.tagId, byVoice, action: "next-question" });
      setLoading(false);
    },
    [currentSemester.tagId, user.uname]
  );

  useImperativeHandle(ref, () => ({
    onRunPracticeTool,
    onSubmitAnswer,
    onSelectAnswers: answers => setSelectedAnswers(answers),
    nextQuestion: () => getPracticeQuestion(true),
    getQuestionParents: () => questionData?.question.parents ?? [],
    getQuestionData: () => questionData?.question ?? null,
    onSelectedQuestionAnswer: (index: number) => setNarratedAnswerIdx(index),
    getSubmittedAnswers: () => submittedAnswers,
    getAssistantInitialState: () => (daysInAWeekWithoutGetDailyPointRef.current >= 6 ? "ANGRY" : "IDLE"),
  }));

  const onViewNodeOnNodeBook = (nodeId: string) => {
    openNodeHandler(nodeId);
    onClose();
  };

  const onSaveLog = (action: "open-leaderboard" | "open-user-status" | "open-notebook" | "display-tags") => {
    addPracticeToolLog(db, {
      user: user.uname,
      semesterId: voiceAssistant.tagId,
      byVoice: false,
      action,
    });
  };

  // will execute a timer and check last interaction to see if user is not interacting
  useEffect(() => {
    if (!questionData) return;
    if (voiceAssistant.questionNode) return;
    const intervalId = setInterval(() => {
      timeInSecondsRef.current += 1000;
      if (MAX_INACTIVE_TIME < timeInSecondsRef.current) {
        setUserIsAnsweringPractice({ result: false });
        timeInSecondsRef.current = 0;
      }
    }, 1000);

    return () => {
      setUserIsAnsweringPractice({ result: true });
      clearInterval(intervalId);
    };
  }, [questionData, setUserIsAnsweringPractice, voiceAssistant.questionNode]);

  // set up events to detect user actions and reset timers
  useEffect(() => {
    if (!questionData) return;
    if (voiceAssistant.questionNode) return;

    const handleMouseMove = () => {
      timeInSecondsRef.current = 0;
      startTransition(() => setUserIsAnsweringPractice({ result: true }));
    };
    const handleMouseClick = () => {
      timeInSecondsRef.current = 0;
      startTransition(() => setUserIsAnsweringPractice({ result: true }));
    };
    const handleMouseDbClick = () => {
      timeInSecondsRef.current = 0;
      startTransition(() => setUserIsAnsweringPractice({ result: true }));
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleMouseClick);
    document.addEventListener("dblclick", handleMouseDbClick);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleMouseClick);
      document.removeEventListener("dblclick", handleMouseDbClick);
    };
  }, [questionData, setUserIsAnsweringPractice, voiceAssistant.questionNode]);

  // this is executed the first time we get selected a semester
  useEffect(() => {
    if (!startPractice) return;
    getPracticeQuestion();
  }, [getPracticeQuestion, startPractice]);

  useEffect(() => {
    const getSemesterConfig = async () => {
      const semester = await getSemesterById(db, currentSemester.tagId);
      if (!semester) return;

      setSemesterConfig(semester);
    };
    getSemesterConfig();
  }, [currentSemester.tagId, user.uname]);

  useEffect(() => {
    if (!semesterConfig) return;

    const q = query(
      collection(db, "semesterStudentVoteStats"),
      where("uname", "==", user.uname),
      where("tagId", "==", currentSemester.tagId)
    );
    const unsub = onSnapshot(q, snapshot => {
      if (snapshot.empty) return;

      const docChanges = snapshot.docChanges();
      for (const docChange of docChanges) {
        const semesterStudentVoteStat = docChange.doc.data() as ISemesterStudentVoteStat;
        // console.log({ semesterStudentVoteStat });
        const currentDateYYMMDD = getDateYYMMDDWithHyphens();
        // console.log({ currentDateYYMMDD });
        const currentDayStats = semesterStudentVoteStat.days.find(cur => cur.day === currentDateYYMMDD);
        // console.log({ currentDayStats });
        // if (!currentDayStats) return;
        //
        const totalQuestions = semesterConfig.dailyPractice.numQuestionsPerDay;
        const questionsLeft = totalQuestions - (currentDayStats?.correctPractices ?? 0);
        // console.log({ questionsLeft });
        // setPracticeInfo(prev => ({ ...prev, questionsLeft }));

        const completedDays = Math.abs(differentBetweenDays(new Date(), semesterConfig.startDate.toDate()));
        const totalDays = Math.abs(
          differentBetweenDays(semesterConfig.endDate.toDate(), semesterConfig.startDate.toDate())
        );
        const remainingDays = totalDays - completedDays;
        daysInAWeekWithoutGetDailyPointRef.current = getDaysInAWeekWithoutGetDailyPoint(
          semesterStudentVoteStat,
          totalQuestions
        );
        setPracticeInfo(prev => ({
          ...prev,
          questionsLeft,
          totalQuestions,
          completedDays,
          totalDays,
          remainingDays,
        }));
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, [currentSemester.tagId, semesterConfig, user.uname]);

  useEffect(() => {
    // console.log({ practiceInfo });
    if (!practiceInfo) return;
    if (!semesterConfig) return;
    if (!root) return;

    setStartPractice(true);
  }, [practiceInfo, root, semesterConfig, setStartPractice]);

  const onToggleAssistant = useCallback(() => {
    // console.log("onToggleAssistant", { questionData });
    if (!questionData) return;

    setVoiceAssistant(prev => {
      addPracticeToolLog(db, {
        user: user.uname,
        semesterId: currentSemester.tagId,
        byVoice: false,
        action: prev.questionNode ? "stop-assistant" : "start-assistant",
      });
      if (prev.questionNode) {
        timeInSecondsRef.current = 0;
        return { ...prev, questionNode: null };
      }
      return { tagId: currentSemester.tagId, questionNode: questionData.question };
    });
  }, [currentSemester.tagId, questionData, setVoiceAssistant, user.uname]);

  // this is executed when practice start and get question node
  useEffect(() => {
    if (!questionData) return;
    if (!startPractice) return;
    setVoiceAssistant(prev => {
      if (!prev.questionNode) return { tagId: currentSemester.tagId, questionNode: null }; // if practice voice only is disable, we keep disable
      return { tagId: currentSemester.tagId, questionNode: questionData.question };
    });
  }, [currentSemester.tagId, questionData, setVoiceAssistant, startPractice]);

  // when practice tool is dismounted
  useEffect(() => {
    return () => {
      setStartPractice(false);
      setDisplayRightSidebar(null);
    };
  }, [setDisplayRightSidebar, setStartPractice]);

  return startPractice ? (
    <Box
      ref={scrollableWrapper}
      sx={{
        position: "absolute",
        inset: "0px",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.notebookBl1,
        overflowY: "auto",
        overflowX: "hidden",
        // border: "dashed 2px royalBlue",
        boxSizing: "content-box",
        zIndex: 2,
      }}
    >
      <PracticeQuestionMemoized
        question={questionData?.question ?? null}
        practiceIsCompleted={practiceIsCompleted}
        onClose={onClose}
        onViewNodeOnNodeBook={onViewNodeOnNodeBook}
        onGetNextQuestion={getPracticeQuestion}
        onSaveAnswer={onSubmitAnswer}
        practiceInfo={practiceInfo}
        submitAnswer={submitAnswer}
        setSubmitAnswer={setSubmitAnswer}
        selectedAnswers={selectedAnswers}
        setSelectedAnswers={setSelectedAnswers}
        enabledAssistant={Boolean(voiceAssistant.questionNode)}
        onToggleAssistant={onToggleAssistant}
        narratedAnswerIdx={narratedAnswerIdx}
        setDisplayRightSidebar={setDisplayRightSidebar}
        loading={loading}
        onSaveLog={onSaveLog}
      />
    </Box>
  ) : (
    <CourseDetail user={user} currentSemester={currentSemester} onStartPractice={() => setStartPractice(true)} />
  );
});
PracticeTool.displayName = "PracticeTool";
export default PracticeTool;

// TODO: replace on DB the letters with numbers
const replaceTextByNumber = (choice: string, idx: number) => {
  const choiceContent = choice.split(" ").slice(1);
  return [`${idx + 1}.`, ...choiceContent].join(" ");
};
