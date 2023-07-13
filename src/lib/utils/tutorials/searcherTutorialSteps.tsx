import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import MarkdownRender from "@/components/Markdown/MarkdownRender";

import { TutorialState, TutorialStep, TutorialStepConfig } from "../../../nodeBookTypes";
import { getBaseStepConfig } from "./tutorial.utils";

export const INITIAL_NODE_TUTORIAL_STATE: TutorialState = null;

dayjs.extend(relativeTime);

const NODES_STEPS: TutorialStepConfig[] = [
  {
    // targetId: "sidebar-wrapper-searcher",
    childTargetId: "sidebar-wrapper-searcher",
    title: "Search Engine",
    description: (
      <MarkdownRender
        text={
          "1Cademy has a search engine that can be used to help you find nodes in its databse, based on tags, filters, and queries."
        }
      />
    ),
    tooltipPosition: "right",
    anchor: "Portal",
    outline: "inside",
  },

  {
    // targetId: "sidebar-wrapper-searcher",
    childTargetId: "search-input",
    title: "Search Query",
    description: <MarkdownRender text={"To search, simply enter what you're looking for."} />,
    tooltipPosition: "bottom",
    targetDelay: 10,
    anchor: "Portal",
  },

  {
    // targetId: "sidebar-wrapper-searcher",
    childTargetId: "SearchIcon",
    title: "How to Search",
    description: <MarkdownRender text={"To start searching, **Click** this icon."} />,
    tooltipPosition: "bottom",
    isClickable: true,
    anchor: "Portal",
  },
  {
    // targetId: "sidebar-wrapper-searcher",
    childTargetId: "searcher-sidebar-options",
    title: "Options",
    description: <MarkdownRender text={"There are a number of ways to refine your search."} />,
    tooltipPosition: "bottom",
    anchor: "Portal",
    outline: "inside",
  },
  {
    // targetId: "sidebar-wrapper-searcher",
    childTargetId: "searcher-tags-button",
    title: "Filter by Tags",
    description: (
      <MarkdownRender
        text={
          "Click this icon to refine your search to one or more selected tags that represents knowledge domains, communities, courses, and chapters."
        }
      />
    ),
    tooltipPosition: "bottom",
    anchor: "Portal",
  },
  {
    // targetId: "sidebar-wrapper-searcher",
    childTargetId: "search-sort-options",
    title: "Sort Options",
    description: (
      <MarkdownRender
        text={
          "By clicking this icon, you can sort the search results by: last viewed, date modified, proposals, upvotes, downvotes, and net votes."
        }
      />
    ),
    tooltipPosition: "bottom",
    anchor: "Portal",
  },
  {
    // targetId: "sidebar-wrapper-searcher",
    childTargetId: "search-filter-options",
    title: "Filter by Dates",
    description: (
      <MarkdownRender text={"You can also refine your search by how recently nodes were created or edited."} />
    ),
    tooltipPosition: "bottom",
    anchor: "Portal",
  },
  {
    // targetId: "sidebar-wrapper-searcher",
    childTargetId: "sidebar-wrapper-searcher-content",
    title: "Search Results",
    description: (
      <MarkdownRender
        text={
          "This list would show your search results. Clicking each item would open the node in your current notebook and pan to show you that node."
        }
      />
    ),
    tooltipPosition: "top",
    anchor: "Portal",
    outline: "inside",
  },
];

export const SEARCHER_STEPS_COMPLETE: TutorialStep[] = NODES_STEPS.map((c, i, s) => {
  return {
    ...getBaseStepConfig(i + 1, s.length),
    ...c,
  };
});
