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
      return `${BASE_URL}/${staticPagePath.replace('.js', '')}`;
    });


  const nodesDocs = await db.collection("nodes").where("deleted", "==", false).where("isTag", "==", true).get();
  const allNodeIds = nodesDocs.docs.map((x: any) => x.id);

  const nodes: any[] = [];
  const dynamicPaths = allNodeIds.map((nodeId: String) => {
    const isNodeAlreadyExist = nodes.indexOf((id: string) => id === nodeId) >= 0;
    if (!isNodeAlreadyExist) {
      nodes.push(nodeId);
      return `${BASE_URL}/sitemap/${nodeId}`
    }
  });

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


  // if (nodesDocs.docs.length === 0) {
  //   res.writeHead(404, { "Content-Type": "text/xml" });
  //   res.write("No Sitemap Index!");
  //   res.end();
  // } else {
  //   let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
  //     <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  //     <sitemap>
  //         <loc>https://node.1cademy.us/sitemap-015NGDPVg3ZoJ9SyiZaq.xml</loc>
  //       </sitemap>
  //       <sitemap>
  //         <loc>https://node.1cademy.us/sitemap-KwhAGgtGx3MDrSYIvaq4.xml</loc>
  //       </sitemap>
  //       <sitemap>
  //         <loc>https://node.1cademy.us/sitemap-Lm9V7WPNWC0eDJYDpW3v.xml</loc>
  //       </sitemap>
  //       <sitemap>
  //       <loc>https://node.1cademy.us/sitemap-WgF7yr5q7tJc54apVQSr.xml</loc>
  //     </sitemap>
  //     <sitemap>
  //       <loc>https://node.1cademy.us/sitemap-Z5I4I5OIIfcUY6iPizRZ.xml</loc>
  //     </sitemap>
  //   </sitemapindex>`;
  //   res.writeHead(200, { "Content-Type": "text/xml" });
  //   res.write(xmlContent);
  //   res.end();
  // }
  return {
    props: {}
  };
};

export default SitemapIndex;
