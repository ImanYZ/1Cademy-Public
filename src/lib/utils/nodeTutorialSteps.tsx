import { Typography } from "@mui/material";

import { Step } from "../../hooks/useInteractiveTutorial";

export const NODE_STEPS: Step[] = [
  // {
  //   targetId: "01",
  //   title: "Nodes",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       We are familiar with nodes and their main content, but it is important to learn about their header and footer to
  //       understand how you can manipulate the map and interact with the nodes.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },

  // {
  //   targetId: "01",
  //   childTargetId: "01-node-header",
  //   title: "Nodes - Node Header",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       Node headers are one of the ways that you can manipulate what you see on the knowledge graph.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-header",
  //   title: "Nodes - Node Header",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       In the header are four buttons.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-hiden-button",
  //   title: "Nodes - Node Header",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       This one, which we looked at earlier closes the node. Once again, it just removes it from your view, it does not
  //       delete the node from the platform.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-hide-offsprings-button",
  //   title: "Nodes - Node Header",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       This one closes all the open children nodes of the node it is clicked on.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-close-button",
  //   title: "Nodes - Node Header",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       This one minimizes the content in a node so only the title is displayed.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // // // ---------------------------------------------------------------
  // // Nodes -body
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-title",
  //   title: "Nodes - Node Body",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       Each node has a body that consists of a title and content.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-title",
  //   title: "Nodes - Node Title",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       This is the title.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-title",
  //   title: "Nodes Body - Node Title",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       We want a title that is concise and accurately describes the information within.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-title",
  //   title: "Nodes Body - Node Title",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       This means that you need to consider if the title is duplicated or would likely be duplicated.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-title",
  //   title: "Nodes Body - Node Title",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       For example, <b>“growth”</b> could be used in a number of titles in a number of subjects. Are we talking about
  //       an organism growing, a population growing, or economic growth? Make sure the title addresses what is
  //       specifically being discussed.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-content",
  //   title: "Node Body - Node Content",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       This is the content.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-content",
  //   title: "Node Body - Node Content",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       The content of a node describes what is stated in a title.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-content",
  //   title: "Node Body - Node Content",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       We want the content to be clear, concise, and accurate.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-content",
  //   title: "Node Content - Markdown",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       Beyond normal written content, nodes accept basic markdown to make text bold or italic, and to produce ordered
  //       and unordered lists.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-content",
  //   title: "Node Content - Markdown",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       For <b>bold text</b> you place two stars before and after the text you would like to make bold.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-content",
  //   title: "Node Content - Markdown",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       For <i>italicized text</i> you place one star before and after the text you would like to make italicized.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-content",
  //   title: "Node Content - Markdown",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       For an ordered list you type the number, a period, and then a space before each listed item. Listed items are
  //       placed on their own line.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-content",
  //   title: "Node Content - Markdown",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       for an unordered list you type a dash and a space before each listed item. Listed items are placed on their own
  //       line.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-content",
  //   title: "Node Content - Math jax",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       You can also use math jax to create mathematical formulas.
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-node-content",
  //   title: "Node Content - Math jax",
  //   description: (
  //     <Typography variant="body1" sx={{ mb: "16px" }}>
  //       To learn more about how to write mathematical formulas look at this page:
  //       <br />
  //       <Link
  //         href="https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference"
  //         target={"_blank"}
  //         rel={"noReferrer"}
  //       >
  //         https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference
  //       </Link>
  //     </Typography>
  //   ),
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  {
    targetId: "01",
    childTargetId: "01-node-footer",
    title: "Nodes - Node Footer",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        The node footer has many icons
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-user",
    title: "Nodes - Node Footer",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        The first is the profile of the top contributor to the node. That is the person that has done the most to make
        the node in its present form.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-type",
    title: "Nodes - Node Footer",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        The next one indicates what type of node it is, this one is a concept node.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-timestamp",
    title: "Nodes - Node Footer",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        The third icon indicates when the latest version of the node was adopted, this one was approved __days ago.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-propose",
    title: "Nodes - Node Footer",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        The fourth icon is the purpose/evaluate versions of this node button.This allows you to edit the node or add
        children nodes to it.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-votes",
    title: "Nodes - Node Footer",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        The next two icons are the downvote and upvote buttons, which also display each number of votes the node has
        received.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-votes",
    title: "Node Footer - Up/Down Votes",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        Upvoting and downvoting nodes play an important role in ensuring the quality of content on 1Cademy. In effect
        you are voting on the usefulness of a node.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-downvotes",
    title: "Node Footer - Down votes",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        A downvote is infact a vote to remove a node
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-upvotes",
    title: "Node Footer - Up votes",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        An upvote is a vote to not change a node
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-votes",
    title: "Node Footer - Up/Down Votes",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        When a ratio with a high enough number of downvotes to upvotes is reached a node can be deleted.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-votes",
    title: "Node Footer - Up/Down Votes",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        The difference of upvotes and downvotes, called net vote, also determines how many or few approving votes a
        proposal will need to change the node. This will be discussed further later on.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-tags-citations",
    title: "Node Footer - Tag and Citation",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        The next icons are on a single button and represent the tag and citation for a node.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-tags-citations",
    title: "Node Footer - Tag and Citation",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        if you press this button the bottom of the node expands and shows the source for the content in the node on the
        left and the tags for the node on the right.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-button-parent-children",
    title: "Node Footer - Parent and Children",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        The next icon is for parent and child nodes.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-button-parent-children",
    title: "Node Footer - Parent and Children",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        If you press this button, the bottom will expand and you will see parent nodes on the left and child nodes on
        the right.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-button-parent-children",
    title: "Node Footer - Parent and Children",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        You can click on either the parent or child nodes to open them in the graph.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-ellipsis",
    title: "Node Footer - Other Options",
    description: (
      <Typography variant="body1" sx={{ mb: "16px" }}>
        Finally the ellipses icon can be clicked to open a few other options.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-ellipsis",
    title: "Node Footer - Studied or Bookmarked",
    description: (
      // <Typography variant="body1" sx={{ mb: "16px" }}>
      //   You can mark a node as studied or bookmarked here.
      // </Typography>
      <Typography variant="body1" sx={{ mb: "16px" }}>
        Your can mark a node as studied or bookmarked here.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-ellipsis",
    title: "Node Footer - Studied or Bookmarked",
    description: (
      // <Typography variant="body1" sx={{ mb: "16px" }}>
      //   You can mark a node as studied or bookmarked here.
      // </Typography>
      <Typography variant="body1" sx={{ mb: "16px" }}>
        You can also have the node narrated for you.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  {
    targetId: "01",
    childTargetId: "01-node-footer-ellipsis",
    title: "Node Footer - Studied or Bookmarked",
    description: (
      // <Typography variant="body1" sx={{ mb: "16px" }}>
      //   You can mark a node as studied or bookmarked here.
      // </Typography>
      <Typography variant="body1" sx={{ mb: "16px" }}>
        Finally, you can share the node to Twitter, Reddit, Facebook, or Linkedin.
      </Typography>
    ),
    tooltipPos: "top",
    anchor: "",
    disabledElements: [],
  },
  // NodeFooter

  // // content.
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node Body - Content",
  //   description: "The content of a node describes what is stated in a title",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node Body - Content",
  //   description: "We want the content to be clear, concise, and accurate",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },
  // // tools to write title and content
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node - Node Body",
  //   description:
  //     "Beyond normal written content, nodes accept basic markdown to make text bold or italic, and to produce ordered and unordered lists. ",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node - Node Body",
  //   description: "For bold text you place two stars before and after the text you would like to make bold.",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node - Node Body",
  //   description: "For italicized text you place one star before and after teh text you would like to make italicized.",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node - Node Body",
  //   description:
  //     "For an ordered list you type the number, a period, and then a space before each listed item. Listed items are placed on their own line.",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node - Node Body",
  //   description:
  //     "for an unordered list you type a dash and a space before each listed item. Listed items are placed on their own line. ",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node - Node Body",
  //   description: "You can also use math jax to create mathematical formulas.",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node - Node Body",
  //   description:
  //     "To learn more about how to write mathematical formulas look at this page: https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference ",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },

  // // ---------------------------------------------------------------
  // // Nodes - Footer
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node - Node Footer",
  //   description: "The node footer has many icons.",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node - Node Footer",
  //   description:
  //     "The first is the profile of the top contributor to the node. That is the person that has done the most to make the node in its present form.",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "user-settings-picture",
  //   title: "Node - Node Footer",
  //   description:
  //     "The first is the profile of the top contributor to the node. That is the person that has done the most to make the node in its present form.",
  //   tooltipPos: "right",
  //   anchor: "portal",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   title: "Welcome to the Essentials I Tutorial!",
  //   description:
  //     "This tutorial will teach you what nodes are and how they work on 1Cademy Read the content of the node and then click Next to continue.",
  //   tooltipPos: "top",
  //   anchor: "",
  //   callback: () => console.log("cb: scroll to Node"),
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-content",
  //   title: "Introduction",
  //   description:
  //     "This is the content of a node. This is where the concept in the title is described in a granular fashion. ",
  //   tooltipPos: "right",
  //   anchor: "",
  //   callback: () => console.log("cb: expand Node"),
  //   disabledElements: [""],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-button-parent-children",
  //   title: "Basic Navigation: Parent Nodes",
  //   description: "Most nodes have parents and children. They can be seen by clicking this button",
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-parents-list",
  //   title: "Basic Navigation: Parent Nodes",
  //   description: "You can see the parent node(s) listed below in this panel",
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-parent-button-0",
  //   title: "Basic Navigation: Parent Nodes",
  //   description: "By clicking a title, we are taken to the parent node.",
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-children-list",
  //   title: "Basic Navigation: Child Nodes",
  //   description: "You can see the children nodes listed below in this panel.",
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "01",
  //   childTargetId: "01-child-button-0",
  //   title: "Basic Navigation: Child Nodes",
  //   description: "By clicking a title, we are taken to the child node.",
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "02",
  //   title: "Basic Navigation: Learning Pathway",
  //   description: "We can keep opening children or parent nodes to create chains or branches of nodes",
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "03",
  //   title: "Basic Navigation: Learning Pathway",
  //   description: "These are learning pathways, and we can use these to follow information from basic to advanced",
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "03",
  //   childTargetId: "03-hiden-button",
  //   title: "Basic Navigation: Learning Pathway",
  //   description:
  //     "While we hide open a lot of nodes, it is important to try to keep your map tidy and close unused nodes.",
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "02",
  //   childTargetId: "02-hiden-button",
  //   title: "Basic Navigation: Learning Pathway",
  //   description: "hide nodes does not delete them, it only means they are not displayed currently",
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
  // {
  //   targetId: "02",
  //   childTargetId: "02-close-button",
  //   title: "Basic Navigation: Learning Pathway",
  //   description: "hide nodes does not delete them, it only means they are not displayed currently",
  //   tooltipPos: "top",
  //   anchor: "",
  //   disabledElements: [],
  // },
];
