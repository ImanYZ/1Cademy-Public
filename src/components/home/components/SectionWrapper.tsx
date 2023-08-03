import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { forwardRef, ReactNode } from "react";

import { StatsSchema } from "../../../knowledgeTypes";
import { wrapStringWithBoldTag } from "../../../lib/utils/JSX.utils";
import { RE_DETECT_NUMBERS_WITH_COMMAS } from "../../../lib/utils/RE";
import { gray200, gray600 } from "../../../pages/home";
import { HomepageSection } from "../SectionsItems";

// TODO: improve this to change the description as React Node and send styles from section Wrapper
// so we don't need to validate if is string, if is function or if is component
// ad we can set up links and other values into description
const getDescription = (section: HomepageSection, stats?: StatsSchema): string => {
  if (typeof section.description !== "string") return "";
  const statsCopy = { ...stats };
  if (!section.getDescription) return section.description;
  if (!stats) return section.description;

  stats.communities = "49";
  return section.getDescription(statsCopy);
};

// const observerOption: UseInViewProps = { options: { root: null, rootMargin: "-480px 0px -380px 0px", threshold: 0 } };

type SectionWrapperProps = {
  section: HomepageSection;
  children: ReactNode;
  textAlign?: "center" | "left";
  stats?: StatsSchema;
};

export const SectionWrapper = forwardRef(
  ({ section, children, textAlign = "left", stats }: SectionWrapperProps, ref) => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
    // const { inView, ref: refTT } = useInView(observerOption);
    // const router = useRouter();

    // useEffect(() => {
    //   // if (typeof window !== "undefined") return;
    //   if (router.asPath.includes(`#${section.id}`)) return;
    //   if (!inView) return;

    //   router
    //     .push({ pathname: "/", hash: `#${section.id}` }, undefined, { shallow: true, scroll: false })
    //     .catch(err => console.error(err));
    // }, [inView, router, section.id]);

    return (
      <Box
        ref={ref}
        id={section.id}
        component={"section"}
        sx={{
          py: { xs: "64px", sm: "96px" },
          px: { xs: "16px", sm: "32px" },
          maxWidth: "1280px",
          m: "auto",
          textAlign,
          // border: "solid 2px royalBlue",
        }}
      >
        {section.label && section.description && (
          <Box sx={{ mb: "64px", display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontSize: "36px", mb: "20px", textTransform: "uppercase", fontWeight: 600 }}>
                {section.label}
              </Typography>

              {/* description */}
              {typeof section.description === "string"
                ? getDescription(section, stats)
                    .split("\n")
                    .map((paragraph: string) => (
                      <Typography
                        key={paragraph}
                        color={theme => (theme.palette.mode === "dark" ? gray200 : gray600)}
                        sx={{ fontSize: "20px", maxWidth: textAlign === "left" ? "500px" : undefined }}
                      >
                        {wrapStringWithBoldTag(paragraph, RE_DETECT_NUMBERS_WITH_COMMAS)}
                      </Typography>
                    ))
                : section.description}
            </Box>

            {/* image */}
            {textAlign === "left" && section.imageDark && !isSmall && (
              <Box
                sx={{
                  width: { xs: "250px", sm: "300px", md: "350px", lg: "430px" },
                  minWidth: { xs: "250px", sm: "300px", md: "350px", lg: "430px" },
                  height: { xs: "250px", sm: "300px", md: "350px", lg: "430px" },
                  alignSelf: "center",
                  // ...sx,
                }}
              >
                <img
                  src={`/static/${theme.palette.mode === "dark" ? section.imageDark : section.image}`}
                  alt={section.title}
                  style={{ width: "100%", height: "100%" }}
                />
              </Box>
            )}

            {/* {textAlign === "left" && theme.palette.mode === "light" && section.image} */}
          </Box>
        )}
        {children}
      </Box>
    );
  }
);

SectionWrapper.displayName = "SectionWrapper";
