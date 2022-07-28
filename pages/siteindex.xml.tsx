//TODO: Delete this file This is just for demo purpose

import { GetServerSideProps } from "next";

import { db } from "../lib/admin";

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
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
          <loc>https://node.1cademy.us/sitemap-015NGDPVg3ZoJ9SyiZaq.xml</loc>
        </sitemap>
        <sitemap>
          <loc>https://node.1cademy.us/sitemap-KwhAGgtGx3MDrSYIvaq4.xml</loc>
        </sitemap>
        <sitemap>
          <loc>https://node.1cademy.us/sitemap-Lm9V7WPNWC0eDJYDpW3v.xml</loc>
        </sitemap>
        <sitemap>
        <loc>https://node.1cademy.us/sitemap-WgF7yr5q7tJc54apVQSr.xml</loc>
      </sitemap>
      <sitemap>
        <loc>https://node.1cademy.us/sitemap-Z5I4I5OIIfcUY6iPizRZ.xml</loc>
      </sitemap>
    </sitemapindex>`;
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.write(xmlContent);
    res.end();
  }
  return {
    props: {}
  };
};

export default SitemapIndex;
