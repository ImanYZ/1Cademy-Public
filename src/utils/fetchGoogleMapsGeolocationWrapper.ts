import axios from "axios";
import { delay } from "../../src/lib/utils/utils";
export const fetchGoogleMapsGeolocation = async (institution: any) => {
  try {
    const response = await axios.get(
      encodeURI(
        `https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyDdW02hAK8Y2_2SWMwLGV9RJr4wm17IZUc&address=${institution}`
      )
    );
    return response.data.results[0]?.geometry.location;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchGoogleMapsGeolocationWrapper = async (institution: any) => {
  let geoLoc,
    errorNum = 0;
  //  attempt to obtain geoLoc until the api returns a value
  geoLoc = await fetchGoogleMapsGeolocation(institution);
  while (!geoLoc && errorNum < 10) {
    errorNum += 1;
    geoLoc = await fetchGoogleMapsGeolocation(institution);
    await delay(400);
  }
  //  if geoLoc still doesn't exist, create temp values for it
  if (!geoLoc) {
    geoLoc = { lng: -1, lat: -1 };
  }
  return geoLoc;
};
