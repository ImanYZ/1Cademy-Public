import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import UploadIcon from "@mui/icons-material/Upload";
import { Box, Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Question, Rubric, updateQuestion } from "src/client/firestore/questions.firestore";
import { TryRubricResponse } from "src/types";

import CsvButton from "@/components/CSVBtn";
import { Post } from "@/lib/mapApi";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { newId } from "@/lib/utils/newFirestoreId";

import { RubricForm, RubricItem } from "./RubricItem";
import { UserAnswers, UserListAnswers } from "./UserAnswers";

type RubricsEditorProps = {
  question: Question;
  onSetQuestions: React.Dispatch<React.SetStateAction<Question | null>>;
  onReturnToQuestions: () => void;
  username: string;
};

export type UserAnswer = { user: string; userImage: string; answer: string };

export type UserAnswerProcessed = UserAnswer & { points: number };

const generateEmptyRubric = (questionId: string, username: string): Rubric => ({
  id: "",
  questionId,
  points: 1,
  prompts: [],
  downvotesBy: [],
  upvotesBy: [username],
  createdBy: username,
});

export const RubricsEditor = ({ question, username, onReturnToQuestions, onSetQuestions }: RubricsEditorProps) => {
  const db = getFirestore();

  const [rubrics, setRubrics] = useState<Rubric[]>(question.rubrics);
  const [editedRubric, setEditedRubric] = useState<{ data: Rubric; isNew: boolean; isLoading: boolean } | null>(null);
  const [usersAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [tryRubric, setTryRubric] = useState<Rubric | null>(null);
  const [tryUserAnswer, setTryUserAnswer] = useState<{ userAnswer: UserAnswer; result: TryRubricResponse[] } | null>(
    null
  );

  const onAddRubric = () => {
    const id = newId(db);
    const newRubric = { ...generateEmptyRubric(question.id, username), id };
    setRubrics(prev => [...prev, newRubric]);
    setEditedRubric({ data: newRubric, isNew: true, isLoading: false });
  };

  const onSaveRubric = async (newRubric: Rubric) => {
    const newRubrics = question.rubrics.find(c => c.id === newRubric.id)
      ? question.rubrics.map(c => (c.id === newRubric.id ? newRubric : c))
      : [...question.rubrics, newRubric];

    setEditedRubric(prev => (prev ? { ...prev, isLoading: true } : null));
    await updateQuestion(db, question.id, { rubrics: newRubrics });
    setEditedRubric(null);
  };

  const newRubric = useMemo(() => {
    return rubrics.reduce((acu: Rubric | null, cur) => {
      if (acu) return acu;
      const founded = question.rubrics.find(c => c.id === cur.id);
      return founded ? null : cur;
    }, null);
  }, [question.rubrics, rubrics]);

  const onDisplayForm = (selectedRubric: Rubric) => {
    setEditedRubric({ data: selectedRubric, isLoading: false, isNew: false });

    const removeRubric = (rubrics: Rubric[], rubricToRemove: Rubric) => rubrics.filter(c => c.id !== rubricToRemove.id);
    if (newRubric) onSetQuestions(prev => (prev ? { ...prev, rubrics: removeRubric(prev.rubrics, newRubric) } : null));
  };

  const onDuplicateRubric = async (rubric: Rubric) => {
    const newRubric: Rubric = { ...rubric, questionId: question.id, id: newId(db), createdBy: username };
    setRubrics(prev => [...prev, newRubric]);
    setEditedRubric({ data: newRubric, isNew: true, isLoading: false });
  };

  const onCancelRubric = () => {
    const removeRubric = (rubrics: Rubric[], rubricToRemove: Rubric) => rubrics.filter(c => c.id !== rubricToRemove.id);
    if (newRubric) onSetQuestions(prev => (prev ? { ...prev, rubrics: removeRubric(prev.rubrics, newRubric) } : null));
    setEditedRubric(null);
  };

  /**
   * valuable = upvotes - downvotes
   */
  const rubricsSortedByValuable = useMemo(
    () =>
      rubrics.sort((a, b) => b.upvotesBy.length - b.downvotesBy.length - (a.upvotesBy.length - a.downvotesBy.length)),
    [rubrics]
  );

  const onTryRubricOnAnswer = useCallback(
    async (userAnswer: UserAnswer) => {
      const response: TryRubricResponse[] = await Post("/assignment/tryRubric", {
        essayText: userAnswer,
        rubrics: tryRubric,
      });
      setTryUserAnswer({ userAnswer, result: response });
    },
    [tryRubric]
  );

  useEffect(() => setRubrics(question.rubrics), [question.rubrics]);

  // const tryRubrics = async (rubrics: any) => {
  //   console.log(rubrics);
  //   await Post("/assignment/tryRubric", { essayText: "hello", rubrics });
  // };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: tryRubric ? "1fr 1fr" : "1fr",
        // gridTemplateRows: tryRubric ? "100%" : undefined,
        maxWidth: tryRubric ? undefined : "788px",
        height: tryRubric ? "100%" : undefined,
        mx: tryRubric ? undefined : "auto",
        gap: tryRubric ? "20px" : undefined,
        // overflowY: "auto",
        // border: "solid 2px olive",
        position: "relative",
      }}
    >
      <Stack spacing={"16px"} sx={{ height: "100%", overflowY: "auto" }}>
        <Box
          sx={{
            p: "32px",
            backgroundColor: ({ palette }) =>
              palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h1">Questions</Typography>
            <Tooltip title="Return to Questions">
              <IconButton onClick={onReturnToQuestions}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Divider sx={{ my: "12px" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "20px" }}>{question.title}</Typography>
          <Typography>{question.description}</Typography>
          {question.imageUrl && <img src={question.imageUrl} alt="question image" style={{ width: "100%" }} />}
        </Box>

        <Box
          sx={{
            p: "24px 32px",
            backgroundColor: ({ palette }) =>
              palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: "18px", mb: "32px" }}>Alternative rubrics</Typography>

          <Stack spacing={"28px"}>
            {rubricsSortedByValuable.map(cur =>
              editedRubric && cur.id === editedRubric.data.id ? (
                <RubricForm key={cur.id} rubric={editedRubric.data} onSave={onSaveRubric} cancelFn={onCancelRubric} />
              ) : (
                <RubricItem
                  key={cur.id}
                  username={username}
                  onDuplicateRubric={() => onDuplicateRubric(cur)}
                  rubric={cur}
                  onTryIt={() => setTryRubric(cur)}
                  onSave={onSaveRubric}
                  onDisplayForm={
                    username === cur.createdBy &&
                    cur.upvotesBy.length === 1 &&
                    cur.upvotesBy[0] === username &&
                    !cur.downvotesBy.length
                      ? () => onDisplayForm(cur)
                      : undefined
                  }
                  onRemoveRubric={
                    username === cur.createdBy &&
                    cur.upvotesBy.length === 1 &&
                    cur.upvotesBy[0] === username &&
                    !cur.downvotesBy.length
                      ? () => onDisplayForm(cur)
                      : undefined
                  }
                />
              )
            )}
          </Stack>

          <Divider sx={{ mt: "32px", mb: "36px" }} />

          {!newRubric && (
            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
              <Stack direction={"row"} alignItems={"center"} spacing={"8px"}>
                <Typography
                  sx={{
                    color: theme => (theme.palette.mode === "light" ? DESIGN_SYSTEM_COLORS.gray900 : undefined),
                    fontWeight: 500,
                  }}
                >
                  Propose a new alternative rubric
                </Typography>
                <IconButton
                  onClick={onAddRubric}
                  size="small"
                  sx={{
                    backgroundColor: theme =>
                      theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray700 : DESIGN_SYSTEM_COLORS.gray300,
                    borderRadius: "6px",
                    width: "20px",
                    height: "20px",
                    p: "0px",
                  }}
                >
                  <AddIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </Stack>
              <CsvButton
                BtnText={
                  <>
                    <UploadIcon sx={{ mr: "8px" }} />
                    Upload User Answers
                  </>
                }
                addNewData={data => setUserAnswers(data.rows as UserAnswer[])}
                sx={{
                  border: `solid 1px ${DESIGN_SYSTEM_COLORS.gray300}`,
                  backgroundColor: theme =>
                    theme.palette.mode === "dark"
                      ? DESIGN_SYSTEM_COLORS.notebookMainBlack
                      : DESIGN_SYSTEM_COLORS.baseWhite,
                  color: theme =>
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.gray700,
                  ":hover": {
                    backgroundColor: theme =>
                      theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseGraphit : DESIGN_SYSTEM_COLORS.gray300,
                  },
                }}
              />
            </Stack>
          )}
        </Box>
      </Stack>

      {tryRubric && (
        <Box
          sx={{
            marginTop: "0px",
            p: "24px",
            position: "relative",
            height: "100%",
            overflowY: "auto",
            backgroundColor: ({ palette }) =>
              palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
          }}
        >
          {!tryUserAnswer && (
            <UserListAnswers
              setUserAnswers={setUserAnswers}
              userAnswersProcessed={usersAnswers.map(c => ({ ...c, points: 1 }))}
              onTryRubricOnAnswer={onTryRubricOnAnswer}
            />
          )}

          {tryUserAnswer && (
            <UserAnswers
              result={tryUserAnswer.result}
              rubric={tryRubric}
              userAnswers={tryUserAnswer.userAnswer}
              onBack={() => setTryUserAnswer(null)}
            />
          )}
        </Box>
      )}

      {tryRubric && (
        <IconButton
          onClick={() => setTryRubric(null)}
          size="small"
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-4px)",
            top: "22px",
            p: "0px",
            border: `solid 1px ${DESIGN_SYSTEM_COLORS.gray300}`,
            backgroundColor: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.baseWhite,
            color: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.gray700,
            ":hover": {
              backgroundColor: theme =>
                theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.baseGraphit : DESIGN_SYSTEM_COLORS.gray300,
            },
          }}
        >
          <KeyboardDoubleArrowLeftIcon
            sx={{ transform: tryRubric ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }}
          />
        </IconButton>
        // <CustomButton
        //   onClick={() => setTryRubrics(null)}
        //   variant="contained"
        //   color="secondary"
        //   sx={{ position: "absolute", left: "-24px", top: "70px" }}
        // >

        // </CustomButton>
      )}

      {/* {tryRubrics && (
        <CustomButton
          onClick={() => setTryRubrics(null)}
          variant="contained"
          color="secondary"
          sx={{ position: "absolute", right: "24px", top: "70px" }}
        >
          <KeyboardDoubleArrowLeftIcon
            sx={{ transform: tryRubrics ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }}
          />
          {!tryRubrics && "Student’s work"}
        </CustomButton>
      )} */}
    </Box>
  );
};
