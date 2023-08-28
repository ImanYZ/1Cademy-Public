import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import { Modal, Stack, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React, { useMemo, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { gray200, gray600 } from "@/pages/home";

import { useWindowSize } from "../../../hooks/useWindowSize";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";

export type TMechanisms = {
  id: string;
  title: string;
  description: string;
  animation: {
    src: string;
    artboard: string;
    padding: number;
  };
  video: { url: string; thumbnail: string }[];
};
export const MECHANISM_ITEMS: TMechanisms[] = [
  {
    id: "long-term-learning",
    title: "Personalized Daily Retrieval Practice",
    description:
      "1Cademy AI Assistant integrates student's previous responses with the knowledge graph's prerequisite relations. Correct answers guide students toward more advanced topics, whereas incorrect answers trigger a review of the prerequisites. Students earn daily points to motivate spaced practice. The 1Cademy knowledge graph, personalized practice, and daily point incentives foster students' long-term learning, with our large controlled experiments revealing significant increase in exam scores especially amongst students with lower GPAs.",
    animation: {
      src: "rive/long-term-learning.riv",
      artboard: "New Artboard",
      padding: 0,
    },
    video: [
      {
        url: "https://www.youtube.com/embed/kU6ppO_WLC0",
        thumbnail: "/home/demos/practice-tool-demo.png",
      },
      {
        url: "https://www.youtube.com/embed/Un6s1rtfZVA",
        thumbnail: "/home/demos/practice-preview.png",
      },
    ],
  },
  {
    id: "contextualized-q-a",
    title: "Course-specific Question Answering",
    description:
      "1Cademy AI Assistant provides answers exclusively based on its knowledge graph, populated with instructor-curated course content. It closely examines each student's response history, understanding prerequisite topic relationships, which aids in identifying root issues causing academic struggles. Furthermore, it visualizes prerequisite pathways to deepen students' learning. 1Cademy also offers instructors comprehensive student conversation reports, facilitating more effective teaching strategy refinement.",
    animation: {
      src: "rive/contextualized-q-a.riv",
      artboard: "New Artboard",
      padding: 0,
    },

    video: [{ url: "https://www.youtube.com/embed/Z8aVR459Kks", thumbnail: "/home/demos/question-answering-demo.png" }],
  },
  {
    id: "ai-enhanced-grading",
    title: "AI-Enhanced Assignments/Exams",
    description: `
    1Cademy empowers instructors to efficiently manage assignments and exams by offering tools to create, schedule, review, and auto-grade them, all under their control. It enables instructors to personalize questions, assign points, and tag or revise them. Students benefit from completing assignments, receiving instant constructive feedback, and reviewing grades with metacognitive learning analytics, fostering transparency in the learning process.
    `,
    animation: {
      src: "rive/ai.riv",
      artboard: "New Artboard",
      padding: 0,
    },
    video: [
      {
        url: "https://www.youtube.com/embed/E2ClCIX9g0g",
        thumbnail: "/home/demos/ai_assisted-assignments-and-exams.png",
      },
      {
        url: "https://www.youtube.com/embed/uj8fqLV-S1M",
        thumbnail: "/home/demos/ai-assisted-grading-conceptual-and-essay-questions.png",
      },
    ],
  },
  {
    id: "positive-reinforcement",
    title: "Positive Reinforcement",
    description: `
    The 1Cademy Assistant engages learners in recognizing their progress by providing immediate feedback, celebrating correct answers, and tracking their progress throughout their academic journey. This feedback cycle, embedded at critical moments within the learning material interactions, utilizes interactive, concise, and encouraging animations illustrated by the 1Cademy Assistant character. On completing each piece of micro-content, learners receive an enhanced level of positive reinforcement through awards and reputation points, keeping the brain engaged and facilitating increased learning through consistent encouragement for small achievements.
    `,
    animation: {
      src: "rive/positive-reinforcement.riv",
      artboard: "New Artboard",
      padding: 70,
    },
    video: [
      {
        url: "https://www.youtube.com/embed/9vWGSEBf8WQ",
        thumbnail: "/home/demos/introduction-instructor-ad-student-dashboard.png",
      },
    ],
  },
  {
    id: "micro-content-generation",
    title: "Micro-content Generation",
    description:
      "1Cademy aims to simplify and facilitate comprehension by translating complex scientific content into easily digestible microlearning modules. Current research indicates a trend towards students' preference for micro-content delivery methods such as flashcards, over traditional lengthy text-based learning. 1Cademy actively aids teachers and students in working together to break down learning content into smaller segments of micro-content, each embodying a single concept. These bite-sized learning modules can be applied across numerous learning contexts and goals. To assist in this task, 1Cademy employs a three-way collaboration between educators, students, and its customized AI Assistant, whereby invaluable information from myriad sources is consolidated into compact, clear-cut pieces of micro-content. This diverse collaboration ensures the micro-content is relevant to a broader spectrum of students covering the same topics, extending beyond a single term of study.",
    animation: {
      src: "rive/micro-content-generation.riv",
      artboard: "New Artboard",
      padding: 0,
    },
    video: [],
  },
  {
    id: "linking",
    title: "Linking",
    description:
      "For learning to be effective, the content must be progressive. 1Cademy offers a large-scale, asynchronous collaborative mechanism that allows teachers and students, with the assistance of the 1Cademy AI Assistant, to build an extensive prerequisite knowledge graph using the micro-content modules. With unique learning pathways established for each learning objective, students can seek out various prerequisite learning routes. Each pathway could better suit a different student, considering their prior knowledge base, preferred learning styles, and specific learning requirements. Once an objective is achieved, students can delve into more advanced topics, furthering their Zone of Proximal Development. This collective generation of learning pathways, under the guidance of educators, equips students with optimized mechanisms for understanding each concept.",
    animation: {
      src: "rive/linking.riv",
      artboard: "New Artboard",
      padding: 0,
    },
    video: [],
  },
  {
    id: "evaluating",
    title: "Evaluating",
    description:
      "Ensuring the quality of the knowledge graph and study pathways requires crucial oversight by educators. To assist teachers in saving their time, an AI-enhanced peer-review process has been implemented. Instructors, students, and the 1Cademy AI Assistant collaboratively evaluate each micro-content segment, and a collective score determines the need for modification or deletion. Students' upvotes help in identifying helpful content, earning the author reputation points. Conversely, downvotes indicate the need for improvement, and it leads to loss of points for the author. Unlike conventional classroom settings where students compete to acquire more knowledge, here, the competition lies in being more beneficial to the learner's community, motivating students to earn higher reputation points. It fosters a sense of accomplishment among students, giving them pride in contributing to society even as they pursue their education.",
    animation: {
      src: "rive/evaluating.riv",
      artboard: "New Artboard",
      padding: 0,
    },
    video: [],
  },
  {
    id: "improving",
    title: "Improving",
    description:
      "Evolving in conjunction with all stakeholders, 1Cademy notebooks are structured knowledge graphs of micro-content pieces along with their prerequisite learning pathways. Teachers and students from various institutions, who are teaching or learning the same topics, ensure that the content stays updated and improved over time. The AI Assistant also supports this continual improvement process. Multiple versions of each micro-content piece, proposed by different learners across various schools, cover an array of viewpoints and use-cases. Teachers can provide their inputs about these different versions, by acceptance, rejection, or providing suggestions for improvement. 1Cademy then visualizes these versions side-by-side, granting the learners the freedom to select the most suitable learning pathway, depending on their prerequisites, learning styles, and needs.",
    animation: {
      src: "rive/improving.riv",
      artboard: "New Artboard",
      padding: 0,
    },
    video: [],
  },
];

export interface IMechanism {
  mechanisms: TMechanisms[];
}

const Mechanism = ({ mechanisms }: IMechanism) => {
  const theme = useTheme();
  const [displayVideo, setDisplayVideo] = useState("");
  const { width } = useWindowSize();

  const canvasDimensions = useMemo(() => {
    let newWidth = width - 10;

    if (width >= 600) newWidth = 600;
    if (width >= 900) newWidth = 700;
    if (width >= 1200) newWidth = 500;

    const newHeight = getHeight(newWidth);
    return { width: newWidth, height: newHeight };
  }, [width]);

  return (
    <Box>
      {mechanisms.map((cur, idx) => (
        <Stack
          key={cur.id}
          direction={{ xs: "column", md: idx % 2 === 0 ? "row" : "row-reverse" }}
          spacing={{ xs: "32px", md: "auto" }}
          alignItems="center"
          justifyContent={"space-between"}
          minHeight={{ md: "512px" }}
          sx={{ mb: { xs: "32px", md: "48px" } }}
        >
          <Box sx={{ maxWidth: { md: "528px" }, textAlign: "left", flex: 1 }}>
            <Typography component={"h3"} sx={{ fontSize: "30px", fontWeight: "600", mb: "16px" }}>
              {cur.title}
            </Typography>
            {cur.description.split("\n").map((paragraph: string, idx: number) => (
              <Typography
                key={idx}
                sx={{ color: theme.palette.mode === "dark" ? gray200 : gray600, mb: "8px", textAlign: "justify" }}
              >
                {paragraph}
              </Typography>
              // <Typography
              //   key={idx}
              //   fontSize={"16px"}
              //   color={theme.palette.mode === "light" ? "#475467" : "#EAECF0"}
              //   sx={{ p: "8px", pt: "0" }}
              // >
              //   {wrapStringWithBoldTag(paragraph, RE_DETECT_NUMBERS_WITH_COMMAS)}
              // </Typography>
            ))}

            <Box sx={{ mt: "20px", display: "flex", justifyContent: "space-between" }}>
              {cur.video.map(c => (
                <Box
                  key={cur.id}
                  onClick={() => setDisplayVideo(c.url)}
                  sx={{
                    width: "100%",
                    // border: "solid 2px pink",
                  }}
                >
                  <Box
                    sx={{
                      height: "200px",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundImage: `url(${c.thumbnail})`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      backgroundSize: "contain",
                      ":hover": {
                        cursor: "pointer",
                        svg: {
                          fill: DESIGN_SYSTEM_COLORS.primary600,
                        },
                      },
                    }}
                  >
                    <PlayCircleIcon sx={{ fontSize: "50px", color: DESIGN_SYSTEM_COLORS.baseWhite }} />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* <Typography sx={{ color: theme.palette.mode === "dark" ? gray200 : gray600 }}>{cur.description}</Typography> */}
          </Box>
          <Box
            sx={{
              width: canvasDimensions.width,
              height: canvasDimensions.height,
              padding: `${cur.animation.padding}px`,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
              }}
            >
              <RiveComponentMemoized
                src={cur.animation.src}
                artboard={cur.animation.artboard}
                animations={["Timeline 1", theme.palette.mode]}
                autoplay={true}
                displayControls
              />
            </Box>
          </Box>
        </Stack>
      ))}
      {/* <Demos /> */}
      <Modal
        open={Boolean(displayVideo)}
        onClose={() => setDisplayVideo("")}
        // ariaLabelledby="modal-modal-title"
        // aria-describedby="modal-modal-description"
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <iframe
          width="560"
          height="315"
          src={displayVideo}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen={true}
        ></iframe>
      </Modal>
    </Box>
  );
};

const getHeight = (width: number) => width;

export default Mechanism;
