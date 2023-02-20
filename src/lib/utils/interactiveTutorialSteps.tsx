import { Step } from "../../hooks/useInteractiveTutorial";

export const NOTEBOOK_STEPS: Step[] = [
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
  {
    targetId: "sidebar-wrapper-toolbar",
    title: "Sidebar: Intro",
    description:
      "The sidebar, on the left of your screen, contains all the important functions and information that users on 1Cademy need. ",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "toolbar-profile-button",
    title: "Sidebar: Profile",
    description: "your profile can be access by clicking this icon at the top of the sidebar.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "sidebar-wrapper-user-settings",
    title: "Sidebar: Profile",
    description: "On your profile sidebar you will find important information and options.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Sidebar: Profile",
    description: "On your profile sidebar you will find important information and options.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  // =================================================================================================
  // =================================================================================================
  // =================================================================================================
  // =================================================================================================
  {
    targetId: "user-settings-picture",
    title: "Sidebar: Picture",
    description:
      "Users with pictures for their profile help increase social presence on 1Cademy, they let us know that we are in fact collaborating with other people from around the world",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Sidebar: Picture",
    description: "It is not required that you add a profile picture, but it is recommended",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },

  // ---------------------------------------------------------------
  {
    targetId: "user-settings-picture",
    title: "Sidebar: Community Tag",
    description: "You will want to make sure that you are using an appropriate community tag",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Sidebar: Community Tag",
    description:
      "This can be viewed here under your name. You will want to make sure that the tag matches your community because any node you create will have this tag by default.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Sidebar: Community Tag",
    description: "To change your community tag, click on the current tag. ",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Sidebar: Community Tag",
    description: "A search box will appear and you can write in your community name to search for their tag. ",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Sidebar: Community Tag",
    description: "Check the box net to the appropriate tag.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  // ---------------------------------------------------------------
  {
    targetId: "user-settings-picture",
    title: "Sidebar: Statistics",
    description: "On your profile your can view the number of upvotes your contributions have generated here",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Sidebar: Statistics",
    description: "you can also see the number of each type of node that you have created. ",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  // ---------------------------------------------------------------
  {
    targetId: "user-settings-picture",
    title: "Sidebar: Personalization",
    description:
      "Under the statistics you have three tabs that allow you to customize your view and add information about yourself.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },

  // ---------------------------------------------------------------
  // SEARCH
  {
    targetId: "user-settings-picture",
    title: "Search",
    description: "1Cademy has a search engine that can be used to help you find a node, reference, or topic.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Search",
    description: "To search click on this search icon and enter your query.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Search",
    description: "Beyond searching terms there are a number of ways to refine your search.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Search",
    description:
      "You can search by tags by clicking this icon and refining your search to one or more selected tags representing information domains and communities.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Search",
    description: "You can also refine your search by how recently nodes were created or edited.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Search",
    description:
      "Finally you can further sort by: last viewed, date modified, proposals, upvotes, downvotes, or net votes with this icon.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Search",
    description:
      "After entering search terms, you can select one of the nodes that are retrieved in this list and it will take you to that node.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },

  // ---------------------------------------------------------------
  // BOOKMARTS/STUDIED
  {
    targetId: "user-settings-picture",
    title: "Bookmark/Studied",
    description:
      "To understand bookmarking, it is important to understand the mechanism for marking nodes as studied or unstudied.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  // ---------------------------------------------------------------
  {
    targetId: "user-settings-picture",
    title: "Bookmark/Studied: Studied",
    description: "Marking nodes as studied is a great way to keep track of your progress on 1Cademy.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Bookmark/Studied: Studied",
    description: "Unstudied nodes have a red border like this.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Bookmark/Studied: Studied",
    description:
      "By clicking this envelope icon in the footer, it markes the node as studied and the border becomes yellow",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Bookmark/Studied: Studied",
    description:
      "A node will remain studied, with a yellow border, until it is changed. If this occurs it will become unstudied, with a red border, again. ",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  // ---------------------------------------------------------------
  {
    targetId: "user-settings-picture",
    title: "Bookmark/Studied: Bookmark",
    description: "To bookmark an important node, click this banner icon.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Bookmark/Studied: Bookmark",
    description: "If this node changes, there will be a notification in this bookmark updates tab.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Bookmark/Studied: Bookmark",
    description:
      "Only nodes that have been designated as unstudied (through the process previously described) can show up in the bookmark updates tab",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Bookmark/Studied: Bookmark",
    description: "To view the node in the bookmark updates tab, just click on the title",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Bookmark/Studied: Bookmark",
    description: "You can click on the banner icon of bookmarked node to make it so that it is no longer bookmarked",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },

  // ---------------------------------------------------------------
  // PENDING LIST
  {
    targetId: "user-settings-picture",
    title: "Pending List",
    description: "The pending list can be viewed by clicking this tab.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Pending List",
    description: "You can view all the proposed nodes or changes that you have made.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Pending List",
    description: "By clicking on a pending proposed node you can view the node that is being proposed.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Pending List",
    description: "You can also view accepted proposals and similarly click on them to be taken to them on the map.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  {
    targetId: "user-settings-picture",
    title: "Pending List",
    description:
      "Getting proposal accepted is an important process on 1Cademy and will be covered in more detail later.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
  // ---------------------------------------------------------------
  // PENDING LIST
  {
    targetId: "user-settings-picture",
    title: "Pending List",
    description:
      "Getting proposal accepted is an important process on 1Cademy and will be covered in more detail later.",
    tooltipPos: "right",
    anchor: "portal",
    disabledElements: [],
  },
];
