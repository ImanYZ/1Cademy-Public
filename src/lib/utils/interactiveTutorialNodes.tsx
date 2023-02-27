import { FullNodeData, FullNodesData } from "../../nodeBookTypes";

const DEFAULT_NODE_DATE = new Date("2020-01-30T03:58:24.537Z");

const BASE_NODE: FullNodeData = {
  node: "00",
  createdAt: DEFAULT_NODE_DATE,
  open: true,
  changed: true,
  wrong: false,
  updatedAt: DEFAULT_NODE_DATE,
  bookmarked: false,
  user: "max10",
  visible: true,
  isStudied: false,
  deleted: false,
  correct: false,
  nodeImage: "",
  tags: ["1Cademy"],
  comments: 0,
  contributors: {
    "1man": {
      chooseUname: false,
      fullname: "Iman YeckehZaare",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F1man_Thu%2C%2006%20Feb%202020%2016%3A26%3A40%20GMT.png?alt=media&token=94459dbb-81f9-462a-83ef-62d1129f5851",
      reputation: 24,
    },
  },
  nodeType: "Concept",
  bookmarks: 0,
  viewers: 0,
  content: "",
  aFullname: "Iman YeckehZaare",
  tagIds: [""],
  institutions: {
    "University of Michigan - Ann Arbor": {
      reputation: 27,
    },
  },
  contribNames: ["1man"],
  referenceIds: [],
  children: [],
  referenceLabels: [],
  admin: "1man",
  institNames: ["University of Michigan - Ann Arbor"],
  versions: 0,
  changedAt: DEFAULT_NODE_DATE,
  corrects: 0,
  title: "",
  maxVersionRating: 0,
  references: [],
  studied: 0,
  parents: [],
  aImgUrl:
    "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F1man_Thu%2C%2006%20Feb%202020%2016%3A26%3A40%20GMT.png?alt=media&token=94459dbb-81f9-462a-83ef-62d1129f5851",
  wrongs: 0,
  userNodeId: "",
  nodeChangeType: "removed",
  userNodeChangeType: "removed",
  editable: false,
  left: 0,
  top: 0,
  firstVisit: DEFAULT_NODE_DATE,
  lastVisit: DEFAULT_NODE_DATE,
  choices: [],
  nodeChanges: null,
  nodeVideo: undefined,
  isTag: false,
  aChooseUname: false,
};

