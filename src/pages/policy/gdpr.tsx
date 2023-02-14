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

        <Typography component={"h2"} sx={{ fontSize: "24px", my: "20px", fontWeight: 600 }}>
          Introduction
        </Typography>
        <Typography>
          At 1Cademy, we respect our users' personal and sensitive information and strive to ensure that our users feel
          secure while using our products and services. We are committed to complying with the General Data Protection
          Regulation (GDPR) regarding the protection of personal and sensitive information of our users on 1Cademy and
          all third-party services.
        </Typography>
        <Typography>
          To achieve this, we have taken the necessary steps to inform our users through comprehensive documentation,
          keep our infrastructures and resources up-to-date, and implement suitable technical and administrative
          measures to protect our users' data.
        </Typography>
        <Typography component={"h2"} sx={{ fontSize: "24px", my: "20px", fontWeight: 600 }}>
          1Cademy Commitments to the GDPR
        </Typography>
        <Typography>
          As a data controller, 1Cademy is committed to using data processors with suitable technical and administrative
          measures to ensure the safety of our users' data. Our GDPR assessment includes the following:
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          Reliability & Resources
        </Typography>
        <Typography>
          1Cademy is dedicated to maintaining our defense strategies, developing security review processes, building a
          robust security infrastructure, and accurately executing our security policies to ensure the protection of our
          users' data.
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          Data Safeguard Commitments
        </Typography>
        <Typography component={"h4"} sx={{ fontSize: "16px", my: "16px", fontWeight: 600 }}>
          Data Processing Agreements
        </Typography>
        <Typography>
          Our data processing agreements for 1Cademy clearly communicate our privacy commitment to our users. We
          regularly update these agreements based on feedback from our users and lawful authorities, and we have updated
          these agreements to reflect the GDPR and to help our users assess their compliance and readiness for the GDPR
          when using our services.
        </Typography>
        <Typography component={"h4"} sx={{ fontSize: "16px", my: "16px", fontWeight: 600 }}>
          Processing According to Instructions
        </Typography>
        <Typography>
          Any data that a user provides to 1Cademy will only be processed under the user's instructions, as described in
          1Cademy's GDPR data processing agreements.
        </Typography>
        <Typography component={"h4"} sx={{ fontSize: "16px", my: "16px", fontWeight: 600 }}>
          Personnel Confidentiality Commitments
        </Typography>
        <Typography>
          All 1Cademy employees are required to sign a confidentiality agreement and complete compulsory confidentiality
          and privacy training to manage their responsibilities and expected behavior regarding data protection.
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          Use of Subprocessors
        </Typography>
        <Typography>
          Most of the data processing actions required to provide 1Cademy services are run by 1Cademy itself. However,
          1Cademy may engage some third-party vendors to assist in supporting these services. In such cases, 1Cademy
          carefully surveys these third parties to ensure their competence in delivering the appropriate level of
          security and privacy. 1Cademy complies with the Data Protection Act 1998 when transferring user data to a
          third-party located outside the European Economic Area (EEA).
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          Security of the Services
        </Typography>
        <Typography>
          According to the GDPR, reasonable technical and administrative measures must be enforced to ensure an
          appropriate level of protection for the risk. 1Cademy takes advantage of state-of-the-art security
          infrastructures throughout the entire data processing lifecycle to provide secure deployment of services,
          secure storage of data with end-user privacy safeguards, secure communications between services, secure and
          private communication with consumers over the Internet, and safe operation by administrators.
        </Typography>
        <Typography component={"h4"} sx={{ fontSize: "16px", my: "16px", fontWeight: 600 }}>
          Encryption
        </Typography>
        <Typography>
          1Cademy employs encryption to protect data in transit and at rest. Our data in transit between regions is
          protected using HTTPS, which is activated by default for all users. 1Cademy encrypts users' content stored at
          rest, without any action required from users, using one or more encryption mechanisms.
        </Typography>
        <Typography component={"h4"} sx={{ fontSize: "16px", my: "16px", fontWeight: 600 }}>
          Access Controls
        </Typography>
        <Typography>
          For 1Cademy employees, access rights and levels are based on job position and role. Requests for additional
          access follow a formal process that requires a request and approval from a data or system owner, manager, or
          other executives, as defined by 1Cadmy's security policies.
        </Typography>

        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          Data Retention and Deletion
        </Typography>
        <Typography>
          1Cademy provides users with the affordance to delete the personal data they have provided to 1Cademy at any
          time. When 1Cademy receives a complete deletion instruction from users, it will delete the relevant personal
          data from all of its systems within a maximum period of 100 days unless retention commitments involve. Note
          that this only applies to users' personal data. We do not delete the data that users publicly share on
          1Cademy.
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          Incident Notifications
        </Typography>
        <Typography>
          1Cademy will continue to promptly inform you of incidents involving your personal and sensitive information in
          line with the information incident terms in our recent agreements.{" "}
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          International Data Transfers
        </Typography>
        <Typography>
          The GDPR provides several mechanisms to ameliorate transfers of personal data outside of the EU. These
          mechanisms are aimed at securing an adequate level of protection or ensuring the performance of suitable
          safeguards when personal data is transferred to a third country.{" "}
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          Automated Decision-Making
        </Typography>
        <Typography>
          1Cademy may use automated decision-making in processing your personal data for some services and products, you
          can request a review of the accuracy of an automated decision if you are unhappy with it.{" "}
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          1Cademy Data Protection Principles
        </Typography>
        <ul>
          <li>Personal Data shall be processed lawfully, fairly, and in a transparent manner.</li>
          <li>
            The Personal Data collected will only be those specifically required to fulfill 1Cademy services. Such data
            may be collected directly from users. Such data will only be processed for that purpose.
          </li>
          <li>
            Personal Data shall only be retained for as long as it is required to fulfill 1Cademy services, or to
            provide statistics to our Client Company.
          </li>
          <li>
            Personal Data shall be adequate, relevant, and limited to what is necessary in relation to the purposes for
            which they are collected and/or processed. Personal Data shall be accurate and, where necessary, kept up to
            date.
          </li>
          <li>
            Users have the right to request from 1Cademy access to and rectification or erasure of their personal data,
            to object to or request restriction of processing concerning the data, or to the right to data portability.
            In each case such a request must be put in writing and sent to OUREMAIL HERE.
          </li>
          <li>
            Personal Data shall only be processed based on the legal basis as explained above, except where such
            interests are overridden by the fundamental rights and freedoms of users which will always take precedence.
            If users have provided specific additional Consent to the processing, then such consent may be withdrawn at
            any time (but may then result in an inability to fulfill 1Cademy products/ services requirements).
          </li>
        </ul>
        <Typography>
          The Data Subject has the right to make a complaint directly to a supervisory authority within their own
          country. For inquiries about 1Cademy's Data Protection compliance please contact via OUREMAIL
        </Typography>
        <Typography component={"h3"} sx={{ fontSize: "19px", my: "18px", fontWeight: 600 }}>
          Children's Privacy
        </Typography>
        <Typography>
          Children are not eligible to use 1Cademy products and services. Minors (children under the age of 18) should
          not submit any personal information to 1Cademy. If you are a minor, you can use 1Cademy only in conjunction
          with your parents or legal guardians.
        </Typography>
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
