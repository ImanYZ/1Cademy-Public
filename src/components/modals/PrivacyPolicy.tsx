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
      onClose={handleClose}
      scroll={"paper"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="scroll-dialog-title">1Cademy Privacy Policy</DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="scroll-dialog-description" tabIndex={-1}>
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

const PrivacyPolicyContent = () => {
  return (
    <Box component={"div"}>
      <p>
        <b>
          1Cademy reserves the right to retrieve, analyze, store, and mine your interaction data with the provided
          services and the data, content, source, or information that you post to 1Cademy services. This data, content,
          source, or information may be used by 1Cademy team for research purposes and to learn more about your
          interests in their services and potentially to tailor services to you. More information about how we collect
          and process your information including your personal information are described below in this document as
          our''Privacy Policy''.
        </b>
      </p>

      <h3>1Cademy Privacy Policy</h3>
      <h4>INTRODUCTION</h4>
      <p>
        We welcome you to use and contribute to 1Cademy, an online collaborative knowledge generation, and sharing. This
        document specifies: the information and data we gather on 1Cademy, how we use that information in the use of our
        products and the options you have to manage your personal information. 1Cademy might process personal
        information of the users to provide the system and/ or our products. When you use 1Cademy or our other product
        via a private/public network, you affirm that you have read and fully understood our Terms of Services and
        Privacy policy. You confirm that you have understood the use and the reason for collecting your information. Our
        Terms of Service and this Privacy Policy applies to your use of 1Cademy and its products. As will be described,
        1Cademy offers you several options to manage or limit collecting your personal information in case that you do
        not want to allow 1Cademy to collect and process your personal information or you can simply discontinue using
        1Cademy and its products. As you use 1Cademy or you buy any product or services on 1Cademy you confirm the
        permission to use your information in any country that 1Cademy operates including the United States of America.
        This document will illustrate how your personal information is protected by 1Cademy. You should be aware that
        privacy laws such as the rights of obtaining personal information by authorities in particular countries may not
        be the same as the country you live in. Whenever it is needed to transfer your information to other countries it
        is ensured that it would be allowed by law and your information will be kept safe.
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
        information such as a contact address, a billing address or cell phone number might be required to safeguard
        your personal information. By default, 1Cademy will contact you at the email address you provide, but in some
        cases, 1Cademy may need to contact you by other means.
      </p>

      <h4>Profile Information</h4>
      <p>
        When you create a profile on 1Cademy to be able to use our products and services, required and optional sections
        of the profile may require to enter personal identification or sensitive information. The name you chose to
        create your account will be displayed publicly along with your reputation points. You can also manage your
        account setting to share other profile information publicly, this may include your picture or avatar, your
        location, your interests, your educational background, your job, your age, your gender, how long you have been a
        member, your contribution statistics. When you use on 1Cademy on your browser or on a mobile device or any other
        means, 1Cademy collects and records information including your Internet Protocol (IP) address or unique device
        identifier. We use cookies /JSON Web Tokens and the data about the pages you visit on 1Cademy to conduct and
        optimize our products and services. This information is securely logged and gathered automatically. The browser
        information might be combined with your other information. Collecting this information is necessary to safeguard
        our products and services and to optimize the utilization of our services and products. We also process this
        information to provide you with an optimal personalized view/use of the system and advertisement. Additionally,
        we use this information to connect you with a potential employer or educational institution.
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
        When you create an account on 1Cademy and use 1Cademy we and approved third-parties we put cookies and JSON Web
        Tokens (JWT) on you and your account interaction. More detail can be found in our Cookies Policy. We use this
        information to provide you personalized advertising, job offers, education/research opportunities. Additionally,
        we use this information to present our products and services and deliver important notification and messages. In
        case that you do not want to receive marketing notifications from 1Cademy, you can change your preferences.
        Please notice that if you restrain those activities, your experience with 1Cademy will be limited and you will
        benefit some features like job offers, research/education opportunities, and personalized advertisements.
      </p>

      <h4>Analytics data</h4>
      <p>
        1Cademy collects analytics data from the web browser and mobiles. This information enables us to run and ensure
        the functionality of the system and services and help us to provide you with the optimal product and user
        experience. To this end, we collect information including the frequency of visiting the website and contributing
        to 1Cademy functionality information about the operation of the website, errors and debugging. We also collect
        information about your interaction and usage of 1ademy and its products and services. In some cases, we may
        share this data with authorized partners for the purpose of research and customization of products and services.
      </p>

      <h4>Billing Information</h4>
      <p>
        When you do a financial transaction on 1Cademy, for example, when you buy a product or service, we record a
        billing name and contact information, for instance, phone number and Email address, billing/shipping address for
        invoicing purposes. To safeguard the process of payment by credit cards,1Cademy may engage an authorized partner
        compliant with PCI DSS standard to assure the security of your transactions. 1Cademy will record an encrypted
        JWT and the last four digits of credit card and the expiration month and year of the card. Please note that
        1Cademy will not restore any extra billing information about you.
      </p>

      <h4>The Data We Collect On You</h4>
      <p>
        In the following, we will describe in more detail what kind of information we collect on you and how we use it.
      </p>
      <h4>Public Network (Content Generation)</h4>
      <p>
        1Cademy provides users with a public community to collaborate and share their knowledge and learn from their
        peers. Contents are user-generated and are public to be used or modified by others. For the purpose of security
        of the system and optimizing/personalizing your experience, it is necessary to gather some specific personal
        information. The data that we receive and record includes your username and password, IP address. We use this
        information to assign your identity to your contribution, assign your reputation and reward s and help the
        community to recognize you. As far as we assign your username, profile picture/avatar, and reputation to every
        content that you generate, they would be publicly visible to all users. Also, your communications on the
        discussion forum and chat features along with your communication with 1Cademy will be recorded. IP address data
        and browser data might be used for investigation, security and personalization/optimization of products and
        services. You should be informed that you cannot withdraw your granted right to 1Cademy to publish your
        generated contents and contributions once they are made online publicly, also other users will have the right to
        modify or edit or distribute your generated contents. Your public contributions to 1Cademy will remain public
        and open on the internet and 1Cademy will not have direct control or administration on those contents. This
        states that if you share any piece of your personal information publicly you transgress any privacy right you
        had so you should take the risk and any consequences at your own risk. Please be aware that any content
        generated and contributed on 1Cademy may not be possible to remove from public view and access even if they are
        removed from our system and servers.
      </p>

      <h4>Academic and job opportunities</h4>
      <p>
        1Cademy facilitates connecting academic/educational/research opportunity providers and job offers with
        individuals who are inquiring about those opportunities. To this and to help 1Cademy to personalize and optimize
        the process of connecting position offers and seekers 1Cademy collects some personal information on you and the
        academic and job position offering entities. The information we collect from academic/job position seekers
        include your name, your residential and email address your phone number and your resume with a cover letter (if
        applicable). For job and academic position offering entities we collect information including name, email and
        the associated organization. Please notice that your public profile is available to be received and be recorded
        by the organizations seeking to recruit you. Similarly, the profile and contact information of job/academic
        position offering parties will be available to those seeking those opportunities. Additionally, position seekers
        can contact recruitment entities via direct messaging. 1Cademy also receives and records that information from
        recruiters and seekers to personalize and optimize suggestions. 1Cademy offers customization of your profile so
        that you can manage to exclude some piece of your personal information that you do not want to share with
        recruiters third-parties this information might include your CV, academic/employment history.
      </p>

      <h4>Advertising Products</h4>
      <p>
        1Cademy collaborates with third parties to provide you with personalized/customized advertisements. To this end,
        1Cademy and advertisement partners may gather and process your personal information as well as your activity.
        The information we receive to customize our advertisement activities include: Data from advertising technologies
        like JSON Web Tokens, web beacons, pixels, ad tags, and browser/device identifiers Profile information, your
        education background, your skills and awards, and in limited instances your job history analytics including your
        visits to the 1Cademy, browsing and search history Data from our advertising third-parties (e.g., device type
        and location)
      </p>
      <h4>1Cademy Survey</h4>
      <p>
        1Cademy takes voluntary Surveys to investigate educators and contributors. The Survey may collect personal and
        demographic information. Additionally, the Survey may collect information about gender, race, sexual
        orientation, immigration status, and location. We consider this information as sensitive information and try to
        safeguard this information along with anonymizing your name and other personal information. This information is
        kept within 1Cademy, in the case that it is required to share this information with specific third-parties we
        assure that this process will comply with these terms of service and the third party will be obliged to obey
        these regulations by contract. 1Cademy's surveys are anonymized, this means that the information we collect from
        the surveys is segregated from your personal identity. Your personal privacy is very important for us and we do
        our best to safeguard your privacy while using 1Cademy or its products and services. Therefore, 1Cademy provides
        you the possibility of managing the way and what kind of your personal information we collect. A major part of
        the information you provide on 1Cademy is optional and voluntary so you can decide not to share that information
        if you do not want to. Additionally, you will be able to delete/edit or modify that optional information
        whenever you like for instance your profile picture and educational/employment history. In the situation that
        1Cademy adds or removes any condition under privacy policy statements, those changes/modifications will be
        obvious and be instantly provided to you for your consideration and decision. Please note that you also have the
        chance to delete your account. By deleting your account permanently all of your personal information will be
        deleted from our servers excluding your IP address and the content you have generated publicly and your
        reputations data. Recording your IP address is required for 1Cademy's functionality and protecting it from spam
        and other security issues. 1Cademy provides you more information management choices including ability to
        download a copy of your personal data received by 1Cademy; ability to change or modify your personal
        information; ability to delete your personal data saved on 1Cademy with the exception of some information that
        are required for the system functionality and performance; the ability to request an opt-out to process your
        personal information with some exceptions required for the Network security and functionality. It should be
        noted that you may be required to be verified before being able to use some of these features. 1Cademy will
        collaborate with you to verify your accounts but 1Cademy reserves the right to refuse your request if it fails
        to verify your identity. 1Cademy may reach you by sending you messages, those messages may be related to some
        legal necessities or system functionality and are mandatory. Some messages belong to
        promotions/advertisements/offers and marketing. The latter message group is voluntary and not mandatory so you
        can manage to receive this kind of message.
      </p>

      <h4>Cookies/JSON Web Tokens</h4>
      <p>
        1Cademy may put cookies or JSON Web Tokens on you, as well as third parties like advertisement entities or
        research institutions. This is required for the functionality of 1Cademy and its products and services described
        in this document. Cookies and JSON web tokens are used to personalize the advertisements and educational/job
        offers that we present to you. You can find more information in our Cookies Policy document about how we process
        cookies and what third-party cookies we allow.
      </p>

      <h4>Information Processing/Revealing</h4>
      <p>
        When we provide you with 1Cademy and its products and services we receive, save, share, transmit and process
        your data as described in this document. Some legal bases that 1Cademy relies on, to process your personal
        information are required to necessitate our Terms of Services and to provide you with 1Cademy and its products
        and services; are required for the interest of 1Cademy or third-parties; are required to fulfill a legal
        necessity or to withstand legal rights; are required to respect others or public rights; you have published your
        information; you gave permission to collect and process your information. We collect and process your data based
        on legal concerns to achieve the following goals.
      </p>

      <h5>To secure your personal information</h5>
      <p>
        The information and data we collect which contain your personal/financial information are proprietary and we
        always try to keep them confidential. The information that you share publicly on 1Cademy with your peers or the
        information we collect from you, will be kept confidential and protected. As one of the most important
        priorities,1Cademy tries to safeguard your information from spam and illegal collection by others.
      </p>
      <h5>Provide and Optimize Products and Services</h5>
      <p>
        The information 1Cademy collects from you is needed to enhance its products and services, to verify your
        identity, to facilitate online/offline advertisements including our partners such as Google Analytics, to
        personalize marketing offers such as academic/job position offers, to support general research and analytics. To
        this end, 1Cademy may collect information about your interests and preferences of 1Cademy's products and
        services. A lawful concern of 1Cademy is to personalize and optimize your experience of using 1Cademy network
        and its products and services.
      </p>

      <h4>1Cademy's Commercial Activities</h4>
      <p>
        To use some specific 1Cademy products and services, you might be required to pay. To safeguard your financial
        transactions and payments, 1Cademy may share your information with third parties. We will only share this
        information with verified third parties through a contractual policy to secure the confidentiality of your
        information.
      </p>

      <h4>Regulatory and lawful Necessities</h4>
      <p>
        1Cademy commits to pursuing lawful requirements which may necessitate revealing your personal information.
        1Cademy will only share your personal information with lawful institutions upon a legal request. These legal
        cases include lawful national security or legal obligations (including a subpoena, court order, or other legal
        requests by a legitimate institution with lawful jurisdiction). 1Cademy may also disclose your personal
        information to protect its lawful profits. 1Cademy may share your personal information with third parties in
        case we realize any user including you might endanger or offend others or yourself.
      </p>

      <h4>Marketing and Product Information</h4>

      <p>
        1Cademy may send you messages or public announcements to present to your products and services and inform you
        about academic/job offers. 1Cademy provides you with the possibility to manage your preferences about receiving
        such messages. You can also request not to receive commercial communication. The personal information 1Cademy
        collects on you, will not be sold to gain financial profits (except in the case of a merger or a corporate
        occasion). This lawful marketing activity facilitates presenting you with the offering and products/ service.
        You can opt-out receiving these communications or you can limit the scope and frequency of these communications.
      </p>

      <h4>Main Business Activities</h4>
      <p>
        1Cademy incorporation with third parties may involve in business activities such as purchasing and selling of
        properties, the examination of our commercial activities and financials, and to involve in business development
        openings. The above-mentioned actions may require processing or sharing some personal pieces of information in
        compliance with our lawful benefits to promote and expand 1Cademy. In any case that it necessitates sharing your
        personal information, 1Cademy will assure you of applying confidential means to safeguard your privacy.
      </p>

      <h4>Information Transfers</h4>
      <p>
        1Cademy is a world-wide network and it can be reached globally from almost anywhere. So 1Cademy is required to
        comply with local laws of the country of your residence. When you use 1Cademy and its products and services, you
        confirm that your personal information might be received and transported from your local jurisdiction to the
        united states. To this end, we base on some legal mechanisms to be able to collect and transport your
        information.
      </p>

      <h4>1Cademy's Dedication To Safeguard Information</h4>
      <p>
        1Cademy has a commitment to protect your information. To securely collect, record, process and transport your
        personal information 1Cademy uses Transport Layer Security (''TLS'') standard, by limiting your personal data
        when not required to collect and by storing your personal data only when essential to conduct our lawful
        business activities. To protect your personal information, we need your help and support. You are advised to
        choose a strong and safe password to prevent unwanted access to your personal data. You are discouraged from
        revealing your account information including your password to anyone. Also, you need to be ensured about the
        security of the network via which you access 1Cademy. After finishing your activity on 1Cademy you are
        encouraged to log out from your account, doing so may reduce the chance of accessing your personal information
        by hackers and malicious users.
      </p>
      <h4>Unsubscribing From Direct Marketing</h4>
      <p>
        If you chose not to receive marketing communications from 1Cademy you can opt-out by managing your account
        setting or requesting to unsubscribe.
      </p>

      <h4>Privacy Policy Amendments</h4>
      <p>
        This privacy policy document may be modified and updated. If 1Cademy makes any modification to its privacy
        policy, we will notify you. Also, you preserve the right to request previous versions of this policy.
      </p>
    </Box>
  );
};
