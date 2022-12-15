import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import NextLink from "next/link";
import React, { FC, useCallback } from "react";

import { useAuth } from "../context/AuthContext";
import { useNodeBook } from "../context/NodeBookContext";
import OptimizedAvatar from "./OptimizedAvatar";

type Props = {
  name?: string;
  uname?: any;
  fullname?: any;
  chooseUname?: any;
  imageUrl?: any;
  reputation: number;
  isChamp: boolean;
  renderAsAvatar?: boolean;
  href?: string;
  setOpenSideBar?: any;
  reloadPermanentGrpah?: any;
};

const LeaderboardChip: FC<Props> = ({
  href,
  name = "",
  uname,
  fullname,
  chooseUname,
  imageUrl,
  reputation,
  isChamp,
  renderAsAvatar = true,
  setOpenSideBar,
  reloadPermanentGrpah,
}) => {
  const db = getFirestore();
  const [{ user }] = useAuth();
  const { nodeBookDispatch } = useNodeBook();
  const openUserInfo = useCallback(() => {
    if (!user) return;

    const userUserInfoCollection = collection(db, "userUserInfoLog");

    // const userUserInfoLogRef = firebase.db.collection("userUserInfoLog").doc();
    nodeBookDispatch({
      type: "setSelectedUser",
      payload: {
        username: uname,
        imageUrl: imageUrl,
        fullName: fullname,
        chooseUname: chooseUname,
      },
    });

    // setSelectedUser(props.uname);
    // setSelectedUserImageURL(props.imageUrl);
    // setSelectedUserFullname(props.fullname);
    // setSelectedUserChooseUname(props.chooseUname);
    nodeBookDispatch({
      type: "setSelectionType",
      payload: "UserInfo",
    });
    // setSelectionType("UserInfo");
    setOpenSideBar("USER_INFO");
    reloadPermanentGrpah();
    addDoc(userUserInfoCollection, {
      uname: user.uname,
      uInfo: uname,
      createdAt: Timestamp.fromDate(new Date()),
    });
    // console.log("openUserInfo");
  }, [db, nodeBookDispatch, user]);
  const renderChipComponent = () => (
    <Chip
      component="a"
      sx={{
        height: 60,
        borderRadius: 28,
        padding: "6px",
      }}
      icon={<OptimizedAvatar name={name} imageUrl={imageUrl} renderAsAvatar={renderAsAvatar} />}
      variant="outlined"
      label={
        <Box sx={{ my: 1 }}>
          <Typography variant="body2" component="div">
            {name}
          </Typography>
          <Typography variant="body2" component="div">
            {isChamp ? "🏆" : "✔️"}
            {" " + Math.round((reputation + Number.EPSILON) * 100) / 100}
          </Typography>
        </Box>
      }
    />
  );
  if (href) {
    return (
      <NextLink passHref href={href}>
        {renderChipComponent()}
      </NextLink>
    );
  }
  return <Box onClick={openUserInfo}>{renderChipComponent()}</Box>;
};

export default LeaderboardChip;
