import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
//import { articleTypes } from "../../data/articleTypes";
import { Box } from "@mui/material";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import LinearProgress from "@mui/material/LinearProgress";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { TreeItem,TreeView } from "@mui/x-tree-view";
import React, { useEffect,useState } from "react";

import { sendMessageToChatGPT } from "../../services/openai";
//import { arraysAreEqual } from "@/lib/utils/utils";

type AcademicArticleCategory = {
  [key: string]: AcademicArticleCategory | string[];
};

// Utility function to convert camelCase text to space separated
const camelCaseToSpaces = (text: string): string => {
  return text
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, function (str) {
      return str.toUpperCase();
    });
};

const getPathFromArticleTypesObj = (responsePath: string[], articleTypes: any) => {
  function findPath(obj: any, path: any) {
    for (const key in obj) {
      if (typeof obj[key] === "object") {
        path.push(key);
        if (key === responsePath[responsePath.length - 2]) {
          return true;
        }
        if (findPath(obj[key], path)) {
          return true;
        }
        path.pop();
      }
    }
    return false;
  }

  let path = [responsePath[0]];
  if (!findPath(articleTypes[responsePath[0]], path)) {
    return [];
  }
  path.push(responsePath[responsePath.length - 1]);
  return path;
};

type DisciplinesCompProps = {
  allContent: string;
  articleTypePath: string[];
  setArticleTypePath: (path: string[]) => void;
  articleTypes: any;
};

const DisciplinesComp: React.FC<DisciplinesCompProps> = ({
  allContent,
  articleTypePath,
  setArticleTypePath,
  articleTypes,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // const compareResponsesOfGPRPrompts = async (prevResponse: any, newResponse: any, responses: any = []) => {
  //   if (responses.length === 4) return;
  //   responses = [...responses, prevResponse];
  //   const revisionPrompt = `I've written the following triple-quoted piece:
  //     '''
  //     ${allContent}
  //     '''
  //     Among the types of writing listed below, is "${newResponse}" the most appropriate type characterizing my written one?
  //     ${articleTypes}
  //     Respond only a JSON object with the path of the specific type of writing as an array: {"path": [an array of categories and sub-categories that end up with the chosen one]}.
  //     For example, if the writing is a "Research Article" in the "Computer Science" category under "Applied Sciences" under "Academic Articles", the response would be {"path": ["Academic Articles", "Applied Sciences", "Computer Science", "Research Article"]}
  //     If you think "${newResponse}" is the best type that characterizes my writing, respond the same path, otherwise respond the writing type path that best characterizes my writing.`;
  //   const revisionPromptResponse = await sendMessageToChatGPT([
  //     {
  //       role: "user",
  //       content: revisionPrompt,
  //     },
  //   ]);
  //   for (const prevResponse of responses) {
  //     if (arraysAreEqual(prevResponse, revisionPromptResponse.path)) {
  //       return revisionPromptResponse;
  //     }
  //   }
  //   await compareResponsesOfGPRPrompts(newResponse, revisionPromptResponse.path, responses);
  // };

  useEffect(() => {
    if (Object.keys(articleTypes).length === 0) return;
    const specifyArticleType = async () => {
      setLoading(true);
      const chatGPTMessages = [
        {
          role: "user",
          content: `The following is the content of an article I've written:
'''
${allContent}
'''
Which of the following types of articles is this?
${JSON.stringify(articleTypes, null, 2)}
Respond only a JSON object with the path of the specific type of article as an array: {"path": [an array of categories and sub-categories that end up with the chosen one]}.
For example, if the article is a "Research Article" in the "Computer Science" category under "Applied Sciences" under "Academic Articles", the response would be {"path": ["Academic Articles", "Applied Sciences", "Computer Science", "Research Article"]}`,
        },
      ];
      let articleTypePath = await sendMessageToChatGPT(chatGPTMessages);
      if (articleTypePath.path && articleTypePath.path.length > 0) {
        // const revisionPrompt = `I've written the following triple-quoted piece:
        // '''
        // ${allContent}
        // '''
        // Among the types of writing listed below, is "${articleTypePath.path}" the most appropriate type characterizing my written one?
        // ${articleTypes}
        // Respond only a JSON object with the path of the specific type of writing as an array: {"path": [an array of categories and sub-categories that end up with the chosen one]}.
        // For example, if the writing is a "Research Article" in the "Computer Science" category under "Applied Sciences" under "Academic Articles", the response would be {"path": ["Academic Articles", "Applied Sciences", "Computer Science", "Research Article"]}
        // If you think "${articleTypePath.path}" is the best type that characterizes my writing, respond the same path, otherwise respond the writing type path that best characterizes my writing.`;
        // const revisionPromptResponse = await sendMessageToChatGPT([
        //   {
        //     role: "user",
        //     content: revisionPrompt,
        //   },
        // ]);
        // if (!arraysAreEqual(articleTypePath.path, revisionPromptResponse.path)) {
        //   articleTypePath = await compareResponsesOfGPRPrompts(articleTypePath.path, revisionPromptResponse.path);
        // }
        //if (articleTypePath?.length === 0) console.error("GPT doesn't give the correct path");
        const path = getPathFromArticleTypesObj(articleTypePath.path, articleTypes);
        if (path.length === 0) specifyArticleType();
        setArticleTypePath(path);
      } else {
        const element = document.getElementById("loader-overlay") as HTMLElement;
        if (element) {
          element.style.display = "none";
        }
      }
      setLoading(false);
    };
    specifyArticleType();
  }, [allContent, articleTypes]);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTreeItemClick = (path: string[]) => {
    setArticleTypePath(path);
    handleClose();
  };

  const renderTree = (node: AcademicArticleCategory | string[], nodeId: string, path: string[]): JSX.Element => {
    if (Array.isArray(node)) {
      return (
        <>
          {node.map((item, index) => (
            <TreeItem
              key={`${nodeId}-${index}`}
              nodeId={`${nodeId}-${index}`}
              label={camelCaseToSpaces(item)}
              onClick={() => handleTreeItemClick([...path, item])}
            />
          ))}
        </>
      );
    } else {
      return (
        <>
          {Object.keys(node).map((key, index) => (
            <TreeItem key={`${nodeId}-${index}`} nodeId={`${nodeId}-${index}`} label={camelCaseToSpaces(key)}>
              {renderTree(node[key], `${nodeId}-${index}`, [...path, key])}
            </TreeItem>
          ))}
        </>
      );
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return loading ? (
    <LinearProgress sx={{ width: "80%" }} color="secondary" />
  ) : (
    <div>
      <Box aria-owns={open ? "click-popover" : undefined} aria-haspopup="true" onClick={handleClick}>
        <Breadcrumbs aria-label="breadcrumb">
          {articleTypePath.length === 0 ? (
            <Typography color="textPrimary">Select Category</Typography>
          ) : (
            articleTypePath.map((path, index) => (
              <Typography key={index} color="textPrimary">
                {camelCaseToSpaces(path)}
              </Typography>
            ))
          )}
        </Breadcrumbs>
      </Box>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          style={{ maxHeight: 400, overflowY: "auto", padding: "10px" }}
        >
          {renderTree(articleTypes, "0", [])}
        </TreeView>
      </Popover>
    </div>
  );
};

export default DisciplinesComp;
