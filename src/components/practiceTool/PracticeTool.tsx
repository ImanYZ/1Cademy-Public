import { Box } from "@mui/material";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import React, {
  Dispatch,
  forwardRef,
  SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { VoiceAssistant } from "src/nodeBookTypes";
import { ISemester } from "src/types/ICourse";
import { ISemesterStudentVoteStat } from "src/types/ICourse";

import { getSemesterById } from "../../client/serveless/semesters.serverless";
import { CourseTag, SimpleQuestionNode } from "../../instructorsTypes";
import { User } from "../../knowledgeTypes";
import { Post } from "../../lib/mapApi";
import { differentBetweenDays, getDateYYMMDDWithHyphens } from "../../lib/utils/date.utils";
import { ICheckAnswerRequestParams } from "../../pages/api/checkAnswer";
import CourseDetail from "./CourseDetail";
import Leaderboard from "./Leaderboard";
import { PracticeQuestion } from "./PracticeQuestion";
import { UserStatus } from "./UserStatus";

type PracticeToolProps = {
  voiceAssistant: VoiceAssistant | null;
  setVoiceAssistant: Dispatch<SetStateAction<VoiceAssistant | null>>;
  user: User;
  root?: string;
  currentSemester: CourseTag;
  onClose: () => void;
  openNodeHandler: (nodeId: string) => void;
  startPractice: boolean;
  setStartPractice: Dispatch<SetStateAction<boolean>>;
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
  onSubmitAnswer: (answers: boolean[]) => void;
  nextQuestion: () => void;
  getQuestionParents: () => string[];
  getQuestionData: () => SimpleQuestionNode | null;
  onSelectedQuestionAnswer: (index: number) => void;
  getSubmittedAnswers: () => boolean[];
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
  } = props;
  console.log({ currentSemester });
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

  const onRunPracticeTool = useCallback(() => {
    (start: boolean) => {
      if (!practiceInfo) return;

      setStartPractice(start);
    };
  }, [practiceInfo, setStartPractice]);

  const onSubmitAnswer = useCallback(
    async (answers: boolean[]) => {
      if (!questionData) return;

      setSubmitAnswer(true);
      setSubmittedAnswers(answers);
      const payload: ICheckAnswerRequestParams = {
        answers,
        flashcardId: questionData.flashcardId,
        nodeId: questionData.question.id,
        postpone: false,
      };
      await Post("/checkAnswer", payload).then(() => {});
    },
    [questionData]
  );

  const getPracticeQuestion = useCallback(async () => {
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
  }, [currentSemester.tagId]);

  useImperativeHandle(ref, () => ({
    onRunPracticeTool,
    onSubmitAnswer,
    onSelectAnswers: answers => setSelectedAnswers(answers),
    nextQuestion: getPracticeQuestion,
    getQuestionParents: () => questionData?.question.parents ?? [],
    getQuestionData: () => questionData?.question ?? null,
    onSelectedQuestionAnswer: (index: number) => setNarratedAnswerIdx(index),
    getSubmittedAnswers: () => submittedAnswers,
  }));

  const onViewNodeOnNodeBook = (nodeId: string) => {
    openNodeHandler(nodeId);
    onClose();
  };

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
  }, [currentSemester.tagId, db, user.uname]);

  useEffect(() => {
    console.log({ semesterConfig });
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
        console.log({ semesterStudentVoteStat });
        const currentDateYYMMDD = getDateYYMMDDWithHyphens();
        console.log({ currentDateYYMMDD });
        const currentDayStats = semesterStudentVoteStat.days.find(cur => cur.day === currentDateYYMMDD);
        console.log({ currentDayStats });
        // if (!currentDayStats) return;
        //
        const totalQuestions = semesterConfig.dailyPractice.numQuestionsPerDay;
        const questionsLeft = totalQuestions - (currentDayStats?.correctPractices ?? 0);
        console.log({ questionsLeft });
        // setPracticeInfo(prev => ({ ...prev, questionsLeft }));

        const completedDays = differentBetweenDays(new Date(), semesterConfig.startDate.toDate());
        const totalDays = differentBetweenDays(semesterConfig.endDate.toDate(), semesterConfig.startDate.toDate());
        const remainingDays = totalDays - completedDays;
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
  }, [currentSemester.tagId, db, semesterConfig, user.uname]);

  useEffect(() => {
    console.log({ practiceInfo });
    if (!practiceInfo) return;
    if (!semesterConfig) return;
    if (!root) return;

    setStartPractice(true);
  }, [practiceInfo, root, semesterConfig, setStartPractice]);

  const onToggleAssistant = useCallback(() => {
    console.log("onToggleAssistant", { questionData });
    if (!questionData) return;

    setVoiceAssistant(prev => {
      if (prev) return null;
      return { tagId: currentSemester.tagId, questionNode: questionData.question };
    });
  }, [currentSemester.tagId, questionData, setVoiceAssistant]);

  // this is executed when practice start and get question node
  useEffect(() => {
    if (!questionData) return;
    if (!startPractice) return;
    setVoiceAssistant(prev => {
      if (!prev) return prev; // if practice voice only is disable, we keep disable
      return { tagId: currentSemester.tagId, questionNode: questionData.question };
    });
  }, [currentSemester.tagId, questionData, setVoiceAssistant, startPractice]);

  useEffect(() => {
    return () => setStartPractice(false);
  }, [setStartPractice]);

  return startPractice ? (
    <Box
      sx={{
        position: "absolute",
        inset: "0px",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.notebookBl1,
        zIndex: 1,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <PracticeQuestion
        question={questionData?.question ?? null}
        practiceIsCompleted={practiceIsCompleted}
        onClose={onClose}
        leaderboard={<Leaderboard semesterId={currentSemester.tagId} />}
        userStatus={<UserStatus semesterId={currentSemester.tagId} user={user} />}
        onViewNodeOnNodeBook={onViewNodeOnNodeBook}
        onGetNextQuestion={getPracticeQuestion}
        onSaveAnswer={onSubmitAnswer}
        practiceInfo={practiceInfo}
        submitAnswer={submitAnswer}
        setSubmitAnswer={setSubmitAnswer}
        selectedAnswers={selectedAnswers}
        setSelectedAnswers={setSelectedAnswers}
        enabledAssistant={Boolean(voiceAssistant)}
        onToggleAssistant={onToggleAssistant}
        narratedAnswerIdx={narratedAnswerIdx}
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
