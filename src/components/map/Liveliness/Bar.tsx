// import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
// import { Box, SxProps, Theme } from "@mui/material";
// import { getFirestore } from "firebase/firestore";
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { ActionsTracksChange, getActionTrackSnapshot } from "src/client/firestore/actionTracks.firestore";

// import OptimizedAvatar2 from "@/components/OptimizedAvatar2";

// import { MemoizedActionBubble } from "./ActionBubble";
// import { synchronizeActionsTracks, UserInteractions } from "./LivelinessBar";

// const PAST_24H = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

// type BarProps = {
//   authEmail: string | undefined;
//   onlineUsers: string[];
//   openUserInfoSidebar: (uname: string, imageUrl: string, fullName: string, chooseUname: string) => void;
//   onToggleDisplay: () => void;
//   open: boolean;
//   top: number;
//   bottom: number;
//   sx?: SxProps<Theme>;
// };

// export const Bar = ({ authEmail, onlineUsers, openUserInfoSidebar, onToggleDisplay, open, sx }: BarProps) => {
//   const db = getFirestore();
//   const [usersInteractions, setUsersInteractions] = useState<UserInteractions>({
//     u1: {
//       actions: ["ChildNode"],
//       chooseUname: false,
//       count: 1,
//       fullname: "u 1",
//       id: "sadfa",
//       imageUrl: "",
//       reputation: "Gain",
//       email: "",
//     },
//     u2: {
//       actions: ["ChildNode"],
//       chooseUname: false,
//       count: 10,
//       fullname: "u 2",
//       id: "sadfa",
//       imageUrl: "",
//       reputation: "Gain",
//       email: "",
//     },
//   });

//   const minActions: number = useMemo(() => {
//     return Math.min(
//       0,
//       Object.keys(usersInteractions).reduce(
//         (carry, uname: string) => (carry > usersInteractions[uname].count ? usersInteractions[uname].count : carry),
//         0
//       )
//     );
//   }, [usersInteractions]);

//   const maxActions: number = useMemo(() => {
//     return Math.max(
//       10,
//       Object.keys(usersInteractions).reduce(
//         (carry, uname: string) => (carry < usersInteractions[uname].count ? usersInteractions[uname].count : carry),
//         0
//       )
//     );
//   }, [usersInteractions]);

//   const syncLivelinessBar = useCallback(
//     (changes: ActionsTracksChange[]) => {
//       setUsersInteractions(prevUsersInteractions => {
//         return changes.reduce((acu, cur) => synchronizeActionsTracks(acu, cur, authEmail ?? ""), {
//           ...prevUsersInteractions,
//         });
//       });
//     },
//     [authEmail]
//   );

//   //   useEffect(() => {
//   //     const killSnapshot = getActionTrackSnapshot(db, { rewindDate: PAST_24H }, syncLivelinessBar);
//   //     return () => killSnapshot();
//   //   }, [db, syncLivelinessBar]);

//   console.log({ usersInteractions, minActions, maxActions });

//   return (
//     <Box
//       sx={{
//         width: "56px",
//         p: "10px",
//         background: theme =>
//           theme.palette.mode === "dark" ? theme.palette.common.darkBackground : theme.palette.common.lightBackground,
//         zIndex: 1199,
//         ...sx,
//         border: "solid 2px royalBlue",
//       }}
//     >
//       <Box sx={{ position: "relative", border: "solid 2px red", height: "300px" }}>
//         {Object.keys(usersInteractions)
//           .map(key => ({ ...usersInteractions[key], uname: key }))
//           .map(cur => (
//             <Box
//               key={cur.id}
//               onClick={() =>
//                 openUserInfoSidebar(
//                   cur.uname,
//                   usersInteractions[cur.uname].imageUrl,
//                   usersInteractions[cur.uname].fullname,
//                   usersInteractions[cur.uname].chooseUname ? "1" : ""
//                 )
//               }
//               className={
//                 usersInteractions[cur.uname].reputation === "Gain"
//                   ? "GainedPoint"
//                   : usersInteractions[cur.uname].reputation === "Loss"
//                   ? "LostPoint"
//                   : ""
//               }
//               sx={{
//                 border: "solid 2px green",
//                 cursor: "pointer",
//                 position: "absolute",
//                 transition: "all 0.2s 0s ease",
//                 transform: `translate(-50%, ${getSeekPosition({
//                   uname: cur.uname,
//                   barHeight: 300,
//                   maxActions: maxActions,
//                   minActions: minActions,
//                   usersInteractions: usersInteractions,
//                 })}px)`,
//                 "& > .user-image": {
//                   borderRadius: "50%",
//                   overflow: "hidden",
//                   width: "28px",
//                   height: "28px",
//                 },
//                 "&.GainedPoint": {
//                   "& > .user-image": {
//                     boxShadow: "1px 1px 13px 4px rgba(21, 255, 0, 1)",
//                   },
//                 },
//                 "&.LostPoint": {
//                   "& > .user-image": {
//                     boxShadow: "1px 1px 13px 4px rgba(255, 0, 0, 1)",
//                   },
//                 },
//                 "@keyframes slidein": {
//                   from: {
//                     transform: "translateY(0%)",
//                   },
//                   to: {
//                     transform: "translateY(100%)",
//                   },
//                 },
//               }}
//             >
//               <Box>
//                 {usersInteractions[cur.uname].actions.map((action, index) => {
//                   return <MemoizedActionBubble key={index} actionType={action} />;
//                 })}
//               </Box>
//               <OptimizedAvatar2
//                 alt={usersInteractions[cur.uname].fullname}
//                 imageUrl={usersInteractions[cur.uname].imageUrl}
//                 size={28}
//                 sx={{ border: "none" }}
//               />
//               {onlineUsers.includes(cur.uname) && (
//                 <Box sx={{ background: "#12B76A" }} className="UserStatusOnlineIcon" />
//               )}
//             </Box>
//           ))}
//       </Box>
//       <Box
//         sx={{
//           background: theme =>
//             theme.palette.mode === "dark" ? theme.palette.common.darkBackground : theme.palette.common.lightBackground,
//           display: "flex",
//           top: "50%",
//           transform: "translate(0px, -50%)",
//           left: "-22px",
//           width: "28px",
//           height: "36px",
//           color: theme => (theme.palette.mode === "dark" ? "#bebebe" : "rgba(0, 0, 0, 0.6)"),
//           position: "absolute",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: "20px",
//           borderRadius: "6px 0px 0px 6px",
//           cursor: "pointer",
//         }}
//         onClick={onToggleDisplay}
//       >
//         <ArrowForwardIosIcon
//           fontSize="inherit"
//           sx={{
//             transform: !open ? "scaleX(-1)" : null,
//           }}
//         />
//       </Box>
//     </Box>
//   );
// };

export const a = 2; // INFO: I added this to upload advance
