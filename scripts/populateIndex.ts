import Typesense from "typesense";
import { CollectionFieldSchema } from "typesense/lib/Typesense/Collection";

import config from "./typesenseConfig";

const main = async (
  indexName: string,
  fields: CollectionFieldSchema[],
  dataToImport: any[],
  forceReIndex?: boolean
) => {
  const client = new Typesense.Client({
    nodes: [
      {
        host: config.host,
        port: config.port,
        protocol: config.protocol
      }
    ],
    connectionTimeoutSeconds: 1000,
    apiKey: config.apiKey
  });

  const schema = {
    name: indexName,
    fields
  };

  console.log(`--- Populating data index in Typesense for  ${indexName} ---`);
  let reindexNeeded = false;
  try {
    const collection = await client.collections(indexName).retrieve();
    console.log(`Found existing schema: ${indexName}`);
    if (collection.num_documents !== dataToImport.length || forceReIndex) {
      console.log(`Deleting existing schema:  ${indexName}`);
      reindexNeeded = true;
      await client.collections(indexName).delete();
    }
  } catch (e) {
    reindexNeeded = true;
  }

  if (!reindexNeeded) {
    return true;
  }

  console.log(`Creating schema:  ${indexName}`);
  await client.collections().create(schema);

  console.log("Adding records: ");

  // Bulk Import
  try {
    const returnData = await client.collections(indexName).documents().import(dataToImport);
    console.log(`*** Done indexing:  ${indexName} ***`);

    const failedItems = returnData.filter(item => item.success === false);
    if (failedItems.length > 0) {
      throw new Error(`Error indexing items ${JSON.stringify(failedItems, null, 2)}`);
    }
    return returnData;
  } catch (error) {
    console.log(error);
  }
};

export default main;
