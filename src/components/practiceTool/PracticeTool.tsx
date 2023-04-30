import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";

import { CourseTag, SimpleQuestionNode } from "../../instructorsTypes";
import { User } from "../../knowledgeTypes";
import { Post } from "../../lib/mapApi";
import CourseDetail from "./CourseDetail";
import Leaderboard from "./Leaderboard";
import { PracticeQuestion } from "./PracticeQuestion";
import { UserStatus } from "./UserStatus";

type PracticeToolProps = {
  user: User;
  currentSemester: CourseTag;
  onClose: () => void;
};

export const PracticeTool = ({ user, currentSemester, onClose }: PracticeToolProps) => {
  const [startPractice, setStartPractice] = useState(false);
  const [question, setQuestion] = useState<SimpleQuestionNode | null>(null);
  const [practiceIsCompleted, setPracticeIsCompleted] = useState(false);

  useEffect(() => {
    console.log("getPracticeQuestion");
    const getPracticeQuestion = async () => {
      const res: any = await Post("/practice", { tagId: currentSemester.tagId });
      if (res?.done) setPracticeIsCompleted(true);

      const { question, flashcardId } = res as { question: SimpleQuestionNode; flashcardId: string };
      setQuestion(question);
      console.log("------>", { question, flashcardId });
    };
    getPracticeQuestion();
  }, [currentSemester.tagId]);

  return startPractice ? (
    <Box
      sx={{
        position: "absolute",
        inset: "0px",
        background: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.notebookBl1,
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <PracticeQuestion
        question={question}
        practiceIsCompleted={practiceIsCompleted}
        onClose={onClose}
        leaderboard={<Leaderboard semesterId={currentSemester.tagId} />}
        userStatus={<UserStatus semesterId={currentSemester.tagId} user={user} />}
      />
    </Box>
  ) : (
    <CourseDetail currentSemester={currentSemester} onStartPractice={() => setStartPractice(true)} />
  );
};

// if (!question || practiceIsCompleted)
// return (
//   <Box
//     sx={{
//       p: "45px 64px",
//       width: "100%",
//       height: "100%",
//       position: "relative",
//       // position: "absolute",
//       // inset: "0px",
//       background: theme =>
//         theme.palette.mode === "dark" ? theme.palette.common.notebookG900 : theme.palette.common.notebookBl1,
//       zIndex: 1,
//       // p: "45px 64px",
//     }}
//   >
//     <IconButton onClick={onClose} sx={{ color: theme => theme.palette.common.primary800, position: "absolute" }}>
//       <CloseFullscreenIcon />
//     </IconButton>
//     <Box sx={{ maxWidth: "820px", m: "auto" }}>
//       {practiceIsCompleted && (
//         <QuestionMessage
//           messages={[
//             `You've got today's practice point!`,
//             `You have completed 19 days out of 45 days of your review practice.`,
//             `24 days are remaining to the end of the semester.`,
//           ]}
//         />
//       )}
//     </Box>
//   </Box>
// );
