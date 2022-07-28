import { FilterValue } from "../../knowledgeTypes";
import { db } from "./admin";

export const getInstitutionsForAutocomplete = async (institutions: string[]) => {
  const response: FilterValue[] = [];
  for (let institution of institutions) {
    if (institution.length === 0) {
      continue;
    }
    const institutionDoc = await db.collection("institutions").doc(institution).get();
    if (!institutionDoc.exists || !institutionDoc.data()) {
      continue;
    }
    const institutionData = institutionDoc.data();

    response.push({
      id: institution,
      imageUrl: institutionData?.logoURL || null,
      name: institutionData?.name || ""
    });
  }

  return response;
};
