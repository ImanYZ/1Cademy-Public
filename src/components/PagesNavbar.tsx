import CloseIcon from "@mui/icons-material/Close";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { ClickAwayListener, Fab, IconButton, styled, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import Box from "@mui/material/Box";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { ComponentType, FC, ReactNode, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import SECTIONS from "@/lib/utils/navbarSections";

import AppHeader from "./AppHeader";
import AppMenuMovil from "./AppMenuMovil";
import FeedbackForm from "./FeedbackForm";
import Head from "./Head";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
  // showSearch: boolean;
  enableMenu: boolean;
  onClickSearcher: () => void;
};

export const AppFooter: ComponentType<any> = dynamic(() => import("./AppFooter").then(m => m.default), {
  ssr: false,
});

const PagesNavbar: FC<Props> = ({ children, title, description, enableMenu, onClickSearcher }) => {
  const router = useRouter();

  const [showMobileFeedbackForm, setShowMobileFeedbackForm] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [{ isAuthenticated }] = useAuth();

  const onSendFeedback = () => {
    setShowMenu(false);
    setShowMobileFeedbackForm(true);
  };

  const switchSection = (idx: number) => {
    SECTIONS[idx].label === "NODE" ? router.push(SECTIONS[idx].route) : open(SECTIONS[idx].route, "_blank");
  };

  return (
    <>
      <Head title={title} description={description} />
      {/* <AppHeaderNavbar
        showMenu={showMenu}
        onCloseMenu={onCloseMenu}
        onShowMenu={onShowMenu}
        showSearch={showSearch}
        isSignedIn={isAuthenticated}
      /> */}
      {/* //onClickSearcher?: () => void; */}
      <AppHeader
        sections={SECTIONS}
        switchSection={switchSection}
        enableMenu={enableMenu}
        onClickSearcher={onClickSearcher}
      />
      {showMenu && <AppMenuMovil isSignedIn={isAuthenticated} onSendFeedback={onSendFeedback} />}
      <Box
        component="main"
        sx={{
          position: "relative",
          minHeight: "calc(100vh - var(--navbar-height) - var(--footer-height) )",
          backgroundColor: theme => theme.palette.background.default,
        }}
      >
        {children}

        {/* mobil feedback */}
        {showMobileFeedbackForm && (
          <Box
            sx={{
              width: "100vw",
              height: "calc(100vh - var(--navbar-height) )",
              px: "9px",
              position: "fixed",
              bottom: "0px",
              zIndex: "10",
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#6028282A",
            }}
          >
            <Box
              sx={{
                maxWidth: "500px",
                width: "100%",
                maxHeight: "600px",
                backgroundColor: theme => theme.palette.common.darkGrayBackground,
                position: "relative",
              }}
            >
              <ClickAwayListener onClickAway={() => setShowMobileFeedbackForm(false)}>
                <FeedbackForm
                  onSuccessFeedback={() => setShowMobileFeedbackForm(false)}
                  sx={{ padding: "30px 50px" }}
                />
              </ClickAwayListener>
              <IconButton
                aria-label="Close feedback"
                onClick={() => setShowMobileFeedbackForm(false)}
                sx={{ position: "absolute", top: "30px", right: "15px", color: "white" }}
              >
                <CloseIcon fontSize="large" />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      <AppFooter />

      {/* pc feedback */}

      <FeedbackTooltip
        open={showFeedbackForm}
        placement="top-start"
        title={
          <ClickAwayListener onClickAway={() => setShowFeedbackForm(false)}>
            <FeedbackForm onSuccessFeedback={() => setShowFeedbackForm(false)} sx={{ padding: "40px 50px" }} />
          </ClickAwayListener>
        }
        sx={{ display: { xs: "none", md: "block" } }}
      >
        <Fab
          aria-label="Open Feedback"
          onClick={() => setShowFeedbackForm(true)}
          color="primary"
          sx={{
            color: theme => theme.palette.common.white,
            float: "right",
            display: { xs: "none", md: "flex" },
            position: "fixed",
            bottom: "28px",
            right: "30px",
          }}
        >
          <Tooltip title={"Question/Feedback"} placement="top">
            <QuestionMarkIcon />
          </Tooltip>
        </Fab>
      </FeedbackTooltip>
    </>
  );
};

const FeedbackTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.darkGrayBackground,
    color: theme.palette.text.primary,
    maxWidth: "500px",
    maxHeight: "600px",
    fontWeight: theme.typography.fontWeightRegular,
    padding: "0px",
    border: `1px solid ${theme.palette.grey[400]}`,
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
  },
}));

export default PagesNavbar;
