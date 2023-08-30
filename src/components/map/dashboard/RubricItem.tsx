import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Divider, IconButton, Stack, TextField, Tooltip, Typography, useTheme } from "@mui/material";
import { FieldArray, Formik, FormikHelpers } from "formik";
import React, { useMemo } from "react";
import { Rubric, RubricItemType } from "src/client/firestore/questions.firestore";
import { TryRubricResponse } from "src/types";
import * as yup from "yup";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import shortenNumber from "@/lib/utils/shortenNumber";

import { CustomButton, CustomWrapperButton } from "../Buttons/Buttons";
import { SelectedUserAnswer, UserAnswer } from "./RubricsEditor";
import { getColorFromResult } from "./UserAnswers";

const NO_RUBRICS_MESSAGE = "No Rubric Items";

type RubricItemProps = {
  rubric: Rubric;
  username: string;
  onDuplicateRubric: () => void;
  onTryIt: () => void;
  onSave: (newRubric: Rubric) => Promise<void>;
  onDisplayForm?: () => void;
  onRemoveRubric?: () => void;
  isSelected: boolean;
  tryUserAnswers: {
    userAnswer: UserAnswer;
    result: TryRubricResponse[];
  }[];
  onSelectRubricItem: (params: string | null) => void;
  selectedRubricItem: string | null;
  selectedUserAnswer: SelectedUserAnswer;
};

