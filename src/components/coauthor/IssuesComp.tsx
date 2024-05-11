import { Box, Paper } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import { sendMessageToChatGPT } from "../../services/openai";

interface Props {
  allContent: string;
  articleTypePath: string[];
  recommendedSteps: string[];
  selectedStep: string | null;
  issues: string[];
  setIssues: Dispatch<SetStateAction<string[]>>;
  selectedArticle: any;
  expandedIssue: any;
  setExpandedIssue: any;
}

const IssuesComp: React.FC<Props> = ({
  allContent,
  articleTypePath,
  recommendedSteps,
  selectedStep,
  issues,
  setIssues,
  selectedArticle,
  expandedIssue,
  setExpandedIssue,
}) => {
  const db = getFirestore();
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchInstructions = async () => {
      if (!selectedArticle?.aSteps) return;
      try {
        setLoading(true);
        let issues: any = selectedArticle?.issues;
        if (!issues) {
          issues = await getIssues();
        }
        setIssues(issues.issues);
      } catch (error) {
        console.error("Failed to fetch or process instructions:", error);
      }
      setLoading(false);
    };

    fetchInstructions();
  }, [allContent, articleTypePath, selectedStep]);

  const getIssues = async () => {
    const chatGPTMessages = [
      {
        role: "user",
        content: `The following is the content of our ${articleTypePath.slice(2).reverse().join(" of ")}:
        '''
        ${allContent}
        '''
        We're currently at the following stage:
        '''
        ${JSON.stringify(recommendedSteps)}
        '''
        You are one of the coauthors.
        ${
          selectedArticle?.priorReviews
            ? "We have received the following reviews:\n'''\n" +
              selectedArticle?.priorReviews +
              "\n'''\n We need your help to synthesize and classify the issues discussed in these reviews, in addition to all other possible issues that you see in our writing. "
            : "We need your help to identify the issues in our writing. Please read it carefully and identify all possible issues that you see in our writing. "
        }
        Respond a JSON object with the following structure:
        ${
          selectedArticle?.priorReviews
            ? "{\n" +
              '"issues": [An array of all possible issues that you see in the article. Each array element should be an object with the following structure]:\n' +
              "   {\n" +
              '   "issue": "A long string about a single issue with detailed explanation.",\n' +
              '   "sentences": [An array of sentences from the reviews based on which you defined this issue.]\n' +
              "   },\n" +
              '"message": "Your message to the other coauthors in the team."\n' +
              "}"
            : "{\n" +
              '"issues": [An array of all possible issues that you see in the article. Each array element should be a long string about a single issue with detailed explanation.],\n' +
              '"message": "Your message to the other coauthors in the team."\n' +
              "}"
        }`,
      },
    ];

    const issues = await sendMessageToChatGPT(chatGPTMessages);
    await updateDoc(doc(db, "articles", selectedArticle.id), { issues });
    return issues;
  };

  return loading ? (
    <LinearProgress color="secondary" />
  ) : (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {issues.map((issue: any, index: any) => {
        if (issue instanceof Object) {
          issue = issue.issue;
        }
        return (
          <Paper
            key={index}
            onClick={() => setExpandedIssue(index)}
            elevation={3}
            className="CollapsedProposal collection-item avatar"
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: { xs: "5px 10px", sm: "15px" },
              borderRadius: "8px",
              boxShadow: theme =>
                theme.palette.mode === "light"
                  ? "0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1)"
                  : undefined,
              cursor: "auto!important",
              background: theme => (theme.palette.mode === "dark" ? "#242425" : "#F2F4F7"),
              ":hover": {
                background: theme => (theme.palette.mode === "dark" ? "#2F2F2F" : "#EAECF0"),
              },
            }}
          >
            {expandedIssue === index ? issue : issue.substring(0, 100) + "..."}
          </Paper>
        );
      })}
    </Box>
  );
};

export default IssuesComp;
