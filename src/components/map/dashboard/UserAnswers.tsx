import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { FieldArray, Form, Formik } from "formik";
import React, { useMemo, useState } from "react";
import { Rubric, RubricItemType } from "src/client/firestore/questions.firestore";
import { TryRubricResponse } from "src/types";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { CustomButton } from "../Buttons/Buttons";
import { UserAnswer } from "./RubricsEditor";

type UserAnswerState = "LOADING" | "ERROR" | "IDLE";

export type UserAnswerData = { userAnswer: UserAnswer; result: TryRubricResponse[]; state: UserAnswerState };

type UserAnswersProcessedProps = {
  data: UserAnswerData[];
  rubric: Rubric;
  onBack: () => void;
  onSelectUserAnswer: (data: UserAnswerData) => void;
};

export const TEXT_HIGHLIGHT: { [key in "success" | "warning" | "error"]: string } = {
  success: "#D7FEE7",
  warning: "#FFE6E6",
  error: "#FDEAD7",
};

export const UserAnswersProcessed = ({ data, rubric, onBack, onSelectUserAnswer }: UserAnswersProcessedProps) => {
  const [thresholdByPoints, setThresholdByPoints] = useState(0);

  const onChangeThreshold = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const numberValue = Number(e.target.value);
    if (Number.isNaN(numberValue)) return;
    setThresholdByPoints(numberValue);
  };

  const dataAboveThreshold = useMemo(() => {
    return data
      .filter(cur => getPointsFromResult(cur.result, rubric.prompts) > thresholdByPoints)
      .sort((a, b) => getPointsFromResult(b.result, rubric.prompts) - getPointsFromResult(a.result, rubric.prompts));
  }, [data, rubric.prompts, thresholdByPoints]);

  const dataBellowThreshold = useMemo(() => {
    return data
      .filter(cur => getPointsFromResult(cur.result, rubric.prompts) <= thresholdByPoints)
      .sort((a, b) => getPointsFromResult(b.result, rubric.prompts) - getPointsFromResult(a.result, rubric.prompts));
  }, [data, rubric.prompts, thresholdByPoints]);

  return (
    <Box
      sx={{
        position: "relative",
        // border: "solid 1px red",
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        overflow: "auto",
        backgroundColor: ({ palette }) =>
          palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookMainBlack : DESIGN_SYSTEM_COLORS.gray50,
      }}
    >
      <Stack direction={"row"} justifyContent={"space-between"} sx={{ p: "24px" }}>
        <CustomButton variant="contained" color="secondary" onClick={onBack}>
          <KeyboardArrowLeftIcon sx={{ mr: "10px" }} />
          Back
        </CustomButton>
        {data.length > 1 && (
          <TextField
            id="outlined-basic"
            label="Threshold by Points"
            variant="outlined"
            size="small"
            type="number"
            value={thresholdByPoints}
            onChange={onChangeThreshold}
            sx={{ width: "140px" }}
          />
        )}
      </Stack>

      {data.length > 1 && (
        <Box sx={{ height: "100%", display: "grid", gridTemplateRows: "1fr 1fr", overflow: "auto" }}>
          <Box
            sx={{
              p: "24px",
              overflow: "auto",
              borderTop: theme =>
                theme.palette.mode === "dark"
                  ? `solid 1px ${DESIGN_SYSTEM_COLORS.gray100}`
                  : `solid 1px ${DESIGN_SYSTEM_COLORS.gray400}`,
            }}
          >
            {dataAboveThreshold.map((cur, idx) => (
              <UserAnswerProcessed
                key={idx}
                result={cur.result}
                userAnswer={cur.userAnswer}
                rubric={rubric}
                state={cur.state}
                onSelectUserAnswer={onSelectUserAnswer}
              />
            ))}
          </Box>

          <Box
            sx={{
              p: "24px",
              overflow: "auto",
              borderTop: theme =>
                theme.palette.mode === "dark"
                  ? `solid 1px ${DESIGN_SYSTEM_COLORS.gray100}`
                  : `solid 1px ${DESIGN_SYSTEM_COLORS.gray400}`,
            }}
          >
            {dataBellowThreshold.map((cur, idx) => (
              <UserAnswerProcessed
                key={idx}
                result={cur.result}
                userAnswer={cur.userAnswer}
                rubric={rubric}
                state={cur.state}
                onSelectUserAnswer={onSelectUserAnswer}
              />
            ))}
          </Box>
        </Box>
      )}

      {data.length === 1 &&
        data.map((cur, idx) => (
          <Box key={idx} sx={{ p: "24px" }}>
            <UserAnswerProcessed
              result={cur.result}
              userAnswer={cur.userAnswer}
              rubric={rubric}
              state={cur.state}
              onSelectUserAnswer={onSelectUserAnswer}
            />
          </Box>
        ))}

      {/* {dataAboveThreshold.map((cur, idx) => (
        <UserAnswerProcessed
          key={idx}
          result={cur.result}
          userAnswer={cur.userAnswer}
          rubric={rubric}
          state={cur.state}
          onSelectUserAnswer={onSelectUserAnswer}
        />
      ))}
      <Divider />
      {dataBellowThreshold.map((cur, idx) => (
        <UserAnswerProcessed
          key={idx}
          result={cur.result}
          userAnswer={cur.userAnswer}
          rubric={rubric}
          state={cur.state}
          onSelectUserAnswer={onSelectUserAnswer}
        />
      ))} */}
    </Box>
  );
};

