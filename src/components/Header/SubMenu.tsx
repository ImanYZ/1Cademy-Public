import { ClickAwayListener, Collapse, Link, SxProps, Typography } from "@mui/material";
import { Box, Theme } from "@mui/system";

import { gray50, gray200, gray300, gray600, gray850,gray900 } from "../../pages/home";
import { HomepageSection } from "../home/SectionsItems";

type SubMenuProps = { onCloseSubMenu: () => void; sectionVisible?: HomepageSection; sx?: SxProps<Theme> };

export const SubMenu = ({ onCloseSubMenu, sectionVisible, sx }: SubMenuProps) => {
  return (
    <Collapse in={Boolean(sectionVisible)} timeout="auto" unmountOnExit sx={{ ...sx }}>
      {sectionVisible && (
        <ClickAwayListener onClickAway={onCloseSubMenu}>
          <Box
            sx={{
              p: { xs: "36px 12px", md: "32px" },
              maxWidth: "1280px",
              margin: "auto",
            }}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
              {sectionVisible.options.map(cur => (
                <Link
                  key={cur.title}
                  href={cur.link}
                  rel="noopener"
                  target="_blank"
                  sx={{
                    textDecoration: "none",
                    p: "12px",
                    cursor: "pointer",
                    borderRadius: "16px",
                    color: theme => (theme.palette.mode === "dark" ? gray200 : "black"),
                    ":hover": {
                      background: theme => (theme.palette.mode === "dark" ? gray850 : gray50),
                    },
                  }}
                >
                  <Typography
                    sx={{
                      mb: "4px",
                      color: theme => (theme.palette.mode === "dark" ? gray200 : gray900),
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    {cur.title}
                  </Typography>
                  <Typography
                    sx={{
                      display: { xs: "none", md: "block" },
                      color: theme => (theme.palette.mode === "dark" ? gray300 : gray600),
                      fontSize: "14px",
                    }}
                  >
                    {cur.description.split(" ").slice(0, 13).join(" ") + "..."}
                  </Typography>
                </Link>
              ))}
            </Box>
          </Box>
        </ClickAwayListener>
      )}
    </Collapse>
  );
};
