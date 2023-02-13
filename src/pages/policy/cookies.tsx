import { Box, Typography } from "@mui/material";
import React from "react";

import AppFooter from "@/components/AppFooter";
import AppHeaderMemoized from "@/components/Header/AppHeader";
import { ONE_CADEMY_SECTIONS } from "@/components/home/SectionsItems";
import ROUTES from "@/lib/utils/routes";

import { darkBase, orange250, orangeDark } from "../home";

const onSwitchSection = (sectionId: string) => {
  window.location.href = `/#${sectionId}`;
};

const CookiePolicy = () => {
  return (
    <Box
      id="ScrollableContainer"
      sx={{
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        position: "relative",
        scrollBehavior: "smooth",
        backgroundColor: theme => (theme.palette.mode === "dark" ? darkBase : "#FFFFFF"),
      }}
    >
      <AppHeaderMemoized
        sections={ONE_CADEMY_SECTIONS}
        onSwitchSection={onSwitchSection}
        selectedSectionId={""}
        page="COMMUNITIES"
      />
      <Box
        sx={{
          maxWidth: "1280px",
          margin: "auto",
          px: { xs: "12px", md: "0px" },
          py: "36px",
        }}
      >
        <Typography
          component={"h1"}
          sx={{ fontSize: "36px", mb: "20px", textTransform: "uppercase", fontWeight: 600, textAlign: "center" }}
        >
          1Cademy Cookies Policy
        </Typography>
        <Typography>
          A <b>cookie</b> is a small piece of text that enables websites to remember your device and maintain a
          consistent experience throughout different times the website is used. Using 1Cademy will result in both
          1Cademy and third parties using <b>Cookies</b> or <b>JSON Web Tokens</b> to track and monitor some of your
          activities on and off the website, and store and access data about you, your browsing history, and usage of
          1Cademy. While it is possible to control and limit the use of cookies, keep in mind that this may alter your
          user experience with 1Cademy, and may limit certain features.{" "}
        </Typography>
        <Typography>
          Companies and other organizations that advertise pages on 1Cademy may use cookies or other technology to learn
          more about your interests in their services and potentially to tailor services to you.
        </Typography>
        <Typography>
          If you don't want cookies to be used when you visit 1Cademy, you can adjust the settings on your internet
          browser to one that best suits your preferences. Keep in mind that 1Cademy does not work to its full potential
          if you do choose to opt-out. In your browser settings, you can typically choose to reject all or some cookies,
          or instead receive a notification when a cookie is being placed on your device. You can also manually delete
          cookies at any time, but this does not prevent the site from setting future cookies on your device if you
          don't adjust your browser settings.
        </Typography>
        <Typography component={"h2"} sx={{ fontSize: "24px", my: "20px", textTransform: "none", fontWeight: 600 }}>
          How to Adjust Your Browser Settings
        </Typography>
        <Typography>
          To adjust your browser settings to control cookies, follow the instructions for your specific browser:
        </Typography>
        <Box
          component={"ul"}
          sx={{
            "& a:link": {
              color: orangeDark,
            },
            "& a:visited": {
              color: orange250,
            },
          }}
        >
          <li>
            <a href="https://support.google.com/chrome/answer/95647?co=GENIE.Platform%3DDesktop&hl=en">Google Chrome</a>
          </li>
          <li>
            <a href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies">
              Internet Explorer
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences">Firefox</a>
          </li>
          <li>
            <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac">Safari</a>
          </li>
        </Box>{" "}
      </Box>
      <AppFooter prevPage={ROUTES.publicHome} />
      <style>
        {`
        body{
          overflow:hidden;
        }
      `}
      </style>
    </Box>
  );
};

export default CookiePolicy;
