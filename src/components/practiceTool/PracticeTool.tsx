import { Box } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

import { CourseTag, SimpleQuestionNode } from "../../instructorsTypes";
import { User } from "../../knowledgeTypes";
import { Post } from "../../lib/mapApi";
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

export const PracticeTool = ({ user, currentSemester, onClose, onCorrectNode, onWrongNode }: PracticeToolProps) => {
  const [startPractice, setStartPractice] = useState(false);
  const [questionData, setQuestionData] = useState<{ question: SimpleQuestionNode; flashcardId: string } | null>(null);
  const [practiceIsCompleted, setPracticeIsCompleted] = useState(false);

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
      />
    </Box>
  ) : (
    <CourseDetail currentSemester={currentSemester} onStartPractice={() => setStartPractice(true)} />
  );
};
