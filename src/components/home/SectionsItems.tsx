import { StatsSchema } from "../../knowledgeTypes";

export type HomepageSection = {
  id: string;
  title: string;
  label: string;
  description: string;
  getDescription?: any;
};
export const ONE_CADEMY_SECTIONS: HomepageSection[] = [
  {
    id: "landing",
    title: "1Cademy's Landing Page",
    label: "1Cademy's Landing Page",
    description: "",
  },
  {
    id: "mechanism",
    title: "Mechanism",
    label: "Mechanism",
    description: "We collaboratively summarize, link, evaluate, and improve science on 1Cademy.",
  },
  {
    id: "magnitude",
    title: "Magnitude",
    label: "Magnitude",
    description: "",
    getDescription: ({ users, institutions, nodes, links, proposals }: StatsSchema) =>
      `Over the past two years, [${users}] students and researchers from [${institutions}] institutions have participated in a large-scale collaboration effort through 1Cademy. This collaboration has resulted in the creation of [${nodes}] nodes and [${links}] prerequisite links between them, which have been proposed through [${proposals}] proposals.`,
  },
  {
    id: "benefits",
    title: "Benefits",
    label: "Benefits",
    description: "",
  },
  {
    id: "topics",
    title: "Topics",
    label: "Topics",
    description:
      "1Cademy facilitated the formation of communities of learners and researchers who can learn from each other, exchange ideas and support one another in their learning journey.",
  },
  {
    id: "systems",
    title: "Systems",
    label: "Systems",
    description:
      "1Cademy offers a comprehensive and integrated solution that enhances the educational and research experience through its three interconnected systems.",
  },
  { id: "about-us", title: "About Us", label: "About Us", description: "" },
];
