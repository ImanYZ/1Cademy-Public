import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const TABLE_CONTENT_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "Tutorial Table of Contents",
    childTargetId: "toolbox-table-of-contents",
    description: (
      <MarkdownRender
        text={
          "You can click this button to view a full list of the tutorials for 1Cademy. It indicates which ones you have and have not completed. You can click on any of the listed tutorials to take them again if you need a refresher on any of 1Cademy’s features."
        }
      />
    ),
    anchor: "Portal",
    isClickeable: true,
    targetDelay: 700,
    tooltipPosition: "bottom",
  },
];

const FOCUS_MODE_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "Focus Mode",
    childTargetId: "toolbox-focus-mode",
    description: (
      <MarkdownRender
        text={
          "If you click this button it will change the presentation format. Rather than looking at a full graph of the nodes you have open, it will focus on one node at a time and prived a linear route of going to parent or child nodes one at a time."
        }
      />
    ),
    anchor: "Portal",
    isClickeable: true,
    targetDelay: 800,
    tooltipPosition: "bottom",
  },
];

const REDRAW_GRAPH_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "Redraw Graph",
    childTargetId: "toolbox-redraw-graph",
    description: (
      <MarkdownRender
        text={
          "If you click this button it will redraw your graph. This is like refreshing the page and helps correct any issues where nodes have become misaligned. The graph that is redrawn will contain all the nodes that you previously had open."
        }
      />
    ),
    anchor: "Portal",
    isClickeable: true,
    targetDelay: 800,
    tooltipPosition: "bottom",
  },
];

const SCROLL_TO_NODE_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "Scroll to Node",
    childTargetId: "toolbox-scroll-to-node",
    description: (
      <MarkdownRender
        text={
          "If you click this button it will automatically scroll to the last node that you interacted with. This can help you find where you previously where if you get a little lost while navigating around nodes."
        }
      />
    ),
    anchor: "Portal",
    isClickeable: true,
    targetDelay: 800,
    tooltipPosition: "bottom",
  },
];

export const TABLE_CONTENT_STEPS: TutorialStep[] = TABLE_CONTENT_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const FOCUS_MODE_STEPS: TutorialStep[] = FOCUS_MODE_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const REDRAW_GRAPH_STEPS: TutorialStep[] = REDRAW_GRAPH_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});

export const SCROLL_TO_NODE_STEPS: TutorialStep[] = SCROLL_TO_NODE_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
