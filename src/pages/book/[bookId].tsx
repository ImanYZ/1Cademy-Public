import { Box, Button, Drawer, List, ListItem, ListItemText } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

const PAGES = [
  "the-mission-corporation-section-4.html",
  "the-mission-corporation-section-5.html",
  "the-mission-corporation-section-6.html",
  "the-mission-corporation-section-7.html",
  "the-mission-corporation-section-8.html",
];

const PAGES_NAMES = [
  "The Next 250 Years: The New Age Of Enlightenment",
  "Mission-Led Business",
  "The Mission Corporations",
  "The Business Of Giving Back",
  "The Seven Declarations",
];

const HtmlRenderer = () => {
  const router = useRouter();
  const [htmlContent, setHtmlContent] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const bookId = router.query.bookId as string;
  const containerRef = useRef<any>(null);
  useEffect(() => {
    if (!bookId) return;
    const pageIndex = PAGES.indexOf(bookId);
    if (pageIndex === -1) {
      router.push(`/book/the-mission-corporation-section-4.html`);
      return;
    }
    const fetchHtml = async () => {
      try {
        const response = await fetch(`/${bookId}`);
        const html = await response.text();

        setHtmlContent(html);
        if (containerRef?.current) {
          containerRef.current.scrollTop = 0;
        }
      } catch (error) {
        console.error("Error loading HTML:", error);
      }
    };
    setCurrentPage(PAGES.indexOf(bookId));
    fetchHtml();
  }, [bookId]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSelectBook = (selectedBookId: any) => {
    router.push(`/book/${selectedBookId}`);
    setIsSidebarOpen(false);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        alignItems="center"
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
          right: 0,
          zIndex: 1,
          width: "40px",
          height: "40px",
        }}
      >
        <Button
          id="handleToggleSidebar"
          variant="contained"
          sx={{ color: "white", borderRadius: "25px" }}
          onClick={handleToggleSidebar}
        >
          Content
        </Button>
      </Box>

      <Drawer anchor="left" open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} sx={{ width: "100px" }}>
        <List>
          {PAGES.map((page, index) => (
            <ListItem button key={index} selected={currentPage === index} onClick={() => handleSelectBook(page)}>
              <ListItemText primary={`${PAGES_NAMES[index]}`} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        ref={containerRef}
        id="book-corporation"
        sx={{ height: "100vh", overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </Box>
    </Box>
  );
};

export default HtmlRenderer;
