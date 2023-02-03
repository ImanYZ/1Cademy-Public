import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import { Box, Link, Typography } from "@mui/material";
import React from "react";

const TOPICS_ITEMS = [
  {
    id: "ux-research-psychology",
    title: "UX Research in Congnitive Psychology of Learning",
    link: "home/communities/01-ux-research-psychology-of-learning.jpg",
  },
  { id: "clinical-psychology", title: "Clinical Psychology", link: "home/communities/02-clinicalpsychology.jpg" },
  { id: "health-psychology", title: "Health Psychology", link: "home/communities/03-health-psychology.jpg" },
  { id: "disability-studies", title: "Disability Studies", link: "home/communities/04-disability-studies.jpg" },
  { id: "social-psychology", title: "Social Psychology", link: "home/communities/05-social-psychology.jpg" },
  {
    id: "natural-language-processing",
    title: "Natural Language Processing",
    link: "home/communities/06-natural-language-processing.jpg",
  },
  {
    id: "ux-research-communities",
    title: "UX Research in Online Communities",
    link: "home/communities/07-ux-research-communities.jpg",
  },
  { id: "liaison-librarians", title: "Liaison Librarians", link: "home/communities/08-liaisonlibrarians.jpg" },
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
            backgroundImage: `url(${cur.link})`,
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
              borderRadius: "0px 0px 12px 12px",
            }}
          >
            <Box sx={{ height: "inherit", p: "16px 13px 16px 30px", display: "flex", alignItems: "center" }}>
              <Typography sx={{ flexGrow: "1" }}>{cur.title}</Typography>
            </Box>
            <Link
              href={cur.link}
              rel="noreferrer"
              target="_blank"
              sx={{
                background: "white",
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
