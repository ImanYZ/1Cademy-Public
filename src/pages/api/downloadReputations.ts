import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../lib/firestoreServer/admin";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    let reputationsQuery: any = db.collection("reputations");
    if ("type" in req.query && req.query.type) {
      if (req.query.type === "Weekly") {
        reputationsQuery = db.collection("weeklyReputations");
        if ("firstWeekDay" in req.query && req.query.firstWeekDay) {
          reputationsQuery = reputationsQuery.where("firstWeekDay", "==", req.query.firstWeekDay);
        }
      }
    }
    if ("tag" in req.query && req.query.tag) {
      reputationsQuery = reputationsQuery.where("tag", "==", req.query.tag);
    }
    let htmlContent = `<!DOCTYPE html>
      <html>
        <head>
          <title>Reputations - 1Cademy</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            #ReputationsTable {
              font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
              border-collapse: collapse;
              width: 100%;
              margin-top: 10px;
            }
            
            #ReputationsTable td, #ReputationsTable th {
              border: 1px solid #ddd;
              padding: 8px;
            }
            
            #ReputationsTable tr:nth-child(even){background-color: #f2f2f2;}
            
            #ReputationsTable tr:hover {background-color: #ddd;}
            
            #ReputationsTable th {
              padding-top: 12px;
              padding-bottom: 12px;
              text-align: left;
              background-color: #4CAF50;
              color: white;
            }
          </style>
          <script>
            const tagsSelectObject = document.getElementById("tags");
            tagsSelectObject.onclick = (event) => {
              event.preventDefault();
          };
          </script>
        </head>
        <body>
      `;
    const reputationsDocs = await reputationsQuery.get();
    const usersDocs = await db.collection("users").get();
    if (reputationsDocs.docs.length > 0 && usersDocs.docs.length > 0) {
      const tagsDocs = await db.collection("nodes").where("isTag", "==", true).get();
      const tagsList = [];
      for (let tag of tagsDocs.docs) {
        const tagData = tag.data();
        tagsList.push({
          id: tag.id,
          title: tagData.title,
        });
      }
      tagsList.sort((t1, t2) => (t1.title > t2.title ? 1 : -1));
      const firstWeekDaysList = [];
      let firstWeekDay = new Date("1-5-2020");
      let daysDiff = firstWeekDay.getDate() - firstWeekDay.getDay();
      while (firstWeekDay < new Date("1-1-2029")) {
        const dateToBegin = new Date("1-5-2020");
        firstWeekDay = new Date(dateToBegin.setDate(Math.floor(daysDiff)));
        firstWeekDaysList.push(
          firstWeekDay.getMonth() + 1 + "-" + firstWeekDay.getDate() + "-" + firstWeekDay.getFullYear()
        );
        daysDiff += 7;
      }
      htmlContent += `
        <form action="https://onecademy-4xi62kpwhq-ue.a.run.app/downloadReputations">
          <label for="tag">Choose the tag:</label>
          <select name="tag" id="tag">
        `;
      for (let tag of tagsList) {
        htmlContent += "<option value='" + tag.title + "'";
        if ("tag" in req.query && req.query.tag && req.query.tag === tag.title) {
          htmlContent += " selected";
        }
        htmlContent += ">" + tag.title + "</option>";
      }
      htmlContent += `
          </select>
          <label for="type">Choose the type:</label>
          <select name="type" id="type">
            <option value='All Time'>All Time</option>
            <option value='Weekly'
        `;
      if ("type" in req.query && req.query.type && req.query.type === "Weekly") {
        htmlContent += " selected";
      }
      htmlContent += `
            >Weekly</option>
          </select>
          <label for="firstWeekDay">Choose the first day of the desired week:</label>
          <select name="firstWeekDay" id="firstWeekDay">
        `;
      for (let firstWeekDayStr of firstWeekDaysList) {
        htmlContent += "<option value='" + firstWeekDayStr + "'";
        if ("firstWeekDay" in req.query && req.query.firstWeekDay && req.query.firstWeekDay === firstWeekDayStr) {
          htmlContent += " selected";
        }
        htmlContent += ">" + firstWeekDayStr + "</option>";
      }
      htmlContent += `
          </select>
          <input type="submit" value="Submit">
        </form>
        <table id="ReputationsTable">
          <tr>
            <th>Tag</th>
        `;
      if ("firstWeekDay" in req.query && req.query.firstWeekDay) {
        htmlContent += "<th>First Weekday</th>";
      }
      htmlContent += `
            <th>Username</th>
            <th>Email</th>
            <th>Firstname</th>
            <th>Lastname</th>
            <th>Total Points</th>
            <th>Concept Corrects</th>
            <th>Concept Awards</th>
            <th>Concept Wrongs</th>
            <th>Code Corrects</th>
            <th>Code Awards</th>
            <th>Code Wrongs</th>
            <th>Question Corrects</th>
            <th>Question Awards</th>
            <th>Question Wrongs</th>
            <th>Profile Corrects</th>
            <th>Profile Awards</th>
            <th>Profile Wrongs</th>
            <th>Sequel Corrects</th>
            <th>Sequel Awards</th>
            <th>Sequel Wrongs</th>
            <th>Advertisement Corrects</th>
            <th>Advertisement Awards</th>
            <th>Advertisement Wrongs</th>
            <th>Reference Corrects</th>
            <th>Reference Awards</th>
            <th>Reference Wrongs</th>
            <th>News Corrects</th>
            <th>News Awards</th>
            <th>News Wrongs</th>
            <th>Idea Corrects</th>
            <th>Idea Awards</th>
            <th>Idea Wrongs</th>
            <th>Meanigful Corrects</th>
            <th>Meanigful Awards</th>
            <th>Meanigful Wrongs</th>
            <th>Practice Points</th>
            <th>Practice Day</th>
          </tr>
        `;
      htmlContent += "</tr>";
      const usersDict: any = {};
      for (let userDoc of usersDocs.docs) {
        const userData = userDoc.data();
        usersDict[userData.uname] = {
          email: userData.email,
          fName: userData.fName,
          lName: userData.lName,
        };
      }
      for (let reputationDoc of reputationsDocs.docs) {
        const reputationData = reputationDoc.data();
        if (reputationData.uname in usersDict) {
          if ("createdAt" in reputationData && reputationData.createdAt) {
            reputationData.createdAt = reputationData.createdAt.toDate();
          }
          if ("updatedAt" in reputationData && reputationData.updatedAt) {
            reputationData.updatedAt = reputationData.updatedAt.toDate();
          }
          htmlContent += "<tr>";
          htmlContent += "<td>" + reputationData.tag + "</td>";
          if ("firstWeekDay" in reputationData && reputationData.firstWeekDay) {
            htmlContent += "<td>" + reputationData.firstWeekDay + "</td>";
          }
          htmlContent += "<td>" + reputationData.uname + "</td>";
          htmlContent += "<td>" + usersDict[reputationData.uname].email + "</td>";
          htmlContent += "<td>" + usersDict[reputationData.uname].fName + "</td>";
          htmlContent += "<td>" + usersDict[reputationData.uname].lName + "</td>";
          htmlContent +=
            "<td>" +
            (reputationData.cnCorrects +
              reputationData.cdCorrects +
              reputationData.qCorrects +
              reputationData.pCorrects +
              reputationData.sCorrects +
              reputationData.aCorrects +
              reputationData.rfCorrects +
              reputationData.nCorrects +
              reputationData.iCorrects +
              reputationData.mCorrects +
              reputationData.lterm -
              reputationData.cnWrongs -
              reputationData.cdWrongs -
              reputationData.qWrongs -
              reputationData.pWrongs -
              reputationData.sWrongs -
              reputationData.aWrongs -
              reputationData.rfWrongs -
              reputationData.nWrongs -
              reputationData.iWrongs -
              reputationData.mWrongs);
          ("</td>");
          htmlContent += "<td>" + reputationData.cnCorrects + "</td>";
          htmlContent += "<td>" + reputationData.cnInst + "</td>";
          htmlContent += "<td>" + reputationData.cnWrongs + "</td>";
          htmlContent += "<td>" + reputationData.cdCorrects + "</td>";
          htmlContent += "<td>" + reputationData.cdInst + "</td>";
          htmlContent += "<td>" + reputationData.cdWrongs + "</td>";
          htmlContent += "<td>" + reputationData.qCorrects + "</td>";
          htmlContent += "<td>" + reputationData.qInst + "</td>";
          htmlContent += "<td>" + reputationData.qWrongs + "</td>";
          htmlContent += "<td>" + reputationData.pCorrects + "</td>";
          htmlContent += "<td>" + reputationData.pInst + "</td>";
          htmlContent += "<td>" + reputationData.pWrongs + "</td>";
          htmlContent += "<td>" + reputationData.sCorrects + "</td>";
          htmlContent += "<td>" + reputationData.sInst + "</td>";
          htmlContent += "<td>" + reputationData.sWrongs + "</td>";
          htmlContent += "<td>" + reputationData.aCorrects + "</td>";
          htmlContent += "<td>" + reputationData.aInst + "</td>";
          htmlContent += "<td>" + reputationData.aWrongs + "</td>";
          htmlContent += "<td>" + reputationData.rfCorrects + "</td>";
          htmlContent += "<td>" + reputationData.rfInst + "</td>";
          htmlContent += "<td>" + reputationData.rfWrongs + "</td>";
          htmlContent += "<td>" + reputationData.nCorrects + "</td>";
          htmlContent += "<td>" + reputationData.nInst + "</td>";
          htmlContent += "<td>" + reputationData.nWrongs + "</td>";
          htmlContent += "<td>" + reputationData.iCorrects + "</td>";
          htmlContent += "<td>" + reputationData.iInst + "</td>";
          htmlContent += "<td>" + reputationData.iWrongs + "</td>";
          htmlContent += "<td>" + reputationData.mCorrects + "</td>";
          htmlContent += "<td>" + reputationData.mInst + "</td>";
          htmlContent += "<td>" + reputationData.mWrongs + "</td>";
          htmlContent += "<td>" + reputationData.lterm + "</td>";
          htmlContent += "<td>" + reputationData.ltermDay + "</td>";
          // htmlContent += "<td>" + reputationData.createdAt + "</td>";
          // htmlContent += "<td>" + reputationData.updatedAt + "</td>";
          htmlContent += "</tr>";
        }
      }
    } else {
      htmlContent += "<h1>I found no reputations.</h1>";
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
