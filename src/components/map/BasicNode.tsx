import CloseIcon from "@mui/icons-material/Close";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, IconButton, Typography } from "@mui/material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

// import { useAuth } from "../../context/AuthContext";
import { KnowledgeChoice } from "../../knowledgeTypes";
import { getVideoDataByUrl } from "../../lib/utils/utils";
import { OpenPart, SelectedUser } from "../../nodeBookTypes";
import MarkdownRender from "../Markdown/MarkdownRender";
import { MemoizedBasicNodeFooter } from "./BasicNodeFooter";
import { MemoizedBasicQuestionChoices } from "./BasicQuestionChoices";
import { MemoizedBasicNodeDetails } from "./LinkingWords/BasicNodeDetails";
import { MemoizedNodeVideo } from "./Node/NodeVideo";
// import { MemoizedNodeFooter } from "./NodeFooter";

dayjs.extend(relativeTime);
type BasicNodeProps = {
  identifier: string;
  left: number;
  top: number;
  width: number;
  nodeType: any;
  title: string;
  content: string;
  nodeImage: string;
  nodeVideo: string;
  nodeVideoStartTime: number;
  nodeVideoEndTime: number;
  choices: KnowledgeChoice[];
  changeNodeHight: any;
  setOpenMedia: (imagUrl: string) => void;
  open: boolean;
  // bookmark: any;
  bookmarked: boolean;
  bookmarks: any;
  changedAt: any; // TODO: check real type of this
  // correctNode: any;
  correctNum: any;
  // aImgUrl: string;
  admin: SelectedUser;
  // notebookRef: MutableRefObject<TNodeBookState>;
  openPart: OpenPart;
  viewers: number;
  // markedCorrect: any;
  wrongNum: any;
  // markedWrong: any;
  references: { title: string; node: string; label: string }[];
  tags: { node: string; title?: string; label?: string }[];
  parents: any[];
  nodesChildren: string[] | { node: string; title?: string; label?: string }[];
  setOpenPart: (nodeId: string, newOpenPart: OpenPart) => void;
  locked: boolean;
  // openNodePart: (event: any, id: string, partType: any, openPart: any, setOpenPart: any, tags: any) => void; //
  toggleNode: (event: any, id: string) => void;
  // onNodeShare: (nodeId: string, platform: string) => void;
  // selectNode: any;
  onSelecteNode: (nodeId: string) => void;
  // proposalsNum: number;
  // studied: number;
  // isStudied: boolean;
  // markStudied: any;
  // wrongNode: any;
  openUserInfoSidebar: (user: SelectedUser) => void;
  selectedNodeId: string;
  displayJoinMessage?: () => void;
};

