import { Link } from "@mui/material";

import { gray200, gray300, gray600, gray700, orangeDark } from "../../pages/home";
import { HomepageSection } from "../home/SectionsItems";

type ActiveLinkProps = {
  section: HomepageSection;
  selectedSectionId: string;
  onSwitchSection: (id: string) => void;
  // preUrl?: string;
};

export const ActiveLink = ({ section, selectedSectionId, onSwitchSection }: ActiveLinkProps) => {
  return (
    <Link
      onClick={() => onSwitchSection(section.id)}
      sx={{
        whiteSpace: "nowrap",
        color: theme => (theme.palette.mode === "dark" ? gray200 : gray600),
        cursor: "pointer",
        textDecoration: "none",
        fontWeight: 600,
        borderBottom: selectedSectionId === `#${section.id}` ? `solid 2px ${orangeDark}` : undefined,
        transitions: "all .5s",
        ":hover": {
          color: theme => (theme.palette.mode === "dark" ? gray300 : gray700),
        },
      }}
    >
      {section.label}
    </Link>
  );
};
