import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box, Divider, IconButton, Stack, TextField, Typography } from "@mui/material";
import { FieldArray, Form, Formik } from "formik";
import React, { useMemo, useState } from "react";
import { Rubric } from "src/client/firestore/questions.firestore";
import { TryRubricResponse } from "src/types";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { CustomButton } from "../Buttons/Buttons";
import { UserAnswer } from "./RubricsEditor";

type UserAnswersProps = { userAnswers: UserAnswer; result: TryRubricResponse[]; rubric: Rubric; onBack: () => void };

export const TEXT_HIGHLIGHT: { [key in "success" | "warning" | "error"]: string } = {
  success: "#D7FEE7",
  warning: "#FFE6E6",
  error: "#FDEAD7",
};

export const UserAnswers = ({ userAnswers, result, rubric, onBack }: UserAnswersProps) => {
  const points = useMemo(
    () => result.reduce((acu, cur, index) => (acu + cur.correct ? rubric.prompts[index]?.point ?? 0 : 0), 0),
    [result, rubric.prompts]
  );

  const replaceSentences = (sentences: string[], text: string, color: string) => {
    return sentences.reduce((acu, cur) => {
      const result = cur.replace(/^[\(\[.?!]|[\)\].?!]$/g, "");
      return acu.replace(result, `<span style=background-color:${color}>${result}</span>`);
    }, text);
  };

  const resultHighlighted = useMemo(() => {
    return result.reduce((acu: string, cur) => {
      const color = getColorFromResult(cur);
      if (color) return replaceSentences(cur.sentences, acu, color);
      return acu;
    }, userAnswers.answer);
  }, [result, userAnswers.answer]);

  // const rebricHighlighted = useMemo(() => {
  //   return result.reduce((acu, cur) => {
  //     // console.log({ sentence });
  //     if (cur.correct === "YES" && cur.mentioned === "YES")
  //       return replaceSentences(cur.sentences, acu, TEXT_HIGHLIGHT["success"]);
  //     if (cur.correct === "NO" && cur.mentioned === "YES")
  //       return replaceSentences(cur.sentences, acu, TEXT_HIGHLIGHT["warning"]);
  //     if (cur.correct === "NO" && cur.mentioned === "NO")
  //       return replaceSentences(cur.sentences, acu, TEXT_HIGHLIGHT["error"]);
  //     return acu;
  //   }, new Array(rubric.prompts.length).fill());
  // }, [result, userAnswers.answer]);

  return (
    <Box>
      <CustomButton variant="contained" color="secondary" sx={{ mb: "24px" }} onClick={onBack}>
        <KeyboardArrowLeftIcon sx={{ mr: "10px" }} />
        Back
      </CustomButton>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Stack direction={"row"} spacing={"12px"} alignItems={"center"} sx={{ mb: "18px" }}>
          <OptimizedAvatar2 imageUrl={userAnswers.userImage} alt={`${userAnswers.user} profile picture`} size={40} />
          <Typography sx={{ fontWeight: 600 }}>{userAnswers.user}</Typography>
        </Stack>
        <Stack>
          <Typography>Total score</Typography>
          <Typography sx={{ fontWeight: 700, color: DESIGN_SYSTEM_COLORS.gray900 }}>{points}</Typography>
        </Stack>
      </Stack>

      <Typography dangerouslySetInnerHTML={{ __html: resultHighlighted }} />

      <Divider />

      <Stack>
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
        </Stack>
        <Stack spacing={"14px"}>
          <Typography>
            {`According to the rubric, a student should earn points for each correct answer of the rubric items in their answer:`}
          </Typography>
          {rubric.prompts.map((cur, idx) => (
            <Stack key={idx} component={"li"} direction={"row"} spacing={"12px"}>
              <Typography sx={{ fontSize: "27px" }}>•</Typography>
              <Stack sx={{ width: "100%" }}>
                <Typography
                  component={"span"}
                  sx={{ backgroundColor: getColorFromResult(result[idx]), mb: "8px", p: "2px 4px" }}
                >
                  {cur.prompt}
                </Typography>
                <Typography>{getHelperTextFromResult(result[idx])}</Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};

type UserListAnswersProps = {
  usersAnswers: UserAnswer[];
  setUserAnswers: (data: UserAnswer[]) => void;
  onTryRubricOnAnswer: (userAnswer: UserAnswer) => Promise<void>;
};
export const UserListAnswers = ({ setUserAnswers, usersAnswers, onTryRubricOnAnswer }: UserListAnswersProps) => {
  const [tryingUserAnswerIdx, setTryingUserAnswerIdx] = useState(-1);

  const onTryUserAnswer = async (userAnswer: UserAnswer, idx: number) => {
    setTryingUserAnswerIdx(idx);
    await onTryRubricOnAnswer(userAnswer);
    setTryingUserAnswerIdx(-1);
  };

  return (
    <Box>
      <Typography sx={{ fontWeight: 600 }}>Random Grading of 10 students</Typography>
      <Stack spacing={"12px"} sx={{ p: "0px" }}>
        <Formik initialValues={{ usersAnswers }} onSubmit={({ usersAnswers }) => setUserAnswers(usersAnswers)}>
          {formik => (
            <Form>
              <FieldArray
                name="usersAnswers"
                render={() => (
                  <Stack>
                    {formik.values.usersAnswers.map((userAnswer, index) => (
                      <>
                        <Stack key={index} spacing={"12px"}>
                          <Stack key={index} direction={"row"} alignItems={"center"} spacing={"12px"}>
                            <OptimizedAvatar2 imageUrl={userAnswer.userImage} alt={userAnswer.user} size={40} />
                            <Typography>{userAnswer.user}</Typography>
                          </Stack>
                          <TextField
                            label=""
                            name={`usersAnswers.${index}.answer`}
                            fullWidth
                            multiline
                            size="small"
                            onChange={formik.handleChange}
                            value={userAnswer.answer}
                            error={
                              Boolean(
                                formik.touched.usersAnswers &&
                                  formik.touched.usersAnswers[index] &&
                                  (formik.touched.usersAnswers as any)[index]["answer"]
                              ) &&
                              Boolean(
                                formik.errors.usersAnswers &&
                                  formik.errors.usersAnswers[index] &&
                                  typeof (formik.errors.usersAnswers as any)[index]["answer"] === "string"
                              )
                            }
                            helperText={
                              Boolean(
                                formik.touched.usersAnswers &&
                                  formik.touched.usersAnswers[index] &&
                                  (formik.touched.usersAnswers as any)[index]["answer"]
                              ) &&
                              formik.errors.usersAnswers &&
                              formik.errors.usersAnswers[index] &&
                              (formik.errors.usersAnswers as any)[index]["answer"]
                            }
                            onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                              formik.handleBlur(event);
                            }}
                          />

                          {/* <Field name={`friends.${index}`} /> */}
                          {/* <button
                                type="button"
                                onClick={() => arrayHelpers.remove(index)} // remove a friend from the list
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() => arrayHelpers.insert(index, "")} // insert an empty string at a position
                              >
                                +
                              </button> */}
                        </Stack>
                        <Stack direction={"row"} justifyContent={"right"} sx={{ mt: "12px" }} spacing={"12px"}>
                          {userAnswer.answer !== usersAnswers[index].answer && (
                            <CustomButton variant="contained" color="secondary" type="submit" size="small">
                              Save
                            </CustomButton>
                          )}
                          <CustomButton
                            variant="contained"
                            type="button"
                            size="small"
                            onClick={() => onTryUserAnswer(userAnswer, index)}
                            disabled={tryingUserAnswerIdx >= 0}
                          >
                            {(tryingUserAnswerIdx !== index || tryingUserAnswerIdx === -1) && (
                              <PlayArrowIcon sx={{ mr: "4px" }} />
                            )}
                            {tryingUserAnswerIdx !== index || tryingUserAnswerIdx === -1 ? "Grade" : "Grading..."}
                          </CustomButton>
                        </Stack>
                      </>
                    ))}

                    <Stack direction={"row"} justifyContent={"center"}>
                      <CustomButton
                        variant="contained"
                        type="button"
                        size="small"
                        disabled={tryingUserAnswerIdx >= 0}
                        onClick={() => {}}
                      >
                        <PlayArrowIcon sx={{ mr: "4px" }} />
                        Grade All
                      </CustomButton>
                    </Stack>
                  </Stack>
                )}
              />
            </Form>
          )}
        </Formik>

        {/* {userAnswersProcessed.map((cur, idx) => (
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
        ))} */}
      </Stack>
    </Box>
  );
};

export const getColorFromResult = (resultItem: TryRubricResponse): string => {
  if (!resultItem) return "";
  if (resultItem.correct === "YES" && resultItem.mentioned === "YES") return TEXT_HIGHLIGHT["success"];
  if (resultItem.correct === "NO" && resultItem.mentioned === "YES") return TEXT_HIGHLIGHT["warning"];
  if (resultItem.correct === "NO" && resultItem.mentioned === "NO") return TEXT_HIGHLIGHT["error"];
  return "";
};

export const getHelperTextFromResult = (resultItem: TryRubricResponse): string => {
  if (!resultItem) return "";
  if (resultItem.correct === "YES" && resultItem.mentioned === "YES")
    return "This rubric was correctly metioned in student’s answer.";
  if (resultItem.correct === "NO" && resultItem.mentioned === "YES")
    return "This rubric was explained incorrectly in student’s answer.";
  if (resultItem.correct === "NO" && resultItem.mentioned === "NO")
    return "This rubric was not mentioned in student’s answer.";
  return "";
};
