import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from "@mui/material";
import React, { useState } from "react";

// import { useMemo } from "react";
import { gray25, gray50, gray100, gray200, gray300, orangeDark } from "../../../pages/home";
import Photo from "./Photo";

// import { gray25, gray50, gray100, gray200, gray300, orangeDark } from "../../../../utils/colors";
const TEAM_ITEMS = [
  {
    id: "item-1",
    title: "1Cademy Architect",
    subtitle: "Iman YeckehZaare",
    image: "home/about/01.jpg",
    awards: [],
    description: `
      Iman YeckehZaare is the founder and architect of 1Cademy. He is currently pursuing his Ph.D. at the University of Michigan, School of Information. He has a Master of Science Degree in Information Science with two specializations in Human-Computer Interaction (HCI) and Information Economics for Management (IEM) from the same institution. Additionally, Iman holds two Bachelor of Engineering Degrees in Computer Science and Information Technology.
Iman was awarded the title of Best Graduate Student Instructor of the Year 2018-2019 at the University of Michigan, School of Information. He was also a Michigan I-Corps 2013 Graduate, a Campus of the Future 2018 Semi-finalist, an Innovation in Action 2018 2nd Prize awardee, and a Learning Levers 2019 3rd Prize awardee.
      `,
    link: "https://www.si.umich.edu/people/iman-yeckehzaare",
  },
  {
    id: "item-2",
    title: "1Cademy Advisor",
    subtitle: "Paul Resnick",
    image: "home/about/02.jpg",
    description: (
      <>
        <Typography
          sx={{ p: "8px", pt: "0" }}
          fontSize={"16px"}
          color={theme => (theme.palette.mode === "light" ? "#475467" : "#EAECF0")}
        >
          Paul Resnick is a professor at the University of Michigan's School of Information. He is a leading expert in
          the field of information and technology and has made significant contributions to the study of online
          communities, reputation systems, and recommendation systems. Professor Resnick has received numerous
          recognition for his work. Some of his most notable awards include:
        </Typography>
        <Box component={"ul"}>
          <Box component={"li"}>The ACM SIGCHI Lifetime Research Award</Box>
          <Box component={"li"}>The National Science Foundation's CAREER Award</Box>
          <Box component={"li"}>
            The Association for Computing Machinery's Conference on Electronic Commerce Best Paper Award
          </Box>
          <Box component={"li"}>The Michigan School of Information's Education Innovator Award</Box>
          <Box component={"li"}>
            The W. Wallace McDowell Award for outstanding contributions to the field of computer science
          </Box>
        </Box>
      </>
    ),
    link: "https://www.si.umich.edu/people/paul-resnick",
  },
  {
    id: "item-3",
    title: "1Cademy Advisor",
    subtitle: "Joel Podolny",
    image: "home/about/03.jpg",
    description: `
    Joel Podolny is a highly regarded sociologist and CEO of Honor Education. Prior to his current position, Joel served as Vice President of Apple and was the founding Dean of Apple University, where he oversaw the company's internal training program.
Joel's educational background is equally impressive. He was Dean and Professor of Management at the Yale School of Management and held professorships at the Harvard Business School and Stanford Graduate School of Business. During his tenure at Stanford, he served as senior associate dean and taught courses in business strategy, organizational behavior, and global management. At Harvard, he was a professor and director of research. In 2006, Joel led a major restructuring of the Yale MBA curriculum to better prepare students for the complex and cross-functional global environment. `,
    link: "https://www.si.umich.edu/people/paul-resnick",
  },
];

const Team = () => {
  const [expandedIdx, setExpandedIdx] = useState(0);
  // const theme = useTheme();
  const handleChange = (idxItem: any) => (event: any, newExpanded: any) => {
    setExpandedIdx(newExpanded ? idxItem : -1);
  };
  // const MediaComponent = useMemo(() => {
  //   const selectedItem = TEAM_ITEMS[expandedIdx];
  //   if (!selectedItem) return null;
  //   return (
  //     <img
  //       src={`${theme.palette.mode === "light" ? selectedItem.imageDark : selectedItem.image}`}
  //       alt={selectedItem.title}
  //       style={{ width: "100%", height: "100%", color: gray200 }}
  //     />
  //   );
  // }, [expandedIdx, theme.palette.mode]);
  return (
    <Box>
      {TEAM_ITEMS.map((cur, idx) => (
        <Accordion
          key={cur.id}
          disableGutters
          elevation={0}
          square
          sx={{
            background: "transparent",
            border: "none",
            borderLeft: theme =>
              `4px solid ${expandedIdx === idx ? orangeDark : theme.palette.mode === "light" ? gray25 : gray100}`,
            "&:before": {
              display: "none",
            },
            ":hover": {
              borderLeft: expandedIdx !== idx ? `4px solid ${gray300}` : undefined,
            },
          }}
          expanded={expandedIdx === idx}
          onChange={handleChange(idx)}
        >
          <AccordionSummary
            sx={{
              ":hover": {
                background: theme => (theme.palette.mode === "dark" ? "black" : gray50),
              },
            }}
          >
            <Typography
              component={"h4"}
              variant={"h4"}
              sx={{
                fontSize: "20px",
                fontWeight: 600,
                p: "8px",
                cursor: "pointer",
                textTransform: "none",
                color: gray200,
              }}
            >
              {`${cur.subtitle} - ${cur.title}`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                justifyItems: "center",
                // placeItems: "center",
              }}
            >
              <Box
                sx={{ p: "8px", pt: "0" }}
                fontSize={"16px"}
                color={theme => (theme.palette.mode === "light" ? "#475467" : "#EAECF0")}
              >
                {cur.description}
              </Box>
              <Photo src={cur.image} subtitle={cur.subtitle} title={cur.title} />
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};
export default Team;
