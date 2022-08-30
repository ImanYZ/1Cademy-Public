import { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.headers["user-agent"] === "Mozilla/5.0 (compatible; Google-Site-Verification/1.0)") {
    res.setHeader("Content-Type", "text/html");
    res.write("google-site-verification: google3f2375afb449a70a.html");
    res.end();
  } else {
    res.redirect("https://1cademy.com/");
  }
}

export default handler;