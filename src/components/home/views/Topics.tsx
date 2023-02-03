import { Box, Collapse, Stack, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";

import valuesItems, { WhyItem } from "./valuesItems";

interface ICollapseKeys {
  [key: string]: boolean;
}

const Topics = () => {
  const theme = useTheme();
  const [item, setItem] = useState<WhyItem | null>(null);
  const [keys, setKeys] = useState<ICollapseKeys>(
    valuesItems?.reduce((acc, cur) => {
      return { ...acc, [cur.name]: false };
    }, {} as ICollapseKeys)
  );

  const handleOpenKeys = (key: string) => {
    setKeys(() => {
      const keys = valuesItems?.reduce((acc, cur) => {
        return { ...acc, [cur.name]: false };
      }, {} as ICollapseKeys);

      keys[key] = true;
      return keys;
    });

    const active = valuesItems.find(item => item.name === key);
    setItem(active ?? null);
  };

  return (
    <Box width={"100%"} height={"100vh"} paddingTop={"200px"}>
      <Stack
        direction={{ xs: "column-reverse", sm: "row" }}
        justifyContent={"space-between"}
        sx={{ maxWidth: "980px", margin: "auto" }}
      >
        <Box sx={{ maxWidth: "500px" }}>
          {valuesItems.map((value: any, idx: number) => (
            <Box
              key={idx}
              component={"details"}
              sx={{
                borderLeft: `2px solid ${keys[value.name] ? "#ff6d00" : "#F8F8F8"}`,
                transition: "border-left .3s ease-out",
                "&> summary": {
                  listStyle: "none",
                },
              }}
              onToggle={() => handleOpenKeys(value.name)}
            >
              <Box component={"summary"}>
                <Typography component={"h4"} variant={"h4"} sx={{ fontWeight: 400, p: "8px", cursor: "pointer" }}>
                  {value.name}
                </Typography>
              </Box>
              <Collapse in={keys[value.name]} timeout="auto" unmountOnExit>
                <Typography
                  sx={{ p: "8px", pt: "0" }}
                  fontSize={"14px"}
                  color={theme.palette.mode === "light" ? "#475467" : "#EAECF0"}
                >
                  {value.body}
                </Typography>
                <Box
                  sx={{
                    width: "300px",
                    height: "300px",
                    alignSelf: "center",
                    display: { xs: "block", sm: "none" },
                    m: "auto",
                  }}
                >
                  <img
                    src={`/static/${theme.palette.mode === "dark" ? value.imageDark : value.image}`}
                    alt={value.name}
                  />
                </Box>
              </Collapse>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            width: "400px",
            minWidth: "400px",
            height: "400px",
            alignSelf: "center",
            display: { xs: "none", sm: "block" },
          }}
        >
          {item && (
            <img src={`/static/${theme.palette.mode === "dark" ? item.imageDark : item.image}`} alt={item.name} />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default Topics;
