import { StatsSchema } from "../../../../knowledgeTypes";

export type TWhichValue = {
  id: string;
  name: string;
  body: string;
  link: string;
  src: string;
  artboard: string;
  getBody?: ({ users, institutions, communities }: StatsSchema) => string;
};

const whichValues: TWhichValue[] = [
  {
    id: "notebook",
    name: "1Cademy Notebook",
    body: "1Cademy is a platform that aims to improve the efficiency of learning and research by utilizing a collaborative approach to gather information from various sources and organize it into concise notes that focus on a single concept.\nThese notes are granularly organized and visualized as a knowledge graph that illustrates the hierarchical relationships between concepts. The platform uses a peer-review process, reputation system, and voting mechanism to ensure the quality of the knowledge graph and encourage the development of high-quality content.\nThrough this process, students and researchers can improve upon each other's contributions, propose more up-to-date and user-friendly versions of each note and share their learning perspectives.\nOver the past two years, 1,543 students and researchers from 183 institutions have participated in the platform, resulting in the formation of 49 research and learning communities covering a wide range of subjects.",
    getBody: ({ users, institutions, communities }: StatsSchema) =>
      `1Cademy is a platform that aims to improve the efficiency of learning and research by utilizing a collaborative approach to gather information from various sources and organize it into concise notes that focus on a single concept.\nThese notes are granularly organized and visualized as a knowledge graph that illustrates the hierarchical relationships between concepts. The platform uses a peer-review process, reputation system, and voting mechanism to ensure the quality of the knowledge graph and encourage the development of high-quality content.\nThrough this process, students and researchers can improve upon each other's contributions, propose more up-to-date and user-friendly versions of each note and share their learning perspectives.\nOver the past two years, [${users}] students and researchers from [${institutions}] institutions have participated in the platform, resulting in the formation of [${communities}] research and learning communities covering a wide range of subjects.`,
    link: "https://1cademy.com/search",
    src: "rive/linking.riv",
    artboard: "New Artboard",
  },
  {
    id: "assistant",
    name: "1Cademy AI Assistant",
    body: "The 1Cademy AI Assistant is designed to improve human life and education by promoting the development of beneficial habits and scheduling tasks and meetings.\nThe assistant recognizes the positive impact of these habits on one's life and motivates the user to invest more time in them. It auto-schedules tasks and optimizes time-allocation, schedules 1-to-1 and group meetings, and keeps the user in sync with their instructors by providing information on courses, assignment deadlines, classes, and exams.\nIt also provides real-time updates on the user's progress on tasks and deadlines and rewards them with points and badges. Additionally, it employs techniques such as desirable difficulties and Pomodoro to boost long-term learning and mitigate procrastination and burn-out.\nFurthermore, it leverages the psychology of motivation by breaking tasks and habits into small pieces and making losses as prominent as gains to motivate the user to learn from their mistakes.",
    link: "https://1cademy.com/assistant",
    src: "rive-assistant/goals.riv",
    artboard: "artboard-3",
  },
];

export default whichValues;
