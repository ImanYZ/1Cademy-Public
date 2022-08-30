export const collection = "institutions";

interface Institution {
  id?: string;
  country: string;
  domains: string[];
  lat: number;
  lng: number;
  logoUrl: string;
  name: string;
  usersNum: number;
}
const data: Institution[] = [
  {
    id: "07nb61GQAMYEtkSwZXrd",
    country: "United States",
    domains: ["@usf.edu"],
    lat: 28.0587031,
    lng: -82.41385389999999,
    logoUrl: "https://storage.googleapis.com/onecademy-dev.appspot.com/Logos/University%20of%20South%20Florida.png",
    name: "University of South Florida",
    usersNum: 5,
  },
];

const institutionsData = { data, collection };

export default institutionsData;
