import { Link, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

const ABOUT_ITEMS = [
  {
    id: "item-3",
    title: "Supported by Honor Education",
    subtitle: "Honor Education",
    image: "home/about/logo-honor.jpg",
    description: "",
    link: "https://www.honor.education/",
  },
  {
    id: "item-4",
    title: "Supported by University of Michigan",
    subtitle: "School of Information",
    image: "home/about/logo-school-of-information.jpg",
    description: "",
    link: "https://www.si.umich.edu/",
  },
  {
    id: "item-5",
    title: "Supported by Google",
    subtitle: "Google Cloud",
    image: "home/about/logo-google-cloud.png",
    description: "awarded research credits to host 1Cademy on GCP services, under award number 205607640.",
    link: "https://cloud.google.com/edu/researchers",
  },
  {
    id: "item-1",
    title: "1Cademy Architect",
    subtitle: "Iman YeckehZaare",
    image: "home/about/Iman_YeckehZaare.jpg",
    description:
      "Ph.D. Candidate, Awarded as the Best Graduate Student Instructor of the Year 2018-2019 at the University of Michigan, School of Information",
    link: "https://www.si.umich.edu/people/iman-yeckehzaare",
  },
  {
    id: "item-2",
    title: "1Cademy Advisor",
    subtitle: "Paul Resnick",
    image: "home/about/Paul_Resnick.jpg",
    description:
      "Michael D. Cohen Collegiate Professor of Information, Associate Dean for Research and Faculty Affairs and Professor of Information, University of Michigan, School of Information",
    link: "https://www.si.umich.edu/people/paul-resnick",
  },
];

const About = () => {
  return (
    <Box
      sx={{
        pb: { xs: "64px", sm: "96px" },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
        gap: "32px",
        placeItems: "center",
      }}
    >
      {ABOUT_ITEMS.map(cur => (
        <Link key={cur.id} href={cur.link} target="_blank" rel="noopener" sx={{ textDecoration: "none" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              ":hover": {
                "& :nth-child(2)": {
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
  );
};

export default About;
