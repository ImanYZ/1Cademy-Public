import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

type PrivacyPolicyProps = {
  open: boolean;
  handleClose: () => void;
};

export const PrivacyPolicy = ({ open, handleClose }: PrivacyPolicyProps) => {
  return (
    <Dialog
      open={open}
      maxWidth={"md"}
      onClose={handleClose}
      scroll={"paper"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="scroll-dialog-title">1Cademy Privacy Policy</DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="scroll-dialog-description" tabIndex={-1} component={"div"}>
          <PrivacyPolicyContent />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrivacyPolicy;

const PrivacyPolicyContent = () => {
  return (
    <Box>
      <p>
        <b>
          1Cademy reserves the right to retrieve, analyze, store, and mine your interaction data with the provided
          services and the data, content, source, or information that you post to 1Cademy services. This data, content,
          source, or information may be used by the 1Cademy team for research purposes and to better understand your
          interests and preferences in their services. With this information, 1Cademy may also tailor their services to
          better suit your needs.
        </b>
      </p>
      <p>
        <b>
          It is important to note that the collection and use of your data and information is described in more detail
          in this document. This policy outlines how 1Cademy collects and processes your personal information and
          provides you with more information on how your data is used.
        </b>
      </p>
      <h3>1Cademy Privacy Policy</h3>
      <h4>INTRODUCTION</h4>
      <p>
        At 1Cademy, we value the importance of protecting your personal information and providing a secure platform for
        knowledge generation and sharing. This document outlines the information and data we collect on 1Cademy, how we
        use that information, and the options you have to manage your personal information.
      </p>
      <p>
        1Cademy may process your personal information to provide our services and products. By using 1Cademy and its
        products, you confirm that you have read and fully understood our Terms of Service and Privacy Policy. You also
        confirm that you understand the reasons behind the collection of your personal information.
      </p>
      <p>
        Our Terms of Service and Privacy Policy apply to your use of 1Cademy and its products. We offer several options
        for you to manage or limit the collection of your personal information, including the ability to discontinue
        using 1Cademy and its products. By using 1Cademy products or services or data, you confirm that 1Cademy has your
        permission to use your information in any country where we operate, including the United States of America.
      </p>
      <p>
        We take the protection of your personal information very seriously, and will do everything in our power to keep
        it safe and secure. Please note that privacy laws, such as the rights of obtaining personal information by
        authorities, may vary between countries. Whenever it is necessary to transfer your information to another
        country, we ensure that it is allowed by law and that your information will be kept safe.
      </p>
      <h4>The Process Of Collecting Information On You</h4>
      <p>
        When you use 1Cademy or its products or services or whenever you contribute to the system or buy any products on
        this network, 1Cademy receives and gathers information in some ways. In most cases, you can manage what
        information to share but for your account verification and some other cases, your personal information is
        required. In the following, we describe how we collect information from you.
      </p>
      <h4>Creating An Account And Registration</h4>
      <p>
        To use 1Cademy and its products and services you need to create an account and register on the Network. Creating
        an account requires you to provide an email address, a name for your account and a secure password. Extra
        information such as a contact address, a billing address, or cell phone number might be required to safeguard
        your personal information. By default, 1Cademy will contact you at the email address you provide, but in some
        cases, 1Cademy may need to contact you by other means.
      </p>
      <h4>Profile Information</h4>
      <p>
        When you create a profile on 1Cademy to be able to use our products and services, required and optional sections
        of the profile may require you to enter personal identification or sensitive information. The name you chose to
        create your account will be displayed publicly along with your reputation points. You can also manage your
        account setting to share other profile information publicly. This may include your picture or avatar, your
        location, your interests, your educational background, your job, your age, your gender, how long you have been a
        member, your contribution statistics.
      </p>
      <p>
        When you use 1Cademy on your browser or on a mobile device or any other means, 1Cademy collects and records
        information including your Internet Protocol (IP) address or unique device identifier. We use cookies /JSON Web
        Tokens and the data about the pages you visit on 1Cademy to conduct and optimize our products and services. This
        information is securely logged and gathered automatically. The browser information might be combined with your
        other information. Collecting this information is necessary to safeguard our products and services and to
        optimize the utilization of our services and products. We also process this information to provide you with an
        optimal personalized view/use of the system and advertisement. Additionally, we use this information to connect
        you with a potential employer or educational institution.
      </p>
      <h4>Information Shared with Third Parties</h4>
      <p>
        1Cademy may share personal information with third parties. Third-parties include online payment providers, email
        services, advertising agencies, and job providers. Also, we facilitate login1Cademy using other third-parties
        accounts like Facebook, Gmail, yahoo mail. When you log in with other accounts, we may collect information from
        these third-parties. We only share your personal information with third-parties whose terms of services are
        consistent with 1Cademy's conditions. We share your personal information with third parties to provide us
        services.
      </p>
      <h4>Advertisement and Marketing Partners</h4>
      <p>
        When you create an account on 1Cademy and use its services, we and approved third-party partners place cookies
        and JSON Web Tokens (JWT) on you and your account interaction. This information is used to provide you with
        personalized advertising, job offers, education/research opportunities, and to present our products and
        services. We also use this information to deliver important notifications and messages. However, if you do not
        want to receive marketing notifications from 1Cademy, you can change your preferences. Please note that if you
        restrict these activities, your experience with 1Cademy will be limited and you will miss out on some features
        such as job offers, research/education opportunities, and personalized advertisements. You can find more details
        about cookies in our Cookies Policy.
      </p>
      <h4>Analytics Data</h4>
      <p>
        1Cademy collects analytics data from the web browser and mobiles to ensure the functionality of the system and
        services and provide you with the optimal product and user experience. This information includes the frequency
        of visiting the website, the operation of the website, errors and debugging, and your interaction with 1Cademy
        and its products and services. In some cases, we may share this data with authorized partners for the purpose of
        research and customization of products and services.
      </p>
      <h4>Billing Information</h4>
      <p>
        When you make a financial transaction on 1Cademy, such as purchasing a product or service, we record your
        billing name and contact information, such as your phone number, email address, and billing/shipping address,
        for invoicing purposes. To ensure the security of your transactions, 1Cademy may engage an authorized partner
        compliant with the PCI DSS standard. We also record an encrypted JWT and the last four digits of your credit
        card and its expiration month and year. Please note that we do not store any additional billing information
        about you.
      </p>
      <h3>The Data We Collect On You</h3>
      <p>
        In the following, we will describe in more detail what kind of information we collect on you and how we use it.
      </p>
      <h4>Public Network (Content Generation)</h4>
      <p>
        1Cademy provides users with a public community to collaborate and share their knowledge and learn from their
        peers. Contents are user-generated and are public to be used or modified by others. For the purpose of security
        of the system and optimizing/personalizing your experience, it is necessary to gather some specific personal
        information. The data that we receive and record includes your username and password, IP address. We use this
        information to assign your identity to your contribution, assign your reputation and rewards, and help the
        community to recognize you. As far as we assign your username, profile picture/avatar, and reputation to every
        content that you generate, they would be publicly visible to all users. Also, your communications on the
        discussion forum and chat features along with your communication with 1Cademy will be recorded. IP address data
        and browser data might be used for investigation, security and personalization/optimization of products and
        services.
      </p>
      <p>
        You should be informed that you cannot withdraw your granted right to 1Cademy to publish your generated contents
        and contributions once they are made online publicly, and other users will have the right to modify, edit, or
        distribute your generated contents. Your public contributions to 1Cademy will remain public and open on the
        internet, and 1Cademy will not have direct control or administration over those contents. This states that if
        you share any piece of your personal information publicly, you will have infringed any privacy rights you had,
        and you should take the risk and any consequences at your own risk. Please be aware that any content generated
        and contributed on 1Cademy may not be possible to remove from public view and access, even if they are removed
        from our system and servers.
      </p>
      <h4>Academic and Job Opportunities</h4>
      <p>
        1Cademy facilitates connecting academic/educational/research opportunity providers and job offers with
        individuals who are inquiring about those opportunities. To this end and to help 1Cademy to personalize and
        optimize the process of connecting position offers and seekers, 1Cademy collects some personal information on
        you and the academic and job position offering entities. The information we collect from academic/job position
        seekers include your name, your residential and email address, your phone number, and your resume with a cover
        letter (if applicable). For job and academic position offering entities, we collect information including name,
        email, and the associated organization.
      </p>
      <p>
        Please note that your public profile is available to be received and recorded by the organizations seeking to
        recruit you. Similarly, the profile and contact information of job/academic position offering parties will be
        available to those seeking those opportunities. Additionally, position seekers can contact recruitment entities
        via direct messaging. 1Cademy also receives and records that information from recruiters and seekers to
        personalize and optimize suggestions. 1Cademy offers customization of your profile so that you can manage to
        exclude some pieces of your personal information that you do not want to share with recruiters and
        third-parties. This information might include your CV, academic/employment history.
      </p>
      <h4>Advertising Products</h4>
      <p>
        1Cademy works with third parties to offer personalized advertisements to our users. To achieve this, 1Cademy and
        its advertisement partners may collect and process your personal information, as well as your online activity
        data. The information we use to personalize our advertisements include:
      </p>
      <ul>
        <li>
          Data from advertising technologies, such as JSON Web Tokens, web beacons, pixels, ad tags, and browser/device
          identifiers
        </li>
        <li>
          Profile information, such as your education background, skills, awards, and in limited cases, your job history
        </li>
        <li>Data from our advertising third-parties, such as device type and location</li>
      </ul>
      <h4>1Cademy Survey</h4>
      <p>
        At 1Cademy, we understand the importance of privacy and the protection of personal information. That's why we
        take voluntary surveys to gather information from educators and contributors. The survey may collect personal
        and demographic information such as gender, race, sexual orientation, immigration status, and location. However,
        we understand that some of this information may be considered sensitive, so we take extra measures to safeguard
        it.
      </p>
      <p>
        All personal information collected through the survey is kept confidential within 1Cademy. If we need to share
        this information with third parties, we will ensure that it is done in compliance with our terms of service and
        that the third party is contractually obliged to protect the privacy of your information. The survey is
        anonymized, which means that your personal information is separated from the data collected.
      </p>
      <p>
        We believe in giving our users control over their personal information. That's why much of the information you
        provide on 1Cademy is optional and voluntary. You can choose to share as much or as little information as you
        like. Additionally, you can delete, edit, or modify optional information such as your profile picture and
        educational/employment history at any time.
      </p>
      <p>
        If 1Cademy makes any changes to our privacy policy, we will make sure to inform you of these changes and give
        you the opportunity to make an informed decision. You also have the option to delete your account completely,
        which will erase all of your personal information from our servers, with the exception of your IP address and
        public content and reputation data. Recording your IP address is necessary for the functionality and security of
        1Cademy.
      </p>
      <p>
        We offer a number of tools to help you manage your personal information, including the ability to download a
        copy of your personal data, change or modify your personal information, and request to opt-out of processing
        your information (with some exceptions for network security and functionality). Please note that you may need to
        verify your identity before accessing some of these features. 1Cademy will work with you to verify your account,
        but reserves the right to refuse your request if we are unable to verify your identity.
      </p>
      <p>
        1Cademy may send you messages, including legal requirements or system functionality updates, which are
        mandatory. Some messages may be promotional, advertisements, offers, or marketing, which are not mandatory and
        you have the option to manage receiving these messages.
      </p>
      <h4>Cookies/JSON Web Tokens</h4>
      <p>
        1Cademy and its partners, such as advertisement entities and research institutions, may use cookies or JSON Web
        Tokens to enhance your user experience and to personalize the advertisements and educational/job offers
        presented to you. Cookies and JSON Web Tokens help us to track your browsing history and preferences, allowing
        us to present you with more relevant content and advertisements. For more information on how we process cookies
        and the third-party cookies we allow, please refer to our Cookies Policy document.
      </p>
      <h4>Information Processing and Revealing</h4>
      <p>
        1Cademy collects, saves, shares, transmits, and processes your information as described in this Privacy Policy.
        Our legal bases for processing your personal information include fulfilling our Terms of Service, providing you
        with our products and services, protecting the interests of 1Cademy and its partners, fulfilling legal
        requirements, respecting the rights of others and public interests, and obtaining your consent.
      </p>
      <h5>Securing Your Personal Information</h5>
      <p>
        Your personal and financial information is highly confidential and protected by 1Cademy. We take all necessary
        measures to safeguard your information from unauthorized access and illegal collection. The information that you
        share privately on 1Cademy or that we collect from you will be kept confidential and protected.
      </p>
      <h5>Provide and Optimize Products and Services</h5>
      <p>
        The information 1Cademy collects from you is essential to improving its products and services, to ensure the
        security of your identity, to facilitate online/offline advertisements including through partnerships with
        companies such as Google Analytics, to personalize marketing offers such as academic and job position offers,
        and to support general research and analytics. In doing so, 1Cademy may collect information about your interests
        and preferences regarding 1Cademy's products and services. It is a top priority for 1Cademy to personalize and
        optimize your experience of using the 1Cademy network and its products and services.
      </p>
      <h4>1Cademy's Commercial Activities</h4>
      <p>
        Some 1Cademy products and services may require a fee to use. In order to ensure the security of your financial
        transactions and payments, 1Cademy may share your information with trusted third parties. This information will
        only be shared through a contractual policy that guarantees the confidentiality of your information.
      </p>
      <h4>Regulatory and Legal Requirements</h4>
      <p>
        1Cademy is committed to following legal requirements that may require it to disclose your personal information.
        1Cademy will only share your personal information with lawful institutions upon receiving a legally valid
        request, such as a subpoena, court order, or other legal request from a legitimate institution with lawful
        jurisdiction. In addition, 1Cademy may also disclose your personal information to protect its legal rights and
        interests. If 1Cademy determines that any user, including yourself, is endangering or offending others or
        themselves, it may also share your personal information with third parties.
      </p>
      <h4>Marketing and Product Information</h4>
      <p>
        At 1Cademy, we may send you messages or public announcements about our products and services, as well as
        academic and job offers. We understand that privacy is important to our users, and that's why we give you the
        option to manage your preferences regarding these types of communications. You can choose to opt-out of
        receiving commercial messages, or limit the frequency and scope of these communications. Rest assured that we do
        not sell your personal information for financial gain, except in the case of a merger or corporate event.
      </p>
      <p>
        The information we collect from you helps us present you with relevant offers and products, so we can improve
        your experience with 1Cademy.
      </p>
      <h4>Main Business Activities</h4>
      <p>
        As part of our business operations, 1Cademy may partner with third parties to engage in activities such as
        purchasing and selling of properties, conducting financial assessments, and exploring business development
        opportunities. In order to carry out these activities, it may be necessary to process or share certain pieces of
        personal information. However, we assure you that we will always use confidentiality measures to protect your
        privacy.
      </p>
      <h4>Information Transfers</h4>
      <p>
        1Cademy operates on a global scale, and as such, we must comply with the local laws of your country of
        residence. By using our products and services, you acknowledge that your personal information may be transferred
        from your local jurisdiction to the United States. We follow legal mechanisms to collect and transfer your
        information in a manner that complies with relevant regulations.
      </p>
      <h4>1Cademy's Commitment to Protect Your Information</h4>
      <p>
        At 1Cademy, we are dedicated to protecting the privacy and security of your personal information. To ensure the
        safe collection, storage, and transfer of your data, we use industry-standard technologies such as Transport
        Layer Security (TLS).
      </p>
      <p>
        To further protect your information, we encourage you to choose a strong and secure password and to keep it
        confidential. Avoid sharing your account information, including your password, with anyone. After finishing your
        activity on 1Cademy, make sure to log out of your account to reduce the risk of unauthorized access to your
        personal data.
      </p>
      <p>
        We also ask for your support in safeguarding your information by being mindful of the security of the network
        you use to access 1Cademy.
      </p>
      <h4>Unsubscribing from Direct Marketing</h4>
      <p>
        If you no longer wish to receive marketing communications from 1Cademy, you can opt-out at any time by managing
        your account settings or by requesting to unsubscribe.
      </p>
      <h4>Privacy Policy Amendments</h4>
      <p>
        1Cademy may update its privacy policy from time to time. If any changes are made, we will notify you and you
        have the right to request previous versions of the policy.
      </p>
    </Box>
  );
};
