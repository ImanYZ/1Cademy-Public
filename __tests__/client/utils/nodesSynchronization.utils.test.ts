import { FullNodeData, NodesData, UserNodeChanges } from "src/nodeBookTypes";

import { dagreUtils } from "@/lib/utils/dagre.util";
import { buildFullNodes, synchronizeGraph } from "@/lib/utils/nodesSyncronization.utils";
import { Graph } from "@/pages/notebook";

describe("should test build full nodes function", () => {
  const expands = [true];
  const notebooks = ["1xjMdGklUUNwZSzwzVpK"];
  const userNodesChanges: UserNodeChanges[] = [
    {
      cType: "added",
      uNodeId: "8rKnI2bYWouj4poAuBXo",
      uNodeData: {
        changed: true,
        correct: false,
        // @ts-ignore
        createdAt: {
          seconds: 1692917771,
          nanoseconds: 120000000,
          toDate: () => new Date(),
        },
        // @ts-ignore
        updatedAt: {
          seconds: 1692917771,
          nanoseconds: 120000000,
          toDate: () => new Date(),
        },
        deleted: false,
        isStudied: false,
        bookmarked: false,
        node: "yRrvzbHWGSnkIfwAWPq4",
        user: "jjnnx",
        wrong: false,
        notebooks,
        expands,
      },
    },
  ];

  const nodesData: NodesData[] = [
    {
      cType: "added",
      nId: "yRrvzbHWGSnkIfwAWPq4",
      nData: {
        nodeImage: "",
        wrongs: 0,
        maxVersionRating: 1,
        children: [
          {
            node: "Jv2GtuTxoafdwP0Ui9f7",
            label: "",
            type: "Concept",
            title: "Scrapy",
          },
          {
            node: "jZWECBh9bD6f2GDh5z0h",
            title: "BeautifulSoup",
            label: "",
            type: "Concept",
          },
          {
            type: "Concept",
            title: "Selenium",
            node: "MUzLeedbszjbyJoXaX9g",
            label: "",
          },
        ],
        nodeType: "Relation",
        deleted: false,
        contributors: {
          swinter00: {
            fullname: "Sam Winter",
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2Fundefined%2FMon%2C%2011%20Jan%202021%2020%3A52%3A14%20GMT.png?alt=media&token=95e37cea-40f7-48ed-bad5-7a21af2f5ce8",
            reputation: 0.5,
            chooseUname: false,
          },
        },
        contribNames: ["swinter00"],
        references: ["Python Documentation"],
        referenceIds: ["srNYrnun6zK1Csh5MWOo"],
        parents: [
          {
            type: "Concept",
            node: "RhnraOCxZtOw5DjmrF2i",
            label: "",
            title: "Python and the Web",
          },
        ],
        viewers: 3,
        tagIds: [
          "MlwLPB5GwSBWXgf1wqTe",
          "FJfzAX7zbgQS8jU5XcEk",
          "LelZt99pp5MHUCIZx4EW",
          "IZs8bbg7nouVdUGwtqMc",
          "Ml73zsstI4hoS2z8ESIQ",
        ],
        chooseUname: false,
        studied: 0,
        tags: [
          "Python Programming Language",
          "Data Science",
          "CORE Econ",
          "Python Programming @ CORE Econ",
          "Ch.1 Mock Chapter 1 - Python Programming @ CORE Econ",
        ],
        referenceLabels: [""],
        content:
          "Many Python libraries exist to help scrape data from the web. Examples of such libraries include Beautiful Soup and Scrapy.",
        aImgUrl:
          "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2Fundefined%2FMon%2C%2011%20Jan%202021%2020%3A52%3A14%20GMT.png?alt=media&token=95e37cea-40f7-48ed-bad5-7a21af2f5ce8",
        institNames: ["University of Michigan - Ann Arbor"],
        versions: 1,
        title: "Web Scraping with Python",
        // @ts-ignore
        createdAt: {
          seconds: 1621966447,
          nanoseconds: 574000000,
          toDate: () => new Date(),
        },
        adminPoints: 0.5,
        institutions: {
          "University of Michigan - Ann Arbor": {
            reputation: 0.5,
          },
        },
        // @ts-ignore
        updatedAt: {
          seconds: 1682793312,
          nanoseconds: 312000000,
          toDate: () => new Date(),
        },
        comments: 0,
        aFullname: "Sam Winter",
        admin: "swinter00",
        corrects: 1,
        // @ts-ignore
        changedAt: {
          seconds: 1624977153,
          nanoseconds: 329000000,
          toDate: () => new Date(),
        },
      },
    },
  ];

  const res = buildFullNodes(userNodesChanges, nodesData);

  res.forEach(c => {
    expect(c.node).toBe("yRrvzbHWGSnkIfwAWPq4");
    c.expands.forEach((c, i) => expect(c).toBe(expands[i]));
    c.notebooks.forEach((c, i) => expect(c).toBe(notebooks[i]));
    expect(c.userNodeId).toBe("8rKnI2bYWouj4poAuBXo");
    expect(c.title).toBe("Web Scraping with Python");
    expect(c.content).toBe(
      "Many Python libraries exist to help scrape data from the web. Examples of such libraries include Beautiful Soup and Scrapy."
    );
    expect(c.left).toBe(0);
    expect(c.top).toBe(0);
  });
});

