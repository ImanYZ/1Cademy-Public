import { GetServerSideProps } from "next";

import { db } from "@/lib/firestoreServer/admin";
import { APP_DOMAIN } from "@/lib/utils/1cademyConfig";

function SitemapIndex() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const nodesDocs = await db.collection("nodes").where("deleted", "==", false).where("isTag", "==", true).get();
  if (nodesDocs.docs.length === 0) {
    res.writeHead(404, { "Content-Type": "text/xml" });
    res.write("No Sitemap Index!");
    res.end();
  } else {
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
    for (let nodeDoc of nodesDocs.docs) {
      xmlContent += `
        <sitemap>
          <loc>${APP_DOMAIN}sitemap/${nodeDoc.id}.xml</loc>
        </sitemap>`;
    }
    xmlContent += "</sitemapindex>";
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.write(xmlContent);
    res.end();
  }
  return {
    props: {},
  };
};

export default SitemapIndex;
