import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/system";
import { FC } from "react";

import ROUTES from "@/lib/utils/routes";

import { KnowledgeNodeContributor, KnowledgeNodeInstitution } from "../knowledgeTypes";
import LeaderboardChip from "./LeaderboardChip";

type Props = {
  contributors: KnowledgeNodeContributor[];
  institutions: KnowledgeNodeInstitution[];
  sx?: SxProps<Theme>;
};

const NodeItemContributors: FC<Props> = ({ contributors, institutions, sx }) => {
  const renderContributors = () => {
    return contributors.map((el, idx) => (
      <Grid item key={idx}>
        <LeaderboardChip
          key={idx}
          name={el.chooseUname ? el.username : el.fullname}
          imageUrl={el.imageUrl}
          reputation={el.reputation || 0}
          isChamp={idx === 0}
          href={`${ROUTES.home}?contributors=${el.username}`}
        />
      </Grid>
    ));
  };

  const renderInstitutions = () => {
    return institutions.map((el, idx) => (
      <Grid item key={idx}>
        <LeaderboardChip
          key={idx}
          name={el.name}
          imageUrl={el.logoURL}
          reputation={el.reputation || 0}
          isChamp={idx === 0}
          renderAsAvatar={false}
          href={`${ROUTES.search}?institutions=${el.id}`}
        />
      </Grid>
    ));
  };

  if (!contributors.length && !institutions.length) {
    return null;
  }

  return (
    <Box sx={{ ...sx }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: "15px" }}>
        Contributors are:
      </Typography>
      <Grid container spacing={1} sx={{ mt: 0 }}>
        {renderContributors()}
      </Grid>
      <Typography variant="body2" color="text.secondary" sx={{ mt: "20px", mb: "15px" }}>
        Who are from:
      </Typography>
      <Grid container spacing={1} sx={{ mt: 0 }}>
        {renderInstitutions()}
      </Grid>
    </Box>
  );
};

export default NodeItemContributors;
