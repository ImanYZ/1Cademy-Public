import { Tooltip } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";

import usePrevious from "../../hooks/usePrevious";
import { preventEventPropagation } from "../../lib/utils/eventHandlers";
import shortenNumber from "../../lib/utils/shortenNumber";
import OptimizedAvatar from "../OptimizedAvatar";

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
};

const UserStatusIcon = (props: UserStatusIconProps) => {
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

  const openUserInfo = useCallback(
    () => {
      // const userUserInfoLogRef = firebase.db.collection("userUserInfoLog").doc();
      // if (props.inUserBar) {
      //   setOpenToolbar(true);
      //   userUserInfoLogRef.set({
      //     uname: username,
      //     uInfo: username,
      //     createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      //   });
      // } else {
      //   setSelectedUser(props.uname);
      //   setSelectedUserImageURL(props.imageUrl);
      //   setSelectedUserFullname(props.fullname);
      //   setSelectedUserChooseUname(props.chooseUname);
      //   setSelectionType("UserInfo");
      //   props.reloadPermanentGrpah();
      //   userUserInfoLogRef.set({
      //     uname: username,
      //     uInfo: props.uname,
      //     createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
      //   });
      // }
      console.log("openUserInfo");
    },
    [
      // firebase,
      // props.inUserBar,
      // username,
      // props.uname,
      // props.imageUrl,
      // props.fullname,
      // props.chooseUname,
    ]
  );

  const getTooltipTitle = (): JSX.Element => {
    let title: string = "";
    title += props.inUserBar ? "Your profile settings" : props.chooseUname ? props.uname : props.fullname;

    if (!("inNodeFooter" in props && props.inNodeFooter) && "totalPositives" in props && "totalNegatives" in props) {
      <>
        <span>{title}</span>
        {/* {tag ? " ― " + tag.title : ""} */}
        <br></br>
        {shortenNumber(props.totalPositives, 2, false) + " "}
        <i className="material-icons DoneIcon green-text">done</i>
        {" ― "}
        {/* <i className="material-icons gray-text">remove</i>{" "} */}
        <span>{shortenNumber(props.totalNegatives, 2, false)} </span>
        <i className="material-icons red-text">close</i>
      </>;
    }

    return <span>{title}</span>;
  };

  return (
    <Tooltip title={getTooltipTitle()} placement="top">
      <div className={"SidebarButton" + (props.inUserBar ? " inUserBar" : "")} onClick={openUserInfo}>
        <div className={(pointsGained ? "GainedPoint" : "") + (pointsLost ? "LostPoint" : "")}>
          {/* <RoundImage imageUrl={props.imageUrl} alt="1Cademist Profile Picture" /> */}
          <OptimizedAvatar
            imageUrl={props.imageUrl}
            renderAsAvatar={true}
            contained={false}
            sx={{ border: "none", width: "28px", height: "28px" }}
          />
        </div>
        {!props.inNodeFooter && (
          <>
            <div className={props.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}></div>
            <span className={"UserStatusTotalPoints" + (props.inUserBar ? " inUserBar" : "")}>
              <i className="material-icons DoneIcon green-text">done</i>{" "}
              {/* <i className="material-icons">remove</i>{" "} */}
              {/* <i className="material-icons red-text">close</i>{" "} */}
              <span>{shortenNumber(props.totalPoints, 2, false)}</span>
              {/* CHECK:I commented this, please uncomment */}
              {/* {props.inUserBar && tag && <div id="UserProfileButtonDefaultTag">{tag.title}</div>} */}
            </span>
            {/* <span className="UserStatusTotalAwards">
            <i className="material-icons amber-text">grade</i>{" "}
            <span>{shortenNumber(props.totalAwards, 2, false)}</span>
          </span> */}
          </>
        )}
        <span className={"TooltipText " + (props.inNodeFooter ? "Top" : "Right")} onClick={preventEventPropagation}>
          {/* {props.inUserBar
            ? "Your profile settings"
            : props.chooseUname
              ? props.uname
              : props.fullname} */}

          {props.inUserBar && "Your profile settings"}
          {!("inNodeFooter" in props && props.inNodeFooter) && "totalPositives" in props && "totalNegatives" in props && (
            <>
              {/* {tag ? " ― " + tag.title : ""} */}
              <br></br>
              {shortenNumber(props.totalPositives, 2, false) + " "}
              <i className="material-icons DoneIcon green-text">done</i>
              {" ― "}
              {/* <i className="material-icons gray-text">remove</i>{" "} */}
              <span>{shortenNumber(props.totalNegatives, 2, false)} </span>
              <i className="material-icons red-text">close</i>
            </>
          )}
        </span>
      </div>
    </Tooltip>
  );
};

export const MemoizedUserStatusIcon = React.memo(UserStatusIcon);

// import React, { useState, useEffect, useCallback } from "react";
// import { useRecoilValue, useSetRecoilState } from "recoil";

// import { firebaseState, usernameState, tagState } from "../../../../../store/AuthAtoms";
// import {
//   selectionTypeState,
//   openToolbarState,
//   selectedUserState,
//   selectedUserImageURLState,
//   selectedUserFullnameState,
//   selectedUserChooseUnameState,
// } from "../../../../../store/MapAtoms";

// import RoundImage from "../../../../PublicComps/RoundImage/RoundImage";

// import usePrevious from "../../../../../hooks/usePrevious";
// import { preventEventPropagation } from "../../../../../utils/eventHandlers";
// import shortenNumber from "../../../../../utils/shortenNumber";

