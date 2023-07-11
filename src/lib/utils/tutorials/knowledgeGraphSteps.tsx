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
          "Notebooks are personalized views of the knowledge graph that are stored, can be switched between, and can be shared with others. Here you can find the list of the notebooks you have created or shared with you. You can switch to another notebook by simply clicking it. If you share the public link to a notebook with others, they can only navigate through its content, without being able to modify it. If they like to collaboratively add/remove nodes in the notebook, they would send you an edit access and you can decide whether to grant that access to them."
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
