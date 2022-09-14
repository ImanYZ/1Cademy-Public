const { db } = require("./admin_Knowledge");
const fs = require("fs");
const axios = require("axios");
// On 1Cademy.com when users sign up, we do not make the corresponding changes
// to the institutions collection. We should run this function every 25 hours in
// a PubSub to assign these arrays.
exports.updateInstitutions = async () => {
  const rawdata = fs.readFileSync("./datasets/edited_universities.json");
  const institutionCountries = {};
  for (let institObj of JSON.parse(rawdata)) {
    institutionCountries[institObj.name] = institObj.country;
  }
  let userDocs = await db.collection("users").get();
  userDocs = [...userDocs.docs];
  for (let userDoc of userDocs) {
    const userData = userDoc.data();

    if (userData.deInstit && !userData.institUpdated) {
      const domainName = userData.email.match("@(.+)$")[0];
      const instQuery = db.collection("institutions").where("name", "==", userData.deInstit).limit(1);
      await db.runTransaction(async t => {
        const instDocs = await t.get(instQuery);
        if (instDocs.docs.length > 0) {
          const instRef = db.collection("institutions").doc(instDocs.docs[0].id);
          const institData = instDocs.docs[0].data();
          if (institData.users) {
            if (!institData.users.includes(userDoc.id)) {
              const instDomains = [...institData.domains];
              if (!instDomains.includes(domainName)) {
                instDomains.push(domainName);
              }
              t.update(instRef, {
                users: [...institData.users, userDoc.id],
                usersNum: institData.usersNum + 1,
                domains: instDomains
              });
            }
          } else {
            const instDomains = [...institData.domains];
            if (!instDomains.includes(domainName)) {
              instDomains.push(domainName);
            }
            t.update(instRef, {
              users: [userDoc.id],
              usersNum: 1,
              domains: instDomains
            });
          }
        } else {
          const instRef = db.collection("institutions").doc();
          const country = userData.deInstit in institutionCountries ? institutionCountries[userData.deInstit] : "";
          let response = await axios.get(
            encodeURI(
              "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDdW02hAK8Y2_2SWMwLGV9RJr4wm17IZUc&address=" +
                userData.deInstit
            )
          );
          let geoLoc;
          if (
            "results" in response.data &&
            Array.isArray(response.data.results) &&
            response.data.results.length > 0 &&
            "geometry" in response.data.results[0]
          ) {
            geoLoc = response.data.results[0].geometry.location;
          } else {
            response = await axios.get(
              encodeURI(
                "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDdW02hAK8Y2_2SWMwLGV9RJr4wm17IZUc&address=" +
                  userData.deInstit +
                  " Education"
              )
            );
            if (
              "results" in response.data &&
              Array.isArray(response.data.results) &&
              response.data.results.length > 0 &&
              "geometry" in response.data.results[0]
            ) {
              geoLoc = response.data.results[0].geometry.location;
            } else {
              geoLoc = {
                lng: "",
                lat: ""
              };
              console.log({
                institution: userData.deInstit,
                geocodeResponse: response.data
              });
            }
          }
          t.set(instRef, {
            country,
            lng: geoLoc.lng,
            lat: geoLoc.lat,
            logoURL: encodeURI(
              "https://storage.googleapis.com/onecademy-1.appspot.com/Logos/" + userData.deInstit + ".png"
            ),
            domains: [domainName],
            name: userData.deInstit,
            users: [userDoc.id],
            usersNum: 1
          });
        }
        const userRef = db.collection("users").doc(userDoc.id);
        t.update(userRef, { institUpdated: true });
      });
    }
  }
};
