import { EdgesData, FullNodeData, FullNodesData, NodesData, UserNodeChanges } from "src/nodeBookTypes";

import { COLUMN_GAP, dagreUtils } from "@/lib/utils/dagre.util";
import { NODE_WIDTH } from "@/lib/utils/Map.utils";
import { buildFullNodes, fillDagre, synchronizeGraph } from "@/lib/utils/nodesSyncronization.utils";
import { Graph } from "@/pages/notebook";

test("should test build full nodes function", () => {
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
    const selectedNotebookId = "1xjMdGklUUNwZSzwzVpK";
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
    expect(nodes[nodeId].top).toBe(0);
    expect(nodes[nodeId].left).toBe(NODE_WIDTH + COLUMN_GAP);
    expect(nodes[nodeId].open).toBe(true);
    expect(nodes[nodeId].visible).toBe(true);
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
      left: 500,
      top: 500,
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
    expect(nodes[PARENT_NODE_ID].top).toBe(parentNode.top);
    expect(nodes[PARENT_NODE_ID].left).toBe(parentNode.left);

    expect(nodes[CHILD_NODE_ID].title).toBe(childNode.title);
    expect(nodes[CHILD_NODE_ID].content).toBe(childNode.content);
    expect(nodes[CHILD_NODE_ID].top).toBe(parentNode.top);
    expect(nodes[CHILD_NODE_ID].left).toBe(parentNode.left + NODE_WIDTH + COLUMN_GAP);
    // TODO: test the top and left position of child
  });

  it("should synchronize full nodes into graph while is linking a node", () => {
    const mockEdgeData = { label: "", fromX: 770, fromY: 0, toX: 580, toY: 0, points: [] };
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
      left: 500,
      top: 500,
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
      userNodeChangeType: "modified",
      editable: false,
      left: 10,
      top: 10,
      firstVisit: new Date("2023-08-24T23:55:05.908Z"),
      lastVisit: new Date("2023-08-24T23:55:05.908Z"),
      bookmarks: 0,
      choices: [],
      nodeChanges: null,
    };

    const childChanges: Partial<FullNodeData> = {
      title: "title of child node - e1",
      parents: [],
    };
    // linked
    const g = dagreUtils.mapObjectToGraph({
      nodes: [
        { id: PARENT_NODE_ID, data: { height: 200, width: 200, x: 10, y: 10 } },
        { id: CHILD_NODE_ID, data: { height: 300, width: 200, x: 200, y: 10 } },
      ],
      edges: [{ data: mockEdgeData, from: PARENT_NODE_ID, to: CHILD_NODE_ID }],
      parents: [{ node: CHILD_NODE_ID, parent: PARENT_NODE_ID }],
    });
    // not be linked
    const fullNodes: FullNodeData[] = [{ ...childNode, ...childChanges }];

    // linked
    const graph: Graph = {
      nodes: { [PARENT_NODE_ID]: parentNode, [CHILD_NODE_ID]: childNode },
      edges: {
        [`${PARENT_NODE_ID}-${CHILD_NODE_ID}`]: {
          fromX: 0,
          fromY: 0,
          label: "",
          points: [],
          toX: 0,
          toY: 0,
        },
      },
    };
    const selectedNotebookId = "1xjMdGklUUNwZSzwzVpK";
    const { edges, nodes } = synchronizeGraph({
      g,
      allTags: {},
      fullNodes,
      graph,
      selectedNotebookId,
      nodesInEdition: [CHILD_NODE_ID],
      setNodeUpdates: jest.fn(),
      setNoNodesFoundMessage: jest.fn(),
    });

    // const nodeId = fullNodes[0].node;
    expect(Object.keys(edges)).toHaveLength(1);
    expect(edges).toHaveProperty(`${PARENT_NODE_ID}-${CHILD_NODE_ID}`);
    expect(Object.keys(nodes)).toHaveLength(2);

    expect(nodes[PARENT_NODE_ID].title).toBe(parentNode.title);
    expect(nodes[PARENT_NODE_ID].content).toBe(parentNode.content);
    expect(nodes[PARENT_NODE_ID].top).toBe(parentNode.top);
    expect(nodes[PARENT_NODE_ID].left).toBe(parentNode.left);

    expect(nodes[CHILD_NODE_ID].title).toBe(childChanges.title);
    expect(nodes[CHILD_NODE_ID].content).toBe(childNode.content);
    expect(nodes[CHILD_NODE_ID].top).toBe(10);
    expect(nodes[CHILD_NODE_ID].left).toBe(10);
    expect(nodes[CHILD_NODE_ID].parents).toEqual([
      {
        type: "Concept",
        label: "",
        node: PARENT_NODE_ID,
        title: "Python and the Web",
        visible: false, // TODO: this should be true because the parent is visible
      },
    ]);

    expect(g.nodes()).toHaveLength(2);
    expect(g.edges()).toHaveLength(1);
  });
});

