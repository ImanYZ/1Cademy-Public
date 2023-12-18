import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import NextImage from "next/image";
import { useEffect, useState } from "react";

import NoProposalDarkIcon from "../../../../../../public/no-proposals-dark-mode.svg";
import NoProposalLightIcon from "../../../../../../public/no-proposals-light-mode.svg";
import { SidebarNodeLink } from "../../SidebarNodeLink";

dayjs.extend(relativeTime);
type NodesProps = {
  db: any;
  theme: any;
  selectedChannel: any;
  roomType: string;
  openLinkedNode: any;
};
export const Nodes = ({ db, selectedChannel, roomType, openLinkedNode, theme }: NodesProps) => {
  const [nodes, setNodes] = useState<any>([]);
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

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
      setFirstLoad(false);
    })();
  }, [roomType, selectedChannel.id]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "9px", marginTop: "9px", width: "100%" }}>
      {!firstLoad && !nodes.length && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "28%",
          }}
        >
          <NextImage src={theme === "Dark" ? NoProposalDarkIcon : NoProposalLightIcon} alt="Node icon" />
        </Box>
      )}
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
