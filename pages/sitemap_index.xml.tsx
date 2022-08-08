import * as fs from "fs";
import { GetServerSideProps } from "next";

import { db } from "../lib/admin";

const SitemapIndex = () => null;


export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let BASE_URL = '';
  if (typeof window !== 'undefined') {
    //This is where you will define your base url. You can also use the default dev url http://localhost:3000
    BASE_URL = `${location.protocol}//${location.host}`;
  }

  const staticPaths = fs
    .readdirSync("pages")
    .filter((staticPage: string) => {
      return ![
        "sitemap_index.xml.tsx",
        "404.tsx",
        "500.tsx",
        "_app.tsx",
        "_document.tsx",
        "api"
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
    const nodeTitles: any[] = Object.keys(nodes);
    const isNodeExist: any = nodeTitles.indexOf((keyTitle: any) => keyTitle === nodeTitle) === -1;
    if (!isNodeExist) {
      nodes[nodeTitle] = {
        id: nodeId,
        updatedAt: nodeUpdatedAt,
        value: nodeValue && nodeValue >= 0 ? nodeValue : 0,
      };
    } else if (isNodeExist) {
      nodes[nodeTitle] = {
        id: nodeId,
        value: (nodeValue + 1),
        updatedAt: nodeUpdatedAt,
      };
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dynamicPaths = Object.entries(nodes).map(([title, node]: any) => `${BASE_URL}/node/${title}/${node.id}`);

  const allPaths = [...staticPaths, ...dynamicPaths];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    // This is where we would be putting in our URLs
    ${allPaths
      .map((url) => {
        return `
          <url>
            <loc>${url}</loc>
          </url>
        `;
      })
      .join("")}
  </urlset>
`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {}
  };
};

export default SitemapIndex;
