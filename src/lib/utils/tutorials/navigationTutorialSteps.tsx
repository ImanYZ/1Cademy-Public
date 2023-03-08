import { Box, useTheme } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect } from "react";
import { useRive } from "rive-react";
import { TutorialState, TutorialStep, TutorialStepConfig } from "src/nodeBookTypes";

// import { RiveComponentMemoized } from "@/components/home/components/temporals/RiveComponentExtended";
import MarkdownRender from "@/components/Markdown/MarkdownRender";

// import { FullNodeData, NodeTutorialState, TutorialState } from "../../nodeBookTypes";
// import { INTERACTIVE_TUTORIAL_NOTEBOOK_NODES } from "../utils/interactiveTutorialNodes";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);
// const STEPS_LENGHT = 47; // 65

// const DISABLE_NOTEBOOK_OPTIONS = [
//   "TOOLBAR",
//   "SEARCHER_SIDEBAR",
//   "LIVENESS_BAR",
//   "COMMUNITY_LEADERBOARD",
//   "SCROLL_TO_NODE_BUTTON",
//   "FOCUS_MODE_BUTTON",
// ];

/**
EX: for notebook sections
 "TOOLBAR", "01", "LIVENESS_BAR", "COMMUNITY_LEADERBOARD", "SCROLL_TO_NODE_BUTTON", "FOCUS_MODE_BUTTON"
Ex for Node id elements to disable
  "01-close-button",
  "01-open-button",
  "01-hide-offsprings-button",
  "01-hide-button",
  "01-node-footer-user",
  "01-node-footer-propose",
  "01-node-footer-downvotes",
  "01-node-footer-upvotes",
  "01-node-footer-tags-citations",
  "01-button-parent-children",
  "01-node-footer-ellipsis",
  "01-reference-button-0"
  "01-tag-button-0"
  "01-node-footer-menu"
 */
const RiveComponentAnimated = ({ src, artboard, animations, autoplay }: any) => {
  const theme = useTheme();
  const { rive, RiveComponent } = useRive({
    src,
    artboard,
    animations: [theme.palette.mode],
    autoplay,
  });
  useEffect(() => {
    if (!rive) return;
    rive.load({ src, artboard, animations: [theme.palette.mode], autoplay });
  }, [animations, artboard, autoplay, rive, src, theme.palette.mode]);

  return <RiveComponent className={`rive-canvas`} />;
};
const NAVIGATION_STEPS: TutorialStepConfig[] = [
  {
    title: "Panning",
    description: (
      <>
        <MarkdownRender
          text={
            "You can manipulate your field of view by panning the screen by sliding two fingers on the trackpad or clicking, sliding with either a finger or the mouse."
          }
        />
        <Box width="380px" height="200px" m="0 auto" mt="8px">
          <RiveComponentAnimated
            src="rive-tutorial/panning.riv"
            artboard="New Artboard"
            animations={["Timeline 1"]}
            autoplay={true}
          />
        </Box>
      </>
    ),
    tooltipPosition: "bottomLeft",
    anchor: "Portal",
  },
  {
    title: "Zooming In and Zooming out",
    description: (
      <>
        <MarkdownRender
          text={
            "To **zoom in**, you can slide two fingers away from each other on the track pad or press control (command Mac) + and To **zoom out**, you can slide to fingers toward each other on the track or press control (command Mac) -"
          }
        />
        <Box width="380px" height="200px" m="0 auto" mt="8px">
          <RiveComponentAnimated
            src="rive-tutorial/zooming.riv"
            artboard="New Artboard"
            animations={["Timeline 1"]}
            autoplay={true}
          />
        </Box>
      </>
    ),
    tooltipPosition: "bottomLeft",
    anchor: "Portal",
  },
  // {
  //   title: "Navigaton: Zoom Out",
  //   description: (
  //     <MarkdownRender
  //       text={"To zoom out, you can slide to fingers toward each other on the track or press control (command Mac) -"}
  //     />
  //   ),
  //   tooltipPosition: "bottomLeft",
  //   anchor: "Portal",
  // },
];

export const NAVIGATION_STEPS_COMPLETE: TutorialStep[] = [...NAVIGATION_STEPS].map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