export const INTERACTIVE_TUTORIAL_NOTEBOOK_NODES: FullNodesData = {
  "02": {
    changed: true,
    correct: false,
    createdAt: new Date("2023-02-15T20:49:56.817Z"),
    updatedAt: new Date("2023-02-15T20:49:56.817Z"),
    deleted: false,
    isStudied: false,
    bookmarked: false,
    node: "02",
    open: true,
    user: "jn10",
    visible: true,
    wrong: false,
    aChooseUname: false,
    wrongs: 0,
    referenceLabels: [],
    aImgUrl:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2FTirdadBarghi_Fri%2C%2014%20Feb%202020%2017%3A28%3A11%20GMT.jpg?alt=media&token=90d05f1b-e896-4a73-b204-1a8ad30eba95",
    nodeType: "Relation",
    // adminPoints: 29,
    tags: ["1Cademy"],
    aFullname: "jj qq",
    // awards: 0,
    referenceIds: [],
    tagIds: [],
    maxVersionRating: 29,
    studied: 2,
    viewers: 2,
    institutions: {
      "University of Michigan - Ann Arbor": {
        reputation: 0,
      },
    },
    contributors: {
      iman: {
        chooseUname: false,
        reputation: 2,
        fullname: "Iman YeckehZaare",
        imageUrl:
          "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2F1man_Thu%2C%2006%20Feb%202020%2016%3A26%3A40%20GMT.png?alt=media&token=94459dbb-81f9-462a-83ef-62d1129f5851",
      },
    },
    content:
      "To create a new node or improve an existing node, you should propose the modification by clicking on the pencil icon in the node's toolbar.",
    children: [
      {
        node: "03",
        title: "Modifications in 1Cademy",
        label: "",
        type: "Concept",
      },
    ],
    changedAt: new Date("2023-02-15T20:49:56.817Z"),
    comments: 0,
    contribNames: ["jn10"],
    corrects: 4,
    references: [],
    admin: "jn10",
    parents: [
      {
        node: "01",
        title: "1Cademy Nodes",
        type: "Concept",
        label: "",
        // visible: true,
      },
    ],
    versions: 1,
    nodeVideo: "",
    institNames: ["University of Michigan - Ann Arbor"],
    title: "Creating or improving a node in 1Cademy",
    nodeImage:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/UploadedImages%2FTirdadBarghi_Tue%2C%2011%20Feb%202020%2018%3A04%3A43%20GMT.JPG?alt=media&token=d0036406-c99f-4d39-8a92-1975f1d13c80",
    userNodeId: "Tvh7IxaVAGkTATAV9RPT",
    nodeChangeType: "added",
    userNodeChangeType: "added",
    editable: false,
    left: 1350,
    top: 330.5,
    firstVisit: new Date("2023-02-15T20:49:56.817Z"),
    lastVisit: new Date("2023-02-15T20:49:56.817Z"),
    choices: [],
    nodeChanges: null,
    isTag: false,
  },
  "03": {
    ...BASE_NODE,
    node: "03",
    title: "Modifications in 1Cademy",
    content:
      'A node is considered "modified" either directly or indirectly when one or more of the following occurs:\n - Direct modification: When a proposal for an improvement to an existing node has been posted and approved.\n - Indirect modification: (1) When a proposal for an improvement to a directly linked parent/child node has been posted and approved. (2) A parent/child node has been deleted.',
    children: [
      {
        node: "04",
        title: "Adding a new node to 1Cademy",
        type: "Concept",
        label: "",
      },
    ],
    parents: [
      {
        node: "02",
        title: "Creating or improving a node in 1Cademy",
        type: "Concept",
        label: "",
      },
    ],
  },
  "04": {
    ...BASE_NODE,
    node: "04",
    title: "Adding a new node to 1Cademy",
    content:
      'To add a new node to 1Cademy map, you need to create a proposal. For this purpose, after identifying the prerequisite node, you should click the "Proposals" button on the node footer and click the appropriate proposal type from the list that shows up on the right, depending on the child node you would like to add. Then, you will see a new child node appears under your chosen prerequisite node. Replace its title and content. If necessary, upload an image for it. For each proposal, you also need to enter the summary of your proposal and justifications for why you propose this new node. Enter these two in their specified text boxes on the right sidebar. Finally, click the "Post" button. Note that you cannot modify the type of a node after proposing it.',
    children: [],
    parents: [
      {
        node: "03",
        title: "Modifications in 1Cademy",
        type: "Concept",
        label: "",
      },
    ],
  },
  "00": {
    ...BASE_NODE,
    node: "00",
    title: "1Cademy",
    content:
      "1Cademy is a collaborative online community that supports interdisciplinary research and learning through content generation, mapping, evaluation, and practice.",
    children: [
      {
        type: "Concept",
        title: "1Cademy Nodes",
        node: "01",
        label: "",
      },
    ],
    parents: [],
  },
  "01": {
    ...BASE_NODE,
    node: "01",
    title: "1Cademy Nodes",
    content:
      "A node is a rectangular box that represents a granular piece of knowledge, summarized in its title and explained in its content.\n\nNodes are connected to other nodes. Together, they make up a hierarchical Knowledge Graph.",
    children: [
      {
        type: "Relation",
        title: "1Cademy Node Components",
        node: "05",
        label: "",
      },
    ],
    parents: [
      {
        node: "00",
        title: "1Cademy",
        type: "Concept",
        label: "",
      },
    ],
    corrects: 1,
    nodeVideo: "https://youtu.be/exLS4UadfFU",
    referenceIds: ["00002"],
    referenceLabels: [""],
    references: ["My python library called Deep Math for Multi Layer Perceptron"],
    tagIds: ["00001"],
    tags: ["Deep Learning (in Machine learning)"],
  },
  "05": {
    ...BASE_NODE,
    node: "05",
    title: "1Cademy Node Components",
    content: "Each node in 1Cademy has the following sections: \n- Title \n- Content \n- Header \n- Footer",
    children: [
      {
        type: "Concept",
        title: "1Cademy Node Header",
        node: "06",
        label: "",
      },
    ],
    parents: [
      {
        node: "01",
        title: "1Cademy Nodes",
        type: "Concept",
        label: "",
      },
    ],
    nodeImage:
      "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/UploadedImages%2FK3DmaX1ZAfXSZ5EzWvz46uJ09fZ2%2FSat%2C%2003%20Apr%202021%2000%3A54%3A56%20GMT.png?alt=media&token=c0673481-b22a-4e73-a129-9d0d70841060",
    nodeType: "Relation",
  },
  "06": {
    ...BASE_NODE,
    node: "06",
    title: "1Cademy Node Header",
    content:
      "The header at the top right corner of the node has options to change your view of the map, such as: \n- Collapsing \n- Expanding \n- Hiding \n- Hiding offsprings",
    children: [],
    parents: [
      {
        node: "05",
        title: "1Cademy Node Components",
        type: "Relation",
        label: "",
      },
    ],
    nodeVideo: "https://youtu.be/m6qIjU4tpL4",
  },
  "07": {
    ...BASE_NODE,
    node: "07",
    title: "This node will be removed with a downvote",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ultricies, arcu ut sodales varius, tortor erat gravida lacus, eget maximus arcu nisi nec elit. In eu scelerisque nunc, id condimentum nisl. Aliquam rhoncus tortor a ultricies consequat. ",
    children: [],
    parents: [],
    wrongs: 0,
    corrects: 1,
  },
};
