import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import { Tooltip } from "@mui/material";
import { addDoc, collection, getFirestore, Timestamp } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useNodeBook } from "../../context/NodeBookContext";
import usePrevious from "../../hooks/usePrevious";
// import { preventEventPropagation } from "../../lib/utils/eventHandlers";
import shortenNumber from "../../lib/utils/shortenNumber";
import OptimizedAvatar from "../OptimizedAvatar";
// import RoundImage from "./RoundImage";

type UserStatusIconProps = {
  uname: string;
  imageUrl: string;
  fullname: string;
  chooseUname: any;
  online: boolean;
  inUserBar: boolean;
  inNodeFooter: boolean;
  reloadPermanentGrpah: any;
  totalPositives?: any;
  totalNegatives?: any;
  totalPoints?: any;
  tagTitle?: string;
};

const UserStatusIcon = (props: UserStatusIconProps) => {
  const db = getFirestore();
  const [{ user }] = useAuth();
  const { nodeBookDispatch } = useNodeBook();
  const [pointsGained, setPointsGained] = useState(false);
  const [pointsLost, setPointsLost] = useState(false);

  const prevAmount = usePrevious({
    totalPositives: props.totalPositives,
    totalNegatives: props.totalNegatives,
    totalPoints: props.totalPoints,
  });

  useEffect(() => {
    if (
      prevAmount &&
      "totalPositives" in prevAmount &&
      "totalPositives" in props &&
      "totalNegatives" in prevAmount &&
      "totalNegatives" in props &&
      "totalPoints" in prevAmount &&
      "totalPoints" in props
    ) {
      if (
        prevAmount.totalPoints < props.totalPoints ||
        prevAmount.totalPositives - prevAmount.totalNegatives < props.totalPositives - props.totalNegatives
      ) {
        setPointsGained(true);
        setTimeout(() => {
          setPointsGained(false);
        }, 1000);
      } else if (
        prevAmount.totalPoints > props.totalPoints ||
        prevAmount.totalPositives - prevAmount.totalNegatives > props.totalPositives - props.totalNegatives
      ) {
        setPointsLost(true);
        setTimeout(() => {
          setPointsLost(false);
        }, 1000);
      }
    }
    // TODO: check dependencies to remove this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.totalPoints, props.totalPositives, props.totalNegatives]);

  const openUserInfo = useCallback(() => {
    if (!user) return;

    const userUserInfoCollection = collection(db, "userUserInfoLog");

    // const userUserInfoLogRef = firebase.db.collection("userUserInfoLog").doc();
    if (props.inUserBar) {
      // Open Toollbar (user setting sidebar)
      nodeBookDispatch({ type: "setOpenToolbar", payload: true });
      // setOpenToolbar(true);

      addDoc(userUserInfoCollection, {
        uname: user.uname,
        uInfo: user.uname,
        createdAt: Timestamp.fromDate(new Date()),
      });
    } else {
      // Open user info sidebar
      nodeBookDispatch({
        type: "setSelectedUser",
        payload: {
          username: props.uname,
          imageUrl: props.imageUrl,
          fullName: props.fullname,
          chooseUname: props.chooseUname,
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
      props.reloadPermanentGrpah();
      addDoc(userUserInfoCollection, {
        uname: user.uname,
        uInfo: props.uname,
        createdAt: Timestamp.fromDate(new Date()),
      });
    }
    // console.log("openUserInfo");
  }, [db, nodeBookDispatch, props, user]);

  const getTooltipTitle = (): JSX.Element => {
    let title: string = "";
    title += props.inUserBar ? "Your profile settings" : props.chooseUname ? props.uname : props.fullname;

    if (!("inNodeFooter" in props && props.inNodeFooter) && "totalPositives" in props && "totalNegatives" in props) {
      return (
        <>
          <span>{title}</span>
          {/* {tag ? " ― " + tag.title : ""} */}
          <br></br>
          {shortenNumber(props.totalPositives, 2, false) + " "}
          {/* <i className="material-icons DoneIcon green-text">done</i> */}
          <DoneIcon className="material-icons DoneIcon green-text" />
          {" ― "}
          {/* <i className="material-icons gray-text">remove</i>{" "} */}
          <span>{shortenNumber(props.totalNegatives, 2, false)} </span>
          <CloseIcon className="material-icons red-text" />
          {/* <i className="material-icons red-text">close</i> */}
        </>
      );
    }

    return <span>{title}</span>;
  };

  // return (
  //   <Tooltip title={getTooltipTitle()} placement="top">
  //     <div
  //       className={"SidebarButton" + (props.inUserBar ? " inUserBar" : "")}
  //       onClick={openUserInfo}
  //       style={{ border: "dashed 2px pink" }}
  //     >
  //       <OptimizedAvatar
  //         imageUrl={props.imageUrl}
  //         renderAsAvatar={true}
  //         contained={false}
  //         sx={{ border: "none", width: "28px", height: "28px", position: "static" }}
  //       />
  //       {!props.inNodeFooter && <div className={props.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}></div>}
  //       {!props.inNodeFooter && (
  //         <span className={"UserStatusTotalPoints" + (props.inUserBar ? " inUserBar" : "")}>
  //           <DoneIcon className="material-icons DoneIcon green-text" />
  //           <span>{shortenNumber(props.totalPoints, 2, false)}</span>
  //           {props.inUserBar && props.tagTitle && <div id="UserProfileButtonDefaultTag">{props.tagTitle}</div>}
  //         </span>
  //       )}
  //     </div>
  //   </Tooltip>
  // );

  // this is with changes in styles
  return (
    <Tooltip title={getTooltipTitle()} placement="top">
      <div
        // className={"SidebarButton" + (props.inUserBar ? " inUserBar" : "")}
        className="SidebarButton"
        onClick={openUserInfo}
        style={{
          // border: "dashed 2px pink",
          display: "flex",
          alignItems: "cemter",
          justifyContent: "space-between",
          padding: "5px 0px",
        }}
      >
        <div className={(pointsGained ? "GainedPoint" : "") + (pointsLost ? "LostPoint" : "")}>
          <OptimizedAvatar
            imageUrl={props.imageUrl}
            renderAsAvatar={true}
            contained={false}
            sx={{ border: "none", width: "28px", height: "28px", position: "static" }}
          />
          {!props.inNodeFooter && (
            <div className={props.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}></div>
          )}
        </div>
        {!props.inNodeFooter && (
          // className={"UserStatusTotalPoints" + (props.inUserBar ? " inUserBar" : "")}
          <div className={"customUserStatusTotalPoints"}>
            <DoneIcon className="material-icons DoneIcon green-text" />
            <span style={{ fontSize: "14px" }}>{shortenNumber(props.totalPoints, 2, false)}</span>
            {props.inUserBar && props.tagTitle && <div id="UserProfileButtonDefaultTag">{props.tagTitle}</div>}
          </div>
        )}
      </div>
    </Tooltip>
  );
};

export const MemoizedUserStatusIcon = React.memo(UserStatusIcon);
