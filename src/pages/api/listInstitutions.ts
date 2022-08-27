import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../lib/firestoreServer/admin";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let htmlContent = `<!DOCTYPE html>
    <html>
    <head>
    <style>
    table {
      font-family: arial, sans-serif;
      border-collapse: collapse;
      width: 100%;
    }
    
    td, th {
      border: 1px solid #dddddd;
      text-align: left;
      padding: 8px;
    }
    
    tr:nth-child(even) {
      background-color: #dddddd;
    }
    </style>
    </head>
    <body>
    <table>
  <tr>
    <th>country</th>
    <th>domains</th>
    <th>logoURL</th>
    <th>name</th>
  </tr>
    `;
    const institutionsDocs = await db.collection("institutions").get();
    for (let instDoc of institutionsDocs.docs) {
      const instData = instDoc.data();
      htmlContent += `<tr>
      <td>${instData.country}</td>
      <td>${instData.domains}</td>
      <td><img src="${instData.logoURL}" width="40px" height="40px"></td>
      <td>${instData.name}</td>
      </tr>`;
    }
    htmlContent += "</body></html>";
    res.setHeader("Content-Type", "text/xml");
    res.write(htmlContent);
    res.end();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;