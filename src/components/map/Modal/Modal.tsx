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
                <i className="material-icons grey-text">
                  {props.returnLeft ? "west" : props.returnDown ? "arrow_downward" : "close"}
                </i>
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
