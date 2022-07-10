import { NextApiRequest, NextApiResponse } from "next";
import Typesense from "typesense";
import { SearchParams } from "typesense/lib/Typesense/Documents";

import { getQueryParameter } from "../../lib/utils";
import { FilterValue, ResponseAutocompleteFilter } from "../../src/knowledgeTypes";

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseAutocompleteFilter>) {
  const q = getQueryParameter(req.query.q) || "";

  const client = new Typesense.Client({
    nodes: [
      {
        host: process.env.ONECADEMYCRED_TYPESENSE_HOST as string,
        port: parseInt(process.env.ONECADEMYCRED_TYPESENSE_PORT as string),
        protocol: process.env.ONECADEMYCRED_TYPESENSE_PROTOCOL as string
      }
    ],
    apiKey: process.env.ONECADEMYCRED_TYPESENSE_APIKEY as string
  });

  if (q.length === 0) {
    const response: ResponseAutocompleteFilter = {
      results: defaultInstitutions
    };
    res.status(200).json(response);
    return;
  }

  try {
    const searchParameters: SearchParams = { q, query_by: "name" };
    const searchResults = await client
      .collections<{ id: string; name: string; logoURL: string }>("institutions")
      .documents()
      .search(searchParameters);
    const results: FilterValue[] | undefined = searchResults.hits?.map(el => ({
      id: el.document.id,
      name: el.document.name,
      imageUrl: el.document.logoURL
    }));
    const response: ResponseAutocompleteFilter = {
      results: results || []
    };
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Cannot get institutions" });
  }
}

const defaultInstitutions = [
  {
    id: "lsC37AFtQ44Jq8vfSzr6",
    name: "University of Michigan - Ann Arbor",
    imageUrl:
      "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/University%20of%20Michigan%20-%20Ann%20Arbor.png"
  },
  {
    id: "Du5EiRth5TPl4KUyKCGl",
    name: "Shenandoah University",
    imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/Shenandoah%20University.png"
  },
  {
    id: "G3Ac3nERuyXuKkluA1SX",
    name: "Smith College",
    imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/Smith%20College.png"
  },
  {
    id: "k5tbLtCBxBO0wuWJxsAd",
    name: "Grinnell College",
    imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/Grinnell%20College.png"
  },
  {
    id: "Jyp3wLc5UCXg3KoXpvjt",
    name: "Georgetown University",
    imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/Georgetown%20University.png"
  },
  {
    id: "10DQIZoac3TsRxqwormd",
    name: "Rutgers University, Newark",
    imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/Rutgers%20University,%20Newark.png"
  },
  {
    id: "8Ocr2ue2ATSqdGTtcds4",
    name: "Pepperdine University",
    imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/Pepperdine%20University.png"
  },
  {
    id: "C4c9txyIZ8i6mDNgsOab",
    name: "University of California, Davis",
    imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/University%20of%20California,%20Davis.png"
  },

  {
    id: "VpITXBFmGYbs2rzmSTKC",
    name: "Syracuse University",
    imageUrl: "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/Syracuse%20University.png"
  }
];

export default handler;
