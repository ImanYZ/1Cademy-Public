import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import { Box, Link, Typography } from "@mui/material";
import React from "react";

const TOPICS_ITEMS = [
  {
    id: "ux-research-psychology",
    title: "UX Research in Congnitive Psychology of Learning",
    image: "home/communities/01-ux-research-psychology-of-learning.jpg",
    link: "https://1cademy.us/community/Cognitive_Psychology",
  },
  {
    id: "clinical-psychology",
    title: "Clinical Psychology",
    image: "home/communities/02-clinicalpsychology.jpg",
    link: "https://1cademy.us/community/Clinical_Psychology",
  },
  {
    id: "health-psychology",
    title: "Health Psychology",
    image: "home/communities/03-health-psychology.jpg",
    link: "https://1cademy.us/community/Health_Psychology",
  },
  {
    id: "disability-studies",
    title: "Disability Studies",
    image: "home/communities/04-disability-studies.jpg",
    link: "https://1cademy.us/community/Disability_Studies",
  },
  {
    id: "social-psychology",
    title: "Social Psychology",
    image: "home/communities/05-social-psychology.jpg",
    link: "https://1cademy.us/community/Social_Psychology",
  },
  {
    id: "natural-language-processing",
    title: "Natural Language Processing",
    image: "home/communities/06-natural-language-processing.jpg",
    link: "https://1cademy.us/community/Deep_Learning",
  },
  {
    id: "ux-research-communities",
    title: "UX Research in Online Communities",
    image: "home/communities/07-ux-research-communities.jpg",
    link: "https://1cademy.us/community/UX_Research_in_Online_Communities",
  },
  {
    id: "liaison-librarians",
    title: "Liaison Librarians",
    image: "home/communities/08-liaisonlibrarians.jpg",
    link: "https://1cademy.us/community/Liaison_Librarians",
  },
];

const Topics = () => {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { sx: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: "16px" }}>
      {TOPICS_ITEMS.map(cur => (
        <Box
          key={cur.id}
          sx={{
            // border: "solid 2px",
            width: "100%",
            height: "310px",
            position: "relative",
            borderRadius: "12px",
            backgroundImage: `url(${cur.image})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Box
            sx={{
              display: "flex",
              //   p: "16px 30px",
              alignItems: "center",
              justifyContent: "space-between",
              position: "absolute",
              left: "0px",
              bottom: "0px",
              right: "0px",
              height: "70px",
              background: "#000000BD",
              // background: theme => (theme.palette.mode === "dark" ? "#000000BD" : "rgba(255, 255, 255, 0.74)"),
              borderRadius: "0px 0px 12px 12px",
            }}
          >
            <Box sx={{ height: "inherit", p: "16px 13px 16px 30px", display: "flex", alignItems: "center" }}>
              <Typography sx={{ flexGrow: "1", color: "white" }}>{cur.title}</Typography>
              {/* <Typography sx={{ flexGrow: "1" }}>{cur.title}</Typography> */}
            </Box>
            <Link
              href={cur.link}
              rel="noreferrer"
              target="_blank"
              sx={{
                // background: theme => (theme.palette.mode === "dark" ? "#000000" : "#F9FAFB"),
                minWidth: "70px",
                width: "70px",
                height: "70px",
                borderRadius: "12px 0px 12px 0px",
                display: "grid",
                placeItems: "center",
                ":hover": {
                  background: "#FF6D00",
                  color: "white",
                },
              }}
            >
              <ArrowOutwardIcon fontSize="large" />
            </Link>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Topics;
