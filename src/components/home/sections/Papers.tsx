import { Box, Typography } from "@mui/material";
import React from "react";

import { SectionItemSwitcher } from "../components/SectionItemSwitcher";

const PAPER_ITEMS = [
  {
    id: "paper-100",
    title:
      "ACM SIGCSE 2023: Reducing Procrastination Without Sacrificing Students' Autonomy Through Optional Weekly Presentations of Student-Generated Content.",
    content: `Collaborative question generation and mapping by students has been shown to improve students' active (engaged) and meaningful learning. In implementing these methods into a course that enabled high levels of autonomy (as recommended by Self-determination theory), we found student procrastination to be a persistent problem. Since student contribution tends to wane over the course of a semester, the efficacy of a curriculum reliant on content generation similarly wanes. We describe our efforts in reducing procrastination in a course focused on collaborative question generation and mapping, using an iterative design research methodology, over eight months of two semesters. To encourage students to create high-quality questions, we implemented a voting system that graded students based on the number of instructor up-votes given to questions they created. While this reduced procrastination early on, students found ways to take advantage of the autonomy provided by the course curriculum, leading them to resume procrastinating. To address this issue, we adjusted the grading schema for the second semester by scoring both students' and instructors' up-votes, while also allowing students to present their created content in optional weekly meetings. The introduction of optional weekly meetings had the greatest effect towards decreasing procrastination. End-of-semester surveys reported that: 1) while students enjoyed both semesters, they gave more positive feedback for the second semester; 2) student-led discussions for personally created content, when combined with the autonomy to choose both the topic and time to study, helped their learning and time management skills.`,
    link: "https://dl.acm.org/doi/10.1145/3545945.3569839",
    image: "home/papers/ACM-SIGCSE-2023-light.svg",
    imageDark: "home/papers/ACM-SIGCSE-2023--dark.svg",
  },

  {
    id: "paper-101",
    title:
      "ACM SIGCSE 2022: Retrieval-based Teaching Incentivizes Spacing and Improves Grades in Computer Science Education.",
    content: `Desirable difficulties such as retrieval practice (testing) and spacing (distributed studying) are shown to improve long-term learning. Despite their knowledge about the benefits of retrieval practice, students struggle with application. We propose a mechanism of embedding desirable difficulties in the classroom called "retrieval-based teaching." We define it as asking students many ungraded, granular questions in class. We hypothesized that this method could motivate students to (1) study more and (2) increase the spacing of their studying. We tested these two hypotheses through a quasi-experiment in an introductory programming course. We compared 684 students' granular activities with an interactive eBook between the class discussion sections where the intervention was implemented and the control discussion sections. Over four semesters, there were a total of 17 graduate student instructors (GSIs) that taught the discussion sections. Each semester, there were five discussion sections, each taught by a distinct GSI. Only one of the five per semester implemented the treatment in their discussion section(s) by dedicating most of the class time for retrieval-based teaching. Our analysis of these data collected over four consecutive semesters shows that retrieval-based teaching motivated students to space their studying over an average of 3.78 more days, but it did not significantly increase the amount they studied. Students in the treatment group earned an average of 2.36 percentage points higher in course grades. Our mediation analysis indicates that spacing was the main factor in increasing the treated students' grades.`,
    link: "https://dl.acm.org/doi/abs/10.1145/3478431.3499408",
    image: "home/papers/ACM-SIGCSE-2022-Retrieval-base-Teaching.svg",
    imageDark: "home/papers/ACM-SIGCSE-2022-Retrieval-base-Teaching.svg",
  },
  {
    id: "paper-102",
    title: "ACM SIGCSE 2022: Another victim of covid-19: Computer science education",
    content: `Prior literature suggests that computer science education (CSE) was less affected by the pandemic than other disciplines. However, it is unclear how the pandemic affected the quality and quantity of students' studying in CSE. We measure the impact of the pandemic on the amount and spacing of students' studying in a large introductory computer science course. Spacing is defined as the distribution of studying over multiple sessions, which is shown to improve long-term learning. Using multiple regression models, we analyzed the total number of students' interactions with the eBook and the number of days they used it, as a proxy for studying amount and spacing, respectively. We compared two sequential winter semesters of the course, one during (Winter 2021) and one prior to the pandemic (Winter 2020). After controlling for possible confounders, the results show that students had 1,345.87 fewer eBook interactions and distributed their studying on 2.36 fewer days during the pandemic when compared to the previous semester prior to the pandemic. We also compared four semesters prior to the pandemic (Fall and Winter of 2018 and 2019) to two semesters during the pandemic (Fall 2020 and Winter 2021). We found, on average, students had 3,376.30 fewer interactions with the eBook and studied the eBook on 16.35 fewer days during the pandemic. Contrary to prior studies, our results indicate that the pandemic negatively affected the amount and spacing of studying in an introductory computer science course, which may have a negative impact on their education.`,
    link: "https://dl.acm.org/doi/abs/10.1145/3478431.3499313",
    image: "home/papers/ACM-SIGCSE-2022-Another-Victim-of-COVID-19--light.svg",
    imageDark: "home/papers/ACM-SIGCSE-2022-Another-Victim-of-COVID-19--dark.svg",
  },

  {
    id: "paper-103",
    title: "ACM LAK 2022: Semester-level Spacing but Not Procrastination Affected Student Exam Performance.",
    content: `Spacing and procrastination are often thought of as opposites. It is possible, however, for a student to space their studying by doing something every day throughout the semester and still procrastinate by waiting until late in the semester to increase their amount of studying. To analyze the relationship between spacing and procrastination, we examined 674 students’ interactions with a course eBook over four semesters of an introductory programming course. We measured each student’s semester-level spacing as the number of days they interacted with the eBook, and each student’s semester-level procrastination as the average delay from the start of the semester for all their eBook interactions. Surprisingly, there was a small, yet positive, correlation between the two measures. Which, then, matters for course performance: studying over more days or studying earlier in the semester? When controlling for total amount of studying, as well as a number of academic and demographic characteristics in an SEM analysis, we find a strong positive effect of spacing but no significant effect of procrastination on final exam scores.`,
    link: "https://dl.acm.org/doi/abs/10.1145/3506860.3506907",
    image: "home/papers/ACM-LAK-2022.svg",
    imageDark: "home/papers/ACM-LAK-2022--dark.svg",
  },

  {
    id: "paper-104",
    title: "ACM ICER 2021: Incentivized Spacing and Gender in Computer Science Education.",
    content: `Extensive prior research shows that spacing – the distribution of studying over multiple sessions – significantly improves long-term learning in many disciplines. However, in computer science education, it is unclear if 1) spacing is effective in an incentivized, non-imposed setting and 2) when incentivized, female and male students space their studying differently. To investigate these research questions, we examined how students in an introductory computer science course (378 female and 310 male) spaced their studying. A retrieval practice tool in the course (for 5% of the course grade) incentivized students to space their studying, by awarding a point per day of usage. To measure how much each student spaced, we examined their interactions with the course eBook, which served as their primary learning resource. Specifically, when comparing two students with the same academic and demographic characteristics, the same measure of course easiness, and the same amount of content studied, we considered the student who distributed their studying over more days to be the one who spaced more. Using this definition, our structural equation modeling (SEM) results show that, 1) on average, students who spaced their studying over 14.516 more days (one standard deviation) got 2.25% higher final exam scores; and 2) female students spaced their studying over 4.331 more days than their male counterparts. These results suggest that, in an introductory computer science course, incentivized spacing is effective. Notably, when compared to their male counterparts, female students both exhibited more spacing and obtained higher final exam scores through spacing.`,
    link: "https://dl.acm.org/doi/abs/10.1145/3446871.3469760",
    image: "home/papers/ACM-ICER-2021.svg",
    imageDark: "home/papers/ACM-ICER-2021--dark.svg",
  },

  {
    id: "paper-105",
    title: "ACM CHI 2020: Engaging Students in Voluntary Question Generation and Linking.",
    content: `Generating multiple-choice questions is known to improve students' critical thinking and deep learning. Visualizing relationships between concepts enhances meaningful learning, students' ability to relate new concepts to previously learned concepts. We designed and deployed a collaborative learning process through which students generate multiple-choice questions and represent the prerequisite knowledge structure between questions as visual links in a shared map, using a variation of Concept Maps that we call "QMap." We conducted a four-month study with 19 undergraduate students. Students sustained voluntary contributions, creating 992 good questions, and drawing 1,255 meaningful links between the questions. Through analyzing self-reports, observations, and usage data, we report on the technical and social design features that led students to sustain their motivation.`,
    link: "https://dl.acm.org/doi/abs/10.1145/3313831.3376882",
    image: "home/papers/ACM-CHI-2020-Engaging-Students.svg",
    imageDark: "home/papers/ACM-CHI-2020-Engaging-Students.svg",
  },

  {
    id: "paper-106",
    title: "ACM ICER 2019: A spaced, interleaved retrieval practice tool that is motivating and effective.",
    content: `Retrieval practice, spacing, and interleaving are known to enhance long-term learning and transfer, but reduce short-term performance. It can be difficult to get both students and instructors to use these techniques since they perceive them as impeding initial student learning. We leveraged user experience design and research techniques, including survey and participant observation, to improve the design of a practice tool during a semester of use in a large introductory Python programming course. In this paper, we describe the design features that made the tool effective for learning as well as motivating. These include requiring spacing by giving credit for each day that a student answered a minimum number of questions, adapting a spaced repetition algorithm to schedule topics rather than specific questions, providing a visual representation of the evolving schedule in order to support meta-cognition, and providing several gameful design elements. To assess effectiveness, we estimated a regression model: each hour spent using the practice tool over the course of a semester was associated with an increase in final exam grades of 1.04%, even after controlling for many potential confounds. To assess motivation, we report on the amount of practice tool use: 62 of the 193 students (32%) voluntarily used the tool more than the required 45 days. This provides evidence that the design of the tool successfully overcame the typically negative perceptions of retrieval practice, spacing, and interleaving.`,
    link: "https://dl.acm.org/doi/abs/10.1145/3291279.3339411",
    image: "home/papers/ACM-ICER-2019.svg",
    imageDark: "home/papers/ACM-ICER-2019--dark.svg",
  },
  {
    id: "paper-107",
    title: "ACM SIGCSE 2019: Speed and Studying: Gendered Pathways to Success.",
    content: `In an introductory Python programming course intended for non-majors with little prior CS experience, with 85 male and 108 female students, we were able to capture electronic traces of students' studying and problem-solving. There was no significant difference in final exam scores by gender but we found that female students spent 12.1 more hours studying over the semester while male students on average earned 2.7 more points per hour of solving problem set questions over the first half of the semester. We were able to capture their learning behavior because students studied using the Runestone interactive textbook and completed weekly problem sets in the same platform for the first half of the semester. We analyzed these logs to determine three quantities for each student. One is study time, as measured by total use of Runestone outside of weekly assignments. The second is speed, as measured by the number of points students earned per hour working on problem sets. The third is earliness, as measured by how far before the deadlines they worked on weekly assignments. We conclude that male students were faster at completing problem sets early in the semester but that female students found an alternative pathway to success.`,
    link: "https://dl.acm.org/doi/abs/10.1145/3287324.3287417",
    image: "home/papers/ACM-SIGCSE-2019.svg",
    imageDark: "home/papers/ACM-SIGCSE-2019--dark.svg",
  },
  {
    id: "paper-108",
    title: "SPLICE 2019: Runestone Interactive Ebooks: A Research Platform for On-line Computer Science Learning.",
    content: `The Runestone ebook platform is open source, extensible, and already serves over 25,000 learners a day. The site currently hosts
    18 free ebooks for computing courses. Instructors can create a custom course from any of the existing ebooks on the site and can
    have their students register for that custom course. Instructors
    can create assignments from the existing material in each ebook,
    grade assignments, and visualize student progress. Instructors can
    even create new content for assignments. The Runestone ebooks
    contain instructional material and a variety of practice problem
    types with immediate feedback. One of the practice types, Parsons
    problems, is also adaptive, which means that the difficulty of the
    problem is based on the learner’s performance. Learner interaction
    is recorded and can be analyzed. This paper presents the history
    of Runestone, describes the interactive features, summarizes the
    previous research studies, and provides detail on the recorded data.
    Interaction data can be shared with other learning environments
    through the Learning Tools Interoperability Standard (LTI).`,
    link: "https://www.researchgate.net/profile/Iman-Yeckehzaare/publication/341966650_Runestone_Interactive_Ebooks_A_Research_Platform_for_On-line_Computer_Science_Learning/links/5edb704945851529453ca208/Runestone-Interactive-Ebooks-A-Research-Platform-for-On-line-Computer-Science-Learning.pdf",
    image: "home/papers/runestone-academy.png",
    imageDark: "home/papers/runestone-academy.png",
  },
];

const Papers = () => {
  return (
    <Box>
      <Typography component={"h3"} sx={{ fontSize: "20px", fontWeight: 600, mb: "32px" }}>
        Related Research
      </Typography>
      <SectionItemSwitcher items={PAPER_ITEMS} />
      {/* <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: "24px" }}>
        {PAPER_ITEMS.map(cur => (
          <Link
            key={cur.id}
            href={cur.link || undefined}
            target="_blank"
            rel="noopener"
            sx={{ textDecoration: "none" }}
          >
            <Box
              sx={{
                p: "24px",
                background: theme => (theme.palette.mode === "dark" ? "#000000" : "#F9FAFB"),
                cursor: "pointer",
                ":hover": {
                  background: theme => (theme.palette.mode === "dark" ? "#1d1d1d" : "#ebebeb"),
                },
              }}
            >
              <Typography component={"h4"} sx={{ fontSize: "20px", fontWeight: 600, mb: "8px" }}>
                {cur.title}
              </Typography>
              <Typography>{wrapStringWithTag(cur.content, RE_DETECT_TEXT, "i")}</Typography>
            </Box>
          </Link>
        ))}
      </Box> */}
    </Box>
  );
};

export default Papers;
