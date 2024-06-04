import { NextApiRequest, NextApiResponse } from "next";

function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    fetch(
      "https://www.core-econ.org/the-economy/microeconomics/02-technology-incentives-04-firms-technology-production.html",
      {
        method: "GET",
        headers: {
          "Content-Type": "text/html",
        },
        mode: "cors", // This is the key part
      }
    )
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then(html => {
        console.log(html);
        return res.status(200).json({ html });
        // You can now do something with the HTML, like inserting it into the DOM
        // document.getElementById("container").innerHTML = html;
      })
      .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
      });
  } catch (error) {
    console.log(error);
  }
}

export default handler;
