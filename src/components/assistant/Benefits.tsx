import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";

import { orangeDark } from "@/pages/home";

import whyItems, { TWhyItem } from "./whyItems";
const Benefits = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>("Option1");
  const [selectedValue, setSelectedValue] = useState<TWhyItem | null>(whyItems[0] ?? null);

  const handleChange = (option: string, name: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? option : false);
    const newSelectedValues = whyItems.find(item => item.name === name) ?? whyItems[0];
    setSelectedValue(newExpanded ? newSelectedValues : null);
  };

  const getImage = (item: TWhyItem | null, sx?: SxProps<Theme>) => {
    return item ? (
      <Box
        sx={{
          width: { xs: "350px", sm: "400px", md: "450px", lg: "600px" },
          minWidth: { xs: "350px", sm: "400px", md: "450px", lg: "600px" },
          height: { xs: "350px", sm: "400px", md: "450px", lg: "600px" },
          alignSelf: "center",
          ...sx,
        }}
      >
        <img
          src={`/${theme.palette.mode === "dark" ? item.imageDark : item.image}`}
          alt={item.name}
          style={{ width: "100%", height: "100%" }}
        />
      </Box>
    ) : null;
  };

  return (
    <Stack direction={{ xs: "column-reverse", md: "row" }} justifyContent={"space-between"} sx={{ margin: "auto" }}>
      <Box sx={{ maxWidth: { xs: "none", md: "500px" } }}>
        {whyItems.map((value, idx: number) => (
          <Accordion
            key={value.name}
            disableGutters
            elevation={0}
            square
            sx={{
              background: "transparent",
              border: "none",
              borderLeft: `4px solid ${expanded === `Option${idx + 1}` ? orangeDark : "#F8F8F8"}`,
              "&:before": {
                display: "none",
              },
            }}
            expanded={expanded === `Option${idx + 1}`}
            onChange={handleChange(`Option${idx + 1}`, value.name)}
          >
            <AccordionSummary>
              <Typography
                component={"h4"}
                variant={"h4"}
                sx={{ fontSize: "20px", fontWeight: 600, p: "8px", cursor: "pointer" }}
              >
                {value.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                sx={{ p: "8px", pt: "0" }}
                fontSize={"16px"}
                color={theme.palette.mode === "light" ? "#475467" : "#EAECF0"}
              >
                {value.body}
              </Typography>

              {getImage(value, { display: { xs: "block", md: "none" }, m: "0 auto" })}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {getImage(selectedValue, { display: { xs: "none", md: "block" } })}
    </Stack>
  );
};
export default Benefits;