test("should test added, modified and removed options on fill dagre function", () => {
  const nodeId1 = "nn1vzbHWGSnkIfwAWPq4";
  const nodeId2 = "nn2vzbHWGSnkIfwAWPq4";
  const nodeId3 = "nn3vzbHWGSnkIfwAWPq4";
  const node1: FullNodeData = {
    changed: true,
    correct: false,
    createdAt: new Date("2021-05-25T18:14:07.574Z"),
    updatedAt: new Date("2023-08-24T23:55:05.912Z"),
    deleted: false,
    isStudied: false,
    bookmarked: false,
    node: nodeId1,
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
    content: "content of node 1",
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
    title: "title of node 1",
    references: ["Python Documentation"],
    children: [],
    wrongs: 0,
    referenceIds: ["srNYrnun6zK1Csh5MWOo"],
    contributors: {},
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
    visible: true,
  };
  const node2: FullNodeData = {
    changed: true,
    correct: false,
    createdAt: new Date("2021-05-25T18:14:07.574Z"),
    updatedAt: new Date("2023-08-24T23:55:05.912Z"),
    deleted: false,
    isStudied: false,
    bookmarked: false,
    node: nodeId2,
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
    content: "content of node 2",
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
    title: "title of node 2",
    references: ["Python Documentation"],
    children: [],
    wrongs: 0,
    referenceIds: ["srNYrnun6zK1Csh5MWOo"],
    contributors: {},
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
    visible: true,
  };
  const node3: FullNodeData = {
    changed: true,
    correct: false,
    createdAt: new Date("2021-05-25T18:14:07.574Z"),
    updatedAt: new Date("2023-08-24T23:55:05.912Z"),
    deleted: false,
    isStudied: false,
    bookmarked: false,
    node: nodeId3,
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
    content: "content of node 3",
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
    title: "title of node 3",
    references: ["Python Documentation"],
    children: [],
    wrongs: 0,
    referenceIds: ["srNYrnun6zK1Csh5MWOo"],
    contributors: {},
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
    visible: true,
  };
  const g = dagreUtils.mapObjectToGraph({
    nodes: [
      { id: nodeId1, data: { height: 200, width: 200, x: 10, y: 10 } },
      { id: nodeId2, data: { height: 300, width: 200, x: 200, y: 10 } },
    ],
    edges: [],
    parents: [],
  });
  const fullNodes: FullNodeData[] = [
    { ...node3, userNodeChangeType: "added", nodeChangeType: "added" },
    { ...node2, title: "node 2 modified", userNodeChangeType: "modified", nodeChangeType: "modified" },
    { ...node1, userNodeChangeType: "removed", nodeChangeType: "removed" },
  ];
  const currentNodes: FullNodesData = { [nodeId1]: node1, [nodeId2]: node2 };
  const currentEdges: EdgesData = {};
  const { result, updatedNodeIds } = fillDagre(g, fullNodes, currentNodes, currentEdges, false, {});

  expect(updatedNodeIds).toEqual([nodeId3, nodeId2, nodeId1]);
  expect(result.newEdges).toEqual({});
  expect(Object.keys(result.newNodes)).toHaveLength(2);
  expect(result.newNodes).toHaveProperty(nodeId3);
  expect(result.newNodes).toHaveProperty(nodeId2);
  expect(result.newNodes).not.toHaveProperty(nodeId1);
  // TODO: add case when is not visible and is modified, previously that was working a remove
});