describe("should test synchronize function", () => {
  it("should synchronize full nodes into empty graph", () => {
    const g = dagreUtils.createGraph();
    const fullNodes: FullNodeData[] = [
      {
        changed: true,
        correct: false,
        createdAt: new Date("2021-05-25T18:14:07.574Z"),
        updatedAt: new Date("2023-08-24T23:55:05.912Z"),
        deleted: false,
        isStudied: false,
        bookmarked: false,
        node: "yRrvzbHWGSnkIfwAWPq4",
        user: "jjnnx",
        wrong: false,
        notebooks: ["1xjMdGklUUNwZSzwzVpK"],
        expands: [true],
        referenceLabels: [""],
        // adminPoints: 0.5,
        changedAt: new Date("2021-06-29T14:32:33.329Z"),
        // chooseUname: false, // this exist doesn't exist type
        aChooseUname: false,
        isTag: false, // this doesn't exist on answer
        corrects: 1,
        aFullname: "Sam Winter",
        nodeType: "Relation",
        tags: [],
        versions: 1,
        institNames: ["University of Michigan - Ann Arbor"],
        studied: 0,
        aImgUrl:
          "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2Fundefined%2FMon%2C%2011%20Jan%202021%2020%3A52%3A14%20GMT.png?alt=media&token=95e37cea-40f7-48ed-bad5-7a21af2f5ce8",
        maxVersionRating: 1,
        contribNames: ["swinter00"],
        content:
          "Many Python libraries exist to help scrape data from the web. Examples of such libraries include Beautiful Soup and Scrapy.",
        parents: [],
        viewers: 4,
        nodeImage: "",
        admin: "swinter00",
        comments: 0,
        institutions: {
          "University of Michigan - Ann Arbor": {
            reputation: 0.5,
          },
        },
        title: "Web Scraping with Python",
        references: ["Python Documentation"],
        children: [],
        wrongs: 0,
        referenceIds: ["srNYrnun6zK1Csh5MWOo"],
        contributors: {
          swinter00: {
            chooseUname: false,
            reputation: 0.5,
            fullname: "Sam Winter",
            imageUrl:
              "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2Fundefined%2FMon%2C%2011%20Jan%202021%2020%3A52%3A14%20GMT.png?alt=media&token=95e37cea-40f7-48ed-bad5-7a21af2f5ce8",
          },
        },
        tagIds: ["MlwLPB5GwSBWXgf1wqTe"],
        userNodeId: "8rKnI2bYWouj4poAuBXo",
        nodeChangeType: "added",
        userNodeChangeType: "added",
        editable: false,
        left: 0,
        top: 0,
        firstVisit: new Date("2023-08-24T23:55:05.908Z"),
        lastVisit: new Date("2023-08-24T23:55:05.908Z"),
        bookmarks: 0,
        choices: [],
        nodeChanges: null,
      },
    ];
    const graph: Graph = { nodes: {}, edges: {} };
    const selectedNotebookId = "";
    const { edges, nodes } = synchronizeGraph({
      g,
      allTags: {},
      fullNodes,
      graph,
      selectedNotebookId,
      setNodeUpdates: jest.fn(),
      setNoNodesFoundMessage: jest.fn(),
    });

    const nodeId = fullNodes[0].node;
    expect(edges).toEqual({});
    expect(Object.keys(nodes).length).toBe(1);
    expect(nodes[nodeId].title).toBe(fullNodes[0].title);
    expect(nodes[nodeId].content).toBe(fullNodes[0].content);
  });

  it("should synchronize full nodes into graph with contain parent of new added node", () => {
    const PARENT_NODE_ID = "pprvzbHWGSnkIfwAWP01";
    const CHILD_NODE_ID = "ccrvzbHWGSnkIfwAWP01";
    const parentNode: FullNodeData = {
      changed: true,
      correct: false,
      createdAt: new Date("2021-05-25T18:14:07.574Z"),
      updatedAt: new Date("2023-08-24T23:55:05.912Z"),
      deleted: false,
      isStudied: false,
      bookmarked: false,
      node: PARENT_NODE_ID,
      user: "jjnnx",
      wrong: false,
      notebooks: ["1xjMdGklUUNwZSzwzVpK"],
      expands: [true],
      referenceLabels: [""],
      // adminPoints: 0.5,
      changedAt: new Date("2021-06-29T14:32:33.329Z"),
      // chooseUname: false, // this exist doesn't exist type
      aChooseUname: false,
      isTag: false, // this doesn't exist on answer
      corrects: 1,
      aFullname: "Sam Winter",
      nodeType: "Relation",
      tags: [],
      versions: 1,
      institNames: ["University of Michigan - Ann Arbor"],
      studied: 0,
      aImgUrl:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2Fundefined%2FMon%2C%2011%20Jan%202021%2020%3A52%3A14%20GMT.png?alt=media&token=95e37cea-40f7-48ed-bad5-7a21af2f5ce8",
      maxVersionRating: 1,
      contribNames: ["swinter00"],
      content: "content of parent node",
      parents: [],
      viewers: 4,
      nodeImage: "",
      admin: "swinter00",
      comments: 0,
      institutions: {
        "University of Michigan - Ann Arbor": {
          reputation: 0.5,
        },
      },
      title: "this is a parent node",
      references: ["Python Documentation"],
      children: [
        {
          type: "Concept",
          label: "",
          node: CHILD_NODE_ID,
          title: "Python and the Web",
        },
      ],
      wrongs: 0,
      referenceIds: ["srNYrnun6zK1Csh5MWOo"],
      contributors: {
        swinter00: {
          chooseUname: false,
          reputation: 0.5,
          fullname: "Sam Winter",
          imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2Fundefined%2FMon%2C%2011%20Jan%202021%2020%3A52%3A14%20GMT.png?alt=media&token=95e37cea-40f7-48ed-bad5-7a21af2f5ce8",
        },
      },
      tagIds: [],
      userNodeId: "8rKnI2bYWouj4poAuBXo",
      nodeChangeType: "added",
      userNodeChangeType: "added",
      editable: false,
      left: 0,
      top: 0,
      firstVisit: new Date("2023-08-24T23:55:05.908Z"),
      lastVisit: new Date("2023-08-24T23:55:05.908Z"),
      bookmarks: 0,
      choices: [],
      nodeChanges: null,
    };
    const childNode: FullNodeData = {
      changed: true,
      correct: false,
      createdAt: new Date("2021-05-25T18:14:07.574Z"),
      updatedAt: new Date("2023-08-24T23:55:05.912Z"),
      deleted: false,
      isStudied: false,
      bookmarked: false,
      node: CHILD_NODE_ID,
      user: "jjnnx",
      wrong: false,
      notebooks: ["1xjMdGklUUNwZSzwzVpK"],
      expands: [true],
      referenceLabels: [""],
      // adminPoints: 0.5,
      changedAt: new Date("2021-06-29T14:32:33.329Z"),
      // chooseUname: false, // this exist doesn't exist type
      aChooseUname: false,
      isTag: false, // this doesn't exist on answer
      corrects: 1,
      aFullname: "Sam Winter",
      nodeType: "Relation",
      tags: [],
      versions: 1,
      institNames: ["University of Michigan - Ann Arbor"],
      studied: 0,
      aImgUrl:
        "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2Fundefined%2FMon%2C%2011%20Jan%202021%2020%3A52%3A14%20GMT.png?alt=media&token=95e37cea-40f7-48ed-bad5-7a21af2f5ce8",
      maxVersionRating: 1,
      contribNames: ["swinter00"],
      content: "content of child node",
      parents: [
        {
          type: "Concept",
          label: "",
          node: PARENT_NODE_ID,
          title: "Python and the Web",
        },
      ],
      viewers: 4,
      nodeImage: "",
      admin: "swinter00",
      comments: 0,
      institutions: {
        "University of Michigan - Ann Arbor": {
          reputation: 0.5,
        },
      },
      title: "title of child node",
      references: ["Python Documentation"],
      children: [],
      wrongs: 0,
      referenceIds: ["srNYrnun6zK1Csh5MWOo"],
      contributors: {
        swinter00: {
          chooseUname: false,
          reputation: 0.5,
          fullname: "Sam Winter",
          imageUrl:
            "https://firebasestorage.googleapis.com/v0/b/onecademy-1.appspot.com/o/ProfilePictures%2Fundefined%2FMon%2C%2011%20Jan%202021%2020%3A52%3A14%20GMT.png?alt=media&token=95e37cea-40f7-48ed-bad5-7a21af2f5ce8",
        },
      },
      tagIds: [],
      userNodeId: "8rKnI2bYWouj4poAuBXo",
      nodeChangeType: "added",
      userNodeChangeType: "added",
      editable: false,
      left: 0,
      top: 0,
      firstVisit: new Date("2023-08-24T23:55:05.908Z"),
      lastVisit: new Date("2023-08-24T23:55:05.908Z"),
      bookmarks: 0,
      choices: [],
      nodeChanges: null,
    };
    const g = dagreUtils.mapObjectToGraph({
      nodes: [{ id: PARENT_NODE_ID, data: { height: 200, width: 200, x: 10, y: 10 } }],
      edges: [],
      parents: [],
    });

    const fullNodes: FullNodeData[] = [childNode];
    const graph: Graph = { nodes: { [PARENT_NODE_ID]: parentNode }, edges: {} };
    const selectedNotebookId = "";
    const { edges, nodes } = synchronizeGraph({
      g,
      allTags: {},
      fullNodes,
      graph,
      selectedNotebookId,
      setNodeUpdates: jest.fn(),
      setNoNodesFoundMessage: jest.fn(),
    });

    // const nodeId = fullNodes[0].node;
    expect(Object.keys(edges).length).toBe(1);
    expect(edges).toHaveProperty(`${PARENT_NODE_ID}-${CHILD_NODE_ID}`);
    expect(Object.keys(nodes).length).toBe(2);
    expect(nodes[PARENT_NODE_ID].title).toBe(parentNode.title);
    expect(nodes[PARENT_NODE_ID].content).toBe(parentNode.content);
    expect(nodes[CHILD_NODE_ID].title).toBe(childNode.title);
    expect(nodes[CHILD_NODE_ID].content).toBe(childNode.content);
    expect(nodes[CHILD_NODE_ID].content).toBe(childNode.content);
    // TODO: test the top and left position of child
  });
});
