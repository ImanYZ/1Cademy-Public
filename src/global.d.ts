import { PaletteColor, PaletteColorOptions } from '@mui/material/styles'
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



// declare module "@mui/material/styles" {
//   interface ThemeOptions {
//     palette: PaletteOptions & { light: PaletteColorOptions }
//   }
// }

// https://mui.com/material-ui/customization/palette/#adding-new-colors
// declare module '@mui/material/styles' {

//   interface Palette {
//     light: PaletteOptions;
//   }
//   interface PaletteOptions {
//     light: PaletteColorOptions;
//   }

// }

declare module '@mui/material/styles' {
  interface Palette {
    light: PaletteColor
  }
  interface PaletteOptions {
    light: PaletteColorOptions;
  }
}
