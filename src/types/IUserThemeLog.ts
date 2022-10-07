import { ITheme } from "./IUser";

export type IUserThemeLog = {
  documentId?: string;
  uname: string;
  theme: ITheme;
  createdAt: Date;
};
