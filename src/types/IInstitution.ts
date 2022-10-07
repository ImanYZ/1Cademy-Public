export type IInstitution = {
  documentId?: string;
  name: string;
  domains: string[];
  logoURL: string;
  lat: number;
  lng: number;
  usersNum: number;
  users: string[];
  country: string;
  totalPoints: number;
};
