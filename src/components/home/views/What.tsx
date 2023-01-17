import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
// import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import React from "react";

import { useInView, UseInViewProps } from "../../../hooks/useObserver";
import Typography from "../components/Typography";
// import { sectionsOrder } from "../sectionsOrder";
import communities from "./communitiesOrder";

// import sectionsOrder from "./sectionsOrder";
// const sectionIdx = sectionsOrder.findIndex(sect => sect.id === "CommunitiesSection");

const ImageBackdrop = styled("div")(({ theme }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  background: "#000",
  opacity: 0.5,
  transition: theme.transitions.create("opacity"),
}));

const ImageIconButton = styled(ButtonBase)(({ theme }) => ({
  position: "relative",
  display: "block",
  padding: 0,
  borderRadius: 0,
  height: "40vh",
  [theme.breakpoints.down("md")]: {
    width: "100% !important",
    height: 100,
  },
  "&:hover": {
    zIndex: 1,
  },
  "&:hover .imageBackdrop": {
    opacity: 0.15,
  },
  "&:hover .imageMarked": {
    opacity: 0,
  },
  "&:hover .imagepTitle": {
    border: "4px solid currentColor",
    maxWidth: "100%",
    padding: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  "& .imageTitle": {
    position: "relative",
    padding: `10px 20px`,
  },
  "& .imageMarked": {
    height: 3,
    width: 18,
    background: theme.palette.common.white,
    // position: "absolute",
    // bottom: -2,
    // left: "calc(50% - 9px)",

    transition: theme.transitions.create("opacity"),
  },
}));

const goToCommPage = (commId: string) => {
  window.open("/community/" + commId, "_blank");
};

const observerOption: UseInViewProps = { options: { root: null, rootMargin: "0px", threshold: 0.3 } };

const What = () => {
  const { inViewOnce: whatItem01InViewOnce, ref: whatItem01Ref } = useInView(observerOption);
  const { inViewOnce: whatItem02InViewOnce, ref: whatItem02Ref } = useInView(observerOption);
  const { inViewOnce: whatItem03InViewOnce, ref: whatItem03Ref } = useInView(observerOption);
  const { inViewOnce: whatItem04InViewOnce, ref: whatItem04Ref } = useInView(observerOption);
  const { inViewOnce: whatItem05InViewOnce, ref: whatItem05Ref } = useInView(observerOption);
  const { inViewOnce: whatItem06InViewOnce, ref: whatItem06Ref } = useInView(observerOption);
  const { inViewOnce: whatItem07InViewOnce, ref: whatItem07Ref } = useInView(observerOption);
  const { inViewOnce: whatItem08InViewOnce, ref: whatItem08Ref } = useInView(observerOption);

  const refs = [
    whatItem01Ref,
    whatItem02Ref,
    whatItem03Ref,
    whatItem04Ref,
    whatItem05Ref,
    whatItem06Ref,
    whatItem07Ref,
    whatItem08Ref,
  ];

  const inViewOnces = [
    whatItem01InViewOnce,
    whatItem02InViewOnce,
    whatItem03InViewOnce,
    whatItem04InViewOnce,
    whatItem05InViewOnce,
    whatItem06InViewOnce,
    whatItem07InViewOnce,
    whatItem08InViewOnce,
  ];

  return (
    <Box
      // id="CommunitiesSection"
      component="section"
    >
      {/* <Typography variant="h4" marked="center" align="center" sx={{ mb: 7 }}>
        {sectionsOrder[sectionIdx].title}
      </Typography> */}
      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        {communities.map((community, idx) => (
          // <Box >
          <ImageIconButton
            key={community.id}
            ref={refs[idx]}
            className={
              inViewOnces[idx]
                ? `slide-bottom-top ${idx % 3 === 1 ? "delay-300ms" : idx % 3 === 2 ? "delay-600ms" : ""}`
                : "hide"
            }
            onClick={() => goToCommPage(community.id)}
            style={{
              width: community.width,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundSize: "cover",
                backgroundPosition: "center 40%",
                backgroundImage: `url(${community.url})`,
              }}
            />
            <ImageBackdrop className="imageBackdrop" />
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
              }}
            >
              <Box className="imagepTitle">
                <Typography component="h3" variant="h6" sx={{ color: "inherit" }}>
                  {community.title}
                </Typography>
              </Box>
              <div className="imageMarked"></div>
            </Box>
          </ImageIconButton>
          // </Box>
        ))}
      </Box>
    </Box>
  );
};

export default What;
