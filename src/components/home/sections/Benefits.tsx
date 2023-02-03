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

import valuesItems, { WhyItem } from "../views/valuesItems";

const Benefits = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>("Option1");
  const [selectedValue, setSelectedValue] = useState<WhyItem | null>(valuesItems[0] ?? null);

  const handleChange = (option: string, name: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? option : false);
    const newSelectedValues = valuesItems.find(value => value.name === name) ?? valuesItems[0];
    setSelectedValue(newExpanded ? newSelectedValues : null);
  };

  const getImage = (value: WhyItem | null, sx?: SxProps<Theme>) => {
    return value ? (
      <Box
        sx={{
          width: { xs: "300px", md: "400px" },
          minWidth: { xs: "300px", md: "400px" },
          height: { xs: "300px", md: "400px" },
          alignSelf: "center",
          ...sx,
        }}
      >
        <img
          src={`/static/${theme.palette.mode === "dark" ? value.imageDark : value.image}`}
          alt={value.name}
          style={{ width: "100%", height: "100%" }}
        />
      </Box>
    ) : null;
  };

  return (
    <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent={"space-between"} sx={{ margin: "auto" }}>
      <Box sx={{ maxWidth: "500px" }}>
        {valuesItems.map((value, idx: number) => (
          <Accordion
            key={value.name}
            disableGutters
            elevation={0}
            square
            sx={{
              background: "transparent",
              border: "none",
              borderLeft: `2px solid ${expanded === `Option${idx + 1}` ? "#FF6D00" : "#F8F8F8"}`,
              "&:before": {
                display: "none",
              },
            }}
            expanded={expanded === `Option${idx + 1}`}
            onChange={handleChange(`Option${idx + 1}`, value.name)}
          >
            <AccordionSummary>
              <Typography component={"h4"} variant={"h4"} sx={{ fontWeight: 400, p: "8px", cursor: "pointer" }}>
                {value.name}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                sx={{ p: "8px", pt: "0" }}
                fontSize={"14px"}
                color={theme.palette.mode === "light" ? "#475467" : "#EAECF0"}
              >
                {value.body}
              </Typography>

              {getImage(value, { display: { xs: "block", sm: "none" }, m: "0 auto" })}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {getImage(selectedValue, { display: { xs: "none", sm: "block" } })}
    </Stack>
  );
};
export default Benefits;
