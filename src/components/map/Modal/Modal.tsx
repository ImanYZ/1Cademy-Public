import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import WestIcon from "@mui/icons-material/West";
import { Box, Typography } from "@mui/material";
// import "./Modal.css";
import React, { useCallback } from "react";

// import { useSetRecoilState } from "recoil";
// import { openProgressBarState } from "../../store/MapAtoms";
// import ModalBody from "./ModalBody";
import { MemoizedMetaButton } from "../MetaButton";

type ModalProps = {
  children: JSX.Element;
  returnLeft?: any;
  returnDown?: any;
  onClick: any;
  noBackground?: any;
  style?: any;
  contentStyle?: any;
  className?: string;
};

const Modal = ({ onClick, ...props }: ModalProps) => {
  // const setOpenProgressBar = useSetRecoilState(openProgressBarState);

  const closeModal = useCallback(() => {
    // setOpenProgressBar(false);
    onClick();
  }, [onClick]);

  const ModalBody = () => {
    return (
      <Box
        id="ModalBody"
        className={props.className}
        sx={{ borderRadius: "5px", padding: "19px", zIndex: 20 }}
        style={props.style}
      >
        <div
          id="ModalContent"
          style={props.contentStyle}
          className={props.returnLeft || props.returnDown ? "ModalWithReturnContent" : "ModalWithReturnContent"}
        >
          <Typography
            sx={{
              position: "absolute",
              left: "50%",
              top: "15px",
              transform: "translateX(-50%)",
            }}
          >
            Search for tags
          </Typography>
          {props.children}

          <div id={props.returnLeft || props.returnDown ? "ModalReturnButton" : "ModalReturnButton"}>
            <MemoizedMetaButton onClick={closeModal} tooltip="Close the window." tooltipPosition="left">
              <div className="CloseButton">
                {props.returnLeft && <WestIcon className="material-icons grey-text" />}
                {props.returnDown && <ArrowDownwardIcon className="material-icons grey-text" />}
                {!props.returnDown && !props.returnLeft && <CloseIcon className="material-icons grey-text" />}
              </div>
            </MemoizedMetaButton>
          </div>
        </div>
      </Box>
    );
  };

  return !props.noBackground ? (
    <div id="Modal">
      {/* <div id="ModalBackground" onClick={closeModal}></div> */}
      <ModalBody />
    </div>
  ) : (
    <ModalBody />
  );
};

export default React.memo(Modal);
