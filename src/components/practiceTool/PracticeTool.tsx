import { Box } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";

import { getSemesterById } from "../../client/serveless/semesters.serverless";
import { getSemesterStudentVoteStatsByIdAndStudent } from "../../client/serveless/semesterStudentVoteStat.serverless";
import { CourseTag, SimpleQuestionNode } from "../../instructorsTypes";
import { User } from "../../knowledgeTypes";
import { Post } from "../../lib/mapApi";
import { differentBetweenDays, getDateYYMMDDWithHyphens } from "../../lib/utils/date.utils";
import { ICheckAnswerRequestParams } from "../../pages/api/checkAnswer";
import { NodeType } from "../../types";
import CourseDetail from "./CourseDetail";
import Leaderboard from "./Leaderboard";
import { PracticeQuestion } from "./PracticeQuestion";
import { UserStatus } from "./UserStatus";

type PracticeToolProps = {
  user: User;
  currentSemester: CourseTag;
  onClose: () => void;
  onCorrectNode: (e: any, nodeId: string) => void;
  onWrongNode: (
    event: any,
    nodeId: string,
    nodeType: NodeType,
    wrong: any,
    correct: any,
    wrongs: number,
    corrects: number,
    locked: boolean
  ) => void;
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

export const PracticeTool = ({ user, currentSemester, onClose, onCorrectNode, onWrongNode }: PracticeToolProps) => {
  const db = getFirestore();
  const [startPractice, setStartPractice] = useState(false);
  const [questionData, setQuestionData] = useState<{ question: SimpleQuestionNode; flashcardId: string } | null>(null);
  const [practiceIsCompleted, setPracticeIsCompleted] = useState(false);
  const [practiceInfo, setPracticeInfo] = useState<PracticeInfo>(DEFAULT_PRACTICE_INFO);

  const onSubmitAnswer = useCallback(
    async (answers: boolean[]) => {
      if (!questionData) return;

      const payload: ICheckAnswerRequestParams = {
        answers,
        flashcardId: questionData.flashcardId,
        nodeId: questionData.question.id,
        postpone: false,
      };
      await Post("/checkAnswer", payload);
    },
    [questionData]
  );

  const getPracticeQuestion = useCallback(async () => {
    const res: any = await Post("/practice", { tagId: currentSemester.tagId });
    console.log("practice:res", { res });
    if (res?.done) return setPracticeIsCompleted(true);

    setQuestionData(res);
    console.log("------>", res);
  }, [currentSemester.tagId]);

  // this is executed the first time we get selected a semester
  useEffect(() => {
    getPracticeQuestion();
  }, [getPracticeQuestion]);

  useEffect(() => {
    const getPracticeInfo = async () => {
      const semesterStudentStats = await getSemesterStudentVoteStatsByIdAndStudent(
        db,
        currentSemester.tagId,
        user.uname
      );
      if (!semesterStudentStats) return;
      const semester = await getSemesterById(db, currentSemester.tagId);
      if (!semester) return;

      console.log({ semesterStudentStats });
      const currentDateYYMMDD = getDateYYMMDDWithHyphens();
      console.log({ currentDateYYMMDD });
      const currentDayStats = semesterStudentStats.days.find(cur => cur.day === currentDateYYMMDD);
      console.log({ currentDayStats });
      if (!currentDayStats) return;

      const totalQuestions = semester.dailyPractice.numQuestionsPerDay;
      const questionsLeft = totalQuestions - currentDayStats.correctPractices;
      console.log({ questionsLeft });
      // setPracticeInfo(prev => ({ ...prev, questionsLeft }));

      const completedDays = differentBetweenDays(new Date(), semester.startDate.toDate());
      const totalDays = differentBetweenDays(semester.endDate.toDate(), semester.startDate.toDate());
      const remainingDays = totalDays - completedDays;
      setPracticeInfo(prev => ({
        ...prev,
        questionsLeft,
        totalQuestions,
        completedDays,
        totalDays,
        remainingDays,
      }));
    };

    getPracticeInfo();
  }, [currentSemester.tagId, db, user.uname]);

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
        onCorrectNode={onCorrectNode}
        onWrongNode={onWrongNode}
        onViewNodeOnNodeBook={(id: string) => console.log(id)}
        onGetNextQuestion={getPracticeQuestion}
        onSaveAnswer={onSubmitAnswer}
        practiceInfo={practiceInfo}
      />
    </Box>
  ) : (
    <CourseDetail currentSemester={currentSemester} onStartPractice={() => setStartPractice(true)} />
  );
};
