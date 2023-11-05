import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

import { TextEditorOptions } from "../components/InputMarkdown/utils";

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: TextEditorOptions;
  }
}
