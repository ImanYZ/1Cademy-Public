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
    image: "home/about/01.png",
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
    image: "home/about/02.jpeg",
    description: (
      <>
        <Typography
          sx={{ p: "8px", pt: "0" }}
          fontSize={"16px"}
          color={theme => (theme.palette.mode === "light" ? "#475467" : "#EAECF0")}
        >
          Paul Resnick is the Michael D. Cohen Collegiate Professor of Information, Associate Dean for Research and
          Innovation, and Professor of Information at the University of Michigan's School of Information. He has made
          significant contributions to research on online communities, reputation systems, and recommendation systems.
          Paul was elected to the CHI Academy in 2017, received the 2010 ACM Software Systems Award for the GroupLens
          Collaborative Filtering Recommender System, the ACM Special Interest Group on E-commerce Test of Time Award
          for "The Social Cost of Cheap Pseudonyms," and the 2016 University of Michigan Distinguished Faculty
          Achievement Award. In 2020, he became an ACM Fellow for his contributions to recommender systems, economics
          and computation, and online communities. Paul chaired the RecSys Conference steering committee from 2013 to
          2015 and co-chaired the ICWSM Conference in 2014. He earned his Ph.D. from MIT in 1992 and has advised the
          1Cademy project since 2013.
        </Typography>
      </>
    ),
    link: "https://www.si.umich.edu/people/paul-resnick",
  },
  {
    id: "item-3",
    title: "1Cademy Advisor",
    subtitle: "Joel Podolny",
    image: "home/about/03.png",
    description: (
      <>
        <Typography>
          Joel Podolny, a distinguished sociologist and CEO of Honor Education, Inc., has an impressive background in
          academia and corporate training. Previously, he held the position of Vice President at Apple and was the
          founding Dean of Apple University (2009-2021), where he managed the company's internal training program. In
          addition, he served as Dean and Professor of Management at the Yale School of Management (2005-2008),
          spearheading a significant overhaul of the Yale MBA curriculum to better equip students for the intricate,
          cross-functional global landscape.
        </Typography>
        <Typography>
          Prior to his tenure at Yale, Podolny was a Professor of Business Administration and Sociology at Harvard
          Business School (2002-2005) and a Professor of Organizational Behavior and Strategic Management at Stanford
          Graduate School of Business (1991-2002). While at Stanford, he held the position of Senior Associate Dean and
          taught courses in business strategy, organizational behavior, and global management. Podolny earned his Ph.D.
          in Sociology from Harvard University in 1991.
        </Typography>
      </>
    ),
    link: "https://www.linkedin.com/in/joel-podolny-58395a63",
  },
  {
    id: "item-4",
    title: "1Cademy Advisor",
    subtitle: "Roby Harrington",
    image: "home/about/roby.jpg",
    description: (
      <>
        <Typography>
          Roby Harrington is currently a board member of the Camphill Foundation, an advisor to CORE ECON, a board
          member of governors at Stanford University Press, a special advisor to the CEO of Honor Education Technology,
          and a farmer at Ten Barn Farm in Ghent, NY. At W. W. Norton & Company, Inc, Roby held various positions,
          including sales representative (1979-82), editor of political science, philosophy, and religion (1983-2020),
          national sales manager (1987-93), director of the college department (1994-2020), and Vice Chairman
          (2007-2021). He was also the chairman of the board at Camphill Foundation (2015-2020) and a fellow at the
          Center for Advanced Study in the Behavioral Sciences at Stanford University (2020-2021).
        </Typography>
      </>
    ),
    link: "https://www.linkedin.com/in/roby-harrington-7860a1137",
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
