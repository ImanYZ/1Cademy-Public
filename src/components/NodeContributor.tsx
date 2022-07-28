import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import { FC } from "react";

import { KnowledgeNodeContributor, KnowledgeNodeInstitution } from "../knowledgeTypes";

type Props = {
  contributor: KnowledgeNodeContributor;
  institutions?: KnowledgeNodeInstitution[];
};
const NodeContributor: FC<Props> = ({ contributor }) => {
  return (
    <Box>
      <Avatar alt={contributor.chooseUname ? contributor.username : contributor.fullname} src={contributor.imageUrl} />
      <Box sx={{ display: "flex", flexDirection: "col" }}>
        <Box>{contributor.chooseUname ? contributor.username : contributor.fullname}</Box>
        {/* <Typography variant="caption">{institution.name}</Typography> */}
      </Box>
    </Box>
  );
};

export default NodeContributor;
