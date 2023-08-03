import { Link, Typography } from "@mui/material";
import { ReactNode } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

export type HomepageSection = {
  id: string;
  title: string;
  label: string;
  image?: string;
  imageDark?: string;
  description: ReactNode;
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
    title: "How It Works",
    label: "How It Works",
    description:
      // "Through human-AI collaboration, we summarize, link, evaluate, improve, and learn science for long-term.",
      "Dive into the future of education with 1Cademy, where technology and pedagogy align to elevate the learning experience to unprecedented heights. Your journey towards effective and efficient online education starts here!",
    options: [],
  },
  {
    id: "magnitude",
    title: "Research Communities",
    label: "Research Communities",
    image: "Research_Communities.svg",
    imageDark: "Research_Communities.svg",
    description: (
      <Typography
        color={theme => (theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray200 : DESIGN_SYSTEM_COLORS.gray600)}
        sx={{ fontSize: "20px", maxWidth: "500px" }}
      >
        1Cademy has fostered the development of communities of enthusiasts for{" "}
        <Link href="https://1cademy.com/community/education-and-psychology-research" target="_blank" rel="noopener">
          various scientific subjects
        </Link>
        , comprising individuals from diverse educational institutions and research organizations. These enthusiasts
        share their discoveries and insights on 1Cademy and come together on a weekly basis to delve deeper into their
        areas of interest. Through these interactions, we gain insight into the cutting-edge research and learning
        taking place at our collaborators' institutions and are able to draw connections that inspire new research
        ideas.
      </Typography>
    ),
    //     getDescription: ({ users, institutions, nodes, links, proposals }: StatsSchema) =>
    //       `Over the past two years, [${users}] students and researchers from [${institutions}] institutions have participated in a large-scale collaboration effort through 1Cademy. This collaboration has resulted in the creation of [${nodes}] nodes and [${links}] prerequisite links between them, which have been proposed through [${proposals}] proposals.
    //       It is truly inspiring to witness the collaborative learning environment that has been fostered at 1Cademy, where students from both top-ranked and low-ranked schools can come together regardless of their background, ethnicity, or socio-economic status.
    // Through this platform, students are able to share their unique learning pathways, making difficult concepts more accessible to those who may be struggling. The simplified learning pathways offered on 1Cademy have been a valuable resource for those seeking to deepen their understanding of complex subject matter.
    // Students are able to engage with the content by voting and commenting on the nodes and links that have been created, which not only helps to acknowledge the valuable contributions of their peers but also encourages meaningful collaboration within the learning community.
    // This approach to learning empowers students to take an active role in their education, making it a more enjoyable and fulfilling experience. By helping one another, students are able to take pride in their contributions to the larger learning community and are able to learn from one another in a truly collaborative way.`,
    options: [],
  },
  {
    id: "benefits",
    title: "Benefits",
    label: "Benefits",
    description: "",
    options: [],
  },
  // {
  //   id: "topics",
  //   title: "Topics",
  //   label: "Topics",
  //   description:
  //     "1Cademy facilitated the formation of communities of learners and researchers who can learn from each other, exchange ideas and support one another in their learning journey.",
  //   options: [
  //     {
  //       title: "Education And Psychology Research",
  //       description: `1Cademy is a collaborative community that supports interdisciplinary research and learning through content generation, mapping, and evaluation. We have multiple successful communities from various fields collaborating regularly by summarizing and organizing content on the platform. This community is focused on learning how to make healthier, more engaged online communities in order to improve our users’ learning, contributions, and experience.
  //       This research team is dedicated to uncovering, presenting, and compiling the latest literature and research on creating and maintaining engaging and beneficial online communities. Our goal is to understand how to foster online communities where users actively contribute their ideas and value the perspectives of their peers. We are seeking a team of dedicated students to conduct thorough research in various disciplines including social science, cognitive science, information science, and education. Utilizing the 1Cademy platform, we will take notes, organize ideas, and map concepts from the literature we find. Ultimately, our aim is to apply our findings to make meaningful improvements to the 1Cademy platform and enhance the user experience of our online communities.
  //   `,
  //       link: "/community/education-and-psychology-research",
  //     },
  //     {
  //       title: "Clinical Psychology",
  //       description: `The Clinical Psychology community explores research related to mental illness/disorders, mental health treatment, and psychopathology of individuals across the lifespan. Clinical psychology is interdisciplinary and can intersect with various fields such as neuroscience, cognitive psychology, and social psychology. We encourage interns to dive into research that they have particular interest in (e.g., child psychopathology), share their findings, and collaborate with other interns. This internship is designed to motivate independent research, gain research skills such as analysis and interpretation, and work towards conducting research.
  //       1Cademy allows interns to present their research findings, gain feedback from other interns, and learn how to communicate their findings in a concise and articulate manner.`,
  //       link: "/community/clinical-psychology",
  //     },
  //     {
  //       title: "Health Psychology",
  //       description:
  //         "The goal of the health psychology community is to inspire the development of key research skills while conducting a review of health psychology literature. Using credible, scholarly articles, we are exploring various topics within the field of health psychology, including: behavioral therapies for mental illness, the intersection of race and gender in the healthcare industry, what motivates people to maintain a healthy lifestyle, and the complex role of the media in health. As we compile our research using 1Cademy, we hope to discover patterns and gaps in the literature that could be addressed in a future study of our own design. Each week, interns read an article, summarize it using 1Cademy, present their findings to the group, and engage in thoughtful discussion about themes present in their article.",
  //       link: "/community/health-psychology",
  //     },
  //     {
  //       title: "Disability Studies",
  //       description:
  //         "The Disability Studies community explores current and past research related to disability. We investigate a wide range of topics related to disability including, disability legislation, disability culture, the psychosocial impact of disability, the economics of disability, and more. Interns summarize research articles and present their findings weekly with the rest of the group. By using 1Cademy, interns learn how to break down articles into smaller ideas, connect them to broader concepts, extrapolate the research for deeper analysis, and communicate their findings to other community members. We value collaborative learning and expect interns to participate in group discussions to dive deeper into the content.",
  //       link: "/community/disability-studies",
  //     },
  //     {
  //       title: "Social Psychology",
  //       description:
  //         "The Social Psychology community explores published research in the field and conducts relevant studies. Interns are responsible for aiding in the ideation and completion of studies. They also summarize research articles and present their findings with the rest of the group. By using 1Cademy, interns learn how to break down articles into granular and connected concepts to best communicate their findings to other community members. We value collaborative learning and expect interns to participate in group discussions to dive deeper into the content. Topics that the community will explore in a research setting include the effects of achievement/effort on performance, ways to increase motivation, and ways to diminish misinformation. While some initial work has been made, interns are welcome to join as soon as possible to receive the necessary training and begin collaborating with us.",
  //       link: "/community/social-psychology",
  //     },
  //     {
  //       title: "UX Research in Cognitive Psychology of Learning",
  //       description: `We study the UX Research and Cognitive Psychology literature on learning and memorizing. Using 1Cademy, we break down articles into granular knowledge pieces, connect them within a larger context of research, communicate our findings to other community members, and utilize our knowledge to conduct research. We conduct online controlled experiments using our research pipeline and co-author research papers to submit to reputable journals and conferences.`,
  //       link: "/community/ux-research-in-cognitive-psychology-of-Learning",
  //     },
  //     {
  //       title: "ADHD and Autism",
  //       description:
  //         "The ADHD and Autism research community is centered around researching aspects of neurodivergence including (but by no means limited to) the relationships between ADHD and Autism with things such as OCD, schizoid disorders, physical disabilities, different types of therapy, depression, anxiety, and gender identity. Interns are encouraged to personalize their research to suit their interests surrounding neurodivergence and will have the opportunity to present their findings at our weekly meetings as well as collaborate with other interns. We will also have opportunities to work with other communities such as the Clinical Psychology community and Disabilities Studies community. Working with 1Cademy allows interns to gain valuable research experience, explore various research topics, collaborate with others, and learn how to present their findings in a succinct, articulate manner.",
  //       link: "/community/ADHD-and-autism",
  //     },
  //     {
  //       title: "Liaison Librarians",
  //       description:
  //         "The 1Cademy Librarian community supports the information processes of all the communities on the 1Cademy platform. We do this by liaising with the co-leaders and interns from each community to help them develop their area of the map and information literacy skills. This work supports communities across all fields of focus in three ways: 1) Embedded Liaison: We work directly with other communities and attend meetings to help create, edit, and arrange their content 2) Asynchronous Support: We review a portion of a community's map during Librarian meetings 3) Consultations: We give feedback directly to co-leaders of other communities when they attend our weekly meetings Through each of these efforts communities receive the support they need to locate, interpret, abstract, disseminate, and organize knowledge clearly, comprehensively, and accurately on the 1Cademy Platform.",
  //       link: "/community/liaison-librarians",
  //     },
  //   ],
  // },
  // {
  //   id: "systems",
  //   title: "Systems",
  //   label: "Systems",
  //   description:
  //     "1Cademy offers a comprehensive and integrated solution that enhances the educational and research experience through its three interconnected systems.",
  //   options: [],
  // },
  { id: "about-us", title: "About Us", label: "About Us", description: "", options: [] },
  // { id: "apply", title: "", label: "", description: "", options: [] },
];
