import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Box, CircularProgress, Divider, Stack, TextField, Typography, useTheme } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import { Formik, FormikHelpers } from "formik";
import React, { useEffect, useMemo, useState } from "react";
import { addAnswer, Answer, updateAnswer } from "src/client/firestore/answer.firestore";
import { Rubric, RubricItemType } from "src/client/firestore/questions.firestore";
import { getNUsers } from "src/client/firestore/user.firestore";
import { User } from "src/knowledgeTypes";
import { TryRubricResponse } from "src/types";
import stringSimilarity from "string-similarity-js";
import model from "wink-eng-lite-web-model";
import winkNLP from "wink-nlp";
import * as yup from "yup";

import OptimizedAvatar2 from "@/components/OptimizedAvatar2";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { newId } from "@/lib/utils/newFirestoreId";

import { CustomButton } from "../Buttons/Buttons";
import { SelectedUserAnswer, UserAnswer } from "./RubricsEditor";

const nlp = winkNLP(model);

type UserAnswerState = "LOADING" | "ERROR" | "IDLE";

export type UserAnswerData = {
  userAnswerId: string;
  userAnswer: UserAnswer;
  result: TryRubricResponse[];
  state: UserAnswerState;
};

type UserAnswersProcessedProps = {
  data: UserAnswerData[];
  rubric: Rubric;
  onBack: () => void;
  selectedRubricItem: { index: Number } | null;
  selectedUserAnswer: SelectedUserAnswer;
  onSelectUserAnswer: (newValue: SelectedUserAnswer) => void;
};

export const TEXT_HIGHLIGHT: {
  [key in "success" | "warning" | "error" | "highlightSuccess" | "highlightWarning" | "highlightError"]: {
    dark: string;
    light: string;
  };
} = {
  success: { light: "#D7FEE7", dark: "#304438" },
  warning: { light: "#FDEAD7", dark: "#5e4b37" },
  error: { light: "#FFE6E6", dark: "#7f4f4f" },
  highlightSuccess: { light: "#6CE9A6", dark: "#1e7842" },
  highlightWarning: { light: "#F9DBAF", dark: "#895927" },
  highlightError: { light: "#ff776e", dark: "#7a1e1e" },
};

