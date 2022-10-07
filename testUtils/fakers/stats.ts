import { faker } from "@faker-js/faker";

import { IStats } from "../../src/types/IStats";

type IFakeStatsOptions = {
  documentId?: string;
  institutions: Number;
  links: Number;
  nodes: Number;
  proposals: Number;
  users: Number;
};

export function createStats(params: IFakeStatsOptions): IStats {
  const { documentId, institutions, links, nodes, proposals, users } = params;
  return {
    documentId: documentId ? documentId : faker.datatype.uuid(),
    institutions: typeof institutions !== "undefined" ? institutions : 0,
    links: typeof links !== "undefined" ? links : 0,
    nodes: typeof nodes !== "undefined" ? nodes : 0,
    proposals: typeof proposals !== "undefined" ? proposals : 0,
    users: typeof users !== "undefined" ? users : 0,
    createdAt: new Date(),
  };
}
