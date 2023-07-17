import { MemoizedNodeVideo } from "@/components/map/Node/NodeVideo";
import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getVideoDataByUrl } from "../utils";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

const KNOWLEDGE_GRAPH_STEPS: TutorialStepConfig[] = [
  {
    title: "The Shared Knowledge Graph",
    description: (
      <MemoizedNodeVideo addVideo={true} videoData={getVideoDataByUrl("https://www.youtube.com/watch?v=CSO-TleAge0")} />
    ),
    tooltipSize: "lg",
    tooltipPosition: "bottomLeft",
    anchor: "Portal",
  },

  {
    title: "Notebook: Personalized Map View",
    description: (
      <MemoizedNodeVideo addVideo={true} videoData={getVideoDataByUrl("https://www.youtube.com/watch?v=OyUSCZ3YcCk")} />
    ),
    tooltipSize: "lg",
    tooltipPosition: "bottomLeft",
    anchor: "Portal",
  },
  {
    childTargetId: "toolbar-notebooks-button",
    title: "Switching Notebooks",
    description: (
      <MarkdownRender
        text={
          "Notebooks are personalized views of the knowledge graph. Below is a list of your notebooks, both created by you and shared with you. Switch to another notebook by clicking on it. Public notebook links allow others to view content without modification privileges. For collaborative editing such as adding/removing nodes, others must request edit access from you, granting of which is at your discretion."
        }
      />
    ),
    tooltipPosition: "top",
    anchor: "Portal",
    outline: "inside",
  },
  {
    childTargetId: "toolbar-notebooks-button",
    title: "Notebooks Options",
    description: (
      <MarkdownRender
        text={
          "You can also create new notebooks. The ellipsis next to each notebook allows you to rename, duplicate, or delete a notebook as well as copying a public URL to the notebook so you can share it with others."
        }
      />
    ),
    tooltipPosition: "top",
    anchor: "Portal",
    outline: "inside",
  },
];

export const KNOWLEDGE_GRAPH_CONFIG: TutorialStep[] = KNOWLEDGE_GRAPH_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
