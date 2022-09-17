require("dotenv").config();

const {cert} = require("firebase-admin/app");
const firebaseAdmin = require("firebase-admin");
const { Storage } = require('@google-cloud/storage');

const escapeBreaksQuotes = (text) => {
  if (!text) {
    return "";
  }
  return text.replace(/(?:\r\n|\r|\n)/g, " ").replace(/['"]/g, "");
}

const escapeHtmlEntites = (text) => {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const encodeTitle = (title) => {
  return escapeHtmlEntites(escapeBreaksQuotes(String(title)));
}

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
      databaseURL: process.env.NEXT_PUBLIC_DATA_BASE_URL
    })
});

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
    client_x509_cert_url: process.env.GCSTORAGE_CLIENT_X509_CERT_URL
  }
});
const bucket = storage.bucket(process.env.STATIC_STORAGE_BUCKET);

function generateAlias(name) {
  return String(name).toLowerCase().replace(/[^a-z- ]/g, '').trim().replace(/ /g, '-')
}

async function uploadToBucket(path, content) {
  await bucket.file(path).save(content)
  await bucket.file(path).makePublic()
  return `https://${process.env.STATIC_STORAGE_BUCKET}/${path}`;
}

async function buildSitemapIndex(sitemaps) {
  // building sitemap index (for sitemap urls)
  let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n'
  sitemapIndex += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  sitemaps.forEach((sitemap) => {
    sitemapIndex += `<sitemap>
      <loc>${sitemap.url}</loc>
      <lastmod>${sitemap.updated_at}</lastmod>
    </sitemap>`
  })
  
  sitemapIndex += `\n</sitemapindex>`;
  return sitemapIndex;
}

async function buildSitemap(pages) {
  // building individual sitemap (for page urls)
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`
  sitemap += `<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  
  pages.forEach((page) => {
    sitemap += `<url>
      <loc>${page.url}</loc>
      <lastmod>${page.updated_at}</lastmod>
    </url>`
  })

  sitemap += `\n</urlset>`
  return sitemap;
}

async function main() {

  const db = admin.firestore();
  const nodes = await db.collection('nodes')
    .where('deleted', '==', false)
    .where('isTag', '==', true).get();

  // for individual sitemaps
  const communityList = [];

  // for sitemap index builder
  let sitemaps = [];
  
  for(const node of nodes.docs) {
    const nodeData = node.data();
    const communitySmUrl = `sitemaps/community-${generateAlias(nodeData.title)}.xml`;

    communityList.push([
      node.id, nodeData.title, communitySmUrl,
      nodeData.updatedAt.toDate().toISOString()
    ])

    sitemaps.push({
      url: `https://${process.env.STATIC_STORAGE_BUCKET}/${communitySmUrl}`,
      updated_at: nodeData.updatedAt.toDate().toISOString()
    })
  }

  // sitemap can have atmost 50000 entries and should not exceed 50MB in size
  // we are using 40000 to be safe in case of size per entry increases
  if(sitemaps.length > 40000) {
    const sitemapIndexes = [];
    while(sitemaps.length > 0) {
      sitemapIndexes.push(sitemaps.splice(0, 40000))
    }

    let c = 1
    for(const sitemapSubindex of sitemapIndexes) {
      const sitemapFilename = `sitemap_index_${c}.xml`;
      const sitemapIndexUrl = await uploadToBucket(sitemapFilename, await buildSitemapIndex(sitemapSubindex))
      console.log(sitemapIndexUrl, 'Sitemap sub index url')
      sitemaps.push({
        url: `https://${process.env.STATIC_STORAGE_BUCKET}/${sitemapFilename}`,
        updated_at: (new Date()).toISOString()
      })
      c++
    }
  }

  // community sitemaps
  for(const community of communityList) {
    const pages = [];
    const contentNodes = await db.collection('nodes')
      .where('deleted', '==', false)
      .where('tags', 'array-contains', {
        node: community[0],
        title: community[1]
      }).get()
    
    // community url itself
    pages.push({
      url: `${process.env.APP_URL}/node/${generateAlias(community[1])}/${community[0]}`,
      updated_at: community[3]
    })

    // individual nodes in this community
    for(const contentNode of contentNodes.docs) {
      const contentNodeData = contentNode.data();
      pages.push({
        url: `${process.env.APP_URL}/node/${generateAlias(contentNodeData.title)}/${contentNode.id}`,
        updated_at: contentNodeData.updatedAt.toDate().toISOString()
      })
    }

    let sitemapContent = '';

    // apply sub indexes strategy for community tags
    if(pages.length > 40000) {
      const subCommunityIndexes = [];
      while(pages.length > 0) {
        subCommunityIndexes.push(pages.splice(0, 40000))
      }

      const communityMap = [];
      let c = 1
      for(const sitemapSubindex of subCommunityIndexes) {
        const communitySubSmFilename = `sitemaps/${community[0]}_${c}.xml`;
        const communitySubSmUrl = await uploadToBucket(communitySubSmFilename, await buildSitemap(sitemapSubindex))
        communityMap.push({
          url: communitySubSmUrl,
          updated_at: (new Date()).toISOString()
        })
        console.log(communitySubSmUrl, 'Community sub index url')
        c++
      }

      sitemapContent = await buildSitemapIndex(communityMap)
    } else {
      sitemapContent = await buildSitemap(pages)
    }
    // pushing community sitemap to bucket
    try {
      const communityUrl = await uploadToBucket(community[2], sitemapContent)
      console.log(communityUrl, 'community sitemap url')
    } catch(e) {
      throw new Error(`Error while upload to cloud storage: ${community[2]}`)
    }
  }
  
  // pushing sitemap index to bucket
  const sitemapIndexContent = await buildSitemapIndex(sitemaps)
  try {
    const sitemapIndexUrl = await uploadToBucket(`sitemap_index.xml`, sitemapIndexContent)
    console.log(sitemapIndexUrl, 'Sitemap index url')
  } catch(e) {
    console.log(e.message)
    throw new Error(`Error while upload to cloud storage: sitemap_index.xml`)
  }
}

main();