type UserAnswerProcessed = {
  userAnswer: UserAnswer;
  result: TryRubricResponse[];
  state: UserAnswerState;
  rubric: Rubric;
  onSelectUserAnswer: (data: UserAnswerData) => void;
};

export const UserAnswerProcessed = ({ userAnswer, result, state, rubric, onSelectUserAnswer }: UserAnswerProcessed) => {
  const points = useMemo(() => getPointsFromResult(result, rubric.prompts), [result, rubric.prompts]);

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
    }, userAnswer.answer);
  }, [result, userAnswer.answer]);

  return (
    <Stack
      sx={{ mb: "30px", cursor: "pointer" }}
      onClick={() => onSelectUserAnswer({ userAnswer, result, state: "IDLE" })}
    >
      <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} sx={{ mb: "18px" }}>
        <Stack direction={"row"} spacing={"12px"} alignItems={"center"}>
          <OptimizedAvatar2 imageUrl={userAnswer.userImage} alt={`${userAnswer.user} profile picture`} size={40} />
          <Typography sx={{ fontWeight: 600 }}>{userAnswer.user}</Typography>
        </Stack>
        {state === "IDLE" && (
          <Stack>
            <Typography>
              Score:{" "}
              <Typography component={"span"} sx={{ fontWeight: 700, color: DESIGN_SYSTEM_COLORS.gray900 }}>
                {points}
              </Typography>{" "}
              pts
            </Typography>
          </Stack>
        )}
        {state === "LOADING" && <CircularProgress sx={{ width: "20px", height: "20px" }} />}
      </Stack>

      <Typography dangerouslySetInnerHTML={{ __html: resultHighlighted }} />
      {state === "ERROR" && (
        <Typography color={"red"}>
          An error occurred. Please verify if the rubrics make sense or attempt again.
        </Typography>
      )}
    </Stack>
  );
};

type UserListAnswersProps = {
  usersAnswers: UserAnswer[];
  setUserAnswers: (data: UserAnswer[]) => void;
  onTryRubricOnAnswer: (userAnswer: UserAnswer) => Promise<void>;
  onTryRubricOnAnswers: () => Promise<void>;
};
export const UserListAnswers = ({
  setUserAnswers,
  usersAnswers,
  onTryRubricOnAnswer,
  onTryRubricOnAnswers,
}: UserListAnswersProps) => {
  const [tryingUserAnswerIdx, setTryingUserAnswerIdx] = useState(-1);
  // const [isPending, startTransition] = useTransition();

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
                      <React.Fragment key={index}>
                        <Stack spacing={"12px"}>
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
                            onChange={e => {
                              formik.handleChange(e);
                              formik.submitForm();
                            }}
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
                          {/* {userAnswer.answer !== usersAnswers[index].answer && (
                            <CustomButton variant="contained" color="secondary" type="submit" size="small">
                              Save
                            </CustomButton>
                          )} */}
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
                      </React.Fragment>
                    ))}

                    <Stack direction={"row"} justifyContent={"center"} sx={{ mt: "20px" }}>
                      <CustomButton
                        variant="contained"
                        type="button"
                        size="small"
                        disabled={tryingUserAnswerIdx >= 0}
                        onClick={onTryRubricOnAnswers}
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

const getPointsFromResult = (result: TryRubricResponse[], prompts: RubricItemType[]) => {
  return result.reduce((acu, cur, index) => acu + (cur.correct === "YES" ? Number(prompts[index]?.point) ?? 0 : 0), 0);
};
