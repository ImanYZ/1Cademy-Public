import AccountCircle from "@mui/icons-material/AccountCircle";
import CloseIcon from "@mui/icons-material/Close";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import NextLink from "next/link";
import React, { Dispatch, SetStateAction } from "react";

//import DisciplinesComp from "./DisciplinesComp";
import ROUTES from "@/lib/utils/routes";

interface NavbarCompProps {
  email: string;
  userProfile: {
    photoURL?: string;
    firstname?: string;
    lastname?: string;
  };
  openSettings: boolean;
  changeOpenSettings: () => void;
  articleContent: string;
  articleTypePath: string[];
  setArticleTypePath: Dispatch<SetStateAction<string[]>>;
}

const imageUrl = "1Cademy-head.svg";

export const NO_IMAGE_USER =
  "https://firebasestorage.googleapis.com/v0/b/ontology-41607.appspot.com/o/profilePicture%2Fno-img.png?alt=media&token=c784a749-6c29-4f7d-9495-f1dc8d948ae3";

const NavbarComp: React.FC<NavbarCompProps> = ({
  email,
  userProfile,
  openSettings,
  changeOpenSettings,
  // articleContent,
  // articleTypePath,
  // setArticleTypePath,
}) => {
  return (
    <Box
      sx={{
        width: "99%",
        position: "fixed",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: "10px",
        background: "#121212",
        zIndex: "9",
      }}
    >
      <NextLink href={ROUTES.notebook} passHref>
        <img src={imageUrl} alt="Logo" height={56} width={160} />
      </NextLink>

      {/* {articleContent.trim() && (
        <DisciplinesComp
          allContent={articleContent}
          articleTypePath={articleTypePath}
          setArticleTypePath={setArticleTypePath}
        />
      )} */}
      {email && (
        <IconButton onClick={changeOpenSettings}>
          {openSettings ? (
            <CloseIcon />
          ) : userProfile?.photoURL ? (
            <Avatar
              src={userProfile?.photoURL || NO_IMAGE_USER}
              alt={`${userProfile?.firstname || ""} ${userProfile?.lastname || ""}`}
            />
          ) : (
            <AccountCircle />
          )}
        </IconButton>
      )}
    </Box>
  );
};

export default NavbarComp;