// import "./UserStatusIcon.css";

// const UserStatusIcon = (props) => {
//   const firebase = useRecoilValue(firebaseState);
//   const username = useRecoilValue(usernameState);
//   const tag = useRecoilValue(tagState);
//   const setSelectionType = useSetRecoilState(selectionTypeState);
//   const setOpenToolbar = useSetRecoilState(openToolbarState);
//   const setSelectedUser = useSetRecoilState(selectedUserState);
//   const setSelectedUserImageURL = useSetRecoilState(selectedUserImageURLState);
//   const setSelectedUserFullname = useSetRecoilState(selectedUserFullnameState);
//   const setSelectedUserChooseUname = useSetRecoilState(selectedUserChooseUnameState);

//   const [pointsGained, setPointsGained] = useState(false);
//   const [pointsLost, setPointsLost] = useState(false);

//   const prevAmount = usePrevious({
//     totalPositives: props.totalPositives,
//     totalNegatives: props.totalNegatives,
//     totalPoints: props.totalPoints,
//   });
//   useEffect(() => {
//     if (
//       prevAmount &&
//       "totalPositives" in prevAmount &&
//       "totalPositives" in props &&
//       "totalNegatives" in prevAmount &&
//       "totalNegatives" in props &&
//       "totalPoints" in prevAmount &&
//       "totalPoints" in props
//     ) {
//       if (
//         prevAmount.totalPoints < props.totalPoints ||
//         prevAmount.totalPositives - prevAmount.totalNegatives <
//           props.totalPositives - props.totalNegatives
//       ) {
//         setPointsGained(true);
//         setTimeout(() => {
//           setPointsGained(false);
//         }, 1000);
//       } else if (
//         prevAmount.totalPoints > props.totalPoints ||
//         prevAmount.totalPositives - prevAmount.totalNegatives >
//           props.totalPositives - props.totalNegatives
//       ) {
//         setPointsLost(true);
//         setTimeout(() => {
//           setPointsLost(false);
//         }, 1000);
//       }
//     }
//   }, [props.totalPoints, props.totalPositives, props.totalNegatives]);

//   const openUserInfo = useCallback(() => {
//     const userUserInfoLogRef = firebase.db.collection("userUserInfoLog").doc();
//     if (props.inUserBar) {
//       setOpenToolbar(true);
//       userUserInfoLogRef.set({
//         uname: username,
//         uInfo: username,
//         createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
//       });
//     } else {
//       setSelectedUser(props.uname);
//       setSelectedUserImageURL(props.imageUrl);
//       setSelectedUserFullname(props.fullname);
//       setSelectedUserChooseUname(props.chooseUname);
//       setSelectionType("UserInfo");
//       props.reloadPermanentGrpah();
//       userUserInfoLogRef.set({
//         uname: username,
//         uInfo: props.uname,
//         createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
//       });
//     }
//   }, [
//     firebase,
//     props.inUserBar,
//     username,
//     props.uname,
//     props.imageUrl,
//     props.fullname,
//     props.chooseUname,
//   ]);

//   return (
//     <div
//       className={"SidebarButton Tooltip" + (props.inUserBar ? " inUserBar" : "")}
//       onClick={openUserInfo}
//     >
//       <div className={(pointsGained ? "GainedPoint" : "") + (pointsLost ? "LostPoint" : "")}>
//         <RoundImage imageUrl={props.imageUrl} alt="1Cademist Profile Picture" />
//       </div>
//       {!props.inNodeFooter && (
//         <>
//           <div className={props.online ? "UserStatusOnlineIcon" : "UserStatusOfflineIcon"}></div>
//           <span className={"UserStatusTotalPoints" + (props.inUserBar ? " inUserBar" : "")}>
//             <i className="material-icons DoneIcon green-text">done</i>{" "}
//             {/* <i className="material-icons">remove</i>{" "} */}
//             {/* <i className="material-icons red-text">close</i>{" "} */}
//             <span>{shortenNumber(props.totalPoints, 2, false)}</span>
//             {props.inUserBar && tag && <div id="UserProfileButtonDefaultTag">{tag.title}</div>}
//           </span>
//           {/* <span className="UserStatusTotalAwards">
//             <i className="material-icons amber-text">grade</i>{" "}
//             <span>{shortenNumber(props.totalAwards, 2, false)}</span>
//           </span> */}
//         </>
//       )}
//       <span
//         className={"TooltipText " + (props.inNodeFooter ? "Top" : "Right")}
//         onClick={preventEventPropagation}
//       >
//         {props.inUserBar
//           ? "Your profile settings"
//           : props.chooseUname
//           ? props.uname
//           : props.fullname}
//         {!("inNodeFooter" in props && props.inNodeFooter) &&
//           "totalPositives" in props &&
//           "totalNegatives" in props && (
//             <>
//               {/* {tag ? " ― " + tag.title : ""} */}
//               <br></br>
//               {shortenNumber(props.totalPositives, 2, false) + " "}
//               <i className="material-icons DoneIcon green-text">done</i>
//               {" ― "}
//               {/* <i className="material-icons gray-text">remove</i>{" "} */}
//               <span>{shortenNumber(props.totalNegatives, 2, false)} </span>
//               <i className="material-icons red-text">close</i>
//             </>
//           )}
//       </span>
//     </div>
//   );
// };

// export default React.memo(UserStatusIcon);
