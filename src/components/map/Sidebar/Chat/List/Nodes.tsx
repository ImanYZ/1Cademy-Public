import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { SidebarNodeLink } from "../../SidebarNodeLink";

dayjs.extend(relativeTime);
type NodesProps = {
  db: any;
  selectedChannel: any;
  roomType: string;
  openLinkedNode: any;
};
export const Nodes = ({ db, selectedChannel, roomType, openLinkedNode }: NodesProps) => {
  const [nodes, setNodes] = useState<any>([]);

  useEffect(() => {
    (async () => {
      let channelRef = doc(db, "channelMessages", selectedChannel.id);
      if (roomType === "direct") {
        channelRef = doc(db, "conversationMessages", selectedChannel.id);
      } else if (roomType === "news") {
        channelRef = doc(db, "announcementsMessages", selectedChannel.id);
      }
      const messageRef = collection(channelRef, "messages");

      let q = query(messageRef, where("node", "!=", {}));
      const messagesDoc = await getDocs(q);
      if (!messagesDoc.empty) {
        let nodes = [];
        for (const doc of messagesDoc.docs) {
          const messageData = doc.data();
          nodes.push(messageData.node);
        }
        setNodes(nodes);
      }
    })();
  }, [roomType, selectedChannel.id]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "9px", width: "100%" }}>
      {nodes.map((node: any) => (
        <SidebarNodeLink
          key={node.id}
          onClick={() => openLinkedNode(node.id, "Searcher")}
          linkMessage="Open"
          {...node}
          sx={{
            borderLeft: "studied" in node && node.studied ? "solid 6px #fdc473" : " solid 6px #fd7373",
          }}
        />
      ))}
    </Box>
  );
};
