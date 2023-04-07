export type INotebook = {
  documentId?: string;
  owner: string;
  title: string;
  isPublic: "visible" | "editable" | "none";
  users: string[];
  roles: {
    [uname: string]: "viewer" | "editor";
  };
};
