import MarkdownRender from "../../../components/Markdown/MarkdownRender";
import { TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

const TABLE_CONTENT_STEPS: TutorialStepConfig[] = [
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
    tooltipPosition: "bottom",
  },
  {
    title: "Tutorial Table of Contents",
    childTargetId: "ComLeaderboardMinimizer",
    description: (
      <MarkdownRender
        text={
          "For reviewing the interactive and organized set of tutorials of each feature you will need to click this button. For reviewing the interactive and organized set of tutorials of each feature you will need to click this button.For reviewing the interactive and organized set of tutorials of each feature you will need to click this button.For reviewing the interactive and organized set of tutorials of each feature you will need to click this button."
        }
      />
    ),
    anchor: "Portal",
    isClickeable: true,
    tooltipPosition: "left",
  },
  {
    title: "Tutorial Table of Contents",
    childTargetId: "toolbar-profile-button",
    description: (
      <MarkdownRender
        text={
          "For reviewing the interactive and organized set of tutorials of each feature you will need to click this button. For reviewing the interactive and organized set of tutorials of each feature you will need to click this button.For reviewing the interactive and organized set of tutorials of each feature you will need to click this button.For reviewing the interactive and organized set of tutorials of each feature you will need to click this button."
        }
      />
    ),
    anchor: "Portal",
    isClickeable: true,
    tooltipPosition: "right",
  },

  {
    title: "Tutorial Table of Contents",
    childTargetId: "toolbox-table-of-contents",
    description: (
      <MarkdownRender
        text={
          "For reviewing the interactive and organized set of tutorials of each feature you will need to click this button. For reviewing the interactive and organized set of tutorials of each feature you will need to click this button.For reviewing the interactive and organized set of tutorials of each feature you will need to click this button.For reviewing the interactive and organized set of tutorials of each feature you will need to click this button."
        }
      />
    ),
    anchor: "Portal",
    isClickeable: true,
    tooltipPosition: "bottom",
  },
];

export const TABLE_CONTENT_STEPS_COMPLETE: TutorialStep[] = TABLE_CONTENT_STEPS.map((c, i, s) => {
  return { ...getBaseStepConfig(i + 1, s.length), ...c };
});
