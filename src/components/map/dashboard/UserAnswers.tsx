import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import UploadIcon from "@mui/icons-material/Upload";
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import React, { useMemo } from "react";
import { Rubric } from "src/client/firestore/questions.firestore";
import { TryRubricResponse } from "src/types";

import CsvButton from "@/components/CSVBtn";
import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { CustomButton } from "../Buttons/Buttons";
import { UserAnswer, UserAnswerProcessed } from "./RubricsEditor";

type UserAnswersProps = { userAnswers: UserAnswer; result: TryRubricResponse[]; rubric: Rubric; onBack: () => void };

const TEXT_HIGHLIGHT: { [key in "success" | "warning" | "error"]: string } = {
  success: "#D7FEE7",
  warning: "#FDEAD7",
  error: "#FFE6E6",
};

export const UserAnswers = ({ userAnswers, result, rubric, onBack }: UserAnswersProps) => {
  const points = useMemo(
    () => result.reduce((acu, cur) => (acu + cur.correct ? rubric.points : 0), 0),
    [result, rubric.points]
  );

  const replaceSentences = (sentences: string[], text: string, color: string) => {
    return sentences.reduce((acu, cur) => {
      return acu.replace(cur, `<span style=background-color:${color}>${cur}</span>`);
    }, text);
  };

  const resultHighlighted = useMemo(() => {
    return result.reduce((acu: string, cur) => {
      if (cur.correct === "YES" && cur.mentioned === "YES")
        return replaceSentences(cur.sentences, acu, TEXT_HIGHLIGHT["success"]);
      if (cur.correct === "NO" && cur.mentioned === "YES")
        return replaceSentences(cur.sentences, acu, TEXT_HIGHLIGHT["warning"]);
      if (cur.correct === "NO" && cur.mentioned === "NO")
        return replaceSentences(cur.sentences, acu, TEXT_HIGHLIGHT["error"]);
      return acu;
    }, userAnswers.answer);
  }, [result, userAnswers.answer]);

  return (
    <Box>
      <CustomButton variant="contained" color="secondary" sx={{ mb: "24px" }} onClick={onBack}>
        <KeyboardArrowLeftIcon sx={{ mr: "10px" }} />
        Back
      </CustomButton>
      <Stack direction={"row"} spacing={"12px"} alignItems={"center"} sx={{ mb: "18px" }}>
        <OptimizedAvatar2 imageUrl={userAnswers.userImage} alt={`${userAnswers.user} profile picture`} size={40} />
        <Typography sx={{ fontWeight: 600 }}>{userAnswers.user}</Typography>
      </Stack>
      <Typography dangerouslySetInnerHTML={{ __html: resultHighlighted }} />

      <Divider />

      <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
        <Stack direction={"row"} spacing={"16px"} alignItems={"center"} sx={{ p: "20px 24px" }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M17.9825 0.5C8.3225 0.5 0.5 8.34 0.5 18C0.5 27.66 8.3225 35.5 17.9825 35.5C27.66 35.5 35.5 27.66 35.5 18C35.5 8.34 27.66 0.5 17.9825 0.5ZM25.4025 28.5L18 24.0375L10.5975 28.5L12.5575 20.0825L6.03 14.43L14.64 13.695L18 5.75L21.36 13.6775L29.97 14.4125L23.4425 20.065L25.4025 28.5Z"
              fill="#32D583"
            />
          </svg>

          <Stack>
            <Typography>Total score</Typography>
            <Typography sx={{ fontWeight: 700, color: DESIGN_SYSTEM_COLORS.gray900 }}>{points}</Typography>
          </Stack>
        </Stack>
        <IconButton>
          <KeyboardArrowDownIcon />
        </IconButton>
        {/* <Typography>
          {`According to the rubric, a student should earn ${rubric.points} points for mentioning each of the following rubric items in
          their answer:`}
        </Typography> */}
      </Stack>
    </Box>
  );
};

type UserListAnswersProps = {
  userAnswersProcessed: UserAnswerProcessed[];
  setUserAnswers: (data: UserAnswer[]) => void;
  onTryRubricOnAnswer: (userAnswer: UserAnswer) => void;
};
export const UserListAnswers = ({
  userAnswersProcessed,
  setUserAnswers,
  onTryRubricOnAnswer,
}: UserListAnswersProps) => {
  return (
    <Box>
      <Typography sx={{ fontWeight: 600 }}>Random Grading of 10 students</Typography>
      <Stack spacing={"12px"} sx={{ p: "0px" }}>
        {!userAnswersProcessed.length && (
          <Stack sx={{ p: "100px" }} alignItems={"center"} justifyContent={"center"} spacing={"20px"}>
            <Typography>No users found</Typography>
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
        {userAnswersProcessed.map((cur, idx) => (
          <Stack
            key={idx}
            direction={"row"}
            spacing={"12px"}
            component={"li"}
            onClick={() => onTryRubricOnAnswer(cur)}
            sx={{
              p: "16px 12px",
              height: "98px",
              borderBottom: `solid 1px ${DESIGN_SYSTEM_COLORS.gray500}`,
              width: "100%",
              cursor: "pointer",
              ":hover": {
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG800 : DESIGN_SYSTEM_COLORS.gray100,
              },
            }}
          >
            <OptimizedAvatar2 imageUrl={cur.userImage} alt={`${cur.user} profile picture`} size={40} />
            <Stack spacing={"6px"} sx={{ width: "100%" }}>
              <Stack spacing={"6px"} direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>{cur.user}</Typography>
                <Typography sx={{ fontSize: "12px", fontWeight: 400, color: DESIGN_SYSTEM_COLORS.gray500 }}>
                  {cur.points} point{cur.points !== 1 && "s"}
                </Typography>
              </Stack>
              <Typography
                sx={{
                  overflow: "hidden",
                  fontSize: "14px",
                }}
              >
                {cur.answer}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};
