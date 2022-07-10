import { StatsSchema } from "../../knowledgeTypes";
import { db } from "./admin";

export const getStats = async (): Promise<StatsSchema> => {
  const statDocs = await db.collection("stats").orderBy("createdAt", "desc").limit(1).get();
  if (statDocs.docs.length > 0) {
    const statsData = statDocs.docs[0].data();
    delete statsData.createdAt;
    return {
      institutions: statsData.institutions.toLocaleString("en-US"),
      users: statsData.users.toLocaleString("en-US"),
      proposals: statsData.proposals.toLocaleString("en-US"),
      nodes: statsData.nodes.toLocaleString("en-US"),
      links: Math.round(statsData.links).toLocaleString("en-US")
    };
  }

  return {
    institutions: "0",
    users: "0",
    proposals: "0",
    nodes: "0",
    links: "0"
  };
};
