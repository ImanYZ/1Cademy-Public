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

function generateAlias(name) {
  const alias = String(name)
    .toLowerCase()
    .replace(/[^a-z- ]/g, "")
    .trim()
    .replace(/ /g, "-")
    .replace(/[-]+/g, "-");
  if (!alias.length) return "-";
  return alias;
}

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
    </url>`;
  });

  sitemap += `\n</urlset>`;
  return sitemap;
}

async function main() {
  const db = admin.firestore();
  const nodes = await db.collection("nodes").where("deleted", "==", false).where("isTag", "==", true).get();

  // for sitemap index builder
  let sitemaps = [];
  const pages = {};
  const communityIds = [];

  for (const node of nodes.docs) {
    const nodeData = node.data();
    communityIds.push({
      id: node.id,
      title: nodeData.title,
    });
    console.log(
      `${process.env.APP_URL}/node/${generateAlias(nodeData.title)}/${node.id}`,
      nodeData.title,
      node.id,
      "c"
    );
    pages[node.id] = {
      url: `${process.env.APP_URL}/node/${generateAlias(nodeData.title)}/${node.id}`,
      updated_at: nodeData.updatedAt.toDate().toISOString(),
    };
  }

  // community sitemaps
  for (const community of communityIds) {
    const contentNodes = await db
      .collection("nodes")
      .where("deleted", "==", false)
      .where("tags", "array-contains", {
        node: community.id,
        title: community.title,
      })
      .get();

    // individual nodes in this community
    for (const contentNode of contentNodes.docs) {
      const contentNodeData = contentNode.data();
      // if node already present in pages hashmap
      if (pages.hasOwnProperty(contentNode.id)) continue;
      console.log(
        `${process.env.APP_URL}/node/${generateAlias(contentNodeData.title)}/${contentNode.id}`,
        contentNodeData.title,
        contentNode.id
      );
      pages[contentNode.id] = {
        url: `${process.env.APP_URL}/node/${generateAlias(contentNodeData.title)}/${contentNode.id}`,
        updated_at: contentNodeData.updatedAt.toDate().toISOString(),
      };
    }
  }

  // this variable will hold sitemap (urlset) or sitemap index, contents depends upon total entries
  let sitemapContent = "";

  let _nodes = Object.values(pages);
  // apply sub indexes strategy for community tags
  // sitemap can have atmost 50000 entries and should not exceed 50MB in size
  // we are using 40000 to be safe in case of size per entry increases
  if (_nodes.length > 40000) {
    const subSitemaps = [];
    while (_nodes.length > 0) {
      subSitemaps.push(_nodes.splice(0, 40000));
    }

    // building each sitemap with atmost 40k entries
    let c = 1;
    for (const subSitemapIndex of subSitemaps) {
      const _sitemapContent = await buildSitemap(subSitemapIndex);
      const communitySubSmFilename = `sitemaps/sitemap_${c}.xml`;
      // pushing sub tree sitemap to bucket
      const communitySubSmUrl = await uploadToBucket(communitySubSmFilename, _sitemapContent);
      sitemaps.push({
        url: communitySubSmUrl,
        updated_at: new Date().toISOString(),
      });
      c++;
    }
    sitemapContent = await buildSitemapIndex(sitemaps);
  } else {
    // building sitemap in index because, entries were less than 40k
    sitemapContent = await buildSitemap(_nodes);
  }

  // pushing sitemap index to bucket
  try {
    const sitemapIndexUrl = await uploadToBucket(`sitemap_index.xml`, sitemapContent);
    console.log(sitemapIndexUrl, "Sitemap index url");
  } catch (e) {
    console.log(e.message);
    throw new Error(`Error while upload to cloud storage: sitemap_index.xml`);
  }
}

main();
