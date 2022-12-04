import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { collection, Firestore, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { IActionTrack } from "src/types/IActionTrack";

const LivelinessWrapper = styled.div`
  position: relative;
  z-index: 1300;
  background: #1f1f1f;
  border-radius: 0px 0px 10px 10px;
  width: 900px;
  max-width: 100%;
  margin: 0 auto;
  height: 58px;
  display: flex;
  justify-content: center;
  align-items: center;
  & > .seekbar {
    width: calc(100% - 20px);
    border-bottom: 2px solid #ffffff;
    position: relative;
    & > .seekbar-users {
      width: 100%;
      position: absolute;
      top: 0px;
      left: 0px;
      transform: translate(0px, -50%);
    }
  }

  & > .seekbar:after {
    content: " ";
    border: 3px solid #ffffff;
    border-radius: 50%;
    display: inline-block;
    position: absolute;
    right: -4px;
    top: -2px;
  }

  & > .seekbar:before {
    content: " ";
    border: 3px solid #ffffff;
    border-radius: 50%;
    display: inline-block;
    position: absolute;
    left: -4px;
    top: -2px;
  }

  .user-item {
    border: 2px solid transparent;
    border-radius: 50%;
    overflow: hidden;
    width: 28px;
    height: 28px;
    display: inline-block;
    position: absolute;
    left: 0px;
    top: 0px;
  }
  .user-item:hover {
    border: 2px solid #ff8a33;
  }
  .user-item.show-receiver {
    border: 2px solid #fdc473;
  }
`;

type ILivelinessBarProps = {
  db: Firestore;
};

type UserInteractions = {
  [uname: string]: {
    receivers: string[];
    imageUrl: string;
    count: number;
  };
};

function LivelinessBarComponent(props: ILivelinessBarProps) {
  const { db } = props;
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [usersInteractions, setUsersInteractions] = useState<UserInteractions>({});
  const [barWidth, setBarWidth] = useState<number>(0);

  useEffect(() => {
    const ts = new Date().getTime() - 86400000;
    const actionTracksCol = collection(db, "actionTracks");
    const q = query(actionTracksCol, where("createdAt", ">=", Timestamp.fromDate(new Date(ts))));
    onSnapshot(q, async snapshot => {
      let _usersInteractions = { ...usersInteractions };
      const docChanges = snapshot.docChanges();
      for (const docChange of docChanges) {
        const actionTrackData = docChange.doc.data() as IActionTrack;
        if (docChange.type === "added") {
          if (!_usersInteractions.hasOwnProperty(actionTrackData.doer)) {
            _usersInteractions[actionTrackData.doer] = {
              receivers: [],
              imageUrl: actionTrackData.imageUrl,
              count: 0,
            };
          }
          for (const receiver of actionTrackData.receivers) {
            if (!_usersInteractions[actionTrackData.doer].receivers.includes(receiver)) {
              _usersInteractions[actionTrackData.doer].receivers.push(receiver);
            }
          }
          _usersInteractions[actionTrackData.doer].count += 1;
        }
        if (docChange.type === "removed") {
          if (_usersInteractions.hasOwnProperty(actionTrackData.doer)) {
            _usersInteractions[actionTrackData.doer].count -= 1;
            if (_usersInteractions[actionTrackData.doer].count < 0) {
              _usersInteractions[actionTrackData.doer].count = 0;
            }
          }
        }
      }
      setUsersInteractions(_usersInteractions);
    });
  }, []);

  useEffect(() => {
    setBarWidth(parseFloat(String(document.getElementById("liveliness-seekbar")?.clientWidth)));
  }, []);

  const unames = useMemo(() => {
    return Object.keys(usersInteractions);
  }, [usersInteractions]);

  const maxActions: number = useMemo(() => {
    return unames.reduce(
      (carry, uname: string) => (carry < usersInteractions[uname].count ? usersInteractions[uname].count : carry),
      0
    );
  }, [usersInteractions]);

  return (
    <Box>
      <LivelinessWrapper>
        <div className="seekbar">
          <div className="seekbar-users" id="liveliness-seekbar">
            {unames.map((uname: string) => {
              const seekPosition = (usersInteractions[uname].count / maxActions) * barWidth - 28;
              const isRelatedSelection =
                selectedUser && (usersInteractions[selectedUser]?.receivers || []).includes(uname);
              return (
                <Box
                  className={"user-item " + (isRelatedSelection ? "show-receiver" : "")}
                  key={uname}
                  sx={{
                    transform: `translate(${seekPosition}px, -50%)`,
                  }}
                  onMouseOver={() => setSelectedUser(uname)}
                  onMouseOut={() => setSelectedUser("")}
                >
                  <Image src={usersInteractions[uname].imageUrl} width={28} height={28} />
                </Box>
              );
            })}
          </div>
        </div>
      </LivelinessWrapper>
    </Box>
  );
}

export const LivelinessBar = React.memo(LivelinessBarComponent);
