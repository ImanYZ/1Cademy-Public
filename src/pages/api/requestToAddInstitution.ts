import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import { isEmail, isEmpty, validPNG, validURL } from "@/lib/utils/utils";

import { admin, db, publicStorageBucket } from "../../lib/firestoreServer/admin";
import { fetchGoogleMapsGeolocationWrapper } from "../../utils";

const validateInstitutionRequestForm = (values: any) => {
  let errors: any = {};

  if (isEmpty(values.email)) {
    errors.email = "Your email address provided by your academic/research institutions is required!";
  } else if (!isEmail(values.email)) {
    errors.email = "Invalid email address!";
  }
  if (isEmpty(values.affiliation)) {
    errors.affiliation = "Please enter your institutional affiliation!";
  }
  if (isEmpty(values.instName)) {
    errors.instName = "Please enter your institution's name!";
  }
  if (isEmpty(values.logoURL) || !validURL(values.logoURL) || !validPNG(values.logoURL)) {
    errors.logoURL =
      "Please enter a valid URL linking to the official logo of your institution. It should be a square, transparent PNG image!";
  }
  if (isEmpty(values.website) || !validURL(values.website)) {
    errors.website = "Please enter your institution's official website address!";
  }
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, affiliation, instName, website, logoURL, country, stateInfo, city } = req.body;
    const { errors, valid } = validateInstitutionRequestForm({
      email,
      affiliation,
      instName,
      website,
      logoURL,
    });
    if (!valid) {
      console.error({ errors });
      return res.status(400).json(errors);
    } else {
      const instDoc = await db.collection("institutions").where("name", "==", instName).limit(1).get();
      if (instDoc.docs.length > 0) {
        return res.status(400).json({ exists: "The institution already exists!" });
      } else {
        const instRef = db.collection("institutions").doc();
        try {
          const geoLoc = await fetchGoogleMapsGeolocationWrapper(instName);
          const domainName = email.match("@(.+)$")[0];

          const axiosResponse = await axios({
            url: logoURL,
            method: "GET",
            responseType: "stream",
          });
          // **********************************************************************
          // Change the bucket name before putting it in production.
          // **********************************************************************
          const imageFile = admin
            .storage()
            .bucket(publicStorageBucket)
            .file("Logos/" + instName + ".png");
          const writeStream = imageFile.createWriteStream();
          axiosResponse.data
            .pipe(writeStream)
            .on("finish", async () => {
              await instRef.set({
                lng: geoLoc.lng,
                lat: geoLoc.lat,
                domains: [domainName],
                logoURL: encodeURI(
                  "https://storage.googleapis.com/" + publicStorageBucket + "/Logos/" + instName + ".png"
                ),
                name: instName,
                usersNum: 0,
                proposerEmail: email,
                affiliation,
                website,
                country,
                stateInfo,
                city,
              });
              return res.status(200).json({});
            })
            .on("error", (err: any) => {
              writeStream.end();
              console.log({ err });
              return res.status(400).json({ logoURL: err });
            });
        } catch (err) {
          console.log({ err });
          return res.status(400).json({ exists: err });
        }
      }
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ err, success: false });
  }
}

export default handler;
