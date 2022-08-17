import React from "react";

// import "./UserHeader.css";

const UserHeader = (props: any) => {
  return (
    <div className="ProposalUsername">
      <div className="UserAvatar">
        <img src={props.imageUrl} alt="1Cademist Profile Picture" />
      </div>
      {/* <span className="circle Avatar">{editor.username[0]}</span> */}
    </div>
  );
};

export default React.memo(UserHeader);
