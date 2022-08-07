import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";

import { db } from "../../lib/admin";
import { getNodePageWithDomain } from "../../lib/utils";

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

interface Params extends ParsedUrlQuery {
  nodeId: string;
}

export const getServerSideProps: GetServerSideProps<any, Params> = async ({ res, params }) => {
  if (!params)
    return {
      props: {}
    };
  const allNodes: any[] = [];
  const nodeId = params.nodeId.replace(".xml", "");
  const tagDoc = await db.collection("nodes").doc(nodeId).get();
  if (!tagDoc.exists) {
    res.writeHead(404, { "Content-Type": "text/xml" });
    res.write(`<message>No Sitemap for Id: ${nodeId}</message>`);
    res.end();
  } else {
    const tagData = tagDoc.data();
    const nodesDocs = await db
      .collection("nodes")
      .where("deleted", "==", false)
      .where("tags", "array-contains", {
        node: nodeId,
        title: tagData?.title
      })
      .get();
    if (nodesDocs.docs.length === 0) {
      res.writeHead(404, { "Content-Type": "text/xml" });
      res.write(`<message>No child nodes found for Id: ${nodeId}</message>`);
      res.end();
    } else {
      let xmlContent =
        '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
      for (let nodeDoc of nodesDocs.docs) {
        const node = nodeDoc.data();
        const isNewNode = allNodes.indexOf((title: string) => title === node.title) === -1;
        if (isNewNode) {
          allNodes.push(node.title);
          xmlContent += `
          <url>
            <loc>${getNodePageWithDomain(node.title, nodeDoc.id)}</loc>
            <lastmod>${node.updatedAt.toDate().toISOString()}</lastmod>
            <changefreq>hourly</changefreq>
          </url>`;
          xmlContent += "</urlset>";
          res.writeHead(200, { "Content-Type": "text/xml" });
          res.write(xmlContent);
          res.end();
        }
      }
    }
  }
  return {
    props: {}
  };
};

export default SiteMap;
