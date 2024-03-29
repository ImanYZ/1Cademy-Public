import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Stack,
  SxProps,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useState } from "react";
import { useQuery } from "react-query";

import { getStats } from "@/lib/knowledgeApi";
import { RE_DETECT_NUMBERS_WITH_COMMAS } from "@/lib/utils/RE";
import { gray25, gray50, gray100, gray300, gray850, orangeDark } from "@/pages/home";

import { wrapStringWithBoldTag } from "../../../lib/utils/JSX.utils";
import { RiveComponentMemoized } from "../components/temporals/RiveComponentExtended";
import whichValues, { TWhichValue } from "./constants/whichValues";

const Systems = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<string | false>("Option1");
  const [selectedValue, setSelectedValue] = useState<TWhichValue | null>(whichValues[0] ?? null);

  const { data: stats } = useQuery("stats", getStats);

  const getDescription = useCallback(
    (whichItem: TWhichValue): string => {
      if (!whichItem.getBody) return whichItem.body;
      if (!stats) return whichItem.body;

      stats.communities = "49";
      return whichItem.getBody(stats);
    },
    [stats]
  );

  const handleChange = (option: string, name: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? option : false);
    const newSelectedValues = whichValues.find(value => value.name === name) ?? whichValues[0];
    setSelectedValue(newExpanded ? newSelectedValues : null);
  };

  const getAnimation = (value: TWhichValue | null, sx?: SxProps<Theme>) => {
    return value ? (
      <Box
        sx={{
          width: { xs: "350px", sm: "400px", md: "450px", lg: "600px", xl: "750px" },
          height: {
            xs: getHeight(350),
            sm: getHeight(400),
            md: getHeight(450),
            lg: getHeight(600),
            xl: getHeight(750),
          },
          alignSelf: "center",
          ...sx,
        }}
      >
        {value.id === "notebook" && (
          <RiveComponentMemoized
            src="rive/linking.riv"
            artboard={"New Artboard"}
            animations={["Timeline 1"]}
            autoplay={true}
            displayControls
          />
        )}
        {value.id === "assistant" && (
          <RiveComponentMemoized
            src="rive-assistant/goals.riv"
            artboard={"artboard-3"}
            animations={["Timeline 1", theme.palette.mode]}
            autoplay={true}
            displayControls
          />
        )}
        {value.id === "extensions" && (
          <RiveComponentMemoized
            src="rive/extension.riv"
            artboard={"extension"}
            animations={["Timeline 1", theme.palette.mode]}
            autoplay={true}
            displayControls
          />
        )}
      </Box>
    ) : null;
  };

  return (
    <Box sx={{ margin: "auto" }}>
      <Stack direction={{ xs: "column-reverse", sm: "row" }} justifyContent={"space-between"}>
        <Box sx={{ maxWidth: "500px", flex: 1 }}>
          {whichValues.map((value, idx: number) => (
            <Accordion
              key={value.name}
              disableGutters
              elevation={0}
              square
              sx={{
                background: "transparent",
                border: "none",
                borderLeft: `4px solid ${
                  expanded === `Option${idx + 1}` ? orangeDark : theme.palette.mode === "dark" ? gray25 : gray100
                }`,
                "&:before": {
                  display: "none",
                },
                ":hover": {
                  borderLeft: theme =>
                    expanded !== `Option${idx + 1}`
                      ? theme.palette.mode === "light"
                        ? `4px solid ${gray300}`
                        : `4px solid ${gray300}`
                      : undefined,
                },
              }}
              expanded={expanded === `Option${idx + 1}`}
              onChange={handleChange(`Option${idx + 1}`, value.name)}
            >
              <AccordionSummary
                sx={{
                  ":hover": {
                    background: theme => (theme.palette.mode === "dark" ? gray850 : gray50),
                  },
                }}
              >
                <Typography
                  component={"h4"}
                  variant={"h4"}
                  fontSize={20}
                  sx={{ fontWeight: 400, p: "8px", cursor: "pointer" }}
                >
                  {value.name}
                </Typography>
                <Button
                  variant="text"
                  href={value.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  sx={{ color: orangeDark }}
                >
                  Visit
                  <ArrowForwardIcon fontSize={"small"} sx={{ ml: "10px" }} color="inherit" />
                </Button>
              </AccordionSummary>
              <AccordionDetails>
                {getDescription(value)
                  .split("\n")
                  .map((paragraph: string, idx: number) => (
                    <Typography
                      key={idx}
                      fontSize={"16px"}
                      color={theme.palette.mode === "light" ? "#475467" : "#EAECF0"}
                      sx={{ p: "8px", pt: "0" }}
                    >
                      {wrapStringWithBoldTag(paragraph, RE_DETECT_NUMBERS_WITH_COMMAS)}
                    </Typography>
                  ))}

                {getAnimation(value, {
                  display: { xs: "block", sm: "none" },
                  m: "0 auto",
                  opacity: selectedValue?.id !== value.id ? "0" : "1",
                })}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {getAnimation(selectedValue, { display: { xs: "none", sm: "block" }, flex: 1 })}
      </Stack>
    </Box>
  );
};
const getHeight = (width: number) => (300 * width) / 500;
export default Systems;
