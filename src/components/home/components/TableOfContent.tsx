import { Box, PaletteMode, Tooltip, Typography, useTheme } from "@mui/material";
import React from "react";

// import { SECTION_WITH_ANIMATION } from "../../../pages";

type TableOfContentProps = {
  menuItems: any[];
  onChangeContent: any;
  viewType: any;
  sectionSelected: number;
  animationSelected: number;
  sectionWithAnimation: number;
};

const TableOfContent = ({
  menuItems,
  onChangeContent,
  viewType,
  sectionSelected,
  animationSelected,
  sectionWithAnimation,
}: TableOfContentProps) => {
  const theme = useTheme();

  const getTextColor = (mode: PaletteMode, selected: boolean) => {
    if (mode === "dark" && selected) return "#f1f1f1";
    if (mode === "dark" && !selected) return "#9c9c9c";
    if (mode === "light" && selected) return theme.palette.common.darkGrayBackground;
    return "#7e7e7e";
  };

  return (
    <Box component={"nav"} sx={{ position: "sticky", top: "200px" }} style={{ mixBlendMode: "difference" }}>
      <Box
        component={"ul"}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          listStyle: "none",
          padding: 0,
          pl: viewType === "SIMPLE" ? "8px" : "15px",
        }}
      >
        {menuItems
          // .filter(c => !c.hidden)
          .map((item: any, idx: number) => (
            <Box
              component={"li"}
              key={item.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <Tooltip title={item.title} placement="right" arrow disableInteractive>
                <Box
                  onClick={() => onChangeContent(idx)}
                  sx={{
                    height: "56px",
                    // border: "solid 2px pink",
                    // color: getTextColor(theme.palette.mode, idx === sectionSelected),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    listStyle: "none",
                    borderLeft: "solid 1px #9c9c9c",
                    px: viewType === "SIMPLE" ? "0px" : "10px",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      position: "absolute",
                      left: "-4px",
                      top: "22px",

                      background: getTextColor(theme.palette.mode, idx === sectionSelected),
                      //  idx === sectionSelected ? "#f1f1f1" : "#9c9c9c",
                      // outline: idx === sectionSelected ? "solid 4px #8d8d8d7a" : undefined
                    },
                    "&::after": {
                      content: '""',
                      width: "15px",
                      height: "15px",
                      borderRadius: "50%",
                      position: "absolute",
                      left: "-8px",
                      top: "18px",
                      background: idx === sectionSelected ? "#8d8d8d7a" : "transparent",
                    },
                    ":hover": {
                      color: "#ff8a33",
                      "&::before": {
                        background: "#ff8a33",
                      },
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: getTextColor(theme.palette.mode, idx === sectionSelected),
                      fontSize: "16px",
                      py: "15px",
                      cursor: "pointer",
                      ":hover": {
                        color: "#ff8a33",
                      },
                    }}
                  >
                    {viewType === "COMPLETE" && item.title}
                    {viewType === "NORMAL" && item.simpleTitle}
                    {viewType === "SIMPLE" && " "}
                  </Typography>
                </Box>
              </Tooltip>

              {item.children.length > 0 && (
                <Box
                  component={"ul"}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    listStyle: "none",
                    pl: viewType === "SIMPLE" ? "0px" : "18px",
                    borderLeft: "solid 1px #9c9c9c",
                  }}
                >
                  {item.children.map((child: any, idx: number) => (
                    <Tooltip key={child.id} title={child.title} placement="right" arrow disableInteractive>
                      <Box
                        component={"li"}
                        onClick={() => onChangeContent(sectionWithAnimation, idx)}
                        sx={{
                          height: "36px",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          "&::before": {
                            content: '""',
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            position: "absolute",
                            left: viewType === "SIMPLE" ? "-3px" : "-21px",
                            top: "16px",
                            background: getTextColor(
                              theme.palette.mode,
                              animationSelected === idx && sectionSelected === sectionWithAnimation
                            ),
                            // animationSelected === idx && sectionSelected === SECTION_WITH_ANIMATION
                            //   ? "#f1f1f1"
                            //   : "#9c9c9c",
                            // outline: animationSelected === idx && sectionSelected === SECTION_WITH_ANIMATION ? "solid 3px #8d8d8d7a" : undefined
                          },
                          "&::after": {
                            content: '""',
                            width: "13px",
                            height: "13px",
                            borderRadius: "50%",
                            position: "absolute",
                            left: viewType === "SIMPLE" ? "-7px" : "-25px",
                            top: "12px",
                            background:
                              animationSelected === idx && sectionSelected === sectionWithAnimation
                                ? "#8d8d8d7a"
                                : "transparent",
                          },
                          ":hover": {
                            color: "#ff8a33",
                            "&::before": {
                              background: "#ff8a33",
                            },
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            // color:
                            //   animationSelected === idx && sectionSelected === SECTION_WITH_ANIMATION
                            //     ? "#f1f1f1"
                            //     : "#9c9c9c",
                            color: getTextColor(
                              theme.palette.mode,
                              animationSelected === idx && sectionSelected === sectionWithAnimation
                            ),
                            fontSize: "14px",
                            cursor: "pointer",
                            py: "5px",
                            ":hover": {
                              color: "#ff8a33",
                            },
                          }}
                        >
                          {viewType === "COMPLETE" && child.title}
                          {viewType === "NORMAL" && child.simpleTitle}
                          {viewType === "SIMPLE" && " "}
                          &nbsp;
                        </Typography>
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              )}
            </Box>
          ))}
      </Box>
    </Box>
  );
};

export const MemoizedTableOfContent = React.memo(TableOfContent);
