import { GetServerSideProps } from "next";
import { APP_DOMAIN } from "src/1cademyConfig";

import { db } from "../lib/admin";

// Google Bot penalizes duplicates. Please add a few lines to the sitemap endpoint to keep track of the nodes 
// that are being added to the sitemap. For the nodes with the same title (duplicates) only include the one
//  with the highest :white_check_mark: minus [X] in the sitemap. Then, test whether it works, please.

function SitemapIndex() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const allNodes = [];
  const nodesDocs = await db.collection("nodes").where("deleted", "==", false).where("isTag", "==", true).get();
  if (nodesDocs.docs.length === 0) {
    res.writeHead(404, { "Content-Type": "text/xml" });
    res.write("No Sitemap Index!");
    res.end();
  } else {
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (let nodeDoc of nodesDocs.docs) {
      const node = nodeDoc.data();
      const isNewNode = allNodes.indexOf((title: string) => title === node.title) === -1;
      if (isNewNode) {
        allNodes.push(node.title);
        xmlContent += `
        <sitemap>
        <loc>${APP_DOMAIN}sitemap/${nodeDoc.id}.xml</loc>
        </sitemap>`;
        xmlContent += "</sitemapindex>";
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.write(xmlContent);
        res.end();
      }
    }
  }
  return {
    props: {}
  };
};

export default SitemapIndex;
