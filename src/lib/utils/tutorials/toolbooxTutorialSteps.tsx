import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const TOOLBOX_STEPS_CONFIG: TutorialStepConfig[] = [
  {
    title: "Tutorial Table of Contents",
    childTargetId: "toolbox-table-of-contents",
    description: (
      <MarkdownRender
        text={
          "You can click this button to view a full list of the 1Cademy tutorials. It indicates which ones you have or have not completed. You can click any of the listed tutorial steps to review them if you need a refresher on any of the 1Cademy’s tools or features."
        }
      />
    ),
    anchor: "Portal",
    isClickable: true,
    tooltipPosition: "bottom",
  },
  {
    title: "Focus Mode",
    childTargetId: "toolbox-focus-mode",
    description: (
      <MarkdownRender
        text={
          "If you click this button it will change the presentation format. Rather than looking at a full graph of the nodes you have open, it will focus on one node at a time and provide a linear route of going to parent or child nodes one at a time."
        }
      />
    ),
    anchor: "Portal",
    isClickable: true,
    // targetDelay: 800,
    tooltipPosition: "bottom",
  },
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
    isClickable: true,
    // targetDelay: 800,
    tooltipPosition: "bottom",
  },
  {
    title: "Scroll to Node",
    childTargetId: "toolbox-scroll-to-node",
    description: (
      <MarkdownRender
        text={
          "If you click this button it will automatically scroll to the last node that you interacted with. This can help you find where you previously were if you get a little lost while navigating around nodes."
        }
      />
    ),
    anchor: "Portal",
    isClickable: true,
    // targetDelay: 800,
    tooltipPosition: "bottom",
  },
];

export const TOOLBOX_STEPS: TutorialStep[] = TOOLBOX_STEPS_CONFIG.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
