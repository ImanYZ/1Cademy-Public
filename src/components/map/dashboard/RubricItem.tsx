import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import { Box, Button, Divider, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { FieldArray, Form, Formik, FormikHelpers } from "formik";
import React from "react";
import { Rubric } from "src/client/firestore/questions.firestore";
import * as yup from "yup";

import MarkdownRender from "@/components/Markdown/MarkdownRender";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import shortenNumber from "@/lib/utils/shortenNumber";

import { CustomButton, CustomWrapperButton } from "../Buttons/Buttons";

const NO_RUBRICS_MESSAGE = "No Rubric Items";

type RubricItemProps = {
  rubric: Rubric;
  username: string;
  onDuplicateRubric: () => void;
  onTryIt: () => void;
  onSave: (newRubric: Rubric) => Promise<void>;
};

export const RubricItem = ({ rubric, username, onDuplicateRubric, onTryIt, onSave }: RubricItemProps) => {
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

  return (
    <Box
      sx={{
        borderRadius: "4px",
        border: ({ palette }) =>
          `solid 1px ${palette.mode === "light" ? DESIGN_SYSTEM_COLORS.gray300 : DESIGN_SYSTEM_COLORS.notebookG600}`,
        backgroundColor: ({ palette }) =>
          palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray50,
        p: "14px",
      }}
    >
      <Typography>
        The student should earn {rubric.points} point{rubric.points === 1 ? "s" : ""} for mentioning each of the
        following points in their answer:
      </Typography>
      {!rubric.prompts.length && (
        <Typography sx={{ color: DESIGN_SYSTEM_COLORS.gray500 }}>{NO_RUBRICS_MESSAGE}</Typography>
      )}
      <Box component={"ul"}>
        {rubric.prompts.map((c, i) => (
          <Typography component={"li"} key={i}>
            {<MarkdownRender text={c} />}
          </Typography>
        ))}
      </Box>
      <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
        <Stack direction={"row"} alignItems={"center"} spacing={"8px"}>
          <CustomButton variant="contained" color="secondary">
            Choose it
          </CustomButton>
          <CustomButton variant="contained" onClick={onTryIt}>
            Try it
          </CustomButton>
        </Stack>
        <Stack direction={"row"} alignItems={"center"} spacing={"8px"}>
          <CustomWrapperButton>
            <Stack direction={"row"} alignItems={"center"}>
              <Tooltip title={"Up-vote rubric"} placement={"top"}>
                <Button onClick={onUpVoteRubric} sx={{ padding: "0px 4px", color: "inherit", minWidth: "0px" }}>
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
                <Button onClick={onDownVoteRubric} sx={{ padding: "0px 4px", color: "inherit", minWidth: "0px" }}>
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
        </Stack>
      </Stack>
    </Box>
  );
};

type RubricFormProps = { rubric: Rubric; onSave: (newRubric: Rubric) => Promise<void>; cancelFn: () => void };
type RubricFormValues = { points: number; prompts: string[] };
export const RubricForm = ({ rubric, onSave, cancelFn }: RubricFormProps) => {
  const initialValue: RubricFormValues = { points: rubric.points, prompts: rubric.prompts };
  const validationSchema = yup.object().shape({
    points: yup.number().min(0).max(10_000).typeError("").required(""),
    prompts: yup
      .array()
      .min(1, "The rubric must include a minimum of one specific detail.")
      .of(yup.string().required("Rubric detail should have a description")),
  });

  const onSubmit = async (values: RubricFormValues, { setSubmitting, setTouched }: FormikHelpers<RubricFormValues>) => {
    setSubmitting(true);
    setTouched({
      points: true,
      prompts: true,
    });
    await onSave({ ...rubric, ...values });
    setSubmitting(false);
  };

  return (
    <Formik initialValues={initialValue} validationSchema={validationSchema} onSubmit={onSubmit}>
      {formik => {
        return (
          <Form>
            <Stack
              direction="column"
              spacing={2}
              alignItems={"center"}
              sx={{
                borderRadius: "4px",
                // border: `solid 1px ${DESIGN_SYSTEM_COLORS.gray``300}`,
                // backgroundColor: DESIGN_SYSTEM_COLORS.gray100,``
                p: "14px",
                border: ({ palette }) =>
                  `solid 1px ${
                    palette.mode === "light" ? DESIGN_SYSTEM_COLORS.gray300 : DESIGN_SYSTEM_COLORS.notebookG600
                  }`,
                backgroundColor: ({ palette }) =>
                  palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray50,
              }}
            >
              <Box sx={{ width: "100%" }}>
                <Typography display={"inline"}>The student should earn </Typography>
                <TextField
                  label=""
                  id="points"
                  name="points"
                  onChange={formik.handleChange}
                  value={formik.values.points}
                  error={formik.touched.points && formik.errors.hasOwnProperty("points")}
                  helperText={formik.touched.points && formik.errors.points}
                  onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                    formik.handleBlur(event);
                  }}
                  size="small"
                  sx={{ width: "50px" }}
                  inputProps={{ style: { padding: "2px 10px", minWidth: "100px" } }}
                />
                <Typography display={"inline"}>
                  {" "}
                  point{formik.values.points === 1 ? "" : "s"} for mentioning each of the following rubric items in
                  their answer:
                </Typography>
              </Box>
              {!formik.values.prompts.length && (
                <Typography sx={{ color: DESIGN_SYSTEM_COLORS.gray500 }}>{NO_RUBRICS_MESSAGE}</Typography>
              )}
              <FieldArray
                name="prompts"
                render={(arrayHelpers: any) => (
                  <>
                    {formik.values.prompts.map((prompt, index) => (
                      <Stack key={index} direction={"row"} sx={{ width: "100%" }} alignItems={"flex-start"}>
                        <TextField
                          label=""
                          name={`prompts.${index}`}
                          fullWidth
                          multiline
                          size="small"
                          onChange={formik.handleChange}
                          value={prompt}
                          error={Boolean(
                            formik.touched.prompts
                              ? (formik.touched.prompts as any)[index] &&
                                  formik.errors.prompts &&
                                  formik.errors.prompts[index]
                              : false
                          )}
                          helperText={
                            (Boolean(formik.touched.prompts) && (formik.touched.prompts as any))[index] &&
                            formik.errors.prompts
                              ? formik.errors.prompts[index] ?? ""
                              : ""
                          }
                          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                            formik.handleBlur(event);
                          }}
                        />

                        <Tooltip title="Remove Rubric Item">
                          <IconButton
                            type="button"
                            onClick={() => arrayHelpers.remove(index)} // remove a friend from the list
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ))}

                    {formik.errors.prompts && typeof formik.errors.prompts === "string" && formik.touched.prompts && (
                      <Typography sx={{ color: theme => theme.palette.error.main }}>{formik.errors.prompts}</Typography>
                    )}
                    <Stack direction={"row"} justifyContent={"space-between"} sx={{ width: "100%" }}>
                      <CustomButton
                        variant="contained"
                        type="button"
                        color="secondary"
                        onClick={() => arrayHelpers.push("")}
                      >
                        Add New Rubric Details <AddIcon />
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
          </Form>
        );
      }}
    </Formik>
  );
};
