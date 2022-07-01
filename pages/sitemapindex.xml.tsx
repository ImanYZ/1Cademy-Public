import { db } from "../lib/admin";

function sitemapIndex() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  const nodesDocs = await db.collection("nodes").where("deleted", "==", false).where("isTag", "==", true).get();
  if (nodesDocs.docs.length === 0) {
    res.writeHeader(404, { "Content-Type": "text/xml" });
    res.write("No Sitemap Index!");
    res.end();
  } else {
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (let nodeDoc of nodesDocs.docs) {
      xmlContent += `
        <sitemap>
          <loc>https://node.1cademy.us/sitemap/${nodeDoc.id}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
        </sitemap>`;
    }
    xmlContent += "</sitemapindex>";
    res.writeHeader(200, { "Content-Type": "text/xml" });
    res.write(xmlContent);
    res.end();
  }
  return {
    props: {}
  };
}

export default sitemapIndex;
