import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";

import { db } from "../../lib/admin";
import { getNodePageWithDomain } from "../../lib/utils";

const SiteMap = () => null;

interface Params extends ParsedUrlQuery {
  nodeId: string;
}

export const getServerSideProps: GetServerSideProps<any, Params> = async ({ res, params }) => {
  if (!params)
    return {
      props: {}
    };
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
      // res.writeHead(404, { "Content-Type": "text/xml" });
      // res.write(`<message>No child nodes found for Id: ${nodeId}</message>`);
      // res.end();
      res.setHeader('Content-Type', 'text/xml');
      res.write(`<message>No child nodes found for Id: ${nodeId}</message>`);
      res.end();

    } else {
      const nodes: any = {};
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
      let xmlContent =
        '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
      Object.entries(nodes).forEach(([title, node]: any) => {
        xmlContent += `
          <url>
            <loc>${getNodePageWithDomain(title, node.id)}</loc>
            <lastmod>${node.updatedAt}</lastmod>
            <changefreq>hourly</changefreq>
          </url>`;
      });
      xmlContent += "</urlset>";
      res.setHeader('Content-Type', 'text/xml');
      res.write(xmlContent);
      res.end();
    }
  }
  return {
    props: {}
  };
}

export default SiteMap;
