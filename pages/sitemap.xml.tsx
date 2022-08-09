import * as fs from "fs";
import { GetServerSideProps } from "next";

import { db } from "../lib/admin";

const Sitemap = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let BASE_URL = 'https://node.1cademy.us';

  const staticPaths = fs
    .readdirSync("pages")
    .filter((staticPage: string) => {
      return ![
        "sitemap",
        "proposal",
        "node",
        "index.tsx",
        "nodesData.csv.js",
        "sitemap.xml.tsx",
        "404.tsx",
        "500.tsx",
        "_app.tsx",
        "_document.tsx",
        "api",
      ].includes(staticPage);
    })
    .map((staticPagePath: String) => {
      return `${BASE_URL}/${staticPagePath.replace('.tsx', '')}`;
    });

  const nodes: any = {};
  const nodesDocs = await db.collection("nodes").where("deleted", "==", false).where("isTag", "==", true).get();

  await nodesDocs.docs.map(doc => {
    const node = doc.data();
    const nodeId = doc.id;
    const nodeTitle: string = node.title;
    const nodeValue: number = node.corrects - node.wrongs;
    const nodeUpdatedAt = node.updatedAt.toDate().toISOString();
    if (nodeTitle in nodes) {
      const ObjValues: any = Object.values(nodes)[0];
      if (nodeValue > ObjValues.value) {
        nodes[nodeTitle] = {
          id: nodeId,
          value: (nodeValue + 1),
          updatedAt: nodeUpdatedAt,
        };
      }
    } else {
      nodes[nodeTitle] = {
        id: nodeId,
        updatedAt: nodeUpdatedAt,
        value: nodeValue && nodeValue >= 0 ? nodeValue : 0,
      };
    }
  });

  const dynamicPaths = Object.entries(nodes).map(([title, node]: any) => {
    if (!node.id) {
      return;
    }
    let nodeTitle = title.trim().toLowerCase();
    if (title.includes('&')) {
      nodeTitle = nodeTitle.split("&").join("and");
    }
    if (title.includes('?')) {
      nodeTitle = nodeTitle.split("?").join("");
    }
    if (title.includes('\n')) {
      nodeTitle = nodeTitle.split("\n").join("");
    }
    nodeTitle = nodeTitle.split(" ").join("-");
    return `${BASE_URL}/node/${nodeTitle}/${node.id}`
  });

  const allPaths = [...staticPaths, ...dynamicPaths];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allPaths.map(url => (`<url>
            <loc>${url}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>1.0</priority>
          </url>`)
  ).join("")}
  </urlset>
`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {}
  };
};

export default Sitemap;
