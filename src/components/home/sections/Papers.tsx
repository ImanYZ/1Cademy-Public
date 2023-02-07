import { Box, Link, Typography } from "@mui/material";
import React from "react";

import { wrapStringWithTag } from "../../../lib/utils/JSX.utils";
import { RE_DETECT_TEXT } from "../../../lib/utils/RE";

const PAPER_ITEMS = [
  {
    id: "paper-100",
    title: "ACM SIGCSE 2023",
    content:
      "YeckehZaare, I., Chen, S., & Barghi, T. (2023). Reducing Procrastination Without Sacrificing Students' Autonomy Through Optional Weekly Presentations of Student-Generated Content. In [Proceedings of the 54th ACM Technical Symposium on Computer Science Education (SIGCSE 2023), March 15--18, 2023, Toronto, Canada. ACM.]",
    link: "",
  },
  {
    id: "paper-101",
    title: "ACM SIGCSE 2022",
    content:
      "YeckehZaare, I., Grot, G., &amp; Aronoff, C. (2022). Retrieval-based Teaching Incentivizes Spacing and Improves Grades in Computer Science Education. In [Proceedings of the 53rd ACM Technical Symposium on Computer Science Education V. 1 (SIGCSE 2022), March 3--5, 2022, Providence, RI, USA. ACM.]",
    link: "https://dl.acm.org/doi/abs/10.1145/3478431.3499408",
  },
  {
    id: "paper-102",
    title: "ACM SIGCSE 2022",
    content:
      "YeckehZaare, I., Grot, G., Dimovski, I., Pollock, K., &amp; Fox, E. (2022). Another Victim of COVID-19: Computer Science Education. In [Proceedings of the 53rd ACM Technical Symposium on Computer Science Education V. 1 (SIGCSE 2022), March 3--5, 2022, Providence, RI, USA. ACM.]",
    link: "https://dl.acm.org/doi/abs/10.1145/3478431.3499313",
  },
  {
    id: "paper-103",
    title: "ACM LAK 2022",
    content:
      "YeckehZaare, I., Mulligan, V., Ramstad, G. V., &amp; Resnick, P. (2022). Semester-level Spacing but Not Procrastination Affected Student Exam Performance. In [Proceedings of the 12th International Conference on Learning Analytics and Knowledge (LAK&#8216;22) online, March 21-25, 2022. ACM.]",
    link: "https://dl.acm.org/doi/abs/10.1145/3506860.3506907",
  },
  {
    id: "paper-104",
    title: "ACM ICER 2021",
    content:
      "YeckehZaare, I., Fox, E., Grot, G., Chen, S., Walkosak, C., Kwon, K., ... &amp; Silverstein, N. (2021, August). Incentivized Spacing and Gender in Computer Science Education. In [Proceedings of the 17th ACM Conference on International Computing Education Research] (pp. 18-28).",
    link: "https://dl.acm.org/doi/abs/10.1145/3446871.3469760",
  },
  {
    id: "paper-105",
    title: "ACM CHI 2020",
    content:
      "Yeckehzaare, I., Barghi, T., &amp; Resnick, P. (2020, April). QMaps: Engaging Students in Voluntary Question Generation and Linking. In [Proceedings of the 2020 CHI Conference on Human Factors in Computing Systems] (pp. 1-14).",
    link: "https://dl.acm.org/doi/abs/10.1145/3313831.3376882",
  },
  {
    id: "paper-106",
    title: "ACM ICER 2019",
    content:
      "YeckehZaare, I., Resnick, P., &amp; Ericson, B. (2019, July). A spaced, interleaved retrieval practice tool that is motivating and effective. In [Proceedings of the 2020 CHI Conference on Human Factors in Computing Systems] (pp. 71-79).",
    link: "https://dl.acm.org/doi/abs/10.1145/3291279.3339411",
  },
  {
    id: "paper-107",
    title: "ACM SIGCSE 2019",
    content:
      "YeckehZaare, I., &amp; Resnick, P. (2019, February). Speed and Studying: Gendered Pathways to Success. In [Proceedings of the 50th ACM Technical Symposium on Computer Science Education] (pp. 693-698).",
    link: "https://dl.acm.org/doi/abs/10.1145/3287324.3287417",
  },
  {
    id: "paper-108",
    title: "SPLICE 2019",
    content:
      "Ericson, B. J., YeckehZaare, I., &amp; Guzdial, M. J. (2019). Runestone Interactive Ebooks: A Research Platform for On-line Computer Science Learning. In [Proceedings of SPLICE 2019 workshop Computing Science Education Infrastructure: From Tools to Data at 15th ACM International Computing Education Research Conference, Aug 11, 2019, Toronto, Canada.]",
    link: "https://www.researchgate.net/profile/Iman-Yeckehzaare/publication/341966650_Runestone_Interactive_Ebooks_A_Research_Platform_for_On-line_Computer_Science_Learning/links/5edb704945851529453ca208/Runestone-Interactive-Ebooks-A-Research-Platform-for-On-line-Computer-Science-Learning.pdf",
  },
];

const Papers = () => {
  return (
    <Box>
      <Typography component={"h3"} sx={{ fontSize: "20px", fontWeight: 600, mb: "32px" }}>
        Recently Published Papers
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: "24px" }}>
        {PAPER_ITEMS.map(cur => (
          <Link
            key={cur.id}
            href={cur.link || undefined}
            target="_blank"
            rel="noopener"
            sx={{ textDecoration: "none" }}
          >
            <Box
              sx={{
                p: "24px",
                background: theme => (theme.palette.mode === "dark" ? "#000000" : "#F9FAFB"),
                cursor: "pointer",
                ":hover": {
                  background: theme => (theme.palette.mode === "dark" ? "#1d1d1d" : "#ebebeb"),
                },
              }}
            >
              <Typography component={"h4"} sx={{ fontSize: "20px", fontWeight: 600, mb: "8px" }}>
                {cur.title}
              </Typography>
              <Typography>{wrapStringWithTag(cur.content, RE_DETECT_TEXT, "i")}</Typography>
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default Papers;
