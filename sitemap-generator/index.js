require("dotenv").config();

const { cert } = require("firebase-admin/app");
const firebaseAdmin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");

// Initializing Firebase that has data for nodes and communities
const admin = firebaseAdmin.initializeApp({
  credential: cert({
    type: process.env.ONECADEMYCRED_TYPE,
    project_id: process.env.NEXT_PUBLIC_PROJECT_ID,
    private_key_id: process.env.ONECADEMYCRED_PRIVATE_KEY_ID,
    private_key: process.env.ONECADEMYCRED_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.ONECADEMYCRED_CLIENT_EMAIL,
    client_id: process.env.ONECADEMYCRED_CLIENT_ID,
    auth_uri: process.env.ONECADEMYCRED_AUTH_URI,
    token_uri: process.env.ONECADEMYCRED_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.ONECADEMYCRED_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.ONECADEMYCRED_CLIENT_X509_CERT_URL,
    databaseURL: process.env.NEXT_PUBLIC_DATA_BASE_URL,
  }),
});

// bucket storage initialization, in our case storage was in different project otherwise we can use single service to connect both of services
const storage = new Storage({
  credentials: {
    type: process.env.GCSTORAGE_TYPE,
    project_id: process.env.GCSTORAGE_PROJECT_ID,
    private_key_id: process.env.GCSTORAGE_PRIVATE_KEY_ID,
    private_key: process.env.GCSTORAGE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.GCSTORAGE_CLIENT_EMAIL,
    client_id: process.env.GCSTORAGE_CLIENT_ID,
    auth_uri: process.env.GCSTORAGE_AUTH_URI,
    token_uri: process.env.GCSTORAGE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GCSTORAGE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GCSTORAGE_CLIENT_X509_CERT_URL,
  },
});
const bucket = storage.bucket(process.env.STATIC_STORAGE_BUCKET);

// function generateAlias(name) {
//   let alias = String(name)
//     .toLowerCase()
//     .replace(/[^a-z- ]/g, "")
//     .trim()
//     .replace(/ /g, "-")
//     .replace(/[-]+/g, "-")
//     .replace(/^-/, "")
//     .replace(/-$/, "")
//     .split("-")
//     .splice(0, 20)
//     .join("-");
//   if (!alias.length) return "-";
//   if (alias.length > 100) {
//     return alias.substring(0, 100);
//   }
//   return alias;
// }

async function uploadToBucket(path, content) {
  await bucket.file(path).save(content);
  await bucket.file(path).makePublic();
  return `https://${process.env.STATIC_STORAGE_BUCKET}/${path}`;
}

async function buildSitemapIndex(sitemaps) {
  // building sitemap index (for sitemap urls)
  let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapIndex += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  sitemaps.forEach(sitemap => {
    sitemapIndex += `<sitemap>
      <loc>${sitemap.url}</loc>
    </sitemap>`;
  });

  sitemapIndex += `\n</sitemapindex>`;
  return sitemapIndex;
}

async function buildSitemap(pages) {
  // building individual sitemap (for page urls)
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  pages.forEach(page => {
    sitemap += `<url>
      <loc>${page.url}</loc>
      <lastmod>${page.updated_at}</lastmod>
      ${page.priority ? "<priority>" + page.priority + "</priority>" : ""}
    </url>`;
  });

  sitemap += `\n</urlset>`;
  return sitemap;
}

async function main() {
  const db = admin.firestore();

  // for sitemap index builder
  let sitemaps = [];

  const nodesQuery = db.collection("nodes");

  let lastNodeDoc = (await nodesQuery.limit(1).get()).docs[0];
  let nodes = [];
  const nodeData = lastNodeDoc.data();
  nodes.push({
    url: `${process.env.APP_URL}/node/${nodeData.nodeSlug}/${lastNodeDoc.id}`,
    priority: nodeData.isTag ? 1 : 0.7,
    updated_at: nodeData.updatedAt.toDate().toISOString(),
  });

  let totalNodes = 1;

  // building each sitemap with atmost 40k entries
  let c = 1;
  while (lastNodeDoc) {
    // apply sub indexes strategy for community tags
    // sitemap can have atmost 50000 entries and should not exceed 50MB in size
    // we are using 40000 to be safe in case of size per entry increases
    const _nodes = await db.collection("nodes").startAfter(lastNodeDoc).limit(40000).get();
    lastNodeDoc = null;
    for (const node of _nodes.docs) {
      const nodeData = node.data();
      if (nodeData.deleted) {
        continue;
      }
      nodes.push({
        url: `${process.env.APP_URL}/node/${nodeData.nodeSlug}/${node.id}`,
        priority: nodeData.isTag ? 1 : 0.7,
        updated_at: nodeData.updatedAt.toDate().toISOString(),
      });
      lastNodeDoc = node;
      totalNodes++;
    }

    // if last node empty don't create sitemap as it will create empty sitemap
    if (!lastNodeDoc) {
      continue;
    }
    const comSitemapFile = `sitemaps/sitemap_${c++}.xml`;
    const sitemapContent = await buildSitemap(nodes);
    const communitySubSmUrl = await uploadToBucket(comSitemapFile, sitemapContent);

    sitemaps.push({
      url: communitySubSmUrl,
      updated_at: new Date().toISOString(),
    });
    nodes = [];
  }

  console.log("Sitemap Node Count: ", totalNodes);

  const sitemapIndex = await buildSitemapIndex(sitemaps);
  // pushing sitemap index to bucket
  try {
    const sitemapIndexUrl = await uploadToBucket(`sitemap_index.xml`, sitemapIndex);
    console.log(sitemapIndexUrl, "Sitemap index url");
  } catch (e) {
    console.log(e.message);
    throw new Error(`Error while upload to cloud storage: sitemap_index.xml`);
  }
}

main();
