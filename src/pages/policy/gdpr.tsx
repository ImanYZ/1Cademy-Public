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

const GDRPolicy = () => {
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

          "& a:link": {
            color: orangeDark,
          },
          "& a:visited": {
            color: orange250,
          },
        }}
      >
        <Typography
          component={"h1"}
          sx={{ fontSize: "36px", fontWeight: 600, textAlign: "center", textTransform: "uppercase" }}
        >
          1Cademy General Data Protection Regulation (GDPR) Policy
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          Introduction
        </Typography>
        <Typography>
          1Cadmey respects users' personal and sensitive information and is committed to ensuring the security and
          privacy of such information in accordance with the requirements of the GDPR. 1Cademy takes the necessary
          measures to comply with the GDPR regarding personal and sensitive information of users on 1Cademy and all
          third-party services. The following policy outlines 1Cademy's commitments to the GDPR and the measures it
          takes to protect users' personal and sensitive information.
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          Commitments to the GDPR
        </Typography>
        <Typography>
          1Cademy is committed to complying with the GDPR in all its operations. This includes using data processors
          with suitable technical and administrative measures and assessing 1Cademy's compliance with the GDPR, which
          may include the following:
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "16px", fontWeight: 600 }}>
          Reliability and Resources
        </Typography>
        <Typography>
          1Cademy is dedicated to maintaining its defense strategies, developing security review processes, building a
          more robust security infrastructure, and precisely executing 1Cademy’s security policies to ensure the
          protection of users' personal and sensitive information.
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "16px", fontWeight: 600 }}>
          Data Safeguard Commitments
        </Typography>
        <Typography>
          1Cademy takes several measures to protect the personal and sensitive information of its users, including:
        </Typography>
        <Typography component={"h4"} sx={{ fontSize: "16px", my: "16px", fontWeight: 600 }}>
          Data Processing Agreements
        </Typography>
        <Typography>
          1Cademy has data processing agreements in place that clearly communicate its privacy commitment to users.
          These agreements are updated regularly to reflect the GDPR and to facilitate users' compliance assessment and
          GDPR readiness when using 1Cademy services.
        </Typography>
        <Typography component={"h4"} sx={{ fontSize: "16px", my: "16px", fontWeight: 600 }}>
          Processing According to Instructions
        </Typography>
        <Typography>
          1Cademy will only process personal data provided by users under the users' instructions, as described in
          1Cademy's GDPR data processing agreements.
        </Typography>
        <Typography component={"h4"} sx={{ fontSize: "16px", my: "16px", fontWeight: 600 }}>
          Personnel Confidentiality Commitments
        </Typography>
        <Typography>
          All 1Cademy employees are required to sign a confidentiality agreement and complete compulsory confidentiality
          and privacy training to manage their responsibilities and expected behavior concerning data protection.
        </Typography>
        <Typography component={"h4"} sx={{ fontSize: "16px", my: "16px", fontWeight: 600 }}>
          Use of Subprocessors
        </Typography>
        <Typography>
          Most of the data processing actions required to provide 1Cademy services are run by 1Cademy itself. However,
          1Cademy may engage third-party vendors to assist in supporting these services. In such cases, 1Cademy
          thoroughly surveys these third parties to ensure their competence to deliver the appropriate level of security
          and privacy. 1Cademy complies with the Data Protection Act 1998 when transferring user data to a third-party
          located outside the European Economic Area (EEA).
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "16px", fontWeight: 600 }}>
          Security of the Services
        </Typography>
        <Typography>
          1Cademy takes reasonable technical and administrative measures to ensure the protection of users' personal and
          sensitive information, in accordance with the GDPR. 1Cademy uses state-of-the-art security infrastructures
          throughout the entire data processing lifecycle, which include:
        </Typography>
        <ul>
          <li>Secure deployment of services</li>
          <li>Secure storage of data with end-user privacy safeguards</li>
          <li>Secure communications between services</li>
          <li>Secure and private communication with consumers over the Internet</li>
          <li>Safe operation by administrators</li>
          <li>Regular security assessments and vulnerability scans</li>
          <li>
            Implementation of firewalls, intrusion detection and prevention systems, and other security technologies
          </li>
          <li>
            Implementation of access controls and authentication mechanisms to prevent unauthorized access to sensitive
            data and systems
          </li>
          <li>
            Implementation of data backup and disaster recovery solutions to ensure business continuity in case of
            unforeseen events
          </li>
        </ul>
        <Typography>
          By implementing these measures, 1Cademy is committed to ensuring that all of your data is securely protected,
          and that you can use our platform with complete peace of mind.
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "16px", fontWeight: 600 }}>
          Updates to Privacy Policy
        </Typography>
        <Typography>
          1Cademy reserves the right to change its privacy policy at any time. If there are any material changes to the
          policy, 1Cademy will notify you via email or through a notice on its website.
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "16px", fontWeight: 600 }}>
          Contact Informations
        </Typography>
        <Typography>
          If you have any questions or concerns about our privacy policy or the way we collect, use, or store your data,
          please contact us at <a href="mailto:privacy@1cademy.com">privacy@1cademy.com</a>.
        </Typography>{" "}
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

export default GDRPolicy;