export const UserAnswersProcessed = ({
  data,
  rubric,
  onBack,
  selectedRubricItem,
  selectedUserAnswer,
  onSelectUserAnswer,
}: UserAnswersProcessedProps) => {
  const [thresholdByPoints, setThresholdByPoints] = useState(0);

  const onChangeThreshold = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const numberValue = Number(e.target.value);
    if (Number.isNaN(numberValue)) return;
    setThresholdByPoints(numberValue);
  };

  const dataSorted = useMemo(() => {
    return data.sort(
      (a, b) => getPointsFromResult(b.result, rubric.prompts) - getPointsFromResult(a.result, rubric.prompts)
    );
  }, [data, rubric.prompts]);

  const dataAboveThreshold = useMemo(() => {
    return dataSorted.filter(cur => getPointsFromResult(cur.result, rubric.prompts) >= thresholdByPoints);
  }, [dataSorted, rubric.prompts, thresholdByPoints]);

  const dataBellowThreshold = useMemo(() => {
    return dataSorted.filter(cur => getPointsFromResult(cur.result, rubric.prompts) < thresholdByPoints);
  }, [dataSorted, rubric.prompts, thresholdByPoints]);

  // restart threshold when selected item is clicked
  useEffect(() => {
    if (selectedRubricItem) setThresholdByPoints(0);
  }, [selectedRubricItem]);

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
      <Stack direction={"row"} justifyContent={"space-between"} sx={{ p: "24px 24px 12px 24px" }}>
        <CustomButton variant="contained" color="secondary" onClick={onBack}>
          <KeyboardArrowLeftIcon sx={{ mr: "4px" }} />
          <Typography sx={{ mr: "6px" }}>Back</Typography>
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
      {data.length > 1 && thresholdByPoints > 0 && (
        <Box sx={{ height: "100%", display: "grid", gridTemplateRows: "1fr 1fr", overflow: "auto" }}>
          <Box
            sx={{
              overflow: "auto",
              borderTop: `solid 1px ${DESIGN_SYSTEM_COLORS.gray500}`,
            }}
          >
            <Typography
              sx={{
                p: "0px 12px",
                mb: "8px",
                textAlign: "center",
                fontWeight: 600,
                position: "sticky",
                top: "0px",
                zIndex: 2,
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
              }}
            >
              {/* <MarkdownRender text="$$"></MarkdownRender> */}
              Answers with <span style={{ fontSize: "20px", fontWeight: 400 }}>&#8805;</span> {thresholdByPoints} point
              {thresholdByPoints !== 1 && "s"}
            </Typography>
            <Stack sx={{ p: "4px 10px" }} spacing={"10px"}>
              {dataAboveThreshold.map((cur, idx) => (
                <UserAnswerProcessed
                  key={idx}
                  result={cur.result}
                  userAnswer={cur.userAnswer}
                  rubric={rubric}
                  state={cur.state}
                  selectedRubricItem={selectedRubricItem}
                  isSelected={selectedUserAnswer?.userAnswerId === cur.userAnswerId}
                  onSelectUserAnswer={() => {
                    onSelectUserAnswer({
                      result: cur.result,
                      userAnswer: cur.userAnswer,
                      userAnswerId: cur.userAnswerId,
                    });
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              overflow: "auto",
              borderTop: `solid 1px ${DESIGN_SYSTEM_COLORS.gray500}`,
            }}
          >
            <Typography
              sx={{
                p: "0px 12px",
                mb: "8px",
                textAlign: "center",
                fontWeight: 600,
                position: "sticky",
                top: "0px",
                zIndex: 2,
                backgroundColor: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray200,
              }}
            >
              Answers with <span style={{ fontSize: "20px", fontWeight: 400 }}>{"<"}</span> {thresholdByPoints} point
              {thresholdByPoints !== 1 && "s"}
            </Typography>
            <Stack sx={{ p: "4px 10px" }} spacing={"10px"}>
              {dataBellowThreshold.map((cur, idx) => (
                <UserAnswerProcessed
                  key={idx}
                  result={cur.result}
                  userAnswer={cur.userAnswer}
                  rubric={rubric}
                  state={cur.state}
                  selectedRubricItem={selectedRubricItem}
                  isSelected={selectedUserAnswer?.userAnswerId === cur.userAnswerId}
                  onSelectUserAnswer={() => {
                    onSelectUserAnswer({
                      result: cur.result,
                      userAnswer: cur.userAnswer,
                      userAnswerId: cur.userAnswerId,
                    });
                  }}
                  // onSelectUserAnswer={onSelectUserAnswer}
                />
              ))}
            </Stack>
          </Box>
        </Box>
      )}
      {(data.length === 1 || thresholdByPoints === 0) &&
        dataSorted.map((cur, idx) => (
          <Box key={idx} sx={{ p: "4px 10px" }}>
            <UserAnswerProcessed
              result={cur.result}
              userAnswer={cur.userAnswer}
              rubric={rubric}
              state={cur.state}
              selectedRubricItem={selectedRubricItem}
              isSelected={selectedUserAnswer?.userAnswerId === cur.userAnswerId}
              // onSelectUserAnswer={}
              onSelectUserAnswer={
                data.length === 1
                  ? undefined
                  : () => {
                      onSelectUserAnswer({
                        result: cur.result,
                        userAnswer: cur.userAnswer,
                        userAnswerId: cur.userAnswerId,
                      });
                    }
              }
            />
          </Box>
        ))}
    </Box>
  );
};

type UserAnswerProcessed = {
  userAnswer: UserAnswer;
  result: TryRubricResponse[];
  state: UserAnswerState;
  rubric: Rubric;
  selectedRubricItem: { index: Number } | null;
  isSelected: boolean;
  onSelectUserAnswer?: () => void;
};

export const UserAnswerProcessed = ({
  userAnswer,
  result,
  state,
  rubric,
  selectedRubricItem,
  isSelected,
  onSelectUserAnswer,
}: UserAnswerProcessed) => {
  const theme = useTheme();
  const points = useMemo(() => getPointsFromResult(result, rubric.prompts), [result, rubric.prompts]);

  const resultHighlighted = useMemo(() => {
    return result.reduce((acu: string, cur, idx) => {
      const isHighlighted = Boolean(selectedRubricItem && selectedRubricItem.index === idx);
      const color = getColorFromResult(cur, theme.palette.mode, isHighlighted);
      return color ? highlightSentences({ color, sentences: cur.sentences, text: acu }) : acu;
    }, userAnswer.answer);
  }, [result, selectedRubricItem, theme.palette.mode, userAnswer.answer]);

  return (
    <Stack
      onClick={onSelectUserAnswer}
      sx={{
        p: "12px",
        border: "solid 2px transparent",
        // mb: "30px",
        // boxSizing: "border-box",
        borderRadius: "4px",
        ...(isSelected && {
          border: ({ palette }) =>
            isSelected
              ? `solid 2px ${DESIGN_SYSTEM_COLORS.primary800}`
              : `solid 1px ${
                  palette.mode === "light" ? DESIGN_SYSTEM_COLORS.gray300 : DESIGN_SYSTEM_COLORS.notebookG600
                }`,
          backgroundColor: ({ palette }) =>
            isSelected
              ? palette.mode === "dark"
                ? DESIGN_SYSTEM_COLORS.notebookG700
                : DESIGN_SYSTEM_COLORS.gray100
              : palette.mode === "dark"
              ? DESIGN_SYSTEM_COLORS.notebookG900
              : DESIGN_SYSTEM_COLORS.gray50,
        }),
        ":hover": {
          cursor: "pointer",
          border: theme =>
            `solid 2px ${
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG200 : DESIGN_SYSTEM_COLORS.gray600
            }`,
        },
      }}
    >
      <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} sx={{ mb: "12px" }}>
        <Stack direction={"row"} spacing={"12px"} alignItems={"center"}>
          <OptimizedAvatar2 imageUrl={userAnswer.userImage} alt={`${userAnswer.user} profile picture`} size={40} />
          <Typography sx={{ fontWeight: 600 }}>{userAnswer.user}</Typography>
        </Stack>
        {state === "IDLE" && (
          <Stack>
            <Typography>
              Score:{" "}
              <Typography component={"span"} sx={{ fontWeight: 700 }}>
                {points}/{rubric.prompts.reduce((a, c) => a + Number(c.point), 0)}
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
  usersAnswers: Answer[];
  setUserAnswers: React.Dispatch<React.SetStateAction<Answer[]>>;
  // onTryRubricOnAnswer: (userAnswer: UserAnswer, userAnswerId: string) => Promise<void>;
  onTryRubricOnAnswers: (userAnswersToTry: Answer[]) => Promise<void>;
  questionId: string;
};

const validationSchema = yup.object({
  answer: yup.string().required("User answer is required."),
});

export const UserListAnswers = ({
  setUserAnswers,
  usersAnswers,
  // onTryRubricOnAnswer,
  onTryRubricOnAnswers,
  questionId,
}: UserListAnswersProps) => {
  const db = getFirestore();
  // const [userAnswersCopy,setUserAnswersCopy]=UserStatus
  const [userAnswersCopy, setUserAnswersCopy] = useState<Answer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  // const [tryingUserAnswerIdx, setTryingUserAnswerIdx] = useState(-1);
  const [newAnswerId, setNewAnswerId] = useState("");
  // const [isPending, startTransition] = useTransition();

  // const onTryUserAnswer = async (userAnswer: Answer, idx: number) => {
  //   setTryingUserAnswerIdx(idx);
  //   await onTryRubricOnAnswer(
  //     { answer: userAnswer.answer, user: userAnswer.user, userImage: userAnswer.userImage },
  //     userAnswer.id
  //   );
  //   setTryingUserAnswerIdx(-1);
  // };

  const onAddUserAnswer = () => {
    const randomUser = users[Math.floor(Math.random() * users.length - 1)];
    if (!randomUser) return console.error("Error: there is not users, set up users in the project", { randomUser });

    const id = newId(db);
    const newUserAnswer: Answer = {
      answer: "",
      createdAt: new Date(),
      question: questionId,
      id,
      updatedAt: new Date(),
      user: randomUser.uname,
      userImage: randomUser.imageUrl ?? "",
    };
    setNewAnswerId(id);
    setUserAnswersCopy(prev => [...prev, newUserAnswer]);
  };

  const onCancelUserAnswer = () => {
    setUserAnswersCopy(prev => prev.filter(c => c.id !== newAnswerId));
    setNewAnswerId("");
  };

  const onSubmit = async (values: Answer, formikHelpers: FormikHelpers<Answer>) => {
    formikHelpers.setSubmitting(true);
    if (newAnswerId === values.id) {
      const newAnswerInput = { ...values } as any;
      delete newAnswerInput.id;
      await addAnswer(db, values.id, newAnswerInput);
      setNewAnswerId("");
      setUserAnswers(prev => [...prev, values]);
    } else {
      await updateAnswer(db, values.id, { answer: values.answer });
      setUserAnswers(prev => prev.map(c => (c.id === values.id ? { ...c, answer: values.answer } : c)));
    }
    formikHelpers.setSubmitting(false);
  };

  useEffect(() => {
    const getUsers = async () => {
      const randomUsers: User[] = await getNUsers(db, 10);
      setUsers(randomUsers);
    };
    getUsers();
  }, [db]);

  useEffect(() => {
    setUserAnswersCopy(usersAnswers);
  }, [usersAnswers]);

  return (
    <Box>
      <Typography sx={{ fontWeight: 600, mb: "12px" }}>Random Grading of 10 students</Typography>
      <Stack spacing={"20px"} sx={{ p: "0px" }}>
        {userAnswersCopy.map((cur, idx) => (
          <Formik key={cur.id} initialValues={cur} validationSchema={validationSchema} onSubmit={onSubmit}>
            {formik => {
              return (
                <form onSubmit={formik.handleSubmit}>
                  <Stack direction={"row"} alignItems={"center"} spacing={"12px"} sx={{ mb: "8px" }}>
                    <OptimizedAvatar2 imageUrl={cur.userImage} alt={cur.user} size={40} />
                    <Typography>{cur.user}</Typography>
                  </Stack>
                  <TextField
                    label=""
                    name={`answer`}
                    fullWidth
                    multiline
                    size="small"
                    onChange={formik.handleChange}
                    value={formik.values["answer"]}
                    error={Boolean(formik.touched.answer && formik.errors.answer)}
                    helperText={Boolean(formik.touched.answer) && formik.errors.answer}
                    onBlur={formik.handleBlur}
                  />
                  <Stack direction={"row"} justifyContent={"space-between"} spacing={"8px"} sx={{ mt: "12px" }}>
                    <Stack direction={"row"} spacing={"8px"}>
                      {newAnswerId && cur.id === newAnswerId && (
                        <CustomButton
                          onClick={onCancelUserAnswer}
                          variant="contained"
                          color="secondary"
                          size="small"
                          disabled={formik.isSubmitting}
                        >
                          Cancel
                        </CustomButton>
                      )}
                      {((newAnswerId && !usersAnswers[idx]) ||
                        (usersAnswers[idx] && formik.values["answer"] !== usersAnswers[idx].answer)) && (
                        <CustomButton
                          variant="contained"
                          color="secondary"
                          size="small"
                          type="submit"
                          disabled={formik.isSubmitting}
                        >
                          {formik.isSubmitting ? (
                            <>
                              Saving <CircularProgress size={"15px"} sx={{ ml: "8px" }} />
                            </>
                          ) : (
                            "Save"
                          )}
                        </CustomButton>
                      )}
                    </Stack>

                    {newAnswerId !== cur.id && (
                      <CustomButton variant="contained" size="small" onClick={() => onTryRubricOnAnswers([cur])}>
                        <PlayArrowIcon sx={{ mr: "4px" }} />
                        Grade
                      </CustomButton>
                    )}
                  </Stack>
                </form>
              );
            }}
          </Formik>
        ))}
        <Divider />
        <Stack direction={"row-reverse"} justifyContent={"space-between"} spacing={"8px"} sx={{ mt: "12px" }}>
          <CustomButton
            variant="contained"
            onClick={() => onTryRubricOnAnswers(usersAnswers)}
            disabled={!userAnswersCopy.length}
          >
            <PlayArrowIcon sx={{ mr: "4px" }} />
            Grade All
          </CustomButton>
          {Boolean(users.length) && !newAnswerId && (
            <CustomButton
              onClick={onAddUserAnswer}
              variant="contained"
              color="secondary"
              size="small"
              // disabled={formik.isSubmitting}
            >
              <AddIcon sx={{ mr: "8px" }} />
              Add User Answer
            </CustomButton>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export const getColorFromResult = (
  resultItem: TryRubricResponse,
  theme: "dark" | "light",
  highlight = false
): string => {
  if (!resultItem) return "";
  if (resultItem.correct === "YES" && resultItem.mentioned === "YES")
    return highlight ? TEXT_HIGHLIGHT["highlightSuccess"][theme] : TEXT_HIGHLIGHT["success"][theme];
  if (resultItem.correct === "NO" && resultItem.mentioned === "YES")
    return highlight ? TEXT_HIGHLIGHT["highlightWarning"][theme] : TEXT_HIGHLIGHT["warning"][theme];
  if (resultItem.correct === "NO" && resultItem.mentioned === "NO")
    return highlight ? TEXT_HIGHLIGHT["highlightError"][theme] : TEXT_HIGHLIGHT["error"][theme];
  return "";
};

export const getHelperTextFromResult = (resultItem: TryRubricResponse): string => {
  if (!resultItem) return "";
  if (resultItem.correct === "YES" && resultItem.mentioned === "YES")
    return "This rubric was correctly mentioned in student’s answer.";
  if (resultItem.correct === "NO" && resultItem.mentioned === "YES")
    return "This rubric was explained incorrectly in student’s answer.";
  if (resultItem.correct === "NO" && resultItem.mentioned === "NO")
    return "This rubric was not mentioned in student’s answer.";
  return "";
};

const getPointsFromResult = (result: TryRubricResponse[], prompts: RubricItemType[]) => {
  return result.reduce((acu, cur, index) => acu + (cur.correct === "YES" ? Number(prompts[index]?.point) ?? 0 : 0), 0);
};

type HighlightSentencesInput = { sentences: string[]; text: string; color: string };
/**
 * this function highlight and approximation using NPL and a threshold
 * like this is non-deterministic problem, we can't create a test
 */
export const highlightSentences = ({ sentences, text, color }: HighlightSentencesInput) => {
  const threshold = 0.9;
  const tt = sentences.reduce((acuHightLight, curSentence) => {
    const fixedSentence = curSentence.replace(/^[\(\[.?!]|[\)\].?!]$/g, "");
    const sentenceIsOnText = acuHightLight.includes(fixedSentence);

    let similarResult = fixedSentence;
    if (!sentenceIsOnText) {
      const doc = nlp.readDoc(text);
      const textSentences = doc.sentences().out();
      const { sentence, score } = textSentences.reduce(
        (acu: { score: number; sentence: string }, cur) => {
          const score = stringSimilarity(cur, fixedSentence);
          return score > acu.score ? { score, sentence: cur } : acu;
        },
        { score: 0, sentence: "" }
      );
      if (score < threshold) return acuHightLight;
      similarResult = sentence;
    }
    if (!similarResult) return acuHightLight;

    return acuHightLight.replace(similarResult, `<span style=background-color:${color}>${similarResult}</span>`);
  }, text);
  return tt;
};
