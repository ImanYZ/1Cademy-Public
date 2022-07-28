"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typesense_1 = __importDefault(require("typesense"));
const typesenseConfig_1 = __importDefault(require("./typesenseConfig"));
const main = async (indexName, fields, dataToImport, forceReIndex) => {
    const client = new typesense_1.default.Client({
        nodes: [
            {
                host: typesenseConfig_1.default.host,
                port: typesenseConfig_1.default.port,
                protocol: typesenseConfig_1.default.protocol
            }
        ],
        connectionTimeoutSeconds: 1000,
        apiKey: typesenseConfig_1.default.apiKey
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
    }
    catch (e) {
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
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = main;
