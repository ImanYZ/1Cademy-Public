import { MemoizedNodeVideo } from "@/components/map/Node/NodeVideo";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getVideoDataByUrl } from "../utils";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

const NODE_INTERACTIONS_STEPS: TutorialStepConfig[] = [
  {
    title: "Node Interactions",
    description: (
      <MemoizedNodeVideo addVideo={true} videoData={getVideoDataByUrl("https://www.youtube.com/watch?v=rcOqKCGmljY")} />
    ),
    tooltipSize: "lg",
    tooltipPosition: "bottomLeft",
    anchor: "Portal",
  },
];

export const NODE_INTERACTIONS_CONFIG: TutorialStep[] = NODE_INTERACTIONS_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
