import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";

import { gray25, gray50, gray100, gray300, gray850, orangeDark } from "../../../pages/home";
import Photo from "./Photo";

const TEAM_ITEMS = [
  {
    id: "item-1",
    title: "1Cademy Architect",
    subtitle: "Iman YeckehZaare",
    image: "home/about/01.jpg",
    description: (
      <>
        <Typography>
          Iman YeckehZaare is the founder and architect of 1Cademy. He is currently pursuing his Ph.D. at the University
          of Michigan, School of Information. He has a Master of Science Degree in Information Science with two
          specializations in Human-Computer Interaction (HCI) and Information Economics for Management (IEM) from the
          same institution. Additionally, Iman holds two Bachelor of Engineering Degrees in Computer Science and
          Information Technology.
        </Typography>
        <Typography>
          Iman was awarded the title of Best Graduate Student Instructor of the Year 2018-2019 at the University of
          Michigan, School of Information. He was also a Michigan I-Corps 2013 Graduate, a Campus of the Future 2018
          Semi-finalist, an Innovation in Action 2018 2nd Prize awardee, and a Learning Levers 2019 3rd Prize awardee.
        </Typography>
      </>
    ),
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
    description: (
      <>
        <Typography>
          Joel Podolny is a highly regarded sociologist and CEO of Honor Education. Prior to his current position, Joel
          served as Vice President of Apple and was the founding Dean of Apple University, where he oversaw the
          company's internal training program.
        </Typography>
        <Typography>
          Joel's educational background is equally impressive. He was Dean and Professor of Management at the Yale
          School of Management and held professorships at the Harvard Business School and Stanford Graduate School of
          Business. During his tenure at Stanford, he served as senior associate dean and taught courses in business
          strategy, organizational behavior, and global management. At Harvard, he was a professor and director of
          research. In 2006, Joel led a major restructuring of the Yale MBA curriculum to better prepare students for
          the complex and cross-functional global environment.
        </Typography>
      </>
    ),
    link: "",
  },
];

const Team = () => {
  const [expandedIdx, setExpandedIdx] = useState(0);
  const handleChange = (idxItem: any) => (event: any, newExpanded: any) => {
    setExpandedIdx(newExpanded ? idxItem : -1);
  };

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
                background: theme => (theme.palette.mode === "dark" ? gray850 : gray50),
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
              }}
            >
              {`${cur.subtitle} - ${cur.title}`}
            </Typography>
            {cur.link && (
              <Button
                variant="text"
                href={cur.link}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                sx={{ color: orangeDark }}
              >
                Visit
                <ArrowForwardIcon fontSize={"small"} sx={{ ml: "10px" }} color="inherit" />
              </Button>
            )}
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                justifyItems: "center",
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
