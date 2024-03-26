import { Box, List, ListItem } from "@mui/material";
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
    <Box>
      <List>
        {issues.map((issue, index) => {
          return (
            <ListItem key={index}>
              {index + 1}- {issue}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default IssuesComp;