export const RubricItem = ({
  rubric,
  username,
  onDuplicateRubric,
  onTryIt,
  onSave,
  onDisplayForm,
  onRemoveRubric,
  isSelected,
  tryUserAnswers,
  onSelectRubricItem,
  selectedRubricItem,
  selectedUserAnswer,
}: RubricItemProps) => {
  const theme = useTheme();

  const onUpVoteRubric = async () => {
    const wasUpVoted = rubric.upvotesBy.includes(username);
    const newUpvotes = wasUpVoted ? rubric.upvotesBy.filter(c => c !== username) : [...rubric.upvotesBy, username];
    const newDownVotes = rubric.downvotesBy.filter(c => c !== username);
    const newRubric: Rubric = { ...rubric, upvotesBy: newUpvotes, downvotesBy: newDownVotes };
    await onSave(newRubric);
  };

  const onDownVoteRubric = async () => {
    const wasVoted = rubric.downvotesBy.includes(username);
    const newDownVotes = wasVoted ? rubric.downvotesBy.filter(c => c !== username) : [...rubric.downvotesBy, username];
    const newUpVotes = rubric.upvotesBy.filter(c => c !== username);
    const newRubric: Rubric = { ...rubric, downvotesBy: newDownVotes, upvotesBy: newUpVotes };
    await onSave(newRubric);
  };

  const userAnswerWhereProcessed = useMemo(() => {
    return tryUserAnswers.reduce((a, c) => a || Boolean(c.result.length), false);
  }, [tryUserAnswers]);

  return (
    <Stack
      direction="column"
      spacing={2}
      sx={{
        borderRadius: "4px",
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
        p: "14px",
      }}
    >
      {/* <Typography>
        The student should earn {rubric.points} point{rubric.points === 1 ? "s" : ""} for mentioning each of the
        following points in their answer:
      </Typography> */}
      {!rubric.prompts.length && (
        <Typography sx={{ color: DESIGN_SYSTEM_COLORS.gray500 }}>{NO_RUBRICS_MESSAGE}</Typography>
      )}

      <Box component={"table"} sx={{ borderCollapse: "collapse" }}>
        <tbody>
          {rubric.prompts.map((c, idx) => (
            <Box
              component={"tr"}
              // component={"li"}
              key={idx}
              sx={{
                border: "solid 2px transparent",
                borderRadius: "8px",
                position: "relative",
                borderBottom: theme =>
                  `solid 2px ${
                    theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG600 : DESIGN_SYSTEM_COLORS.gray300
                  }`,
                ...(isSelected &&
                  userAnswerWhereProcessed &&
                  selectedRubricItem &&
                  selectedRubricItem === c.prompt && {
                    outline: `solid 2px ${DESIGN_SYSTEM_COLORS.notebookG600}`,
                  }),
                ...(isSelected &&
                  userAnswerWhereProcessed && {
                    cursor: "pointer",
                    ":hover": {
                      outline: theme =>
                        `solid 2px ${
                          theme.palette.mode === "dark"
                            ? DESIGN_SYSTEM_COLORS.notebookG200
                            : DESIGN_SYSTEM_COLORS.gray600
                        }`,
                    },
                  }),
              }}
              onClick={() => (isSelected && userAnswerWhereProcessed ? onSelectRubricItem(c.prompt) : undefined)}
            >
              <Box component={"td"} sx={{ p: "8px 4px" }}>
                <MarkdownRender
                  text={c.prompt}
                  sx={{
                    width: "100%",
                    flexGrow: 1,
                    ...(isSelected &&
                      selectedUserAnswer && {
                        backgroundColor: getColorFromResult(selectedUserAnswer.result[idx], theme.palette.mode),
                      }),
                  }}
                />
              </Box>
              <Box component={"td"} sx={{ p: "8px 4px" }}>
                <Typography sx={{ fontWeight: 600, fontSize: "12px", whiteSpace: "nowrap" }}>
                  ({c.point} Point{c.point !== 1 && "s"})
                </Typography>
              </Box>
            </Box>
          ))}
        </tbody>
      </Box>

      <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
        <Stack direction={"row"} alignItems={"center"} spacing={"8px"}>
          {!isSelected && (
            <CustomButton variant="contained" onClick={onTryIt}>
              Try it
            </CustomButton>
          )}
        </Stack>
        <Stack direction={"row"} alignItems={"center"} spacing={"8px"}>
          <CustomWrapperButton>
            <Stack direction={"row"} alignItems={"center"}>
              <Tooltip title={"Up-vote rubric"} placement={"top"}>
                <Button
                  onClick={onUpVoteRubric}
                  sx={{ padding: "0px 4px", color: "inherit", minWidth: "0px" }}
                  disabled={rubric.createdBy === username}
                >
                  <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                    <DoneIcon
                      sx={{ fontSize: "18px", color: rubric.upvotesBy.includes(username) ? "#00E676" : undefined }}
                    />
                    <span style={{ marginLeft: "2px" }}>{shortenNumber(rubric.upvotesBy.length, 2, false)}</span>
                  </Box>
                </Button>
              </Tooltip>
              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{
                  borderColor: theme => (theme.palette.mode === "dark" ? "#D3D3D3" : "inherit"),
                  mx: "4px",
                }}
              />
              <Tooltip title={"Down-vote rubric"} placement={"top"}>
                <Button
                  onClick={onDownVoteRubric}
                  sx={{ padding: "0px 4px", color: "inherit", minWidth: "0px" }}
                  disabled={rubric.createdBy === username}
                >
                  <Box sx={{ display: "flex", fontSize: "14px", alignItems: "center" }}>
                    <CloseIcon
                      sx={{ fontSize: "18px", color: rubric.downvotesBy.includes(username) ? "red" : undefined }}
                    />
                    <span style={{ marginLeft: "2px" }}>{shortenNumber(rubric.downvotesBy.length, 2, false)}</span>
                  </Box>
                </Button>
              </Tooltip>
            </Stack>
          </CustomWrapperButton>
          <Tooltip title="DuplicateRubric">
            <IconButton onClick={onDuplicateRubric}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          {onDisplayForm && (
            <Tooltip title="Edit Rubric" onClick={onDisplayForm}>
              <IconButton>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onRemoveRubric && (
            <Tooltip title="Remove Rubric" onClick={onRemoveRubric}>
              <IconButton>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

type RubricFormProps = { rubric: Rubric; onSave: (newRubric: Rubric) => Promise<void>; cancelFn: () => void };
type RubricFormValues = { prompts: RubricItemType[] };
export const RubricForm = ({ rubric, onSave, cancelFn }: RubricFormProps) => {
  const initialValue: RubricFormValues = { prompts: rubric.prompts };
  const validationSchema = yup.object().shape({
    // points: yup.number().min(0).max(10_000).typeError("").required(""),
    prompts: yup
      .array()
      .min(1, "The rubric must include a minimum of one item.")
      .of(
        yup.object().shape({
          prompt: yup.string().required("Rubric item should not be empty"),
          point: yup.number().min(0).max(10_000).typeError("").required(""),
        })
      ),
  });

  const onSubmit = async (values: RubricFormValues, { setSubmitting, setTouched }: FormikHelpers<RubricFormValues>) => {
    setSubmitting(true);
    setTouched({
      prompts: new Array(values.prompts.length).fill(true),
    });
    await onSave({ ...rubric, ...values });
    setSubmitting(false);
  };

  return (
    <Formik initialValues={initialValue} validationSchema={validationSchema} onSubmit={onSubmit}>
      {formik => {
        return (
          <form onSubmit={formik.handleSubmit}>
            <Stack
              direction="column"
              spacing={2}
              alignItems={"center"}
              sx={{
                borderRadius: "4px",
                p: "14px",
                border: ({ palette }) =>
                  `solid 1px ${
                    palette.mode === "light" ? DESIGN_SYSTEM_COLORS.gray300 : DESIGN_SYSTEM_COLORS.notebookG600
                  }`,
                backgroundColor: ({ palette }) =>
                  palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray50,
              }}
            >
              {!formik.values.prompts.length && (
                <Typography sx={{ color: DESIGN_SYSTEM_COLORS.gray500 }}>{NO_RUBRICS_MESSAGE}</Typography>
              )}

              <FieldArray
                name="prompts"
                render={(arrayHelpers: any) => (
                  <>
                    {formik.values.prompts.length > 0 && (
                      <>
                        <Typography sx={{ width: "100%" }}>The student's response should mention:</Typography>
                        <table>
                          <thead>
                            <th>
                              <Typography>Rubric item</Typography>
                            </th>
                            <th>
                              <Typography>Points</Typography>
                            </th>
                            <th></th>
                          </thead>
                          <tbody>
                            {formik.values.prompts.map((prompt, index) => {
                              return (
                                <tr key={index}>
                                  <td style={{ width: "100%" }}>
                                    <TextField
                                      label=""
                                      name={`prompts.${index}.prompt`}
                                      fullWidth
                                      multiline
                                      size="small"
                                      onChange={formik.handleChange}
                                      value={prompt.prompt}
                                      error={
                                        Boolean(
                                          formik.touched.prompts &&
                                            formik.touched.prompts[index] &&
                                            (formik.touched.prompts as any)[index]["prompt"]
                                        ) &&
                                        Boolean(
                                          formik.errors.prompts &&
                                            formik.errors.prompts[index] &&
                                            typeof (formik.errors.prompts as any)[index]["prompt"] === "string"
                                        )
                                      }
                                      helperText={
                                        Boolean(
                                          formik.touched.prompts &&
                                            formik.touched.prompts[index] &&
                                            (formik.touched.prompts as any)[index]["prompt"]
                                        ) &&
                                        formik.errors.prompts &&
                                        formik.errors.prompts[index] &&
                                        (formik.errors.prompts as any)[index]["prompt"]
                                      }
                                      onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                                        formik.handleBlur(event);
                                      }}
                                    />
                                  </td>
                                  <td style={{ verticalAlign: "top" }}>
                                    <TextField
                                      label=""
                                      id="points"
                                      name={`prompts.${index}.point`}
                                      onChange={formik.handleChange}
                                      value={prompt.point}
                                      error={
                                        Boolean(
                                          formik.touched.prompts &&
                                            formik.touched.prompts[index] &&
                                            (formik.touched.prompts as any)[index]["point"]
                                        ) &&
                                        Boolean(
                                          formik.errors.prompts &&
                                            formik.errors.prompts[index] &&
                                            typeof (formik.errors.prompts as any)[index]["point"] === "string"
                                        )
                                      }
                                      onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                                        formik.handleBlur(event);
                                      }}
                                      size="small"
                                      sx={{ width: "50px" }}
                                      inputProps={{}}
                                    />
                                  </td>
                                  <td style={{ verticalAlign: "top" }}>
                                    <Tooltip title="Remove Rubric Item">
                                      <IconButton
                                        type="button"
                                        onClick={() => arrayHelpers.remove(index)} // remove a friend from the list
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </>
                    )}

                    {formik.errors.prompts && typeof formik.errors.prompts === "string" && formik.touched.prompts && (
                      <Typography sx={{ color: theme => theme.palette.error.main }}>{formik.errors.prompts}</Typography>
                    )}
                    <Stack direction={"row"} justifyContent={"space-between"} sx={{ width: "100%" }}>
                      <CustomButton
                        variant="contained"
                        type="button"
                        color="secondary"
                        onClick={() => arrayHelpers.push({ prompt: "", point: 1 })}
                      >
                        Add Rubric Item <AddIcon />
                      </CustomButton>
                      <Stack spacing={"8px"} direction={"row"}>
                        <CustomButton variant="contained" type="button" color="secondary" onClick={cancelFn}>
                          Cancel
                        </CustomButton>
                        <CustomButton variant="contained" type="submit" disabled={formik.isSubmitting}>
                          {formik.isSubmitting ? "Saving ..." : "Save"}
                        </CustomButton>
                      </Stack>
                    </Stack>
                  </>
                )}
              />
            </Stack>
          </form>
        );
      }}
    </Formik>
  );
};
