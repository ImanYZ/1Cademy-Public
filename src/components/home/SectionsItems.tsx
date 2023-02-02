export type OneCademySection = {
  id: string;
  title: string;
  label: string;
  description: string;
};
export const ONE_CADEMY_SECTIONS = [
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
    description:
      "Over the past two years, 1,543 students and researchers from 183 institutions have participated in a large-scale collaboration effort through 1Cademy. This collaboration has resulted in the creation of 44,665 nodes and 235,674 prerequisite links between them, which have been proposed through 88,167 proposals.",
    getDescription: ({ users, institutions, nodes, links, proposals, communities }: StatsSchema) =>
      `Over the past two years, [${users}] students and researchers from [${institutions}] institutions have participated in a large-scale collaboration effort through 1Cademy. This collaboration has resulted in the creation of [${nodes}] nodes and [${links}] prerequisite links between them, which have been proposed through [${proposals}] proposals. \nAs a result of this collaboration, [${communities}] research and learning communities have formed, covering a wide range of subjects such as psychology, machine learning, and virology. This collaborative effort has allowed for the sharing of knowledge and resources among students and researchers from different institutions, promoting the advancement of knowledge in various fields. \nFurthermore, it has facilitated the formation of communities of learners and researchers who can learn from each other, exchange ideas and support one another in their learning journey. This collaborative note-taking approach ensures that the notes are useful and usable for multiple students studying the same topics, and that they can improve semester by semester. Through this process, students can spend less time on note-taking and gain the most benefit from the notes.`,
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
