import EastRoundedIcon from "@mui/icons-material/EastRounded";
import { Box, Link, Typography } from "@mui/material";
import React from "react";

const TOPICS_ITEMS = [
  {
    id: "ux-research-psychology",
    title: "UX Research in Congnitive Psychology of Learning",
    // image: "home/communities/01-ux-research-psychology-of-learning.jpg",
    image: "/static/Communities/Cognitive_Psychology.jpeg",
    link: "https://1cademy.us/community/Cognitive_Psychology",
  },
  {
    id: "clinical-psychology",
    title: "Clinical Psychology",
    // image: "home/communities/02-clinicalpsychology.jpg",
    image: "/static/Communities/Clinical_Psychology.jpg",
    link: "https://1cademy.us/community/Clinical_Psychology",
  },
  {
    id: "health-psychology",
    title: "Health Psychology",
    // image: "home/communities/03-health-psychology.jpg",
    image: "/static/Communities/Health_Psychology.png",
    link: "https://1cademy.us/community/Health_Psychology",
  },
  {
    id: "disability-studies",
    title: "Disability Studies",
    // image: "home/communities/04-disability-studies.jpg",
    image: "/static/Communities/Disability_Studies.jpg",
    link: "https://1cademy.us/community/Disability_Studies",
  },
  {
    id: "social-psychology",
    title: "Social Psychology",
    // image: "home/communities/05-social-psychology.jpg",
    image: "/static/Communities/Social_Political_Psychology.jpg",
    link: "https://1cademy.us/community/Social_Psychology",
  },
  {
    id: "natural-language-processing",
    title: "Natural Language Processing",
    // image: "home/communities/06-natural-language-processing.jpg",
    image: "/static/Communities/Deep_Learning.jpg",
    link: "https://1cademy.us/community/Deep_Learning",
  },
  {
    id: "ux-research-communities",
    title: "UX Research in Online Communities",
    // image: "home/communities/07-ux-research-communities.jpg",
    image: "/static/Communities/Online_Communities.jpg",
    link: "https://1cademy.us/community/UX_Research_in_Online_Communities",
  },
  {
    id: "liaison-librarians",
    title: "Liaison Librarians",
    // image: "home/communities/08-liaisonlibrarians.jpg",
    image: "/LibraryBackground.jpg",
    link: "https://1cademy.us/community/Liaison_Librarians",
  },
];

const Topics = () => {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { sx: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: "23px" }}>
      {TOPICS_ITEMS.map(cur => (
        <Link
          key={cur.id}
          href={cur.link}
          rel="noreferrer"
          target="_blank"
          sx={{
            ":hover": {
              ".topic-card-hover-effect": {
                opacity: 1,
                transition: "0.5s",
              },
            },
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "491px",
              position: "relative",
              backgroundImage: `url(${cur.image})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          >
            <Box
              sx={{
                display: "flex",
                p: "24px",
                alignItems: "center",
                justifyContent: "space-between",
                position: "absolute",
                left: "0px",
                bottom: "0px",
                right: "0px",
                height: "120px",
                background: "#00000080",
              }}
            >
              <Typography sx={{ color: "white", fontSize: { xs: "20px", xl: "24px" } }}>{cur.title}</Typography>
            </Box>

            <Box
              className="topic-card-hover-effect"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                left: "0px",
                bottom: "0px",
                right: "0px",
                top: "0px",
                background: theme => (theme.palette.mode === "dark" ? "#FF6D00D9" : "#000000CC"),
                opacity: 0,
              }}
            >
              <Box
                sx={{
                  p: "16px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "solid 2px white",
                  borderRadius: "6px",
                  color: "white",
                }}
              >
                <Typography sx={{ color: "inherit", fontSize: "24px" }}>Apply to join</Typography>
                <EastRoundedIcon sx={{ ml: "8px" }} />
              </Box>
            </Box>
          </Box>
        </Link>
      ))}
    </Box>
  );
};

export default Topics;
