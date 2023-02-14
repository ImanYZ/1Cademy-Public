import { StatsSchema } from "../../knowledgeTypes";

export type HomepageSection = {
  id: string;
  title: string;
  label: string;
  description: string;
  getDescription?: any;
  options: { title: string; description: string; link: string }[];
};
export const ONE_CADEMY_SECTIONS: HomepageSection[] = [
  {
    id: "landing",
    title: "1Cademy's Landing Page",
    label: "1Cademy's Landing Page",
    description: "",
    options: [],
  },
  {
    id: "mechanism",
    title: "Mechanism",
    label: "Mechanism",
    description: "We collaboratively summarize, link, evaluate, and improve science on 1Cademy.",
    options: [],
  },
  {
    id: "magnitude",
    title: "Magnitude",
    label: "Magnitude",
    description: `Over the past two years, ${1543} students and researchers from ${183} institutions have participated in a large-scale collaboration effort through 1Cademy. This collaboration has resulted in the creation of ${44665} nodes and ${235674} prerequisite links between them, which have been proposed through [${88167}] proposals.`,
    getDescription: ({ users, institutions, nodes, links, proposals }: StatsSchema) =>
      `Over the past two years, [${users}] students and researchers from [${institutions}] institutions have participated in a large-scale collaboration effort through 1Cademy. This collaboration has resulted in the creation of [${nodes}] nodes and [${links}] prerequisite links between them, which have been proposed through [${proposals}] proposals.`,
    options: [],
  },
  {
    id: "benefits",
    title: "Benefits",
    label: "Benefits",
    description: "",
    options: [],
  },
  {
    id: "topics",
    title: "Topics",
    label: "Topics",
    description:
      "1Cademy facilitated the formation of communities of learners and researchers who can learn from each other, exchange ideas and support one another in their learning journey.",
    options: [
      {
        title: "UX Research In Online Communities",
        description: `1Cademy is a collaborative community that supports interdisciplinary research and learning through content generation, mapping, and evaluation. We have multiple successful communities from various fields collaborating regularly by summarizing and organizing content on the platform. This community is focused on learning how to make healthier, more engaged online communities in order to improve our users’ learning, contributions, and experience.
    The UX Research in Online Communities team is dedicated to uncovering, presenting, and compiling the latest literature and research on creating and maintaining engaging and beneficial online communities. Our goal is to understand how to foster online communities where users actively contribute their ideas and value the perspectives of their peers. We are seeking a team of dedicated students to conduct thorough research in various disciplines including psychology, social science, cognitive science, information science, and economics. Utilizing the 1Cademy platform, we will take notes, organize ideas, and map concepts from the literature we find. Ultimately, our aim is to apply our findings to make meaningful improvements to the 1Cademy platform and enhance the user experience of our online communities.
    `,
        link: "/community/UX_Research_in_Online_Communities",
      },
      {
        title: "Clinical Psychology",
        description: `The Clinical Psychology community explores research related to mental illness/disorders, mental health treatment, and psychopathology of individuals across the lifespan. Clinical psychology is interdisciplinary and can intersect with various fields such as neuroscience, cognitive psychology, and social psychology. We encourage interns to dive into research that they have particular interest in (e.g., child psychopathology), share their findings, and collaborate with other interns. This internship is designed to motivate independent research, gain research skills such as analysis and interpretation, and work towards conducting research.
        1Cademy allows interns to present their research findings, gain feedback from other interns, and learn how to communicate their findings in a concise and articulate manner.`,
        link: "/community/Clinical_Psychology",
      },
      {
        title: "Health Psychology",
        description:
          "The goal of the health psychology community is to inspire the development of key research skills while conducting a review of health psychology literature. Using credible, scholarly articles, we are exploring various topics within the field of health psychology, including: behavioral therapies for mental illness, the intersection of race and gender in the healthcare industry, what motivates people to maintain a healthy lifestyle, and the complex role of the media in health. As we compile our research using 1Cademy, we hope to discover patterns and gaps in the literature that could be addressed in a future study of our own design. Each week, interns read an article, summarize it using 1Cademy, present their findings to the group, and engage in thoughtful discussion about themes present in their article.",
        link: "/community/Health_Psychology",
      },
      {
        title: "Disability Studies",
        description:
          "The Disability Studies community explores current and past research related to disability. We investigate a wide range of topics related to disability including, disability legislation, disability culture, the psychosocial impact of disability, the economics of disability, and more. Interns summarize research articles and present their findings weekly with the rest of the group. By using 1Cademy, interns learn how to break down articles into smaller ideas, connect them to broader concepts, extrapolate the research for deeper analysis, and communicate their findings to other community members. We value collaborative learning and expect interns to participate in group discussions to dive deeper into the content.",
        link: "/community/Disability_Studies",
      },
      {
        title: "Social Psychology",
        description:
          "The Social Psychology community explores published research in the field and conducts relevant studies. Interns are responsible for aiding in the ideation and completion of studies. They also summarize research articles and present their findings with the rest of the group. By using 1Cademy, interns learn how to break down articles into granular and connected concepts to best communicate their findings to other community members. We value collaborative learning and expect interns to participate in group discussions to dive deeper into the content. Topics that the community will explore in a research setting include the effects of achievement/effort on performance, ways to increase motivation, and ways to diminish misinformation. While some initial work has been made, interns are welcome to join as soon as possible to receive the necessary training and begin collaborating with us.",
        link: "/community/Social_Psychology",
      },
      {
        title: "Natural Language Processing",
        description:
          "Welcome to the Deep Learning Community! Our community predominantly contributes to the nlp area on 1Cademy, our collaborative research platform. This semester, we will explore different deep learning topics , mainly NLP topics, by going through selected papers every week. Our team members will dive into these papers and present what they've been learning throughout each week by walking us through the nodes they have designed during our weekly team meetings. We also encourage our interns to work on a specific topic together as a team so that they may write a survey paper together before finishing the internship. After meeting certain requirements, you will be invited to join our small research group to work on concrete research ideas.",
        link: "/community/Deep_Learning",
      },
      {
        title: "UX Research in Cognitive Psychology of Learning",
        description: `We study the UX Research and Cognitive Psychology literature on learning and memorizing. Using 1Cademy, we break down articles into granular knowledge pieces, connect them within a larger context of research, communicate our findings to other community members, and utilize our knowledge to conduct research. We conduct online controlled experiments using our research pipeline and co-author research papers to submit to reputable journals and conferences.`,
        link: "/community/Cognitive_Psychology",
      },
      {
        title: "Liaison Librarians",
        description:
          "The 1Cademy Librarian community supports the information processes of all the communities on the 1Cademy platform. We do this by liaising with the co-leaders and interns from each community to help them develop their area of the map and information literacy skills. This work supports communities across all fields of focus in three ways: 1) Embedded Liaison: We work directly with other communities and attend meetings to help create, edit, and arrange their content 2) Asynchronous Support: We review a portion of a community's map during Librarian meetings 3) Consultations: We give feedback directly to co-leaders of other communities when they attend our weekly meetings Through each of these efforts communities receive the support they need to locate, interpret, abstract, disseminate, and organize knowledge clearly, comprehensively, and accurately on the 1Cademy Platform.",
        link: "/community/Liaison_Librarians",
      },
    ],
  },
  {
    id: "systems",
    title: "Systems",
    label: "Systems",
    description:
      "1Cademy offers a comprehensive and integrated solution that enhances the educational and research experience through its three interconnected systems.",
    options: [],
  },
  { id: "about-us", title: "About Us", label: "About Us", description: "", options: [] },
];
