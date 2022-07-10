import { FilterValue } from "../../src/knowledgeTypes";
import { db } from "./admin";

export const getContributorsForAutocomplete = async (users: string[]) => {
  const response: FilterValue[] = [];
  for (let user of users) {
    if (user.length === 0) {
      continue;
    }
    const userDoc = await db.collection("users").doc(user).get();
    if (!userDoc.exists || !userDoc.data()) {
      continue;
    }
    const userData = userDoc.data();

    response.push({
      id: user,
      imageUrl: userData?.imageUrl,
      name: `${userData?.fName || ""} ${userData?.lName || ""}`
    });
  }

  return response;
};
