import { Box } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { ISemester } from "src/types/ICourse";

import { getSemesterById } from "../../client/serveless/semesters.serverless";
import { CourseTag, SimpleQuestionNode } from "../../instructorsTypes";
import { User } from "../../knowledgeTypes";
import { Post } from "../../lib/mapApi";
import { ICheckAnswerRequestParams } from "../../pages/api/checkAnswer";
import CourseDetail from "./CourseDetail";
import Leaderboard from "./Leaderboard";
import { PracticeQuestion } from "./PracticeQuestion";
import { UserStatus } from "./UserStatus";

type PracticeToolProps = {
  user: User;
  root?: string;
  currentSemester: CourseTag;
  onClose: () => void;
  openNodeHandler: (nodeId: string) => void;
};

export type QuestionInfo = {
  question: SimpleQuestionNode | null;
  flashcardId: string;
  practicesLeft: number;
  correctPractices: number;
  completedDays: number;
  totalDays: number;
};

export interface PracticeToolRef {
  onRunPracticeTool: (start: boolean) => void;
}

const PracticeTool = forwardRef<PracticeToolRef, PracticeToolProps>(
  ({ user, currentSemester, openNodeHandler, onClose, root }, ref) => {
    console.log({ currentSemester });
    const db = getFirestore();
    const [startPractice, setStartPractice] = useState(false);
    const [questionData, setQuestionData] = useState<QuestionInfo | null>(null);
    // const [practiceIsCompleted, setPracticeIsCompleted] = useState(false);
    const [semesterConfig, setSemesterConfig] = useState<ISemester | null>(null);

    const onRunPracticeTool = useCallback(() => {
      (start: boolean) => {
        if (!semesterConfig) return;
        if (!root) return;

        setStartPractice(start);
      };
    }, [root, semesterConfig]);

    useImperativeHandle(ref, () => ({
      onRunPracticeTool,
    }));

    const onSubmitAnswer = useCallback(
      async (answers: boolean[]) => {
        if (!questionData?.question) return;

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
      console.log("practice:res", { res });
      if (res?.done)
        return setQuestionData(prev => {
          if (!prev) return null;
          return {
            question: null,
            completedDays: prev.completedDays,
            correctPractices: prev.correctPractices + 1,
            flashcardId: prev.flashcardId,
            practicesLeft: prev.practicesLeft - 1,
            totalDays: prev.totalDays,
          };
        });

      setQuestionData(res);
      console.log("------>", res);
    }, [currentSemester.tagId]);

    const onViewNodeOnNodeBook = useCallback(() => {
      if (!questionData?.question) return;
      openNodeHandler(questionData?.question?.id);
      onClose();
    }, [onClose, openNodeHandler, questionData?.question]);

    // this is executed the first time we get selected a semester
    useEffect(() => {
      getPracticeQuestion();
    }, [getPracticeQuestion]);

    useEffect(() => {
      const getSemesterConfig = async () => {
        const semester = await getSemesterById(db, currentSemester.tagId);
        if (!semester) return;

        setSemesterConfig(semester);
      };
      getSemesterConfig();
    }, [currentSemester.tagId, db, user.uname]);

    // useEffect(() => {
    //   console.log({ semesterConfig });
    //   if (!semesterConfig) return;

    //   const q = query(
    //     collection(db, "semesterStudentVoteStats"),
    //     where("uname", "==", user.uname),
    //     where("tagId", "==", currentSemester.tagId)
    //   );
    //   const unsub = onSnapshot(q, snapshot => {
    //     if (snapshot.empty) return;

    //     const docChanges = snapshot.docChanges();
    //     for (const docChange of docChanges) {
    //       const semesterStudentVoteStat = docChange.doc.data() as ISemesterStudentVoteStat;
    //       console.log({ semesterStudentVoteStat });
    //       const currentDateYYMMDD = getDateYYMMDDWithHyphens();
    //       console.log({ currentDateYYMMDD });
    //       const currentDayStats = semesterStudentVoteStat.days.find(cur => cur.day === currentDateYYMMDD);
    //       console.log({ currentDayStats });
    //       // if (!currentDayStats) return;
    //       //
    //       const totalQuestions = semesterConfig.dailyPractice.numQuestionsPerDay;
    //       const questionsLeft = totalQuestions - (currentDayStats?.correctPractices ?? 0);
    //       console.log({ questionsLeft });
    //       // setPracticeInfo(prev => ({ ...prev, questionsLeft }));

    //       const completedDays = differentBetweenDays(new Date(), semesterConfig.startDate.toDate());
    //       const totalDays = differentBetweenDays(semesterConfig.endDate.toDate(), semesterConfig.startDate.toDate());
    //       const remainingDays = totalDays - completedDays;
    //       setPracticeInfo(prev => ({
    //         ...prev,
    //         questionsLeft,
    //         totalQuestions,
    //         completedDays,
    //         totalDays,
    //         remainingDays,
    //       }));
    //     }
    //   });
    //   return () => {
    //     if (unsub) unsub();
    //   };
    // }, [currentSemester.tagId, db, semesterConfig, user.uname]);

    useEffect(() => {
      if (!semesterConfig) return;
      if (!root) return;

      setStartPractice(true);
    }, [root, semesterConfig]);

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
          questionData={questionData}
          onClose={onClose}
          leaderboard={<Leaderboard semesterId={currentSemester.tagId} />}
          userStatus={<UserStatus semesterId={currentSemester.tagId} user={user} />}
          onViewNodeOnNodeBook={onViewNodeOnNodeBook}
          onGetNextQuestion={getPracticeQuestion}
          onSaveAnswer={onSubmitAnswer}
        />
      </Box>
    ) : (
      <CourseDetail user={user} currentSemester={currentSemester} onStartPractice={() => setStartPractice(true)} />
    );
  }
);
PracticeTool.displayName = "PracticeTool";
export default PracticeTool;
