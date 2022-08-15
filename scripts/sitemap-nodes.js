const fs = require("fs");
const prettier = require("prettier");

const getDate = new Date().toISOString();
import { db } from "../lib/admin.ts";

const BASE_URL = 'https://node.1cademy.us';

const formatted = (sitemap) => prettier.format(sitemap, { parser: "html" });

const escapeBreaksQuotes = (text) => {
  return text.replace(/(?:\r\n|\r|\n)/g, "<br>").replace(/['"]/g, "").trim().toLowerCase();
};

const encodeTitle = (title) => {
  return encodeURI(escapeBreaksQuotes(title)).replace(/[&\/\?\\]/g, "");
};

(async () => {
  const nodes = {};
  const nodesDocs = await db.collection("nodes").where("isTag", "==", true).get();

  await nodesDocs.docs.map(doc => {
    const node = doc.data();
    const nodeId = doc.id;
    const nodeTitle = node.title;
    const nodeValue = node.corrects - node.wrongs;
    const nodeUpdatedAt = node.updatedAt.toDate().toISOString();
    if (nodeTitle in nodes) {
      const ObjValues = Object.values(nodes)[0];
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

  const dynamicPaths = await Object.entries(nodes).map(([title, node]) => {
    if (!node.id) {
      return;
    }
    const nodeTitle = encodeTitle(title);
    return `${BASE_URL}/node/${nodeTitle}/${node.id}`
  });

  const allPaths = await [...dynamicPaths];

  const nodesSitemap = `
    ${allPaths
      .map(url => (
        `<url>
            <loc>${url}</loc>
            <lastmod>${getDate}</lastmod>
          </url>`))
      .join("")}
  `;

  const generatedSitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
    >
      ${nodesSitemap}
    </urlset>
  `;

  const formattedSitemap = [formatted(generatedSitemap)];

  fs.writeFileSync("../public/sitemap-posts.xml", formattedSitemap, "utf8");
})();