const BasicNode = ({
  identifier,
  left,
  top,
  width,
  nodeType,
  title,
  content,
  nodeImage,
  nodeVideo,
  nodeVideoStartTime,
  nodeVideoEndTime,
  choices,
  changeNodeHight,
  setOpenMedia,
  open,
  // bookmark,
  bookmarked,
  bookmarks,
  changedAt,
  // correctNode,
  correctNum,
  // aImgUrl,
  admin,
  // notebookRef,
  openPart,
  viewers,
  // markedCorrect,
  wrongNum,
  // markedWrong,
  references,
  tags,
  parents,
  nodesChildren,
  setOpenPart,
  locked,

  // studied,
  // isStudied,
  // markStudied,
  // openNodePart,
  // onNodeShare,
  // selectNode,
  onSelecteNode: onSelectedNode,
  toggleNode,
  openUserInfoSidebar,
  selectedNodeId,
  displayJoinMessage,
}: // wrongNode,
// disabled = false,
// enableChildElements = [],
BasicNodeProps) => {
  // const [{ user }] = useAuth();
  const [videoUrl, setVideoUrl] = useState(nodeVideo);
  const [videoStartTime, setVideoStartTime] = useState<any>(nodeVideoStartTime ? nodeVideoStartTime : 0);
  const [videoEndTime, setVideoEndTime] = useState<any>(nodeVideoEndTime ? nodeVideoEndTime : 0);
  const nodeRef = useRef(null);
  const previousHeightRef = useRef<number>(0);
  const previousTopRef = useRef<string>("0px");
  const observer = useRef<ResizeObserver | null>(null);
  const [, /* startTimeValue */ setStartTimeValue] = React.useState<any>(moment.utc(nodeVideoStartTime * 1000));
  const [, /* endTimeValue */ setEndTimeValue] = React.useState<any>(moment.utc(nodeVideoEndTime * 1000));
  const [timePickerError, setTimePickerError] = React.useState<any>(false);

  // const disableTitle = disabled && !enableChildElements.includes(`${identifier}-node-title`);
  // const disableContent = disabled && !enableChildElements.includes(`${identifier}-node-content`);
  //   const disableWhy = disabled && !enableChildElements.includes(`${identifier}-node-why`);
  //   const disableSwitchPreview = disabled;
  //   const disableProposeButton = disabled && !enableChildElements.includes(`${identifier}-button-propose-proposal`);
  //   const disableCancelButton = disabled && !enableChildElements.includes(`${identifier}-button-cancel-proposal`);

  const openNodePartHandler = useCallback(
    (partType: any) => {
      setOpenPart(identifier, openPart === partType ? undefined : partType);
    },

    [identifier, openPart, setOpenPart]
  );

  const onToggleNode = useCallback(
    (event: any) => {
      toggleNode(event, identifier);
    },
    [toggleNode, identifier]
  );

  useEffect(() => {
    setVideoUrl(videoUrl => {
      return videoUrl !== nodeVideo ? nodeVideo : videoUrl;
    });
    setVideoStartTime((videoStartTime: any) => {
      return videoStartTime !== nodeVideoStartTime ? nodeVideoStartTime : videoStartTime;
    });

    setStartTimeValue((startTime: any) => {
      return !moment(startTime).isSame(moment(nodeVideoStartTime * 1000))
        ? moment.utc(nodeVideoStartTime * 1000)
        : moment.utc(startTime);
    });

    setEndTimeValue((endTime: any) => {
      return !moment(endTime).isSame(moment(nodeVideoEndTime * 1000))
        ? moment.utc(nodeVideoEndTime * 1000)
        : moment.utc(endTime);
    });

    setVideoEndTime((videoEndTime: any) => {
      return videoEndTime !== nodeVideoEndTime ? nodeVideoEndTime : videoEndTime;
    });
  }, [nodeVideo, nodeVideoStartTime, nodeVideoEndTime]);

  const videoData = useMemo(() => {
    const startTime = parseInt(videoStartTime);
    const endTime = parseInt(videoEndTime);
    if (
      typeof startTime !== "undefined" &&
      typeof endTime !== "undefined" &&
      !isNaN(startTime) &&
      !isNaN(endTime) &&
      startTime > endTime
    ) {
      setTimePickerError(true);
    } else {
      if (timePickerError) {
        setTimePickerError(false);
      }
    }

    return getVideoDataByUrl(videoUrl, startTime, endTime);
  }, [videoUrl, videoStartTime, videoEndTime]);

  useEffect(() => {
    observer.current = new ResizeObserver(entries => {
      try {
        const { blockSize } = entries[0].borderBoxSize[0];
        const topPosition = (entries[0].target as any)?.style?.top;
        const isSimilar = blockSize === previousHeightRef.current;
        previousHeightRef.current = blockSize;
        previousTopRef.current = topPosition;
        if (isSimilar) return;

        changeNodeHight(identifier, blockSize);
      } catch (err) {
        console.warn("invalid entry", err);
      }
    });

    if (nodeRef.current) {
      observer.current.observe(nodeRef.current);
    }

    return () => {
      if (!observer.current) return;
      return observer.current.disconnect();
    };
  }, [identifier]);

  const onImageClick = useCallback(() => setOpenMedia(nodeImage), [nodeImage]);

  // if (!user) {
  //   return null;
  // }
  return (
    <Box
      id={identifier}
      ref={nodeRef}
      className={"Node card" + (selectedNodeId === identifier ? " active" : "")}
      sx={{ borderColor: "#fd7373" }}
      //   className={
      //     "Node card" +
      //     (activeNode ? " active" : "") +
      //     (changed || !isStudied ? " Changed" : "") +
      //     (isHiding ? " IsHiding" : "") +
      //     (nodeType === "Reference" ? " Choosable" : "")
      //   }
      onClick={() => onSelectedNode(identifier)}
      style={{
        left: left ? left : 1000,
        top: top ? top : 1000,
        width: width,
        transition: "0.3s",
        padding: "13px 13px 13px 13px",
      }}
    >
      {/* INFO: uncomment this only on develope */}
      {process.env.NODE_ENV === "development" && (
        <Typography sx={{ position: "absolute", top: "-2px" }}>{identifier}</Typography>
      )}

      <Box
        id={`${identifier}-node-header`}
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: "4px",
          justifyContent: "flex-end",
          mt: "-14px",
          mb: "-10px",
          float: "right",
        }}
      >
        {open ? (
          <IconButton onClick={onToggleNode} color="inherit" aria-label="Close the node" size="small">
            <RemoveIcon fontSize="inherit" />
          </IconButton>
        ) : (
          <IconButton onClick={onToggleNode} color="inherit" aria-label="open the node" size="small">
            <FullscreenIcon fontSize="inherit" />
          </IconButton>
        )}
        {/* <IconButton disabled={true} color="inherit" aria-label="Hide Descendants" size="small"> */}
        <Box
          onClick={displayJoinMessage}
          sx={{
            p: "5px",
            width: "28px",
            height: "28px",
            color: theme =>
              theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.3)" : theme.palette.common.notebookG200,
          }}
        >
          <KeyboardTabIcon fontSize="inherit" sx={{ transform: "scaleX(-1)" }} />
        </Box>
        {/* </IconButton> */}
        {/* <IconButton disabled={true} color="inherit" aria-label="Hide Node" size="small"> */}
        <Box
          onClick={displayJoinMessage}
          sx={{
            p: "5px",
            width: "28px",
            height: "28px",
            color: theme =>
              theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.3)" : theme.palette.common.notebookG200,
          }}
        >
          <CloseIcon fontSize="inherit" />
        </Box>
        {/* </IconButton> */}
      </Box>

      {open ? (
        <>
          <div className="card-content">
            <div id={`${identifier}-node-body`} className="NodeContent" data-hoverable={true}>
              <MarkdownRender
                text={title}
                customClass={"custom-react-markdown"}
                sx={{ fontSize: "25px", fontWeight: 300, letterSpacing: "inherit" }}
              />

              <Box id={`${identifier}-node-content`}>
                <MarkdownRender
                  text={content}
                  customClass={"custom-react-markdown"}
                  sx={{ marginTop: "13px", fontWeight: 400, letterSpacing: "inherit" }}
                />

                <div id={`${identifier}-node-content-media`}>
                  {nodeImage !== "" && (
                    <>
                      <img
                        src={nodeImage}
                        alt="Node image"
                        className="responsive-img NodeImage"
                        onClick={onImageClick}
                      />
                    </>
                  )}
                  {nodeType === "Question" && (
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <ul className="collapsible" style={{ padding: "0px" }}>
                        {choices.map((choice, idx) => {
                          return (
                            <MemoizedBasicQuestionChoices
                              key={identifier + "Choice" + idx}
                              idx={idx}
                              choice={choice}
                              choices={choices}
                            />
                          );
                        })}
                      </ul>
                    </Box>
                  )}
                  {nodeVideo && (
                    <>
                      <MemoizedNodeVideo addVideo={true} videoData={videoData} />
                      <Box sx={{ mb: "12px" }}></Box>
                    </>
                  )}
                </div>
              </Box>
            </div>
            {/* TODO: add disable Footer */}
          </div>
        </>
      ) : (
        <div className="card-content">
          <div className="NodeTitleClosed">
            <MarkdownRender
              text={title}
              customClass={"custom-react-markdown"}
              sx={{ fontSize: "25px", fontWeight: 400, letterSpacing: "inherit" }}
            />
          </div>
          {/* TODO: ADD Disable Footer */}
        </div>
      )}

      <MemoizedBasicNodeFooter
        // aImgUrl={aImgUrl}
        admin={admin}
        bookmarked={bookmarked}
        bookmarks={bookmarks}
        changedAt={changedAt}
        content={content}
        // correctNode={correctNode}
        correctNum={correctNum}
        open={true}
        identifier={identifier}
        // notebookRef={notebookRef}
        title={title}
        openPart={openPart}
        nodeType={nodeType}
        viewers={viewers}
        // markedCorrect={markedCorrect}
        wrongNum={wrongNum}
        // markedWrong={markedWrong}
        references={references}
        tags={tags}
        parents={parents}
        nodesChildren={nodesChildren}
        // onNodeShare={onNodeShare}
        openNodePart={openNodePartHandler}
        openUserInfoSidebar={openUserInfoSidebar}
        // selectNode={selectNodeHandler}
        locked={locked}
        disabled={true}
        enableChildElements={[`${identifier}-button-parent-children`, `${identifier}-node-footer-tags-citations`]}
        displayJoinMessage={displayJoinMessage}
      />

      {openPart && (
        <MemoizedBasicNodeDetails
          identifier={identifier}
          nodeType={nodeType}
          nodesChildren={nodesChildren}
          parents={parents}
          references={references}
          tags={tags}
          openPart={openPart}
          displayJoinMessage={displayJoinMessage}
        />
      )}
      {/* {(openPart === "LinkingWords" || openPart === "Tags" || openPart === "References") && (
        <LinkingWords
          identifier={identifier}
          notebookRef={notebookRef}
          nodeBookDispatch={nodeBookDispatch}
          editable={editable}
          isNew={isNew}
          openPart={openPart}
          title={title}
          reason={reason}
          references={references}
          tags={tags}
          parents={parents}
          nodesChildren={nodesChildren}
          chosenNodeChanged={chosenNodeChanged}
          referenceLabelChange={referenceLabelChange}
          deleteLink={deleteLinkHandler}
          openLinkedNode={openLinkedNode}
          openAllChildren={openAllChildren}
          openAllParent={openAllParent}
          saveProposedChildNode={saveProposedChildNode}
          saveProposedImprovement={saveProposedImprovement}
          closeSideBar={closeSideBar}
          setAbleToPropose={setAbleToPropose}
          ableToPropose={ableToPropose}
          isLoading={isLoading}
          onResetButton={newValue => setAbleToPropose(newValue)}
          setOperation={setOperation}
          disabled={disabled}
          enableChildElements={enableChildElements}
          nodeType={nodeType}
        />
      )} */}
    </Box>
  );
};

export const MemoizedBasicNode = React.memo(
  BasicNode /* , (prev, next) => {
  return prev.top === next.top && prev.left === next.left;
} */
);
