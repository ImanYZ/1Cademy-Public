import { AddBoxOutlined } from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CloseIcon from '@mui/icons-material/Close';
import CreateIcon from '@mui/icons-material/Create';
import DoneIcon from '@mui/icons-material/Done';
import DraftsIcon from '@mui/icons-material/Drafts';
import HeightIcon from '@mui/icons-material/Height';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MailIcon from '@mui/icons-material/Mail';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VoiceOverOffIcon from '@mui/icons-material/VoiceOverOff';
import { Button, IconButton, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
import React, { useCallback, useState } from 'react'

import { User } from '../../knowledgeTypes';
import shortenNumber from '../../lib/utils/shortenNumber';
import { OpenPart } from '../../nodeBookTypes';
import NodeTypeIcon from '../NodeTypeIcon';
import { MemoizedUserStatusIcon } from './UserStatusIcon';

dayjs.extend(relativeTime);

type NodeFooterProps = {
  open: boolean,
  identifier: any,
  activeNode: any,
  citationsSelected: any,
  proposalsSelected: any,
  acceptedProposalsSelected: any,
  commentsSelected: any,
  editable: any,
  title: any,
  content: any,
  unaccepted: any,
  openPart: OpenPart,
  nodeType: any,
  isNew: any,
  admin: any,
  aImgUrl: any,
  aFullname: any,
  aChooseUname: any,
  viewers: any,
  correctNum: any,
  markedCorrect: any,
  wrongNum: any,
  markedWrong: any,
  references: any,
  tags: any,
  parents: any,
  nodesChildren: any,
  commentsNum: any,
  proposalsNum: any,
  studied: any,
  isStudied: any,
  changed: any,
  changedAt: any,
  bookmarked: any,
  bookmarks: any,
  reloadPermanentGrpah: any,
  markStudied: any,
  bookmark: any,
  nodeChanged: any,
  openNodePart: any,
  selectNode: any,
  correctNode: any,
  wrongNode: any,
  uploadNodeImage: any,
  user: User
}




const NodeFooter = ({ open,
  identifier,
  activeNode,
  citationsSelected,
  proposalsSelected,
  acceptedProposalsSelected,
  commentsSelected,
  editable,
  title,
  content,
  unaccepted,
  openPart,
  nodeType,
  isNew,
  admin,
  aImgUrl,
  aFullname,
  aChooseUname,
  viewers,
  correctNum,
  markedCorrect,
  wrongNum,
  markedWrong,
  references,
  tags,
  parents,
  nodesChildren,
  commentsNum,
  proposalsNum,
  studied,
  isStudied,
  changed,
  changedAt,
  bookmarked,
  bookmarks,
  reloadPermanentGrpah,
  markStudied,
  bookmark,
  nodeChanged,
  openNodePart,
  selectNode,
  correctNode,
  wrongNode,
  uploadNodeImage,
  user
}: NodeFooterProps) => {

  const [isSpeaking, setIsSpeaking] = useState(false);

  const selectReferences = useCallback(
    (event) => {
      openNodePart(event, "References");
    },
    [openNodePart]
  );

  const selectLinkingWords = useCallback(
    (event: any) => {

      openNodePart(event, "LinkingWords");
    },
    [openNodePart]
  );

  const narrateNode = useCallback(
    (event: any) => {
      if (!window.speechSynthesis.speaking) {
        const msg = new SpeechSynthesisUtterance(
          "Node title: " + title + " \n " + "Node content: " + content
        );
        window.speechSynthesis.speak(msg);
        setIsSpeaking(true);
        window.speechSynthesis.onend = () => {
          setIsSpeaking(false);
        };
      } else {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    },
    [title, content]
  );

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className="NodeFooter Left" sx={{ display: 'flex', alignItems: 'center' }}>
        {open &&
          (isNew ? (
            //   <UserStatusIcon
            //     uname={username}
            //     imageUrl={imageUrl}
            //     fullname={fName + " " + lName}
            //     chooseUname={chooseUname}
            //     online={false}
            //     inUserBar={false}
            //     inNodeFooter={true}
            //     reloadPermanentGrpah={reloadPermanentGrpah}
            //   />
            // ) : (
            //   <UserStatusIcon
            //     uname={admin}
            //     imageUrl={aImgUrl}
            //     fullname={aFullname}
            //     chooseUname={aChooseUname}
            //     online={false}
            //     inUserBar={false}
            //     inNodeFooter={true}
            //     reloadPermanentGrpah={reloadPermanentGrpah}
            //   />
            <MemoizedUserStatusIcon
              uname={user.uname}
              imageUrl={user.imageUrl || ""}
              fullname={user.fName + " " + user.lName}
              chooseUname={user.chooseUname}
              online={false}
              inUserBar={false}
              inNodeFooter={true}
              reloadPermanentGrpah={reloadPermanentGrpah}
            />
          ) : (
            <MemoizedUserStatusIcon
              uname={admin}
              imageUrl={aImgUrl}
              fullname={aFullname}
              chooseUname={aChooseUname}
              online={false}
              inUserBar={false}
              inNodeFooter={true}
              reloadPermanentGrpah={reloadPermanentGrpah}
            />
          ))}
        <div className={open ? "NodeTypeIconOpen Tooltip" : "NodeTypeIconClosed Tooltip"}>
          {/* <NodeTypeIcon nodeType={nodeType} /> */}
          <NodeTypeIcon nodeType={nodeType} tooltipPlacement={"top"} />
          {/* <span
            className={"TooltipText " + (open ? "Top" : "Bottom")}
            onClick={preventEventPropagation}
          >
            This is{" "}
            {nodeType[0] == "A" ||
              nodeType[0] == "E" ||
              nodeType[0] == "I" ||
              nodeType[0] == "O" ||
              nodeType[0] == "U"
              ? "an"
              : "a"}{" "}
            "{nodeType}" node.
          </span> */}
        </div>
      </Box>
      <Box className="NodeFooter Right" sx={{ display: 'flex', alignItems: 'center' }}>
        {open ? (
          <>
            {!editable && !unaccepted ? (
              // Accepted nodes
              <>

                <Tooltip title="Adjust the node height." placement='top'>
                  <IconButton onClick={() => console.log('nodeChanged')} sx={{ fontSize: '15px', p: '4px 7px' }}>
                    <HeightIcon fontSize='inherit' />
                  </IconButton>
                </Tooltip>

                <Tooltip title={isSpeaking ? "Stop narration." : "Narrate the node."} placement='top'>
                  <IconButton onClick={narrateNode} sx={{ fontSize: '15px', p: '4px 7px' }}>
                    {isSpeaking ? <VoiceOverOffIcon fontSize='inherit' /> : <RecordVoiceOverIcon fontSize='inherit' />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={"Propose/evaluate versions of this node."} placement='top'>
                  <Button onClick={() => console.log('selectPendingProposals')} sx={{ minWidth: 'auto', fontSize: '15px', p: '4px 7px', color: proposalsSelected ? theme => theme.palette.common.orange : 'inherit' }}>
                    <CreateIcon fontSize='inherit' />{` ${dayjs(new Date(changedAt.seconds * 1000)).fromNow()}`}
                  </Button>
                </Tooltip>

                {/* <MetaButton
                  onClick={nodeChanged}
                  tooltip="Adjust the node height."
                  tooltipPosition="Top"
                >
                  <i className="material-icons grey-text">height</i>
                </MetaButton> */}
                {/* <MetaButton
                  onClick={narrateNode}
                  tooltip={isSpeaking ? "Stop narration." : "Narrate the node."}
                  tooltipPosition="Top"
                >
                  <i className="material-icons grey-text">
                    {isSpeaking ? "voice_over_off" : "record_voice_over"}
                  </i>
                </MetaButton> */}
                {/* <MetaButton
                  onClick={selectAcceptedProposals}
                  tooltip="See version history."
                  tooltipPosition="Top"
                >
                  <i
                    className={
                      "material-icons SeparateIcon " +
                      (acceptedProposalsSelected ? "orange-text" : "grey-text")
                    }
                  >
                    event_available
                  </i>
                  <span>{dayjs(changedAt).fromNow()}</span>
                </MetaButton> */}
                {/* <MetaButton
                  onClick={selectPendingProposals}
                  tooltip="Propose/evaluate versions of this node."
                  // {
                  //   shortenNumber(proposalsNum, 2, false) +
                  //   " proposal" +
                  //   (proposalsNum > 1 ? "s" : "") +
                  //   " exist" +
                  //   (proposalsNum === 1 ? "s" : "") +
                  //   " on this node. Click to propose an improvement or review a proposal on the pending proposals list."
                  // }
                  tooltipPosition="Top"
                >
                  <i
                    className={
                      "material-icons " + (proposalsSelected ? "orange-text" : "grey-text")
                    }
                  >
                    create
                  </i>
                  <span>{dayjs(changedAt).fromNow()}</span>
                </MetaButton> */}
              </>
            ) : (

              // new Node or unaccepted proposal

              // {/* CHECK: I commented this, please uncomented when work in proposal */}
              <>
                {/* <input
                  type="file"
                  ref={inputEl}
                  onChange={uploadNodeImageHandler}
                  hidden="hidden"
                />
                <MetaButton
                  onClick={uploadImageClicked}
                  tooltip="Upload an image for this node."
                  tooltipPosition="Top"
                >
                  <i className="material-icons grey-text ImageUploadButton">
                    photo_size_select_actual
                  </i>
                  {isUploading && (
                    <>
                      <div className="preloader-wrapper active inherit ImageUploadButtonLoader">
                        <div className="spinner-layer spinner-yellow-only">
                          <div className="circle-clipper left">
                            <div className="circle"></div>
                          </div>
                        </div>
                      </div>
                      <span className="ImageUploadPercentage">{percentageUploaded + "%"}</span>
                    </>
                  )}
                </MetaButton> */}
              </>
            )}
            {!editable && !unaccepted && nodeType === "Reference" ? (
              <>
                <Tooltip title={"View nodes that have cited this node."} placement='top'>
                  <Button onClick={() => console.log('selectCitations')} sx={{ minWidth: 'auto', fontSize: '15px', p: '4px 7px' }}>
                    {citationsSelected ? (
                      <>
                        <ArrowForwardIcon fontSize='inherit' sx={{ color: theme => theme.palette.common.orange }} />
                        <MenuBookIcon fontSize='inherit' sx={{ color: theme => theme.palette.common.orange }} />
                        {/* <i className="material-icons orange-text">arrow_forward</i>
                        <i className="material-icons SeparateIcon orange-text">menu_book</i> */}
                      </>
                    ) : (
                      <>
                        <ArrowForwardIcon fontSize='inherit' />
                        <MenuBookIcon fontSize='inherit' />
                        {/* <i className="material-icons grey-text">arrow_forward</i>
                        <i className="material-icons SeparateIcon grey-text">menu_book</i> */}
                      </>
                    )}
                    {/* ********************************************************
                  Retrieve all the nodes that are citing this from the nodes collection.
                  ******************************************************** */}
                    <span>{shortenNumber(10, 2, false)}</span>
                    {/* CHECK: please get correct value from citations */}
                    {/* <span>{shortenNumber(citations[identifier].size, 2, false)}</span> */}
                  </Button>
                </Tooltip>

                <Tooltip title={"View tags assigned to this node."} placement='top'>
                  <Button
                    onClick={() => console.log('selectTags')}
                    sx={{ minWidth: 'auto', fontSize: '15px', p: '4px 7px', color: openPart === 'Tags' ? theme => theme.palette.common.orange : 'inherit' }}>
                    <LocalOfferIcon fontSize='inherit' />
                    <span>{shortenNumber(tags.length, 2, false)}</span>
                  </Button>
                </Tooltip>

                {/* <MetaButton
                  onClick={selectCitations}
                  tooltip="View nodes that have cited this node."
                  tooltipPosition="Top"
                >
                  {citationsSelected ? (
                    <>
                      <i className="material-icons orange-text">arrow_forward</i>
                      <i className="material-icons SeparateIcon orange-text">menu_book</i>
                    </>
                  ) : (
                    <>
                      <i className="material-icons grey-text">arrow_forward</i>
                      <i className="material-icons SeparateIcon grey-text">menu_book</i>
                    </>
                  )}
                  <span>{shortenNumber(citations[identifier].size, 2, false)}</span>
                </MetaButton> */}

                {/* <MetaButton
                  onClick={selectTags}
                  tooltip="View tags assigned to this node."
                  tooltipPosition="Top"
                >
                  <i
                    className={
                      "material-icons " + (openPart === "Tags" ? "orange-text" : "grey-text")
                    }
                  >
                    local_offer
                  </i>
                  <span>{shortenNumber(tags.length, 2, false)}</span>
                </MetaButton> */}
              </>
            ) : (

              <Tooltip title={"View tags and citations used in this node."} placement='top'>
                <Button
                  onClick={selectReferences}
                  sx={{ minWidth: 'auto', fontSize: '15px', p: '4px 7px', color: openPart === 'References' ? theme => theme.palette.common.orange : 'inherit' }}
                >
                  <MenuBookIcon fontSize='inherit' />
                  <span className="CitationsSpanBeforeTagIcon">
                    {shortenNumber(references.length, 2, false)}
                  </span>
                  <Box component={'span'} sx={{ mx: '5px' }}> | </Box>
                  <LocalOfferIcon fontSize='inherit' />
                  <span>{shortenNumber(tags.length, 2, false)}</span>
                </Button>
              </Tooltip>

              // <MetaButton
              //   onClick={selectReferences}
              //   tooltip="View tags and citations used in this node."
              //   tooltipPosition="Top"
              // >
              //   <i
              //     className={
              //       "material-icons SeparateIcon " +
              //       (openPart === "References" ? "orange-text" : "grey-text")
              //     }
              //   >
              //     menu_book
              //   </i>
              //   <span className="CitationsSpanBeforeTagIcon">
              //     {shortenNumber(references.length, 2, false)} |
              //   </span>
              //   <i
              //     className={
              //       "material-icons FooterTagIcon " +
              //       (openPart === "References" ? "orange-text" : "grey-text")
              //     }
              //   >
              //     local_offer
              //   </i>
              //   <span>{shortenNumber(tags.length, 2, false)}</span>
              // </MetaButton>
            )}
            {!editable && !unaccepted && (
              <>
                {/* <MetaButton
                  onClick={event => {}}
                  tooltip="# of comments and Q&amp;As about this node."
                    tooltipPosition="Top"
                >
                  <i
                    className={
                      "material-icons " + 
                      (activeNode &&
                      commentsSelected
                        ? "orange-text"
                        : "grey-text"
                      )}
                  >forum</i>
                  <span>{shortenNumber(commentsNum, 2, false)}</span>
                </MetaButton> */}

                <Tooltip title={"Vote to delete node."} placement='top'>
                  <Button
                    onClick={() => console.log('wrongNode')}
                    sx={{ minWidth: 'auto', fontSize: '15px', p: '4px 7px', color: 'white' }}>
                    <CloseIcon fontSize='inherit' sx={{ color: markedCorrect ? 'red' : 'inherit' }} />
                    <span>{shortenNumber(wrongNum, 2, false)}</span>
                  </Button>
                </Tooltip>

                <Tooltip title={"Vote to prevent further changes."} placement='top'>
                  <Button
                    onClick={() => console.log('correctNode')}
                    sx={{ minWidth: 'auto', fontSize: '15px', p: '4px 7px', color: 'white' }}>
                    <DoneIcon fontSize='inherit' sx={{ color: markedCorrect ? 'green' : 'inherit' }} />
                    <span>{shortenNumber(correctNum, 2, false)}</span>
                  </Button>
                </Tooltip>

                <Tooltip title={"Bookmark this node."} placement='top'>
                  <Button
                    onClick={bookmark}
                    sx={{ minWidth: 'auto', fontSize: '15px', p: '4px 7px', color: bookmarked ? theme => theme.palette.common.orange : 'inherit' }}>
                    {bookmarked ? <BookmarkIcon fontSize='inherit' /> : <BookmarkBorderIcon fontSize='inherit' />}
                    <span>{shortenNumber(bookmarks, 2, false)}</span>
                  </Button>
                </Tooltip>

                <Tooltip
                  title={!isStudied ? 'Mark this node as "studied."' : 'Mark this node as "not studied."'}
                  placement='top'
                >
                  <Button
                    onClick={markStudied}
                    sx={{ minWidth: 'auto', fontSize: '15px', p: '4px 7px', color: isStudied ? theme => theme.palette.common.orange : 'inherit' }}>
                    {isStudied ? <DraftsIcon fontSize='inherit' /> : <MailIcon fontSize='inherit' />}
                    <span>{shortenNumber(studied, 2, false)}</span>
                  </Button>
                </Tooltip>

                {/* <MetaButton
                  onClick={wrongNode}
                  tooltip="Vote to delete node."
                  tooltipPosition="Top"
                >
                  <i className={"material-icons " + (markedWrong ? "red-text" : "grey-text")}>
                    close
                  </i>
                  <span>{shortenNumber(wrongNum, 2, false)}</span>
                </MetaButton> */}

                {/* <MetaButton
                  onClick={correctNode}
                  tooltip="Vote to prevent further changes."
                  tooltipPosition="Top"
                >
                  <i
                    className={
                      "material-icons DoneIcon " +
                      (markedCorrect ? "green-text" : "grey-text")
                    }
                  >
                    done
                  </i>
                  <span>{shortenNumber(correctNum, 2, false)}</span>
                </MetaButton> */}

                {/* <MetaButton
                    tooltip="# of 1Admins who have awarded this node."
                    tooltipPosition="Top"
                  >
                  <i
                    className={"material-icons "
                      (markedAdmired
                        ? "amber-text"
                        : "amber-text text-lighten-3")
                    }
                  >grade</i>
                  <span>{shortenNumber(admiredNum, 2, false)}</span>
                </MetaButton> */}
                {/* <MetaButton
                  onClick={bookmark}
                  tooltip="Bookmark this node."
                  // {
                  //   `You've ${
                  //     !bookmarked ? "not " : ""
                  //   }bookmarked this node. ` +
                  //   shortenNumber(bookmarks, 2, false) +
                  //   " 1Cademist" +
                  //   (bookmarks === 1 ? " has" : "s have") +
                  //   " bookmarked this node."
                  // }
                  tooltipPosition="Top"
                >
                  <i
                    className={"material-icons " + (bookmarked ? "orange-text" : "grey-text")}
                  >
                    {bookmarked ? "bookmark" : "bookmark_border"}
                  </i>
                  <span>{shortenNumber(bookmarks, 2, false)}</span>
                </MetaButton> */}
                {/* <MetaButton
                  onClick={markStudied}
                  tooltip={
                    !isStudied
                      ? 'Mark this node as "studied."'
                      : 'Mark this node as "not studied."'
                  }
                  // {
                  //   (!isStudied
                  //     ? "You've not marked this node as Studied. "
                  //     : `This node is ${
                  //         changed ? "changed" : "not chagned"
                  //       } since the last time you marked it as Studied. `) +
                  //   shortenNumber(studied, 2, false) +
                  //   " 1Cademist" +
                  //   (studied === 1 ? " has" : "s have") +
                  //   " studied this node."
                  // }
                  tooltipPosition="Top"
                >
                  <i className={"material-icons SeparateIcon grey-text"}>
                    {isStudied ? "drafts" : "mail"}
                  </i>
                  <span>{shortenNumber(studied, 2, false)}</span>
                </MetaButton> */}
                {/* <MetaButton
                    tooltip="# of 1Cademists who have this node visible on their map."
                    tooltipPosition="Top"
                  >
                  <i className="material-icons grey-text">visibility</i>
                  <span>{shortenNumber(viewers, 2, false)}</span>
                </MetaButton> */}
              </>
            )}
            <Tooltip title={"View parent and child nodes."} placement='top'>
              <Button
                onClick={selectLinkingWords}
                sx={{ width: 'auto', color: openPart === 'LinkingWords' ? theme => theme.palette.common.orange : 'inherit' }}>
                <span className="">{shortenNumber(parents.length, 2, false)}</span>
                <SwapHorizIcon fontSize='inherit' />
                <span>{shortenNumber(nodesChildren.length, 2, false)}</span>
              </Button>
            </Tooltip>

            {/* <MetaButton
              onClick={selectLinkingWords}
              tooltip="View parent and child nodes."
              // {
              //   "This node has " +
              //   shortenNumber(parents.length, 2, false) +
              //   " parent node" +
              //   (parents.length === 1 ? "" : "s") +
              //   " and " +
              //   shortenNumber(children.length, 2, false) +
              //   " child node" +
              //   (children.length === 1 ? "." : "s.") +
              //   " Click to see the child and parent nodes of this node."
              // }
              tooltipPosition="Top"
            >
              <span className="FooterParentNodesOpen">
                {shortenNumber(parents.length, 2, false)}
              </span>
              <i
                className={
                  "material-icons " +
                  (openPart === "LinkingWords" ? "orange-text" : "grey-text")
                }
              >
                swap_horiz
              </i>
              <span>{shortenNumber(children.length, 2, false)}</span>
            </MetaButton> */}
          </>
        ) : (
          <>
            <Tooltip
              title={
                shortenNumber(correctNum, 2, false) +
                " 1Cademist" +
                (correctNum === 1 ? " has" : "s have") +
                " found this node helpful and " +
                shortenNumber(wrongNum, 2, false) +
                " found it unhelpful."
              }
              placement='top'>
              <Box sx={{ display: 'flex', alignItems: 'center', p: '4px 7px', fontSize: '15px' }}>
                <CloseIcon fontSize='inherit' sx={{ color: markedWrong ? 'red' : 'inherit' }} />
                <span>{shortenNumber(wrongNum, 2, false)}</span>
                <DoneIcon fontSize='inherit' sx={{ color: markedCorrect ? 'green' : 'inherit' }} />
                <span>{shortenNumber(wrongNum, 2, false)}</span>
              </Box>
            </Tooltip>

            <Tooltip
              title={`You've ${!bookmarked ? "not " : ""}bookmarked this node. ` +
                shortenNumber(bookmarks, 2, false) +
                " 1Cademist" +
                (bookmarks === 1 ? " has" : "s have") +
                " bookmarked this node."}
              placement='top'>
              <Box sx={{ display: 'flex', alignItems: 'center', p: '4px 7px', fontSize: '15px' }}>
                {bookmarked
                  ? <BookmarkIcon fontSize='inherit' sx={{ color: bookmarked ? theme => theme.palette.common.orange : 'inherit' }} />
                  : <BookmarkBorderIcon fontSize='inherit' sx={{ color: bookmarked ? theme => theme.palette.common.orange : 'inherit' }} />}
                <span>{shortenNumber(bookmarks, 2, false)}</span>
              </Box>
            </Tooltip>

            <Tooltip
              title={"This node has " +
                shortenNumber(parents.length, 2, false) +
                " parent node" +
                (parents.length === 1 ? "" : "s") +
                " and " +
                shortenNumber(nodesChildren.length, 2, false) +
                " child node" +
                (nodesChildren.length === 1 ? "." : "s.")}
              placement='top'>
              <Box sx={{ display: 'flex', alignItems: 'center', p: '4px 7px', fontSize: '15px' }}>
                <span /*className="FooterParentNodesClosed"*/>
                  {shortenNumber(parents.length, 2, false)}
                </span>
                <SwapHorizIcon fontSize='inherit' />
                <span>{shortenNumber(nodesChildren.length, 2, false)}</span>
              </Box>
            </Tooltip>

            {/* <MetaButton
              tooltip={
                shortenNumber(correctNum, 2, false) +
                " 1Cademist" +
                (correctNum === 1 ? " has" : "s have") +
                " found this node helpful and " +
                shortenNumber(wrongNum, 2, false) +
                " found it unhelpful."
              }
            >
              <i
                className={
                  "material-icons " +
                  (markedWrong ? "red-text more-left-padding" : "grey-text more-left-padding")
                }
              >
                close
              </i>
              <span>{shortenNumber(wrongNum, 2, false)}</span>
              <i className={"material-icons " + (markedCorrect ? "green-text" : "grey-text")}>
                done
              </i>
              <span>{shortenNumber(correctNum, 2, false)}</span>
            </MetaButton> */}
            {/* <MetaButton
              tooltip={
                `You've ${!bookmarked ? "not " : ""}bookmarked this node. ` +
                shortenNumber(bookmarks, 2, false) +
                " 1Cademist" +
                (bookmarks === 1 ? " has" : "s have") +
                " bookmarked this node."
              }
            >
              <i className={"material-icons " + (bookmarked ? "orange-text" : "grey-text")}>
                {bookmarked ? "bookmark" : "bookmark_border"}
              </i>
              <span>{shortenNumber(bookmarks, 2, false)}</span>
            </MetaButton> */}
            {/* <MetaButton tooltip="# of 1Cademists who have studied this node.">
              <i
                className={
                  "material-icons " + (
                  studied
                    ? "orange-text"
                    : "grey-text"
                  )}
              >school</i>
              <span>{shortenNumber(studied, 2, false)}</span>
            </MetaButton> */}
            {/* <MetaButton
              tooltip={
                "This node has " +
                shortenNumber(parents.length, 2, false) +
                " parent node" +
                (parents.length === 1 ? "" : "s") +
                " and " +
                shortenNumber(children.length, 2, false) +
                " child node" +
                (children.length === 1 ? "." : "s.")
              }
            >
              <span className="FooterParentNodesClosed">
                {shortenNumber(parents.length, 2, false)}
              </span>
              <i className="material-icons grey-text">swap_horiz</i>
              <span>{shortenNumber(children.length, 2, false)}</span>
            </MetaButton> */}
            {/* <MetaButton tooltip="# of 1Cademists who have this node visible on their map.">
              <i className="material-icons grey-text">visibility</i>
              <span>{shortenNumber(viewers, 2, false)}</span>
            </MetaButton> */}
          </>
        )}
      </Box>
    </Box>
  );

  //   return (
  //     <Box className="footer">
  //       <Box className="NodeFooter Left" sx={{ display: 'flex' }}>
  //         {open &&
  //           (isNew ? (
  //             <MemoizedUserStatusIcon
  //               uname={user.uname}
  //               imageUrl={user.imageUrl || ""}
  //               fullname={user.fName + " " + user.lName}
  //               chooseUname={user.chooseUname}
  //               online={false}
  //               inUserBar={false}
  //               inNodeFooter={true}
  //               reloadPermanentGrpah={reloadPermanentGrpah}
  //             />
  //           ) : (
  //             <MemoizedUserStatusIcon
  //               uname={admin}
  //               imageUrl={aImgUrl}
  //               fullname={aFullname}
  //               chooseUname={aChooseUname}
  //               online={false}
  //               inUserBar={false}
  //               inNodeFooter={true}
  //               reloadPermanentGrpah={reloadPermanentGrpah}
  //             />
  //           ))}
  //         <NodeTypeIcon nodeType={nodeType} tooltipPlacement={"top"} />
  //       </Box>
  //       <Box className="NodeFooter Right">
  //         {open ? (
  //           <>
  //             {!editable && !unaccepted ? (
  //               // Accepted nodes
  //               <>
  //                 <Tooltip title="Adjust the node height." placement='top'>
  //                   <IconButton onClick={() => console.log('nodeChanged')} >
  //                     <HeightIcon fontSize='inherit' />
  //                   </IconButton>
  //                 </Tooltip>
  //                 <Tooltip title={isSpeaking ? "Stop narration." : "Narrate the node."} placement='top'>
  //                   <IconButton onClick={() => console.log('narrateNode')} >
  //                     {isSpeaking ? <VoiceOverOffIcon fontSize='small' /> : <RecordVoiceOverIcon fontSize='small' />}
  //                   </IconButton>
  //                 </Tooltip>
  //                 {/* <MetaButton
  //                   onClick={selectAcceptedProposals}
  //                   tooltip="See version history."
  //                   tooltipPosition="Top"
  //                 >
  //                   <i
  //                     className={
  //                       "material-icons SeparateIcon " +
  //                       (acceptedProposalsSelected ? "orange-text" : "grey-text")
  //                     }
  //                   >
  //                     event_available
  //                   </i>
  //                   <span>{dayjs(changedAt).fromNow()}</span>
  //                 </MetaButton> */}
  //                 <Tooltip title={"Propose/evaluate versions of this node."} placement='top'>
  //                   <Button onClick={() => console.log('selectPendingProposals')} >
  //                     <CreateIcon fontSize='small' />{` ${dayjs(new Date(changedAt.seconds * 1000)).fromNow()}`}
  //                   </Button>
  //                 </Tooltip>
  //                 {/* <MetaButton
  //                   onClick={selectPendingProposals}
  //                   tooltip="Propose/evaluate versions of this node."
  //                   // {
  //                   //   shortenNumber(proposalsNum, 2, false) +
  //                   //   " proposal" +
  //                   //   (proposalsNum > 1 ? "s" : "") +
  //                   //   " exist" +
  //                   //   (proposalsNum === 1 ? "s" : "") +
  //                   //   " on this node. Click to propose an improvement or review a proposal on the pending proposals list."
  //                   // }
  //                   tooltipPosition="Top"
  //                 >
  //                   <i
  //                     className={
  //                       "material-icons " + (proposalsSelected ? "orange-text" : "grey-text")
  //                     }
  //                   >
  //                     create
  //                   </i>
  //                   <span>{dayjs(changedAt).fromNow()}</span>
  //                    // <span>{shortenNumber(proposalsNum, 2, false)}</span> 
  //                 </MetaButton> */}
  //               </>
  //             ) : (
  //               // new Node or unaccepted proposal
  //               <>
  //                 {/* CHECK: I commented this, please uncomented when work in proposal */}
  //                 {/* <input
  //                   type="file"
  //                   ref={inputEl}
  //                   onChange={uploadNodeImageHandler}
  //                   hidden="hidden"
  //                 />
  //                 <MetaButton
  //                   onClick={uploadImageClicked}
  //                   tooltip="Upload an image for this node."
  //                   tooltipPosition="Top"
  //                 >
  //                   <i className="material-icons grey-text ImageUploadButton">
  //                     photo_size_select_actual
  //                   </i>
  //                   {isUploading && (
  //                     <>
  //                       <div className="preloader-wrapper active small ImageUploadButtonLoader">
  //                         <div className="spinner-layer spinner-yellow-only">
  //                           <div className="circle-clipper left">
  //                             <div className="circle"></div>
  //                           </div>
  //                         </div>
  //                       </div>
  //                       <span className="ImageUploadPercentage">{percentageUploaded + "%"}</span>
  //                     </>
  //                   )}
  //                 </MetaButton> */}
  //               </>
  //             )}

  //             {!editable && !unaccepted && nodeType === "Reference" ? (
  //               <>
  //                 <MetaButton
  //                   onClick={selectCitations}
  //                   tooltip="View nodes that have cited this node."
  //                   tooltipPosition="Top"
  //                 >
  //                   {citationsSelected ? (
  //                     <>
  //                       <i className="material-icons orange-text">arrow_forward</i>
  //                       <i className="material-icons SeparateIcon orange-text">menu_book</i>
  //                     </>
  //                   ) : (
  //                     <>
  //                       <i className="material-icons grey-text">arrow_forward</i>
  //                       <i className="material-icons SeparateIcon grey-text">menu_book</i>
  //                     </>
  //                   )}
  //                   {/* ********************************************************
  //                   Retrieve all the nodes that are citing this from the nodes collection.
  //                   ******************************************************** */}
  //                   <span>{shortenNumber(citations[identifier].size, 2, false)}</span>
  //                 </MetaButton>
  //                 <MetaButton
  //                   onClick={selectTags}
  //                   tooltip="View tags assigned to this node."
  //                   tooltipPosition="Top"
  //                 >
  //                   <i
  //                     className={
  //                       "material-icons " + (openPart === "Tags" ? "orange-text" : "grey-text")
  //                     }
  //                   >
  //                     local_offer
  //                   </i>
  //                   <span>{shortenNumber(tags.length, 2, false)}</span>
  //                 </MetaButton>
  //               </>
  //             ) : (
  //               <MetaButton
  //                 onClick={selectReferences}
  //                 tooltip="View tags and citations used in this node."
  //                 tooltipPosition="Top"
  //               >
  //                 <i
  //                   className={
  //                     "material-icons SeparateIcon " +
  //                     (openPart === "References" ? "orange-text" : "grey-text")
  //                   }
  //                 >
  //                   menu_book
  //                 </i>
  //                 <span className="CitationsSpanBeforeTagIcon">
  //                   {shortenNumber(references.length, 2, false)} |
  //                 </span>
  //                 <i
  //                   className={
  //                     "material-icons FooterTagIcon " +
  //                     (openPart === "References" ? "orange-text" : "grey-text")
  //                   }
  //                 >
  //                   local_offer
  //                 </i>
  //                 <span>{shortenNumber(tags.length, 2, false)}</span>
  //               </MetaButton>
  //             )}
  //             {!editable && !unaccepted && (
  //               <>
  //                 {/* //                 <MetaButton
  //                   //                  onClick={event => {}}
  //                   //                  tooltip="# of comments and Q&amp;As about this node."
  //                   //                    tooltipPosition="Top"
  //                   //                >
  //                   //                  <i
  //                   //                    className={
  //                   //                      "material-icons " + 
  //                   //                      (activeNode &&
  //                   //                      commentsSelected
  //                   //                        ? "orange-text"
  //                   //                        : "grey-text"
  //                   //                      )}
  //                   //                  >forum</i>
  //                   //                  <span>{shortenNumber(commentsNum, 2, false)}</span>
  //                   //                </MetaButton>  */}
  //                 <MetaButton
  //                   onClick={wrongNode}
  //                   tooltip="Vote to delete node."
  //                   tooltipPosition="Top"
  //                 >
  //                   <i className={"material-icons " + (markedWrong ? "red-text" : "grey-text")}>
  //                     close
  //                   </i>
  //                   <span>{shortenNumber(wrongNum, 2, false)}</span>
  //                 </MetaButton>
  //                 <MetaButton
  //                   onClick={correctNode}
  //                   tooltip="Vote to prevent further changes."
  //                   tooltipPosition="Top"
  //                 >
  //                   <i
  //                     className={
  //                       "material-icons DoneIcon " +
  //                       (markedCorrect ? "green-text" : "grey-text")
  //                     }
  //                   >
  //                     done
  //                   </i>
  //                   <span>{shortenNumber(correctNum, 2, false)}</span>
  //                 </MetaButton>
  //                 {/* //                 <MetaButton
  //                   //                    tooltip="# of 1Admins who have awarded this node."
  //                   //                    tooltipPosition="Top"
  //                   //                  >
  //                   //                  <i
  //                   //                    className={"material-icons "
  //                   //                      (markedAdmired
  //                   //                        ? "amber-text"
  //                   //                        : "amber-text text-lighten-3")
  //                   //                    }
  //                   //                  >grade</i>
  //                   //                  <span>{shortenNumber(admiredNum, 2, false)}</span>
  //                   //</MetaButton>  */}
  //                 <MetaButton
  //                   onClick={bookmark}
  //                   tooltip="Bookmark this node."
  //                   // {
  //                   //   `You've ${
  //                   //     !bookmarked ? "not " : ""
  //                   //   }bookmarked this node. ` +
  //                   //   shortenNumber(bookmarks, 2, false) +
  //                   //   " 1Cademist" +
  //                   //   (bookmarks === 1 ? " has" : "s have") +
  //                   //   " bookmarked this node."
  //                   // }
  //                   tooltipPosition="Top"
  //                 >
  //                   <i
  //                     className={"material-icons " + (bookmarked ? "orange-text" : "grey-text")}
  //                   >
  //                     {bookmarked ? "bookmark" : "bookmark_border"}
  //                   </i>
  //                   <span>{shortenNumber(bookmarks, 2, false)}</span>
  //                 </MetaButton>
  //                 <MetaButton
  //                   onClick={markStudied}
  //                   tooltip={
  //                     !isStudied
  //                       ? 'Mark this node as "studied."'
  //                       : 'Mark this node as "not studied."'
  //                   }
  //                   // {
  //                   //   (!isStudied
  //                   //     ? "You've not marked this node as Studied. "
  //                   //     : `This node is ${
  //                   //         changed ? "changed" : "not chagned"
  //                   //       } since the last time you marked it as Studied. `) +
  //                   //   shortenNumber(studied, 2, false) +
  //                   //   " 1Cademist" +
  //                   //   (studied === 1 ? " has" : "s have") +
  //                   //   " studied this node."
  //                   // }
  //                   tooltipPosition="Top"
  //                 >
  //                   <i className={"material-icons SeparateIcon grey-text"}>
  //                     {isStudied ? "drafts" : "mail"}
  //                   </i>
  //                   <span>{shortenNumber(studied, 2, false)}</span>
  //                   {/* </MetaButton>
  //  //                 <MetaButton
  //  //                    tooltip="# of 1Cademists who have this node visible on their map."
  //  //                    tooltipPosition="Top"
  //  //                  >
  //  //                  <i className="material-icons grey-text">visibility</i>
  //  //                  <span>{shortenNumber(viewers, 2, false)}</span>
  //  //                </MetaButton>  */}
  //                 </>
  //         )}
  //                 <MetaButton
  //                   onClick={selectLinkingWords}
  //                   tooltip="View parent and child nodes."
  //                   // {
  //                   //   "This node has " +
  //                   //   shortenNumber(parents.length, 2, false) +
  //                   //   " parent node" +
  //                   //   (parents.length === 1 ? "" : "s") +
  //                   //   " and " +
  //                   //   shortenNumber(children.length, 2, false) +
  //                   //   " child node" +
  //                   //   (children.length === 1 ? "." : "s.") +
  //                   //   " Click to see the child and parent nodes of this node."
  //                   // }
  //                   tooltipPosition="Top"
  //                 >
  //                   <span className="FooterParentNodesOpen">
  //                     {shortenNumber(parents.length, 2, false)}
  //                   </span>
  //                   <i
  //                     className={
  //                       "material-icons " +
  //                       (openPart === "LinkingWords" ? "orange-text" : "grey-text")
  //                     }
  //                   >
  //                     swap_horiz
  //                   </i>
  //                   <span>{shortenNumber(children.length, 2, false)}</span>
  //                 </MetaButton>
  //               </>
  //             ) : (
  //             // Node is close
  //             <Box sx={{ display: 'flex' }}>
  //               <Tooltip
  //                 title={shortenNumber(correctNum, 2, false) + " 1Cademist" + (correctNum === 1 ? " has" : "s have") + " found this node helpful and " + shortenNumber(wrongNum, 2, false) + " found it unhelpful."}
  //                 placement='top'>
  //                 <Box sx={{ display: 'flex', alignItems: 'center', p: '4px 7px' }}>
  //                   <CloseIcon fontSize='small' />
  //                   <span>{shortenNumber(wrongNum, 2, false)}</span>
  //                   <DoneIcon fontSize='small' />
  //                   <span>{shortenNumber(wrongNum, 2, false)}</span>
  //                 </Box>
  //               </Tooltip>
  //               {/* <MetaButton
  //               tooltip={
  //                 shortenNumber(correctNum, 2, false) +
  //                 " 1Cademist" +
  //                 (correctNum === 1 ? " has" : "s have") +
  //                 " found this node helpful and " +
  //                 shortenNumber(wrongNum, 2, false) +
  //                 " found it unhelpful."
  //               }
  //             >
  //               <i
  //                 className={
  //                   "material-icons " +
  //                   (markedWrong ? "red-text more-left-padding" : "grey-text more-left-padding")
  //                 }
  //               >
  //                 close
  //               </i>
  //               <span>{shortenNumber(wrongNum, 2, false)}</span>
  //               <i className={"material-icons " + (markedCorrect ? "green-text" : "grey-text")}>
  //                 done
  //               </i>
  //               <span>{shortenNumber(correctNum, 2, false)}</span>
  //             </MetaButton> */}
  //               <Tooltip
  //                 title={`You've ${!bookmarked ? "not " : ""}bookmarked this node. ` +
  //                   shortenNumber(bookmarks, 2, false) +
  //                   " 1Cademist" +
  //                   (bookmarks === 1 ? " has" : "s have") +
  //                   " bookmarked this node."}
  //                 placement='top'>
  //                 <Box sx={{ display: 'flex', alignItems: 'center', p: '4px 7px' }}>
  //                   {bookmarked ? <BookmarkIcon fontSize='small' /> : <BookmarkBorderIcon fontSize='small' />}
  //                   <span>{shortenNumber(bookmarks, 2, false)}</span>
  //                 </Box>
  //               </Tooltip>
  //               {/* <MetaButton
  //               tooltip={
  //                 `You've ${!bookmarked ? "not " : ""}bookmarked this node. ` +
  //                 shortenNumber(bookmarks, 2, false) +
  //                 " 1Cademist" +
  //                 (bookmarks === 1 ? " has" : "s have") +
  //                 " bookmarked this node."
  //               }
  //             >
  //               <i className={"material-icons " + (bookmarked ? "orange-text" : "grey-text")}>
  //                 {bookmarked ? "bookmark" : "bookmark_border"}
  //               </i>
  //               <span>{shortenNumber(bookmarks, 2, false)}</span>
  //             </MetaButton> */}
  //               {/* //             <MetaButton tooltip="# of 1Cademists who have studied this node.">
  // //              <i
  // //                className={
  // //                  "material-icons " + (
  // //                  studied
  // //                    ? "orange-text"
  // //                    : "grey-text"
  // //                  )}
  // //              >school</i>
  // //              <span>{shortenNumber(studied, 2, false)}</span>
  // //            </MetaButton>  */}
  //               <Tooltip
  //                 title={"This node has " +
  //                   shortenNumber(parents.length, 2, false) +
  //                   " parent node" +
  //                   (parents.length === 1 ? "" : "s") +
  //                   " and " +
  //                   shortenNumber(nodesChildren.length, 2, false) +
  //                   " child node" +
  //                   (nodesChildren.length === 1 ? "." : "s.")}
  //                 placement='top'>
  //                 <Box sx={{ display: 'flex', alignItems: 'center', p: '4px 7px' }}>
  //                   <span /*className="FooterParentNodesClosed"*/>
  //                     {shortenNumber(parents.length, 2, false)}
  //                   </span>
  //                   <SwapHorizIcon fontSize='small' />
  //                   <span>{shortenNumber(nodesChildren.length, 2, false)}</span>
  //                 </Box>
  //               </Tooltip>
  //               {/* <MetaButton
  //               tooltip={
  //                 "This node has " +
  //                 shortenNumber(parents.length, 2, false) +
  //                 " parent node" +
  //                 (parents.length === 1 ? "" : "s") +
  //                 " and " +
  //                 shortenNumber(children.length, 2, false) +
  //                 " child node" +
  //                 (children.length === 1 ? "." : "s.")
  //               }
  //             >
  //               <span className="FooterParentNodesClosed">
  //                 {shortenNumber(parents.length, 2, false)}
  //               </span>
  //               <i className="material-icons grey-text">swap_horiz</i>
  //               <span>{shortenNumber(children.length, 2, false)}</span>
  //             </MetaButton> */}
  //               {/* // <MetaButton tooltip="# of 1Cademists who have this node visible on their map.">
  // //              <i className="material-icons grey-text">visibility</i>
  // //              <span>{shortenNumber(viewers, 2, false)}</span>
  // //            </MetaButton>  */}
  //             </Box>
  //         )}
  //           </Box>
  //     </Box >
  //       )
}

export const MemoizedNodeFooter = React.memo(NodeFooter);