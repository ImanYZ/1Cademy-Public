import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";

import { db } from "../../lib/admin";
import { getNodePageUrl } from "../../lib/utils";
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
  const tagDoc = await db.collection("nodes").doc(params.nodeId).get();
  if (!tagDoc.exists) {
    res.writeHead(404, { "Content-Type": "text/xml" });
    res.write("No Sitemap for Id: " + params.nodeId);
    res.end();
  } else {
    const tagData = tagDoc.data();
    const nodesDocs = await db
      .collection("nodes")
      .where("deleted", "==", false)
      .where("tags", "array-contains", {
        node: params.nodeId,
        title: tagData?.title
      })
      .get();
    if (nodesDocs.docs.length === 0) {
      res.writeHead(404, { "Content-Type": "text/xml" });
      res.write("No Sitemap!");
      res.end();
    } else {
      let xmlContent =
        '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
      for (let nodeDoc of nodesDocs.docs) {
        const nodeData = nodeDoc.data();
        xmlContent += `
          <url>
            <loc>https://node.1cademy.us${getNodePageUrl(nodeData.title, nodeDoc.id)}</loc>
            <lastmod>${nodeData.updatedAt.toDate().toISOString()}</lastmod>
            <changefreq>hourly</changefreq>
          </url>`;
      }
      xmlContent += "</urlset>";
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.write(xmlContent);
      res.end();
    }
  }
  return {
    props: {}
  };
};
export default SiteMap;
