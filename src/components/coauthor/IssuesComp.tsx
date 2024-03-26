import { Box, List, ListItem } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import React, { useEffect,useState } from "react";

import { sendMessageToChatGPT } from "../../services/openai";

interface Props {
  allContent: string;
  articleTypePath: string[];
  recommendedSteps: string[];
  selectedStep: string | null;
}

const IssuesComp: React.FC<Props> = ({ allContent, articleTypePath, recommendedSteps, selectedStep }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [issues, setIssues] = useState<string[]>([]);
  useEffect(() => {
    const fetchInstructions = async () => {
      try {
        setLoading(true);
        const chatGPTMessages = [
          {
            role: "user",
            content: `You are one of the coauthors of the following
              ${articleTypePath}
              :\n
              '''\n
              ${allContent}
              \n'''\n +
              The coauthors are at the following stage of writing:\n
              ${selectedStep || recommendedSteps.join(",")}
              \nRespond a JSON object with the following structure:\n
              {\n
              '   "issues": [An array of all possible issues that you see in the article. Each array element should be a long string about a single issue with detailed explanations.],\n'
              '   "message": "Your message to the other coauthors in the team."\n'
              "}`,
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
