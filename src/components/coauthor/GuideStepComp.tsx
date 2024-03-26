import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinearProgress from "@mui/material/LinearProgress";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { TreeItem,TreeView } from "@mui/x-tree-view";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import React, { useEffect,useState } from "react";

import { sendMessageToChatGPT } from "../../services/openai";

interface Step {
  name: string;
  description: string;
  accomplished: boolean;
  steps: Step[];
}

interface Props {
  allContent: string;
  articleTypePath: string[];
  recommendedSteps: string[];
  setRecommendedSteps: (path: string[]) => void;
  setSelectedStep: any;
}

const GuideStepComp: React.FC<Props> = ({
  allContent,
  articleTypePath,
  recommendedSteps,
  setRecommendedSteps,
  setSelectedStep,
}) => {
  const db = getFirestore();
  const [data, setData] = useState<Step[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [popoverText, setPopoverText] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchInstructions = async () => {
      try {
        setLoading(true);
        let docPath = articleTypePath.join("/");
        if (articleTypePath.length % 2 === 0) {
          const lastIndex = docPath.lastIndexOf("/");
          docPath = docPath.substring(0, lastIndex) + "-" + docPath.substring(lastIndex + 1);
        }
        const docRef = doc(db, "instructions", docPath);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && isMounted) {
          const theSteps = docSnap.data().steps;
          const docDescriptivePath = articleTypePath.slice(2).reverse().join(" of ");

          const chatGPTMessages = [
            {
              role: "user",
              content: `The following is the content of a ${docDescriptivePath} I've written:
'''
${allContent}
'''
Which of the following steps and sub-steps in writing the ${docDescriptivePath} have I already accomplished?
${JSON.stringify(theSteps, null, 2)}
Note that before accomplishing any step/sub-steps, I'm supposed to accomplish all its previous steps/sub-steps. So, don't include a step/sub-steps if I haven't accomplished all its previous steps/sub-steps.
Each step also has some sub-steps. If I've accomplished a step, I've also accomplished all its sub-steps. If I haven't accomplished some sub-steps of a step, I haven't accomplished the step either.
Respond only a JSON object with the structure: {"names": [an array of only the names of the steps/sub-steps I've already accomplished]}.`,
            },
          ];
          const aSteps = await sendMessageToChatGPT(chatGPTMessages);
          if (isMounted) {
            if (aSteps.names && aSteps.names.length > 0) {
              const updatedSteps = specifyAccomplishments(theSteps, aSteps.names);
              setData(updatedSteps);
              setRecommendedSteps(specifyRecommendations(updatedSteps));
              const element = document.getElementById("loader-overlay") as HTMLElement;
              if (element) {
                element.style.display = "none";
              }
            }
          }
        } else if (!docSnap.exists()) {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Failed to fetch or process instructions:", error);
      }
      setLoading(false);
    };

    fetchInstructions();

    return () => {
      isMounted = false; // Cleanup to prevent setting state on unmounted component
    };
  }, [allContent, articleTypePath]);

  const specifyAccomplishments = (theSteps: Step[], names: string[]): Step[] => {
    return theSteps.map(step => {
      const updatedSubsteps = specifyAccomplishments(step.steps, names);
      return {
        ...step,
        accomplished:
          names.includes(step.name) ||
          (step.steps && step.steps.length > 0 && updatedSubsteps.every(subStep => names.includes(subStep.name))),
        steps: updatedSubsteps,
      };
    });
  };

  interface Result {
    parentStep: string;
    nextStep: string;
  }

  const specifyRecommendations = (updatedSeps: Step[]) => {
    let result: Result = { parentStep: "", nextStep: "" };

    function traverse(steps: Step[], parent: string = "") {
      for (let step of steps) {
        if (!step.accomplished) {
          // If the step has sub-steps, go deeper
          if (step.steps && step.steps.length > 0) {
            traverse(step.steps, step.name);
          }
          // If this step is not accomplished and we haven't found the nextStep yet, set it
          if (!result.nextStep) {
            result = {
              parentStep: parent, // This will be null for top-level unaccomplished steps
              nextStep: step.name,
            };
          }
          return; // Stop the search as we found the next unaccomplished step
        }
      }
    }

    traverse(updatedSeps);

    return [result.parentStep, result.nextStep];
  };

  // const handleNodeSelect = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, nodeId: string) => {
  //   const node = findNodeById(data, nodeId);
  //   if (node) {
  //     setAnchorEl(event.currentTarget);
  //     setPopoverText(node.description);
  //   }
  // };

  // const findNodeById = (steps: Step[], nodeId: string): Step | null => {
  //   for (const step of steps) {
  //     if (step.name === nodeId) return step;
  //     const found = findNodeById(step.steps, nodeId);
  //     if (found) return found;
  //   }
  //   return null;
  // };

  const renderTree = (nodes: Step[]) =>
    nodes.map(node => (
      <TreeItem
        key={node.name}
        nodeId={node.name}
        label={
          <div
            onClick={event => handleLabelClick(event, node)}
            style={{
              color: node.accomplished ? "green" : recommendedSteps.includes(node.name) ? "orange" : "inherit",
              cursor: "pointer",
            }}
          >
            {node.name}
          </div>
        }
      >
        {Array.isArray(node.steps) ? renderTree(node.steps) : null}
      </TreeItem>
    ));

  const handleLabelClick = (event: React.MouseEvent<HTMLDivElement>, node: Step) => {
    event.preventDefault(); // Prevent TreeItem expansion
    setAnchorEl(event.currentTarget);
    setPopoverText(node.description);
    setSelectedStep(node.name);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return loading ? (
    <LinearProgress color="secondary" />
  ) : (
    <div>
      <TreeView defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />} multiSelect>
        {renderTree(data)}
      </TreeView>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Typography sx={{ p: 2 }}>{popoverText}</Typography>
      </Popover>
    </div>
  );
};

export default GuideStepComp;
