import "./CommentsList.css";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React from "react";

import shortenNumber from "../../../../../../utils/shortenNumber";
import MetaButton from "../../../../MetaButton/MetaButton";
import UserHeader from "../UserHeader/UserHeader";

const doNothing = () => {};

dayjs.extend(relativeTime);

const CommentsList = props => {
  return (
    <>
      <div className="CommentOnProposal">
        <div className="input-field">
          <textarea
            id={`Proposal${props.proposal.id}NewComment`}
            name={`Proposal${props.proposal.id}NewComment`}
            className="materialize-textarea"
          />
          <label htmlFor={`Proposal${props.proposal.id}NewComment`}>Write comment/Q&amp;A on this proposal.</label>
          <div className="ProposalCommentSubmitButton">
            <MetaButton onClick={doNothing} tooltip="Submit your comment." tooltipPosition="Left">
              <i className="material-icons grey-text">send</i>
              Post
            </MetaButton>
          </div>
          {/* <button
      className={
        isSubmitting
          ? "disabled CommentSubmitButton waves-effect waves-light btn-small orange darken-2"
          : "CommentSubmitButton waves-effect waves-light btn-small orange darken-2"
      }
      disabled={isSubmitting}
      type="submit"
    >
      Submit
    </button> */}
        </div>
      </div>
      <ul className="collection ProposalComments">
        {props.proposal.comments.length !== 0 ? (
          props.proposal.comments.map(comment => {
            return (
              <li className="collection-item avatar" key={`Comment${comment.id}`}>
                <UserHeader imageUrl={comment.imageUrl} />
                <div className="title Username">{comment.user}</div>
                <div className="title Time">{dayjs(comment.createdAt).fromNow()}</div>
                <p className="CommentBody">{comment.comment}</p>
                <span className="secondary-content">
                  <MetaButton
                    onClick={doNothing}
                    tooltip="Click if you find this comment Unhelpful."
                    tooltipPosition="BottomLeft"
                  >
                    <i className={"material-icons " + (comment.wrong ? "red-text" : "grey-text")}>close</i>
                    <span>{shortenNumber(comment.wrongs, 2, false)}</span>
                  </MetaButton>
                  <MetaButton
                    onClick={doNothing}
                    tooltip="Click if you find this comment helpful."
                    tooltipPosition="BottomLeft"
                  >
                    <i
                      className={
                        comment.correct ? "material-icons DoneIcon green-text" : "material-icons DoneIcon grey-text"
                      }
                    >
                      done
                    </i>
                    <span>{shortenNumber(comment.corrects, 2, false)}</span>
                  </MetaButton>
                </span>
              </li>
            );
          })
        ) : (
          <span className="NoComments">No Comments Yet!</span>
        )}
      </ul>
    </>
  );
};

export default React.memo(CommentsList);
