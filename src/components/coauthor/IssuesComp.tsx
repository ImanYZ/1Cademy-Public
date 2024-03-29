import { Box, Paper } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import { sendMessageToChatGPT } from "../../services/openai";

interface Props {
  allContent: string;
  articleTypePath: string[];
  recommendedSteps: string[];
  selectedStep: string | null;
  issues: string[];
  setIssues: Dispatch<SetStateAction<string[]>>;
}

const IssuesComp: React.FC<Props> = ({
  allContent,
  articleTypePath,
  recommendedSteps,
  selectedStep,
  issues,
  setIssues,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        setLoading(true);
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
${selectedStep || recommendedSteps.join(",")}
You are one of the coauthors. We need your help to identify the issues in the article. Please read the article and identify all possible issues that you see in the article. Each issue should be a long string about a single issue with detailed explanations.
Respond a JSON object with the following structure:
{
   "issues": [An array of all possible issues that you see in the article. Each array element should be a long string about a single issue with detailed explanation.],
   "message": "Your message to the other coauthors in the team."
}`,
          },
        ];
        const issues = await sendMessageToChatGPT(chatGPTMessages);
        setIssues(issues.issues);
      } catch (error) {
        console.error("Failed to fetch or process instructions:", error);
      }
      setLoading(false);
    };

    fetchInstructions();
  }, [allContent, articleTypePath, selectedStep]);

  return loading ? (
    <LinearProgress color="secondary" />
  ) : (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {issues.map((issue, index) => {
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
