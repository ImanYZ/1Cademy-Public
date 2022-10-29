import XLSX from "xlsx";

import { Feedback } from "../knowledgeTypes";

export const generateFeedbackReport = (data: Feedback[]) => {
  const wb = XLSX.utils.book_new();

  wb.Props = {
    Title: "Feedback report",
    // Subject: 'Tutorial',
    Author: "1cademy",
    CreatedDate: new Date(),
  };

  const wsName = "newSheet";
  const header = ["Date", "Email", "Feedback", "Name", "Page URL"];
  const body = data.map(cur => [cur.createdAt, cur.email, cur.feedback, cur.name, cur.pageURL]);
  const wsData = [header, ...body];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  XLSX.utils.book_append_sheet(wb, ws, wsName);

  XLSX.writeFile(wb, "public/feedback.xlsx");
};
