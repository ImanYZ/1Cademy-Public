import React from "react";
import { UserTheme } from "src/knowledgeTypes";

import bookmarksDarkTheme from "../../../../../public/bookmarks-dark-mode.jpg";
import bookmarksLightTheme from "../../../../../public/bookmarks-light-theme.jpg";
import { SidebarWrapper } from "./SidebarWrapper";
type SearcherSidebarProps = {
  open: boolean;
  onClose: () => void;
  theme: UserTheme;
  openLinkedNode: any;
};

export const SearcherSidebar = ({ open, onClose, theme }: SearcherSidebarProps) => {
  return (
    // <SidebarWrapper
    //   headerImage={image}
    //   open={open}
    //   onClose={onClose}
    //   SidebarOptions={
    //     <h2>
    //       Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eum omnis incidunt numquam distinctio nemo aliquam
    //       sunt rerum officiis dicta velit. Deleniti maiores, eos voluptas ratione natus perferendis libero vero ipsum.
    //     </h2>
    //   }
    //   SidebarContent={
    //     <h1>
    //       Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptatum provident, ad facere eos, quam dolores
    //       doloribus sequi officiis velit assumenda nam accusantium commodi sint rerum, explicabo obcaecati vel est non!
    //       Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dignissimos molestiae quaerat veritatis dicta
    //       facilis numquam unde a. Neque ea exercitationem voluptate minima, ratione labore, quas blanditiis eveniet
    //       maxime beatae dolorum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia debitis cupiditate
    //       illo, nobis iste voluptates est voluptatibus delectus, tenetur minus maiores. Aspernatur, nulla earum veniam
    //       exercitationem inventore fugiat provident placeat.
    //     </h1>
    //   }
    //   width={300}
    //   anchor="right"
    // ></SidebarWrapper>
    <SidebarWrapper
      headerImage={theme === "Dark" ? bookmarksDarkTheme : bookmarksLightTheme}
      open={open}
      onClose={onClose}
      SidebarOptions={
        <h2>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eum omnis incidunt numquam distinctio nemo aliquam
          sunt rerum officiis dicta velit. Deleniti maiores, eos voluptas ratione natus perferendis libero vero ipsum.
        </h2>
      }
      SidebarContent={
        <h1>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Voluptatum provident, ad facere eos, quam dolores
          doloribus sequi officiis velit assumenda nam accusantium commodi sint rerum, explicabo obcaecati vel est non!
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dignissimos molestiae quaerat veritatis dicta
          facilis numquam unde a. Neque ea exercitationem voluptate minima, ratione labore, quas blanditiis eveniet
          maxime beatae dolorum. Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia debitis cupiditate
          illo, nobis iste voluptates est voluptatibus delectus, tenetur minus maiores. Aspernatur, nulla earum veniam
          exercitationem inventore fugiat provident placeat.
        </h1>
      }
      width={300}
      anchor="right"
    ></SidebarWrapper>
  );
};
