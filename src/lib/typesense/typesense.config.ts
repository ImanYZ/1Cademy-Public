import Typesense from "typesense";

export const clientTypesense = new Typesense.Client({
  nodes: [
    {
      host: process.env.ONECADEMYCRED_TYPESENSE_HOST as string,
      port: parseInt(process.env.ONECADEMYCRED_TYPESENSE_PORT as string),
      protocol: process.env.ONECADEMYCRED_TYPESENSE_PROTOCOL as string,
    },
  ],
  apiKey: process.env.ONECADEMYCRED_TYPESENSE_APIKEY as string,
});

export const getTypesenseClient = () => {
  const client = new Typesense.Client({
    nodes: [
      {
        host: process.env.ONECADEMYCRED_TYPESENSE_HOST as string,
        port: parseInt(process.env.ONECADEMYCRED_TYPESENSE_PORT as string),
        protocol: process.env.ONECADEMYCRED_TYPESENSE_PROTOCOL as string,
      },
    ],
    apiKey: process.env.ONECADEMYCRED_TYPESENSE_APIKEY as string,
  });
  return client;
};

export const typesenseDocumentExists = async (collection: string, documentId: string) => {
  const typesense = getTypesenseClient();
  try {
    await typesense.collections(collection).documents(documentId).retrieve();
    return true;
  } catch (e) {}
  return false;
};

export const typesenseCollectionExists = async (collection: string) => {
  const typesense = getTypesenseClient();
  try {
    await typesense.collections(collection).retrieve();
    return true;
  } catch (e) {}
  return false;
};
