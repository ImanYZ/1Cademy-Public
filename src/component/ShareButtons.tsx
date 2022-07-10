import CloseIcon from "@mui/icons-material/Close";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import LinkIcon from "@mui/icons-material/Link";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Box, IconButton, Snackbar, Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

interface ShareButtonsProps {
  showHelp?: boolean;
  responsive?: boolean;
}

export const ShareButtons = ({ showHelp = false, responsive = false }: ShareButtonsProps) => {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const URL = window.location.href;
    setUrl(URL);
  }, [router]);

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const messageTwitter = () => {
    return `1Cademy - Collaboratively Designing Learning Pathways 
        ${encodeURIComponent(url)}`;
  };

  const onShareByLink = () => {
    navigator.clipboard.writeText(url);
    setOpen(true);
  };

  return (
    <Tooltip title={showHelp ? "share the results of your search/filter/sort" : ""} placement="left">
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          href={`https://twitter.com/intent/tweet?text=${messageTwitter()}`}
          sx={{ color: "#BDBDBD", transition: "1s", ":hover": { transform: "translate(0px, -5px)", color: "#00acee" } }}
          target="_blank"
          rel="noopener"
          aria-label="Share on Twitter"
        >
          <TwitterIcon sx={{ fontSize: { xs: responsive ? "1.3rem" : "1.5rem", md: "1.5rem" } }} />
        </IconButton>
        {/* this works with different urls from localhost */}
        <IconButton
          href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
          sx={{ color: "#BDBDBD", transition: "1s", ":hover": { transform: "translate(0px, -5px)", color: "#3b5998" } }}
          target="_blank"
          rel="noopener"
          aria-label="Share on Facebook"
        >
          <FacebookRoundedIcon sx={{ fontSize: { xs: responsive ? "1.3rem" : "1.5rem", md: "1.5rem" } }} />
        </IconButton>
        {/* this works with different urls from localhost */}
        <IconButton
          href={`https://www.linkedin.com/shareArticle?mini=true&url=${url}`}
          sx={{ color: "#BDBDBD", transition: "1s", ":hover": { transform: "translate(0px, -5px)", color: "#0e76a8" } }}
          target="_blank"
          rel="noopener"
          aria-label="Share on Linkedin"
        >
          <LinkedInIcon sx={{ fontSize: { xs: responsive ? "1.3rem" : "1.5rem", md: "1.5rem" } }} />
        </IconButton>
        <Tooltip title="Copy link" placement="top" arrow>
          <IconButton
            sx={{ color: "#BDBDBD", transition: "1s", ":hover": { transform: "translate(0px, -5px)", color: "#000" } }}
            onClick={onShareByLink}
            aria-label="Share on url"
          >
            <LinkIcon sx={{ fontSize: { xs: responsive ? "1.3rem" : "1.5rem", md: "1.5rem" } }} />
          </IconButton>
        </Tooltip>
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
          message="Link copied to clipboard!"
          action={
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
              <CloseIcon sx={{ fontSize: { xs: responsive ? "1.3rem" : "1.5rem", md: "1.5rem" } }} />
            </IconButton>
          }
        />
      </Box>
    </Tooltip>
  );
};
