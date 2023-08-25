import { NodesData, UserNodeChanges } from "src/nodeBookTypes";

import { buildFullNodes } from "@/lib/utils/nodesSyncronization.utils";

describe("should test node synchronization utils", () => {
  it("should build full nodes", () => {
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
});
