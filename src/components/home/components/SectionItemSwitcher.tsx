import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Accordion, AccordionDetails, AccordionSummary, Button, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React, { useMemo, useState } from "react";

import { gray25, gray50, gray100, gray300, orangeDark } from "../../../pages/home";

export type SectionItemSwitcherItem = {
  id: string;
  title: string;
  content: string;
  link: string;
  image: string;
  imageDark: string;
};
type SectionItemSwitcherProps = {
  items: SectionItemSwitcherItem[];
};

export const SectionItemSwitcher = ({ items }: SectionItemSwitcherProps) => {
  const [expandedIdx, setExpandedIdx] = useState(0);
  const theme = useTheme();

  const handleChange = (idxItem: number) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpandedIdx(newExpanded ? idxItem : -1);
  };

  const MediaComponent = useMemo(() => {
    const selectedItem = items[expandedIdx];
    if (!selectedItem) return null;
    const src = theme.palette.mode === "dark" ? selectedItem.imageDark : selectedItem.image;
    console.log({ src });
    if (!src) return null;

    return <img src={`${src}`} alt={selectedItem.title} style={{ width: "100%", height: "100%" }} />;
  }, [expandedIdx, items, theme.palette.mode]);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" }, columnGap: "20px" }}>
      <Box>
        {items.map((cur, idx: number) => (
          <Accordion
            key={cur.id}
            disableGutters
            elevation={0}
            square
            sx={{
              background: "transparent",
              border: "none",
              borderLeft: theme =>
                `4px solid ${expandedIdx === idx ? orangeDark : theme.palette.mode === "dark" ? gray25 : gray100}`,
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
                  background: theme => (theme.palette.mode === "dark" ? "black" : gray50),
                },
              }}
            >
              <Typography
                component={"h4"}
                variant={"h4"}
                sx={{
                  fontSize: "20px",
                  fontWeight: 400,
                  p: "8px",
                  cursor: "pointer",
                }}
              >
                {cur.title}
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
              <Typography
                sx={{ p: "8px", pt: "0" }}
                fontSize={"16px"}
                color={theme => (theme.palette.mode === "light" ? "#475467" : "#EAECF0")}
              >
                {cur.content}
              </Typography>
              <Box sx={{ display: { xs: "block", md: "none" }, maxWidth: "400px", m: "auto" }}>{MediaComponent}</Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "flex", alignItems: "center" },
        }}
      >
        <Box sx={{ width: "100%", height: "auto" }}>{MediaComponent}</Box>
      </Box>
    </Box>
  );
};
