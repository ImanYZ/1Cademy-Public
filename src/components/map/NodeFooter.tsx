import CreateIcon from '@mui/icons-material/Create';
import { AddBoxOutlined } from '@mui/icons-material';
import HeightIcon from '@mui/icons-material/Height';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VoiceOverOffIcon from '@mui/icons-material/VoiceOverOff';
import { Button, IconButton, Tooltip } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react'

import { User } from '../../knowledgeTypes';
import NodeTypeIcon from '../NodeTypeIcon';
import { MemoizedUserStatusIcon } from './UserStatusIcon';

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
  openPart: any,
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
  children: any,
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

const NodeFooter = (props: NodeFooterProps) => {

  const [isSpeaking, setIsSpeaking] = useState(false);

  return (
    <Box>
      <Box className="NodeFooter Left">
        {props.open &&
          (props.isNew ? (
            <MemoizedUserStatusIcon
              uname={props.user.uname}
              imageUrl={props.user.imageUrl || ""}
              fullname={props.user.fName + " " + props.user.lName}
              chooseUname={props.user.chooseUname}
              online={false}
              inUserBar={false}
              inNodeFooter={true}
              reloadPermanentGrpah={props.reloadPermanentGrpah}
            />
          ) : (
            <MemoizedUserStatusIcon
              uname={props.admin}
              imageUrl={props.aImgUrl}
              fullname={props.aFullname}
              chooseUname={props.aChooseUname}
              online={false}
              inUserBar={false}
              inNodeFooter={true}
              reloadPermanentGrpah={props.reloadPermanentGrpah}
            />
          ))}
        <Tooltip title={`This is 
            ${props.nodeType[0] == "A" ||
            props.nodeType[0] == "E" ||
            props.nodeType[0] == "I" ||
            props.nodeType[0] == "O" ||
            props.nodeType[0] == "U"
            ? "an"
            : "a"}
              ${props.nodeType} node.`}>
          <NodeTypeIcon nodeType={props.nodeType} />
        </Tooltip>
      </Box>
      <Box className="NodeFooter Right">
        {props.open ? (
          <>
            {!props.editable && !props.unaccepted ? (
              // Accepted nodes
              <>
                <Tooltip title="Adjust the node height." placement='top'>
                  <IconButton onClick={() => console.log('props.nodeChanged')} >
                    <HeightIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isSpeaking ? "Stop narration." : "Narrate the node."} placement='top'>
                  <IconButton onClick={() => console.log('narrateNode')} >
                    {isSpeaking ? <RecordVoiceOverIcon /> : <VoiceOverOffIcon />}
                  </IconButton>
                </Tooltip>
                {/* <MetaButton
                  onClick={selectAcceptedProposals}
                  tooltip="See version history."
                  tooltipPosition="Top"
                >
                  <i
                    className={
                      "material-icons SeparateIcon " +
                      (props.acceptedProposalsSelected ? "orange-text" : "grey-text")
                    }
                  >
                    event_available
                  </i>
                  <span>{dayjs(props.changedAt).fromNow()}</span>
                </MetaButton> */}
                <Tooltip title={"Propose/evaluate versions of this node."} placement='top'>
                  <Button onClick={() => console.log('selectPendingProposals')} >
                    <CreateIcon />{` ${dayjs(props.changedAt).fromNow()}`}
                  </Button>
                </Tooltip>
                {/* <MetaButton
                  onClick={selectPendingProposals}
                  tooltip="Propose/evaluate versions of this node."
                  // {
                  //   shortenNumber(props.proposalsNum, 2, false) +
                  //   " proposal" +
                  //   (props.proposalsNum > 1 ? "s" : "") +
                  //   " exist" +
                  //   (props.proposalsNum === 1 ? "s" : "") +
                  //   " on this node. Click to propose an improvement or review a proposal on the pending proposals list."
                  // }
                  tooltipPosition="Top"
                >
                  <i
                    className={
                      "material-icons " + (props.proposalsSelected ? "orange-text" : "grey-text")
                    }
                  >
                    create
                  </i>
                  <span>{dayjs(props.changedAt).fromNow()}</span>
                   // <span>{shortenNumber(props.proposalsNum, 2, false)}</span> 
                </MetaButton> */}
              </>
            ) : (
              // new Node or unaccepted proposal
              <>
                {/* CHECK: I commented this, please uncomented when work in proposal */}
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
                      <div className="preloader-wrapper active small ImageUploadButtonLoader">
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
            {/* here other code */}
          </>
        ) : (
          // note open
        )}
      </Box>
    </Box>
  )
}

export const MemoizedNodeFooter = React.memo(NodeFooter);



{/* <>
// note open
            <MetaButton
              tooltip={
                shortenNumber(props.correctNum, 2, false) +
                " 1Cademist" +
                (props.correctNum === 1 ? " has" : "s have") +
                " found this node helpful and " +
                shortenNumber(props.wrongNum, 2, false) +
                " found it unhelpful."
              }
            >
              <i
                className={
                  "material-icons " +
                  (props.markedWrong ? "red-text more-left-padding" : "grey-text more-left-padding")
                }
              >
                close
              </i>
              <span>{shortenNumber(props.wrongNum, 2, false)}</span>
              <i className={"material-icons " + (props.markedCorrect ? "green-text" : "grey-text")}>
                done
              </i>
              <span>{shortenNumber(props.correctNum, 2, false)}</span>
            </MetaButton>
            <MetaButton
              tooltip={
                `You've ${!props.bookmarked ? "not " : ""}bookmarked this node. ` +
                shortenNumber(props.bookmarks, 2, false) +
                " 1Cademist" +
                (props.bookmarks === 1 ? " has" : "s have") +
                " bookmarked this node."
              }
            >
              <i className={"material-icons " + (props.bookmarked ? "orange-text" : "grey-text")}>
                {props.bookmarked ? "bookmark" : "bookmark_border"}
              </i>
              <span>{shortenNumber(props.bookmarks, 2, false)}</span>
            </MetaButton>
//             <MetaButton tooltip="# of 1Cademists who have studied this node.">
//              <i
//                className={
//                  "material-icons " + (
//                  props.studied
//                    ? "orange-text"
//                    : "grey-text"
//                  )}
//              >school</i>
//              <span>{shortenNumber(props.studied, 2, false)}</span>
//            </MetaButton> 
<MetaButton
  tooltip={
    "This node has " +
    shortenNumber(props.parents.length, 2, false) +
    " parent node" +
    (props.parents.length === 1 ? "" : "s") +
    " and " +
    shortenNumber(props.children.length, 2, false) +
    " child node" +
    (props.children.length === 1 ? "." : "s.")
  }
>
  <span className="FooterParentNodesClosed">
    {shortenNumber(props.parents.length, 2, false)}
  </span>
  <i className="material-icons grey-text">swap_horiz</i>
  <span>{shortenNumber(props.children.length, 2, false)}</span>
</MetaButton>
// <MetaButton tooltip="# of 1Cademists who have this node visible on their map.">
//              <i className="material-icons grey-text">visibility</i>
//              <span>{shortenNumber(props.viewers, 2, false)}</span>
//            </MetaButton> 
          </> 
*/}



// {!props.editable && !props.unaccepted && props.nodeType === "Reference" ? (
//               <>
//                 <MetaButton
//                   onClick={selectCitations}
//                   tooltip="View nodes that have cited this node."
//                   tooltipPosition="Top"
//                 >
//                   {props.citationsSelected ? (
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
//                   ********************************************************
//                   Retrieve all the nodes that are citing this from the nodes collection.
//                   ********************************************************
//                   <span>{shortenNumber(citations[props.identifier].size, 2, false)}</span>
//                 </MetaButton>
//                 <MetaButton
//                   onClick={selectTags}
//                   tooltip="View tags assigned to this node."
//                   tooltipPosition="Top"
//                 >
//                   <i
//                     className={
//                       "material-icons " + (props.openPart === "Tags" ? "orange-text" : "grey-text")
//                     }
//                   >
//                     local_offer
//                   </i>
//                   <span>{shortenNumber(props.tags.length, 2, false)}</span>
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
//                     (props.openPart === "References" ? "orange-text" : "grey-text")
//                   }
//                 >
//                   menu_book
//                 </i>
//                 <span className="CitationsSpanBeforeTagIcon">
//                   {shortenNumber(props.references.length, 2, false)} |
//                 </span>
//                 <i
//                   className={
//                     "material-icons FooterTagIcon " +
//                     (props.openPart === "References" ? "orange-text" : "grey-text")
//                   }
//                 >
//                   local_offer
//                 </i>
//                 <span>{shortenNumber(props.tags.length, 2, false)}</span>
//               </MetaButton>
//             )}
//             {!props.editable && !props.unaccepted && (
//               <>
// //                 <MetaButton
// //                  onClick={event => {}}
// //                  tooltip="# of comments and Q&amp;As about this node."
// //                    tooltipPosition="Top"
// //                >
// //                  <i
// //                    className={
// //                      "material-icons " + 
// //                      (props.activeNode &&
// //                      props.commentsSelected
// //                        ? "orange-text"
// //                        : "grey-text"
// //                      )}
// //                  >forum</i>
// //                  <span>{shortenNumber(props.commentsNum, 2, false)}</span>
// //                </MetaButton> 
//                 <MetaButton
//                   onClick={props.wrongNode}
//                   tooltip="Vote to delete node."
//                   tooltipPosition="Top"
//                 >
//                   <i className={"material-icons " + (props.markedWrong ? "red-text" : "grey-text")}>
//                     close
//                   </i>
//                   <span>{shortenNumber(props.wrongNum, 2, false)}</span>
//                 </MetaButton>
//                 <MetaButton
//                   onClick={props.correctNode}
//                   tooltip="Vote to prevent further changes."
//                   tooltipPosition="Top"
//                 >
//                   <i
//                     className={
//                       "material-icons DoneIcon " +
//                       (props.markedCorrect ? "green-text" : "grey-text")
//                     }
//                   >
//                     done
//                   </i>
//                   <span>{shortenNumber(props.correctNum, 2, false)}</span>
//                 </MetaButton>
// //                 <MetaButton
// //                    tooltip="# of 1Admins who have awarded this node."
// //                    tooltipPosition="Top"
// //                  >
// //                  <i
// //                    className={"material-icons "
// //                      (props.markedAdmired
// //                        ? "amber-text"
// //                        : "amber-text text-lighten-3")
// //                    }
// //                  >grade</i>
// //                  <span>{shortenNumber(props.admiredNum, 2, false)}</span>
//                 //</MetaButton> 
//                 <MetaButton
//                   onClick={props.bookmark}
//                   tooltip="Bookmark this node."
//                   // {
//                   //   `You've ${
//                   //     !props.bookmarked ? "not " : ""
//                   //   }bookmarked this node. ` +
//                   //   shortenNumber(props.bookmarks, 2, false) +
//                   //   " 1Cademist" +
//                   //   (props.bookmarks === 1 ? " has" : "s have") +
//                   //   " bookmarked this node."
//                   // }
//                   tooltipPosition="Top"
//                 >
//                   <i
//                     className={"material-icons " + (props.bookmarked ? "orange-text" : "grey-text")}
//                   >
//                     {props.bookmarked ? "bookmark" : "bookmark_border"}
//                   </i>
//                   <span>{shortenNumber(props.bookmarks, 2, false)}</span>
//                 </MetaButton>
//                 <MetaButton
//                   onClick={props.markStudied}
//                   tooltip={
//                     !props.isStudied
//                       ? 'Mark this node as "studied."'
//                       : 'Mark this node as "not studied."'
//                   }
//                   // {
//                   //   (!props.isStudied
//                   //     ? "You've not marked this node as Studied. "
//                   //     : `This node is ${
//                   //         props.changed ? "changed" : "not chagned"
//                   //       } since the last time you marked it as Studied. `) +
//                   //   shortenNumber(props.studied, 2, false) +
//                   //   " 1Cademist" +
//                   //   (props.studied === 1 ? " has" : "s have") +
//                   //   " studied this node."
//                   // }
//                   tooltipPosition="Top"
//                 >
//                   <i className={"material-icons SeparateIcon grey-text"}>
//                     {props.isStudied ? "drafts" : "mail"}
//                   </i>
//                   <span>{shortenNumber(props.studied, 2, false)}</span>
//                 </MetaButton>
// //                 <MetaButton
// //                    tooltip="# of 1Cademists who have this node visible on their map."
// //                    tooltipPosition="Top"
// //                  >
// //                  <i className="material-icons grey-text">visibility</i>
// //                  <span>{shortenNumber(props.viewers, 2, false)}</span>
// //                </MetaButton> 
//               </>
//             )}
//             <MetaButton
//               onClick={selectLinkingWords}
//               tooltip="View parent and child nodes."
//               // {
//               //   "This node has " +
//               //   shortenNumber(props.parents.length, 2, false) +
//               //   " parent node" +
//               //   (props.parents.length === 1 ? "" : "s") +
//               //   " and " +
//               //   shortenNumber(props.children.length, 2, false) +
//               //   " child node" +
//               //   (props.children.length === 1 ? "." : "s.") +
//               //   " Click to see the child and parent nodes of this node."
//               // }
//               tooltipPosition="Top"
//             >
//               <span className="FooterParentNodesOpen">
//                 {shortenNumber(props.parents.length, 2, false)}
//               </span>
//               <i
//                 className={
//                   "material-icons " +
//                   (props.openPart === "LinkingWords" ? "orange-text" : "grey-text")
//                 }
//               >
//                 swap_horiz
//               </i>
//               <span>{shortenNumber(props.children.length, 2, false)}</span>
//             </MetaButton>