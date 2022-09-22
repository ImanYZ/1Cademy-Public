import {
  fetchGoogleMapsGeolocation,
  fetchGoogleMapsGeolocationWrapper,
} from "../../src/utils/fetchGoogleMapsGeolocationWrapper";

describe("googleMapGeoLocation", () => {
  it("Should fetch google maps geo location", async () => {
    let location = await fetchGoogleMapsGeolocation("Marywood University");
    expect(location).toMatchObject({ lat: 41.43513189999999, lng: -75.6324234 });
  });

  it("Should fetch google maps geo location wrapper with correct input", async () => {
    let location = await fetchGoogleMapsGeolocationWrapper("Marywood University");
    expect(location).toMatchObject({ lat: 41.43513189999999, lng: -75.6324234 });
  });

  it("Should fetch google maps geo location wrapper with wrong input", async () => {
    let location = await fetchGoogleMapsGeolocationWrapper("Unknow University");
    expect(location).toMatchObject({ lng: -1, lat: -1 });
  }, 15000);
});
