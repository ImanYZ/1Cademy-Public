export type WhyItem = {
  name: string;
  body: string;
  imageDark: string;
  image: string;
  padding?: string;
};
const values: WhyItem[] = [
  {
    name: "Learning Like Researchers",
    body: "The traditional learning approach for students is to start with foundational concepts and gradually work towards more complex topics.\n On the other hand, researchers often prefer to begin with the advanced topics and work backwards to gain a deeper understanding of the underlying prerequisites. 1Cademy offers an innovative approach to learning by enabling students to emulate the research method and start with advanced topics, then delve into the prerequisites as needed. \nThis approach allows students to learn in a more targeted and efficient manner, similar to the way researchers approach learning.",
    image: "Light_Learning_Like_Researchers.svg",
    imageDark: "Dark_Learning_Like_Researchers.svg",
    padding: "4px 40px 0px 40px",
  },
  // {
  //   name: "Research Communities",
  //   body: "1Cademy has fostered the development of communities of enthusiasts for various scientific subjects, comprising individuals from diverse educational institutions and research organizations. These enthusiasts share their discoveries and insights on 1Cademy and come together on a weekly basis to delve deeper into their areas of interest.\nThrough these interactions, we gain insight into the cutting-edge research and learning taking place at our collaborators' institutions and are able to draw connections that inspire new research ideas.",
  //   // image: "Research_Communities.png",
  //   image: "Research_Communities.svg",
  //   imageDark: "Research_Communities.svg",
  // },
  {
    name: "Learning Deeply",
    body: "The process of meticulously considering the prerequisites for each concept when adding them to 1Cademy not only improves the quality of our learning, but also helps us uncover novel learning pathways to grasp complex concepts that we previously thought were unattainable.",
    image: "Learning_Deeply.svg",
    imageDark: "Learning_Deeply-dark.svg",
    padding: "13px 79px 0px 79px",
  },
  {
    name: "Effective Ways to Learn",
    body: "1Cademy members are constantly evaluating the efficacy of the content and learning pathways. If a member discovers a more straightforward method for defining or explaining a concept, they can propose it on 1Cademy for community review.\nThrough this process, the community collectively decides which approach is most effective for learning that particular concept. As a result, the learning experience through 1Cademy continually improves, becoming both more efficient and enjoyable over time.",
    image: "Evaluating.svg",
    imageDark: "Evaluating-dark.svg",
    padding: "4px 37px 0px 37px",
  },
  {
    name: "Developing Learning Pathways",
    body: "While information on any topic is readily available on the internet, many people still choose to invest in textbooks and courses. The reason for this is that these resources provide structured learning pathways - step-by-step procedures to achieve one's learning objectives. However, traditional textbooks and courses are limited by the perspectives of a few authors and are infrequently updated or improved. \n1Cademy offers a solution to this by providing a collaborative platform for students, instructors, and researchers to design and share learning pathways on any topic, all within the framework of a shared knowledge graph.",
    image: "Developing_Learning_Pathways_light.svg",
    imageDark: "Developing_Learning_Pathways_dark.svg",
    padding: "4px 37px 0px 37px",
  },
  {
    name: "Crowdsourced",
    body: "Similar to Wikipedia, 1Cademy is built through a collaborative effort on a large scale. However, while Wikipedia is the most comprehensive encyclopedia, 1Cademy's goal is to tap into the collective intelligence of its users to uncover the most efficient learning pathways for any given topic by identifying the most effective prerequisite connections.",
    image: "Crowdsourcing.svg",
    imageDark: "Crowdsourcing.svg",
  },
  {
    name: "Learning Through Teaching",
    body: "Ample research in cognitive psychology has demonstrated that the act of learning with the intention of teaching others is more effective than learning for the sole purpose of being tested. On 1Cademy, we condense and depict our learning pathways with the objective of enhancing the learning experience for our collaborators. In the process, our understanding of the topics deepens as we contemplate ways to make them more accessible for others to learn.",
    // image: "Learning_Through_Teaching.png",
    image: "Learning_Through_Teaching.svg",
    imageDark: "Learning_Through_Teaching.svg",
  },
  {
    name: "Searching as Learning",
    body: "Have you ever encountered difficulty finding relevant content to learn something, because you're not sure what the appropriate keywords are? For instance, what would you search for to learn how to create the web animations featured on a particular website? Simply searching a phrase might not yield the most helpful results. \n1Cademy offers a solution to this challenge by providing both a factual search engine and a mechanism for creating a personalized view of the shared knowledge graph to facilitate exploratory search. \nThis way, even without having the exact keywords, one can navigate through the hierarchical structure of concepts and their prerequisite links to facilitate learning.",
    // image: "Search_for_Learning.png",
    image: "Search_for_Learning.svg",
    imageDark: "Search_for_Learning.svg",
  },
  {
    name: "Balanced Perspectives",
    body: "These days, we see political, sexual, ethnic, or even scientific polarization everywhere on the Internet. Echo chambers are formed where a group of people only accept thoughts and ideas that are aligned with their perspectives, ignoring alternatives views. \n1Cademy provides us with a consensus-based collaboration mechanism where alternative or even competing perspectives are placed side-by-side so that one can easily compare and contrast them to learn and rationalize each topic in different contexts.",
    // image: "Balanced_Perspectives.png",
    image: "Balanced_Perspectives_Ligth.svg",
    imageDark: "Balanced_Perspectives_Dark.svg",
  },
];

export default values;
