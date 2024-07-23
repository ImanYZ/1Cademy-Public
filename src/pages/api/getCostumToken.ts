import { db } from "@/lib/firestoreServer/admin";
import { getAuth } from "firebase-admin/auth";
import { NextApiRequest, NextApiResponse } from "next";

const isLocalhost = (req: NextApiRequest) => {
  const host = req.headers.host;
  console.log(host);
  return host && host.includes("localhost");
};

const localhostMiddleware = (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!isLocalhost(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return handler(req, res);
  };
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { emailORuname } = req.body;
    console.log("email", emailORuname);
    let userDoc = await db.collection("users").where("email", "==", emailORuname).get();
    if (userDoc.docs.length <= 0) {
      userDoc = await db.collection("users").where("uname", "==", emailORuname).get();
    }
    console.log("userDoc.docs.length", userDoc.docs.length);
    if (userDoc.docs.length > 0) {
      const userData = userDoc.docs[0].data();
      const customToken = await getAuth().createCustomToken(userData.userId);
      return res.status(200).json({
        customToken,
      });
    } else {
      return res.status(500).json({
        customToken: "",
      });
    }
  } catch (error) {
    console.log("Error creating custom token:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default localhostMiddleware(handler);
