import { Box, Typography, useTheme } from "@mui/material";
import NextImage from "next/image";
import React, { useCallback, useEffect, useState } from "react";

import { useInView } from "@/hooks/useObserver";

import NoProposalDarkIcon from "../../../../public/no-proposals-dark-mode.svg";
import NoProposalLightIcon from "../../../../public/no-proposals-light-mode.svg";
import ProposalItem from "../ProposalsList/ProposalItem/ProposalItem";

const ELEMENTS_PER_PAGE = 13;

type PendingProposalListProps = {
  proposals: any[];
  openLinkedNode: any;
  userVotesOnProposals?: { [key: string]: any };
  openComments: (refId: string, type: string, proposal?: any) => void;
};

const PendingProposalList = ({
  proposals,
  openLinkedNode,
  userVotesOnProposals = {},
  openComments,
}: PendingProposalListProps) => {
  const theme = useTheme();
  const [isRetrieving, setIsRetrieving] = useState(false);

  const { ref: refInfinityLoaderTrigger, inView: inViewInfinityLoaderTrigger } = useInView();
  const [lastIndex, setLastIndex] = useState(ELEMENTS_PER_PAGE);

  const loadOlderProposalsClick = useCallback(() => {
    if (lastIndex >= proposals.length) return;

    setIsRetrieving(true);
    setLastIndex(lastIndex + ELEMENTS_PER_PAGE);
    setTimeout(() => {
      setIsRetrieving(false);
    }, 500);
  }, [lastIndex, proposals.length]);

  useEffect(() => {
    if (!inViewInfinityLoaderTrigger) return;
    if (isRetrieving) return;

    loadOlderProposalsClick();
  }, [inViewInfinityLoaderTrigger, isRetrieving, loadOlderProposalsClick]);

  return (
    <Box id="PendingProposalsContainer">
      {!proposals.length && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "40%",
          }}
        >
          <NextImage
            src={theme.palette.mode === "dark" ? NoProposalDarkIcon : NoProposalLightIcon}
            alt="Notification icon"
          />
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "500",
              textAlign: "center",
              mt: "24px",
              maxWidth: "300px",
            }}
          >
            There's no Pending Proposals
          </Typography>
        </Box>
      )}

      {!!proposals.length && (
        <ul
          className="collection Proposals"
          style={{ display: "flex", padding: "0px", margin: "0px", flexDirection: "column", gap: "4px" }}
        >
          {proposals.slice(0, lastIndex).map((proposal, idx) => {
            return (
              <ProposalItem
                key={idx}
                proposal={proposal}
                openLinkedNode={(nodeId: string) => openLinkedNode(nodeId, "initialProposal-" + proposal.id)}
                showTitle={true}
                userVotesOnProposals={userVotesOnProposals}
                openComments={openComments}
              />
            );
          })}
          {proposals.length > lastIndex && <Box id="ContinueButton" ref={refInfinityLoaderTrigger}></Box>}
        </ul>
      )}
    </Box>
  );
};

export default React.memo(PendingProposalList);
