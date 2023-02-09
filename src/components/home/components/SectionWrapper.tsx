import { Box, Typography } from "@mui/material";
import { forwardRef, ReactNode } from "react";

import { StatsSchema } from "../../../knowledgeTypes";
import { wrapStringWithBoldTag } from "../../../lib/utils/JSX.utils";
import { RE_DETECT_NUMBERS_WITH_COMMAS } from "../../../lib/utils/RE";
import { gray200, gray600 } from "../../../pages/home";
import { HomepageSection } from "../SectionsItems";

const getDescription = (section: HomepageSection, stats?: StatsSchema): string => {
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
    // const { inView, ref: refTT } = useInView(observerOption);
    // const router = useRouter();

    // console.log(inView, router.asPath, `#${section.id}`);

    // useEffect(() => {
    //   // console.log({ inView });
    //   // if (typeof window !== "undefined") return;
    //   if (router.asPath.includes(`#${section.id}`)) return;
    //   if (!inView) return;

    //   router
    //     .push({ pathname: "/", hash: `#${section.id}` }, undefined, { shallow: true, scroll: false })
    //     .catch(err => console.log(err));
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
          //   border: "solid 2px royalBlue",
        }}
      >
        <Box sx={{ mb: "64px" }}>
          <Typography sx={{ fontSize: "36px", mb: "20px", textTransform: "uppercase", fontWeight: 600 }}>
            {section.label}
          </Typography>

          {getDescription(section, stats)
            .split("\n")
            .map((paragraph: string) => (
              <Typography
                key={paragraph}
                color={theme => (theme.palette.mode === "dark" ? gray200 : gray600)}
                sx={{ fontSize: "20px", maxWidth: textAlign === "left" ? "768px" : undefined }}
              >
                {wrapStringWithBoldTag(paragraph, RE_DETECT_NUMBERS_WITH_COMMAS)}
              </Typography>
            ))}
        </Box>
        {children}
      </Box>
    );
  }
);

SectionWrapper.displayName = "SectionWrapper";
