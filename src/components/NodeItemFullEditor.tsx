import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpIcon from "@mui/icons-material/Help";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FieldArray, Formik, FormikErrors, FormikHelpers } from "formik";
import { FC, ReactNode } from "react";

// import { NodeType } from "src/types";
import { NODE_TYPE_OPTIONS } from "@/lib/utils/constants";

import { KnowledgeChoice, KnowledgeNode, NodeType } from "../knowledgeTypes";
import MarkdownRender from "./Markdown/MarkdownRender";
import { MarkdownHelper } from "./MarkdownHelper";
import NodeTypeIcon from "./NodeTypeIcon";

dayjs.extend(relativeTime);

export interface ProposalFormValues {
  title: string;
  content: string;
  reasons: string;
  nodeType: NodeType;
  questions: KnowledgeChoice[];
}

type Props = {
  node: KnowledgeNode;
  image: ReactNode;
  references: ReactNode;
  tags: ReactNode;
  onSubmit: (formValues: ProposalFormValues) => Promise<void>;
  onCancel: () => void;
};

export const NodeItemFullEditor: FC<Props> = ({ node, image, references, tags, onSubmit, onCancel }) => {
  const initialValues: ProposalFormValues = {
    title: node.title || "",
    content: node.content || "",
    reasons: "",
    nodeType: node.nodeType || "Advertisement",
    questions: node.choices ? [...node.choices] : [],
  };

  const validate = (values: ProposalFormValues) => {
    let errors: FormikErrors<ProposalFormValues> = {};
    const fillDefaultErrorQuestions = () =>
      (errors.questions = values.questions.map(() => ({ choice: "", feedback: "" })));
    if (!values.title) {
      errors.title = "required";
    }
    if (values.questions.length) {
      values.questions.forEach(({ feedback, choice }, idx) => {
        if (!feedback) {
          if (!errors.questions) {
            fillDefaultErrorQuestions();
          }
          (errors.questions as FormikErrors<{ choice: string; feedback: string }>[])[idx].feedback = "required";
        }

        if (!choice) {
          if (!errors.questions) {
            fillDefaultErrorQuestions();
          }
          (errors.questions as FormikErrors<{ choice: string; feedback: string }>[])[idx].choice = "required";
        }
      });
    }

    return errors;
  };

  const onSubmitForm = async (
    values: ProposalFormValues,
    { setSubmitting, setTouched }: FormikHelpers<ProposalFormValues>
  ) => {
    setSubmitting(true);
    setTouched({
      title: true,
      questions: values.questions.map(() => ({ choice: true, feedback: true })),
    });

    await onSubmit(values);
  };

  const getToggleCorrectQuestion = (
    questions: { choice: string; feedback: string; correct: boolean }[],
    index: number
  ) => {
    return questions.map((cur, idx) => (idx === index ? { ...cur, correct: !cur.correct } : { ...cur }));
  };

  return (
    <Card data-testid="node-item-full">
      <CardContent
        sx={{
          p: { xs: 5, md: 10 },
          "&:last-child": {
            paddingBottom: { xs: 4, md: 10 },
          },
        }}
      >
        <Formik initialValues={initialValues} validate={validate} onSubmit={onSubmitForm}>
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => {
            return (
              <form onSubmit={handleSubmit}>
                <TextField
                  id="reasons"
                  name="reasons"
                  label="Provide reasons for your changes"
                  variant="outlined"
                  margin="normal"
                  placeholder="To expedite your proposal review, please explain why you propose this new version"
                  value={values.reasons}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.reasons) && Boolean(touched.reasons)}
                  rows={2}
                  multiline
                  fullWidth
                />

                <Box sx={{ my: "8px" }}>
                  <Typography textAlign="right">
                    <Link>Log in</Link> to show your name in the contributors’ list and earn points for your helpful
                    proposals
                  </Typography>
                  <Box sx={{ pt: "20px", display: "flex", justifyContent: "end", gap: "10px" }}>
                    <Button onClick={onCancel} type="button" color="secondary">
                      Cancel
                    </Button>
                    <LoadingButton type="submit" color="primary" variant="contained" loading={isSubmitting}>
                      Propose changes
                    </LoadingButton>
                  </Box>
                </Box>

                <Divider sx={{ my: "8px" }} />

                <MarkdownHelper />

                <FormControl sx={{ width: "200px" }} margin="normal">
                  <InputLabel id="nodeTypeLabel">Node Type</InputLabel>
                  <Select
                    labelId="nodeTypeLabel"
                    id="nodeType"
                    name="nodeType"
                    value={values.nodeType}
                    label="Node Type"
                    onChange={(event: SelectChangeEvent) => {
                      const value = event.target.value as string;
                      setFieldValue("nodeType", value);
                      setFieldValue(
                        "questions",
                        value === "Question" ? [{ choice: "", feedback: "", correct: false }] : []
                      );
                    }}
                  >
                    {NODE_TYPE_OPTIONS.map((cur, idx) => (
                      <MenuItem value={cur} key={idx}>
                        <Box display={"flex"}>
                          <NodeTypeIcon sx={{ mr: 1 }} nodeType={cur} />
                          {cur}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {values.nodeType === "Question" && (
                  <Box>
                    <>
                      <Box sx={{ display: "flex", color: grey[600], my: "32px" }}>
                        <Typography>Add choices to your question</Typography> <HelpIcon sx={{ ml: "10px" }} />
                      </Box>

                      {/* questions */}
                      <FieldArray name="questions">
                        {({ remove, push }) => (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {values.questions.map(({ choice, feedback, correct }, idx) => (
                              <Box key={idx} sx={{ display: "flex" }}>
                                <Box sx={{ pr: "23px" }}>
                                  <IconButton
                                    onClick={() =>
                                      setFieldValue("questions", getToggleCorrectQuestion(values.questions, idx))
                                    }
                                  >
                                    {correct ? <CheckIcon color="success" /> : <CloseIcon color="error" />}
                                  </IconButton>
                                </Box>
                                <Box sx={{ width: "100%", p: "16px", position: "relative", background: "#fafafa" }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "end",
                                      gap: "10px",
                                      position: "absolute",
                                      color: grey[600],
                                      right: "0px",
                                      top: "0px",
                                    }}
                                  >
                                    <IconButton onClick={() => remove(idx)}>
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                  <TextField
                                    id={`questions.${idx}.choice`}
                                    name={`questions.${idx}.choice`}
                                    label={`Choice ${idx + 1} *`}
                                    value={choice}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    variant="standard"
                                    margin="dense"
                                    error={Boolean(
                                      errors.questions &&
                                        (errors.questions as FormikErrors<{ choice: string; feedback: string }>[])[
                                          idx
                                        ] &&
                                        (errors.questions as FormikErrors<{ choice: string; feedback: string }>[])[idx]
                                          .choice &&
                                        touched.questions &&
                                        (touched.questions as FormikErrors<{ choice: string; feedback: string }>[])[
                                          idx
                                        ] &&
                                        (touched.questions as FormikErrors<{ choice: string; feedback: string }>[])[idx]
                                          .choice
                                    )}
                                    fullWidth
                                  />
                                  <TextField
                                    id={`questions.${idx}.feedback`}
                                    name={`questions.${idx}.feedback`}
                                    label={`Feedback for choice ${idx + 1} *`}
                                    value={feedback}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={Boolean(
                                      errors.questions &&
                                        (errors.questions as FormikErrors<{ choice: string; feedback: string }>[])[
                                          idx
                                        ] &&
                                        (errors.questions as FormikErrors<{ choice: string; feedback: string }>[])[idx]
                                          .feedback &&
                                        touched.questions &&
                                        (touched.questions as FormikErrors<{ choice: string; feedback: string }>[])[
                                          idx
                                        ] &&
                                        (touched.questions as FormikErrors<{ choice: string; feedback: string }>[])[idx]
                                          .feedback
                                    )}
                                    variant="standard"
                                    margin="dense"
                                    fullWidth
                                  />
                                </Box>
                              </Box>
                            ))}
                            <Box>
                              <Button
                                color="secondary"
                                onClick={() => push({ choice: "", feedback: "", correct: false })}
                              >
                                <AddIcon sx={{ mr: "10px" }} />
                                Add choice
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </FieldArray>
                    </>
                  </Box>
                )}

                <TextField
                  id="title"
                  name="title"
                  label="Change the title"
                  variant="outlined"
                  margin="normal"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.title) && Boolean(touched.title)}
                  fullWidth
                />

                <TextField
                  id="content"
                  name="content"
                  label="Change the content"
                  variant="outlined"
                  margin="normal"
                  value={values.content}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(errors.content) && Boolean(touched.content)}
                  fullWidth
                  multiline
                  rows={4}
                />

                <Box>
                  <Typography component="h2" sx={{ fontSize: "30px", mb: "32px", mt: "10px" }}>
                    <MarkdownRender text={values.title} />
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    component="div"
                    sx={{
                      color: theme => theme.palette.common.black,
                      lineHeight: 2,
                      fontSize: "1.2rem",
                    }}
                  >
                    <MarkdownRender text={values.content} />
                  </Typography>
                </Box>

                {image}

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <NodeTypeIcon nodeType={node.nodeType} />
                  {node.changedAt && (
                    <Tooltip title={`Last updated on ${new Date(node.changedAt).toLocaleString()}`}>
                      <Typography sx={{ ml: 1 }} component="span" color="text.secondary" variant="caption">
                        {dayjs(new Date(node.changedAt)).fromNow()}
                      </Typography>
                    </Tooltip>
                  )}
                </Box>

                <Divider sx={{ my: "32px" }} />
                <Box>{tags}</Box>
                <Box>{references}</Box>
              </form>
            );
          }}
        </Formik>
      </CardContent>
    </Card>
  );
};
