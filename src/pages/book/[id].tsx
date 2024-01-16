import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Grid, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
const PAGES = [
  "the-mission-corporation-section-4.html",
  "the-mission-corporation-section-5.html",
  "the-mission-corporation-section-6.html",
  "the-mission-corporation-section-7.html",
  "the-mission-corporation-section-8.html",
];

const HtmlRenderer = () => {
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const nodeId = router.query.id as string;
  useEffect(() => {
    const pageIndex = PAGES.indexOf(nodeId);
    if (pageIndex === -1) {
      router.push(`/book/the-mission-corporation-section-4.html`);
      return;
    }
    const fetchHtml = async () => {
      try {
        const response = await fetch(`/${nodeId}`);
        const html = await response.text();

        setHtmlContent(html);
      } catch (error) {
        console.error("Error loading HTML:", error);
      }
    };
    setCurrentPage(PAGES.indexOf(nodeId));
    fetchHtml();
  }, [nodeId]);

  const handlePrevPage = () => {
    const page = PAGES[Math.max(currentPage - 1, 0)];
    router.push(`/book/${page}`);
  };

  const handleNextPage = () => {
    const page = PAGES[Math.min(currentPage + 1, PAGES.length - 1)];
    router.push(`/book/${page}`);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1, background: "#fff" }}
      >
        <Grid item>
          <IconButton sx={{ color: "black" }} onClick={handlePrevPage} disabled={currentPage === 0}>
            <ArrowBackIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton sx={{ color: "black" }} onClick={handleNextPage} disabled={currentPage === PAGES.length - 1}>
            <ArrowForwardIcon />
          </IconButton>
        </Grid>
      </Grid>

      <Box sx={{ height: "100vh", overflow: "auto" }}>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </Box>
    </Box>
  );
};

export default HtmlRenderer;
