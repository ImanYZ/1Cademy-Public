const collection = "status";

const data: any[] = [
  {
    documentId: "1man",
    state: "online",
    last_online: new Date(),
  },

  {
    documentId: "AMYZH",
    state: "offline",
    last_online: new Date(new Date().getTime() - 48 * 60 * 60 * 1000), // was last online 2 days ago
  },

  {
    documentId: "A_wei",
    state: "online",
    last_online: new Date(),
  },
];

const statusData = { data, collection };

export default statusData;
