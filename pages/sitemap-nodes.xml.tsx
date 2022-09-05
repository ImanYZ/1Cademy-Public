import { GetServerSideProps } from "next";

import { db } from "../lib/admin";

const Sitemap = () => null;

const escapeBreaksQuotes = (text: string) => {
  return text
    .replace(/(?:\r\n|\r|\n)/g, "<br>")
    .replace(/['"]/g, "")
    .trim()
    .toLowerCase();
};

const encodeTitle = (title: string) => {
  return encodeURI(escapeBreaksQuotes(title)).replace(/[&\/\?\\]/g, "");
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let BASE_URL = "https://node.1cademy.us";

  const nodes: any = {};
  const nodesDocs = await db.collection("nodes").where("isTag", "==", true).get();

  await nodesDocs.docs.forEach(doc => {
    const node = doc.data();
    const nodeId = doc.id;
    const nodeTitle: string = node.title;
    const nodeValue: number = node.corrects - node.wrongs;
    const nodeUpdatedAt = node.updatedAt.toDate().toISOString();
    if (nodeTitle in nodes) {
      const valueFromNodes: any = nodes[nodeTitle];
      const nodeTags: any = node.tags || [];
      if (
        nodeTitle !== "" &&
        nodeTitle !== null &&
        nodeTitle !== undefined &&
        nodeValue > (valueFromNodes.value || 0)
      ) {
        nodes[nodeTitle] = {
          id: nodeId,
          value: nodeValue + 1,
          updatedAt: nodeUpdatedAt
        };
      }

      // Again add corresponding nodes from Node.Tags
      const elem: any = [nodeTags];
      if (elem) {
        const tagTitle = elem.title;
        const tagNode = elem.node;
        if (tagTitle in nodes) {
          const nodeValuesForTag: any = nodes[tagTitle];
          if (tagTitle !== "" && tagTitle !== null && tagTitle !== undefined) {
            nodes[tagTitle] = {
              id: tagNode,
              updatedAt: nodeUpdatedAt,
              value: nodeValuesForTag.value++
            };
          }
        } else {
          if (tagTitle !== "" && tagTitle !== null && tagTitle !== undefined) {
            nodes[tagTitle] = {
              value: 0,
              id: tagNode,
              updatedAt: nodeUpdatedAt
            };
          }
        }
      }
    } else {
      if (nodeTitle !== "" && nodeTitle !== null && nodeTitle !== undefined) {
        nodes[nodeTitle] = {
          id: nodeId,
          updatedAt: nodeUpdatedAt,
          value: nodeValue && nodeValue >= 0 ? nodeValue : 0
        };
      }
    }
  });

  const dynamicPaths = Object.entries(nodes).map(([title, node]: any) => {
    if (!node.id) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const nodeTitle = encodeTitle(title);
    return `${BASE_URL}/sitemap/${node.id}`;
  });

  const allPaths = [...dynamicPaths];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allPaths
      .map(
        url =>
          `<sitemap>
            <loc>${url}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
          </sitemap>`
      )
      .join("")}
  </sitemapindex>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {}
  };
};

export default Sitemap;
