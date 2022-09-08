import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import CloseIcon from "@mui/icons-material/Close";
import WestIcon from "@mui/icons-material/West";
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
};

const Modal = ({ onClick, ...props }: ModalProps) => {
  // const setOpenProgressBar = useSetRecoilState(openProgressBarState);

  const closeModal = useCallback(() => {
    // setOpenProgressBar(false);
    onClick();
  }, [onClick]);

  const ModalBody = () => {
    return (
      <div id="ModalBody">
        <div id="ModalContent" className={props.returnLeft || props.returnDown ? "ModalWithReturnContent" : undefined}>
          {props.children}

          <div id={props.returnLeft || props.returnDown ? "ModalReturnButton" : "ModalCloseButton"}>
            <MemoizedMetaButton onClick={closeModal} tooltip="Close the window." tooltipPosition="left">
              <div className="CloseButton">
                {props.returnLeft && <WestIcon className="material-icons grey-text" />}
                {props.returnDown && <ArrowDownwardIcon className="material-icons grey-text" />}
                {!props.returnDown && !props.returnLeft && <CloseIcon className="material-icons grey-text" />}
              </div>
            </MemoizedMetaButton>
          </div>
        </div>
      </div>
    );
  };

  return !props.noBackground ? (
    <div id="Modal">
      <div id="ModalBackground" onClick={closeModal}></div>
      <ModalBody />
    </div>
  ) : (
    <ModalBody />
  );
};

export default React.memo(Modal);
