import { Box } from "@mui/system";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { collection, doc, getDocs, query } from "firebase/firestore";
import Image from "next/image";
import { useEffect, useState } from "react";

dayjs.extend(relativeTime);
type MediaProps = {
  db: any;
  selectedChannel: any;
  roomType: string;
};
export const Media = ({ db, selectedChannel, roomType }: MediaProps) => {
  const [medias, setMedias] = useState<any>([]);
  useEffect(() => {
    (async () => {
      let channelRef = doc(db, "channelMessages", selectedChannel.id);
      if (roomType === "direct") {
        channelRef = doc(db, "conversationMessages", selectedChannel.id);
      } else if (roomType === "news") {
        channelRef = doc(db, "announcementsMessages", selectedChannel.id);
      }
      const messageRef = collection(channelRef, "messages");

      let q = query(messageRef);
      const messagesDoc = await getDocs(q);
      if (!messagesDoc.empty) {
        let medias = [];
        for (const doc of messagesDoc.docs) {
          const messageData = doc.data();
          if (messageData?.imageUrls && Array.isArray(messageData?.imageUrls)) {
            for (const data of messageData?.imageUrls) {
              medias.push({ imageUrl: data });
            }
          }
        }
        setMedias(medias);
      }
    })();
  }, [roomType, selectedChannel.id]);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "9px", marginTop: "9px" }}>
      {medias.map((media: any, idx: number) => (
        <Box key={idx} sx={{ cursor: "pointer" }}>
          <Image src={media.imageUrl} width={"105px"} height={"100px"} />
        </Box>
      ))}
    </Box>
  );
};
