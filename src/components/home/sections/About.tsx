import { Box, Link, Theme, Typography } from "@mui/material";
import { SxProps } from "@mui/system";
import React from "react";

import Team from "../components/AboutSwitcher";

const ABOUT_ITEMS = [
  {
    id: "item-1",
    title: "Supported by Honor Education",
    subtitle: "Honor Education",
    image: "home/about/logo-honor.jpg",
    description: "",
    link: "https://www.honor.education/",
  },
  {
    id: "item-2",
    title: "Supported by Google",
    subtitle: "Google Cloud",
    image: "home/about/logo-google-cloud.png",
    description: "awarded research credits to host 1Cademy on GCP services, under award number 205607640.",
    link: "https://cloud.google.com/edu/researchers",
  },
];

type AboutProps = { sx?: SxProps<Theme> };

const About = ({ sx }: AboutProps) => {
  return (
    <Box sx={{ ...sx }}>
      <Typography component={"h3"} sx={{ fontSize: "20px", fontWeight: 600, mb: "32px" }}>
        Sponsors
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          gap: "32px",
          placeItems: "center",
          pb: { xs: "64px" },
        }}
      >
        {ABOUT_ITEMS.map(cur => (
          <Link key={cur.id} href={cur.link} target="_blank" rel="noopener" sx={{ textDecoration: "none" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                ":hover": {
                  "& .about-card-content": {
                    background: theme => (theme.palette.mode === "dark" ? "#1d1d1d" : "#ebebeb"),
                  },
                },
              }}
            >
              <img
                src={cur.image}
                alt={cur.title}
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  height: "240px",
                  borderRadius: "10px 10px 0px 0px",
                  objectFit: "cover",
                }}
              />
              <Box
                className="about-card-content"
                sx={{
                  width: "100%",
                  maxWidth: "300px",
                  minHeight: "150px",
                  p: "20px 16px",
                  background: theme => (theme.palette.mode === "dark" ? "#000000" : "#F9FAFB"),
                }}
              >
                <Typography component={"h3"} sx={{ fontSize: "20px", fontWeight: 700, pb: "12px" }}>
                  {cur.title}
                </Typography>
                <Typography sx={{ fontSize: "16px", fontWeight: 600, pb: "8px" }}>{cur.subtitle}</Typography>
                {cur.description && <Typography sx={{ fontSize: "12px" }}>{cur.description}</Typography>}
              </Box>
            </Box>
          </Link>
        ))}
      </Box>

      <Typography component={"h3"} sx={{ fontSize: "20px", fontWeight: 600, mb: "32px" }}>
        Our Team
      </Typography>

      <Team />
    </Box>
  );
};

export default About;
