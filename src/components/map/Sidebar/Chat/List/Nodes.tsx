import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";

import { SidebarNodeLink } from "../../SidebarNodeLink";

dayjs.extend(relativeTime);

export const Nodes = () => {
  const [nodes, setNodes] = useState<any>([]);
  useEffect(() => {
    const nodes = [
      {
        id: "1233",

        title: "Phoneix Baker",
        content: "Test Node",

        nodeType: "Concept",
        username: "username",
        tag: "1Cademy",
        changedAt: new Date(),
      },
      {
        id: "1233",

        title: "Phoneix Baker",
        content: "Test Node",

        nodeType: "Concept",
        username: "username",
        tag: "1Cademy",
        changedAt: new Date(),
      },
      {
        id: "1233",

        title: "Phoneix Baker",
        content: "Test Node",

        nodeType: "Concept",
        username: "username",
        tag: "1Cademy",
        changedAt: new Date(),
      },
      {
        id: "1233",

        title: "Phoneix Baker",
        content: "Test Node",

        nodeType: "Concept",
        username: "username",
        tag: "1Cademy",
        changedAt: new Date(),
      },
    ];
    [];
    setNodes(nodes);
  }, []);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "9px", width: "100%" }}>
      {nodes.map((node: any) => (
        <SidebarNodeLink
          key={node.id}
          onClick={() => {}}
          {...node}
          sx={{
            borderLeft: "studied" in node && node.studied ? "solid 6px #fdc473" : " solid 6px #fd7373",
          }}
        />
      ))}
    </Box>
  );
};
