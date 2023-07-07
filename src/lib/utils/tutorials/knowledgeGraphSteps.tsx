import { MemoizedNodeVideo } from "@/components/map/Node/NodeVideo";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getVideoDataByUrl } from "../utils";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

const KNOWLEDGE_GRAPH_STEPS: TutorialStepConfig[] = [
  {
    title: "The Knowledge Graph",
    description: (
      <MemoizedNodeVideo addVideo={true} videoData={getVideoDataByUrl("https://www.youtube.com/watch?v=CSO-TleAge0")} />
    ),
    tooltipPosition: "bottomLeft",
    anchor: "Portal",
  },

  {
    title: "The Knowledge Graph",
    description: (
      <MemoizedNodeVideo addVideo={true} videoData={getVideoDataByUrl("https://www.youtube.com/watch?v=OyUSCZ3YcCk")} />
    ),
    tooltipPosition: "bottomLeft",
    anchor: "Portal",
  },
];

export const KNOWLEDGE_GRAPH_CONFIG: TutorialStep[] = KNOWLEDGE_GRAPH_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
