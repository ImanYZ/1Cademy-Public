import { CustomBadge } from "../../CustomBudge";

export const getMessageSummary = (m: any) => {
  if (m.message.trim()) {
    return `${m.message.substr(0, 36)} ${m.message.length > 36 ? "..." : ""}`;
  } else if (m.imageUrls.length > 0) {
    return `${m.imageUrls.length} Image${m.imageUrls.length > 1 ? "s" : ""}`;
  }
};

export const GetNotificationNumbers = (notifications: any, chatType: string) => {
  const number = notifications.filter((n: any) => n.chatType === chatType).length;
  return (
    <CustomBadge
      value={number}
      sx={{
        height: "20px",
        p: "6px",
        fontSize: "13px",
      }}
    />
  );
};
