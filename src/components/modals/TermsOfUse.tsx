import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

type TermsOfUseProps = {
  open: boolean;
  handleClose: () => void;
};

export const TermsOfUse = ({ open, handleClose }: TermsOfUseProps) => {
  return (
    <Dialog
      open={open}
      maxWidth={"md"}
      onClose={handleClose}
      scroll={"paper"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="scroll-dialog-title">1Cademy Terms Of Use</DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="scroll-dialog-description" tabIndex={-1} component={"div"}>
          <TermsOfUseContent />
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

export default TermsOfUse;

const TermsOfUseContent = () => {
  return (
    <Box>
      <h3>Introduction</h3>
      <p>
        By retrieving any data from 1Cademy, through an Internet browser, API, or any other means, you guarantee and
        authorize that you only use the data, content, source, or information; including text, graphs, photographs,
        images, source code, video, maps, logos, and animations; for your own personal use. You are granted only a
        personal, non-transferable, limited, non-commercial, non-exclusive, and revocable license to view the content
        provided to you through 1Cademy.
      </p>
      <p>
        You guarantee and authorize not to view, use, procure, or reproduce the data, content, source, or information
        provided to you through 1Cademy, by any automated means; including scrapers, spiders, crawlers, scripts, or
        bots; or to use any other technologies or procedures to retrieve, frame, mask, copy, or simulate the 1Cademy
        data, content, source, or information, unless formally authorized by 1Cademy under separate written agreement or
        through standard search engine or Internet browser usage. You guarantee and authorize not to copy, reproduce,
        modify, republish, download, upload, post, transmit, or distribute the 1Cademy data, content, source, or
        information in any form or by any means without 1Cademy's prior written permission or as indicated in these
        Terms of Use document.
      </p>
      <p>
        By using, viewing, retrieving, or downloading the 1Cademy content or services, as authorized by these Terms of
        Use, you guarantee and authorize that you (a) do not modify any and all copyright and other proprietary notices
        and (b) do not copy, adapt, reproduce, modify, reverse engineer, or attempt to discover any object or source
        code associated with the 1Cademy services, or you permit or support any third party (whether to yours or the
        third party's benefit or not) to do so.
      </p>
      <p>
        By purchasing a subscription or a license to access any 1Cademy content or service, you guarantee and authorize
        that you do not share that subscription or license with others. 1Cademy reserves its right to impose limits on
        your scope of access to 1Cademy content or services.
      </p>
      <p>
        <h4>Creating an Account</h4>
      </p>
      <p>
        By creating an account on 1Cademy, you are guaranteeing and authorizing the following:
        <ol>
          <li>That you own (or have the necessary permission to publicly publish) any content you post to 1Cademy.</li>
          <li>
            That the content you post does not violate the privacy rights, publicity rights, copyrights, contract
            rights, or any other rights of any individual or entity.
          </li>
          <li>That you will not post any content under a viral license.</li>
        </ol>
        <b>You are solely responsible</b> for any and all content you submit, as well as your interactions with other
        users. If you grant authorization to any third-party or automated system, including any services and language
        models accessed through 1Cademy, you will also be held responsible for any content posted to 1Cademy on your
        behalf.
      </p>
      <p>
        When you contribute, upload, or otherwise provide content, you accept full responsibility if any of it was
        illegally obtained or illegal in any other manner. 1Cademy has no responsibility to monitor or enforce your
        intellectual property rights to content but does have the right to protect its rights to your content.
        Additionally, you agree that 1Cademy does not have any commitment to your content and can remove it at any time
        if it deems it necessary, in accordance with its policies and terms of use. If you believe that your content has
        been used in a manner that constitutes copyright infringement, please contact 1Cademy's designated copyright
        agent at onecademy@umich.edu.
      </p>
      <p>
        In the event that 1Cademy receives a notice of claimed copyright infringement, it may remove or disable access
        to the allegedly infringing material and promptly notify the user who provided the content. If the user believes
        that the removed material was removed in error, they may file a counter-notification with 1Cademy's designated
        copyright agent.
      </p>
      <p>
        In addition to copyright infringement, 1Cademy also prohibits the use of its platform for any illegal or
        fraudulent activities, and will take appropriate legal action against any individuals or organizations found to
        be engaging in such activities.
      </p>
      <p>
        By using 1Cademy's platform, you agree to comply with all applicable laws, rules and regulations, and
        acknowledge that 1Cademy has the right to terminate your use of the platform if it determines that you have
        violated any laws, rules or regulations.
      </p>
      <p>
        All content displayed, written, or created on 1Cademy, including text, graphs, photographs, images,
        illustrations, video, voice, sound, maps, logos, animations, source code, raw or processed data, and pieces of
        information, knowledge, or wisdom are the property of 1Cademy and are protected by United States and
        international copyright laws. Use of the website means you agree to follow all U.S. copyright laws,
        international covenants, and other copyright laws.
      </p>
      <p>
        By creating an account on 1Cademy, you agree that any and all the data, source, content, or information that you
        provide to the website is permanently licensed to 1Cademy. 1Cademy has the right and license to publicly
        publish, share, use, display, copy, modify, and distribute the content posted by users, even if the content has
        been removed by the user. When you submit any content on the website, you grant 1Cademy a non-exclusive,
        perpetual, irrevocable, unlimited, royalty-free, and fully transferable right and license to, now or in the
        future, publicly publish, share, use, modify, reproduce, copy, display, distribute, and sell the information.
        You authorize 1Cademy to publish your content in a way that may be accessed by other users. After posting any
        content to 1Cademy, it is not possible to revoke permission for 1Cademy to use the content as necessary for the
        function, security, and features of 1Cademy. 1Cademy reserves the right to alter or change the format, sizing,
        wording, and any other display specifications as it sees fit, even if it is not agreeable to you. 1Cademy also
        has the right to remove any user content at any time. All rights not expressly granted herein are reserved. All
        contents, source/object codes, designs, representations, or any visual features on 1Cademy are protected by
        copyright and the Digital Millennium Copyright Act (DMCA).
      </p>
      <h3>1Cademy Terms of Use</h3>
      <p>
        Before using 1Cademy and its products and services, it is important that you carefully read and understand these
        terms of use. These terms impact your legal rights and responsibilities, and it is your responsibility to ensure
        compliance with them. Any websites, mobile applications, or other applications that reference this document must
        abide by these terms. In this document, we may use the terms "we" or "our" to refer to 1Cademy and its products
        and services, and the terms "you" or "yours" and "user" to refer to any individual or organization who uses
        1Cademy and/or its products and services.
      </p>
      <p>
        When you use 1Cademy as either a registered user or guest user, whether directly or indirectly through a
        third-party website, and from any device or technology including a computer or mobile device, these terms of use
        will apply to you. By connecting to our network and using 1Cademy, you express your consent to these terms of
        use. If you do not agree to these terms, it is your responsibility to cease using 1Cademy and its products and
        services.
      </p>
      <p>
        It is important to note that by accepting these terms of use (i.e. by using 1Cademy and its products and
        services), you agree to resolve any disputes with 1Cademy through binding individual mediation and waive your
        right to participate in a representative action or classwide arbitration.
      </p>
      <p>
        You may be provided with some extra requirements in addition to these Terms of use when you use some specific
        products and services. If there are any discrepancies between those extra Terms and the Terms stated in this
        document, those additional Terms will be Criterion of your action unless the opposite is explicitly stated in
        those extra Terms.
      </p>
      <h4>Registering/Unregistering on 1Cademy</h4>
      <p>
        1Cademy is a platform that offers a variety of services and products, both online and offline, and provides
        users with a collaborative community to share knowledge and learn from others. To fully utilize the features of
        1Cademy, it is necessary for users to create a unique account.
      </p>
      <p>
        During the account creation process, it is important to provide accurate and up-to-date personal information and
        to avoid creating multiple or fake accounts. Using personal information that belongs to others is strictly
        prohibited. The password chosen for the account should be strong and kept confidential. A strong password should
        consist of at least six characters and include a combination of letters, numbers, and symbols (if allowed), as
        well as both uppercase and lowercase letters. The password should not include any words that can be found in a
        dictionary or parts of the user's own name or personal information.
      </p>
      <p>
        The 1Cademy account and membership should not be shared or sold to others, and purchasing or using another
        person's account information is also prohibited. If any unauthorized use of the account is detected, the user
        must immediately inform 1Cademy. 1Cademy reserves the right to discontinue its products and services to any
        account at its discretion, and may also block an account without prior notification.
      </p>
      <h4>Conditions regarding Age and Place of Residence</h4>
      <p>
        In order to use 1Cademy and its associated products and services, it is necessary for you to be at least 16
        years of age. If you are over 16 but have reached the age of majority in the country you reside in, you must
        provide a written letter of consent, signed by both you and your parent or guardian, indicating that you have
        fully read and agreed to these Terms of Use.
      </p>
      <p>
        While 1Cademy can be accessed from almost anywhere around the world, there are certain countries and
        organizations that are banned by the governments of the United States or European Union. 1Cademy provides its
        services and products within the regions of the United States, European Union, India, China, Canada, Australia,
        Taiwan, and New Zealand. However, 1Cademy cannot guarantee the suitability of its services and products for use
        in any other countries outside of these regions, and it is the user's responsibility to ensure that the use of
        1Cademy and its products is legal and appropriate in their place of residency.
      </p>
      <p>
        By using 1Cademy, you agree to comply with all relevant laws and regulations of the United States, European
        Union, India, China, Canada, Australia, Taiwan, and New Zealand, as applicable to your place of work and
        residency. This includes collaborating online, generating and sharing content, and using other features and
        tools offered by 1Cademy.
      </p>
      <p>
        It is important to note that 1Cademy reserves the right to stop providing its products and services to any
        individual, entity, country, or authority at any time, without prior notification and for any reason.
      </p>
      <h4>Laws and Regulations regarding Crowdsourcing Platforms</h4>
      <p>
        Crowdsourcing platforms like 1Cademy are subject to various laws and regulations in different countries. In the
        United States, the Federal Trade Commission enforces guidelines for online marketplaces and the protection of
        user data. The European Union has strict data protection laws under the General Data Protection Regulation
        (GDPR). In India, the Information Technology (Intermediary Guidelines) Rules, 2011 regulate online platforms.
        China has the Cybersecurity Law that governs the operations of online platforms. Canada has the Personal
        Information Protection and Electronic Documents Act (PIPEDA) that governs the protection of personal data.
        Australia has the Privacy Act 1988 and the Australian Privacy Principles (APPs) that regulate the collection and
        use of personal information. Taiwan has the Personal Information Protection Act that governs the protection of
        personal data. New Zealand has the Privacy Act 1993 that governs the protection of personal information.
      </p>
      <p>
        1Cademy is committed to complying with all relevant laws and regulations in each of the regions it operates in.
        It is important for users of 1Cademy to also adhere to the laws and regulations imposed by their country of
        residency regarding their usage of the platform. By using 1Cademy, users acknowledge and agree to comply with
        all relevant laws and regulations in their respective regions.
      </p>
      <h4>Proprietary Rights</h4>
      <p>
        1Cademy is the sole administrator and owner of all services offered on the platform. All information and
        contents on 1Cademy, including domain names, contents, source and object code, as well as all their past,
        present, and future versions, graphic designs, logos, icons, content representations, and interfaces are either
        owned, managed, or licensed by 1Cademy or its authorized partners. All information and contents on 1Cademy are
        protected from unauthorized use by third parties or any entities not approved by 1Cademy. In accordance with
        legal rights, patents, trademark, and copyright regulations, the information and source/object code of 1Cademy
        are strictly prohibited from being copied, shared, or reused by any other entities. It is important to note that
        any contents on 1Cademy, such as images, tables, and book sections, which are copyrighted by other entities, are
        protected under their original work or object. If you redistribute, share, copy, or reverse engineer the
        information, contents, and design of 1Cademy, you may be in violation of copyright, trademark, patent, and other
        related laws and regulations. Such violations may result in criminal penalties and fines.
      </p>
      <h4>The License of 1Cademy Content</h4>
      <p>
        By accepting these Terms of Use, 1Cademy grants you a license to view its contents. This license is
        non-exclusive and non-commercial, and may be terminated at any time by 1Cademy for any reason. Please note that
        this license is solely for your personal and non-commercial use and cannot be transferred to others. You are
        prohibited from accessing 1Cademy's network, copying or collecting 1Cademy content and/or information through
        automated methods such as scripts, bots, spiders, crawlers, or scrapers. Reproduction, sharing, downloading,
        uploading, or transferring any 1Cademy content or information is also strictly prohibited. In order to copy,
        download, share, modify, or redistribute any 1Cademy contents, you must obtain written consent from 1Cademy. For
        any contents and information that are permitted for download or use under these Terms of Use, you are not
        allowed to copy, alter, or attempt to reverse engineer any part or all of the source and object code. You must
        also not cooperate with or support any other entities in collecting, copying, redistributing, modifying, or
        using the contents and/or codes. 1Cademy offers various products and services for purchase by users. If you
        purchase such a product or service, you are not permitted to transfer it to third parties. To prevent
        unauthorized use of 1Cademy contents and services, 1Cademy may restrict user access to its contents and
        products.
      </p>
      <h4>Public Sharing</h4>
      <p>
        At 1Cademy, we believe in the power of knowledge sharing and spreading information. As a user of our platform,
        you may be granted a written license to make personal use of some of our 1Cademy content or to share specific
        limited content with others. This may include sending or sharing 1Cademy content to a friend, inserting it into
        your personal website, or sharing it on social media platforms such as Instagram, Facebook, Twitter, etc.
      </p>
      <p>
        It is essential to properly cite and reference 1Cademy as the source of the information when sharing 1Cademy
        content. This provides proper credit to 1Cademy and allows anyone who views your shared content to easily see
        and refer to the original source. To properly cite 1Cademy, simply state that the information was obtained from
        1Cademy and include a link to our platform.
      </p>
      <p>
        However, we reserve the right to revoke or rescind this license and permission at any time and according to our
        discretion, based on our legal interests. If you have any questions or concerns about sharing 1Cademy content,
        please reach out to us for clarification.
      </p>
      <h5>Citing 1Cademy in Scientific Publications</h5>
      <p>
        When citing 1Cademy in scientific publications, it is important to follow the citation style that is required by
        the publication you are submitting to. Here are some common citation styles and how to cite 1Cademy in each:
      </p>
      <ul>
        <li>
          <b>APA 6:</b> 1Cademy. (n.d.). [Information obtained from 1Cademy]. Retrieved from https://www.1cademy.com
        </li>
        <li>
          <b>APA 7:</b> 1Cademy. (n.d.). [Information obtained from 1Cademy]. Retrieved from https://www.1cademy.com
        </li>
        <li>
          <b>MLA:</b> "1Cademy." 1Cademy, n.d. Web. [Date accessed]. &lt;https://www.1cademy.com&gt;.
        </li>
        <li>
          <b>Chicago:</b> 1Cademy. [Information obtained from 1Cademy]. [Date accessed].
          &lt;https://www.1cademy.com&gt;.
        </li>
      </ul>
      <p>
        Note: "n.d." means "no date" and is used when the date of publication is unknown. [Information obtained from
        1Cademy] should be replaced with the specific information that you obtained from 1Cademy.
      </p>
      <h4>User's contribution and Content generation</h4>
      <p>
        1Cademy is a platform that allows users to generate and share content individually or collaboratively with
        others. The user-generated content (referred to as "User Content" or "1Cademy content") may include creating and
        proposing new content/relationships or reference nodes, images, videos, comments and feedback, text, profile
        information, and modifications to previously generated content.{" "}
      </p>
      <h4>License and Intellectual Property Rights</h4>
      <p>
        By posting, submitting, linking to, emailing, or sharing any 1Cademy content, you agree that 1Cademy and its
        authorized third parties or associates have a non-exclusive, unlimited, permanent, fully sublicensable, and
        transferable license to perform, utilize, reproduce, copy, show, distribute, modify, sell, offer for sale, and
        create derivatives of the User Content. You also grant 1Cademy the right to apply any type of copyright,
        trademark, or license to the User Content.{" "}
      </p>
      <p>
        Additionally, when you contribute to 1Cademy and generate any content, you grant 1Cademy the right to
        unlimitedly and unconditionally use any ideas or concepts in the User Content for any reason, including but not
        limited to business, research, marketing, and progression. However, 1Cademy will not pay or compensate you in
        any way for the use of your ideas or concepts.{" "}
      </p>
      <h4>Accessibility and Searchability of User Content</h4>
      <p>
        The User Content you generate and contribute on 1Cademy will be publicly searchable and accessible on the
        1Cademy network and the internet. You agree to waive any rights you may have now, in the past, or in the future
        in the User Content you contribute, even if the User Content is modified or edited in a way that you may not
        agree with.{" "}
      </p>
      <p>
        User Content on 1Cademy is generated, modified, and established through user contributions and collaboration.
        1Cademy is not obligated to host and provide User Content and may delete it if it is deemed necessary in
        accordance with its legal interests. 1Cademy may also alter, modify, or improve its design and representation,
        or any interface design and features at any time for any reason.{" "}
      </p>
      <h4>Responsibility for User Content</h4>
      <p>
        When you submit any content on 1Cademy, it is your responsibility to ensure that the content does not violate
        any laws, privacy rights, copyrights, or other rights of individuals and entities. You may be required to
        provide 1Cademy with supporting documentation to justify your agreement with these Terms of Use.{" "}
      </p>
      <p>
        The User Content you submit on 1Cademy is considered non-confidential and non-proprietary, and will not be
        returned. Please note that your content may not be treated confidentially, except as stated in the Privacy
        Policy document. 1Cademy may use or disclose your User Content for any purpose, in any way, in accordance with
        the Privacy Policy. 1Cademy may also retain your User Content for a commercially reasonable time for backup,
        archival, or audit purposes. Furthermore, 1Cademy may retain and use your User Content as necessary to comply
        with legal obligations, resolve disputes, or enforce the terms and conditions of the website.{" "}
      </p>
      <p>
        By submitting your User Content, you grant 1Cademy a non-exclusive, transferable, sub-licensable, royalty-free,
        worldwide license to use, copy, modify, create derivative works based on, distribute, publicly display, publicly
        perform, and otherwise exploit in any manner such User Content in all formats and distribution channels now
        known or hereafter devised (including in connection with the website and 1Cademy's business and on third-party
        sites and services), without further notice to or consent from you, and without the requirement of payment to
        you or any other person or entity.{" "}
      </p>
      <p>
        You represent and warrant that: (i) you either are the sole and exclusive owner of all User Content or you have
        all rights, licenses, consents, and releases that are necessary to grant to 1Cademy the rights in such User
        Content, as contemplated under these terms and conditions; and (ii) neither the User Content, your submission of
        such User Content, nor 1Cademy's use of the User Content as permitted herein will infringe, misappropriate or
        violate a third party's patent, copyright, trademark, trade secret, moral rights or other proprietary or
        intellectual property rights, or rights of publicity or privacy, or result in the violation of any applicable
        law or regulation.{" "}
      </p>
      <h4>Allowable Terms of Use</h4>
      <p>
        You are solely responsible for the user content that you generate and contribute, or the content you share or
        convey to other users on 1Cademy. If you contribute any unlawful or unacceptable content, 1Cademy reserves the
        right to not only delete such content, but also to deactivate your account and inform legal authorities for
        further investigation if required. Unacceptable user content includes, but is not limited to:
      </p>
      <ul>
        <li>
          Content that is legally, socially, or culturally unacceptable or defined as such by 1Cademy, including but not
          limited to:
          <ul>
            <li>
              Content that promotes or engages in aggressive assaults, racism, intolerance, hate speech, or corporal
              harm of any kind against any society or person.
            </li>
            <li>Content that promotes or engages in persecution of individuals or groups.</li>
            <li>
              Sexual, pornographic, nudity, or violent content that reveals or abuses others' personal and confidential
              information.
            </li>
            <li>
              Deliberately propagating false or unlawful information, or copying and redistributing copyrighted
              materials without obtaining permission from the copyright holder.
            </li>
            <li>
              Submitting cracked software, pirated soundtracks, pieces of music, photos, or any other type of
              password-protected and restricted content.
            </li>
          </ul>
        </li>
        <li>
          Content that relates to illegal actions, including but not limited to:
          <ul>
            <li>
              Cybercrimes and computer-oriented crimes, such as hacking, copyright infringement, unwarranted
              mass-surveillance, sextortion, child pornography and child grooming, illegal weapon and drug trafficking,
              computer viruses/malwares, cyberbullying and harassment, financial extortion, internet bomb threats,
              classified global security data theft, password trafficking, enterprise trade secret theft, personal data
              hacking, counterfeit trademarks, credit card theft and fraud, email phishing, and domain name hijacking.
            </li>
          </ul>
        </li>
        <li>
          Content that promotes commercial or financial benefit, or advertisements, unless you have obtained written
          permission from 1Cademy.
        </li>
        <li>Unauthorized posting of others' personal information, such as pictures, voice recordings, or videos.</li>
        <li>Posting content that is protected by copyright, privacy rights, or patents.</li>
      </ul>
      <p>
        1Cademy reserves the right to delete or restrict access to any user content that violates these terms, and to
        deactivate or ban accounts that persistently violate these terms.
      </p>
      <h4>Forbidden operations on 1Cademy</h4>
      <p>
        1Cademy is committed to providing a safe and secure platform for its users. In order to ensure this, certain
        actions are strictly prohibited on 1Cademy. Any user engaging in these activities will have their account
        suspended or terminated, and may face legal consequences.
      </p>
      <p>The following is a comprehensive list of forbidden operations on 1Cademy:</p>
      <ul>
        <li>
          Any kind of advertisement or promotion of products or services without obtaining prior permission from
          1Cademy. This includes promoting products or services for personal gain or on behalf of third parties.
        </li>
        <li>
          Any attempt to bypass or alter 1Cademy security technologies, including manipulating or altering any part of
          the code or security technologies.
        </li>
        <li>
          Any form of cybercrime or sabotage, such as the use of viruses, malware, bots, worms, or any other computer
          programs that crash, damage, or restrict the operation of computer software or hardware, or that facilitate
          unwanted access to technology.
        </li>
        <li>
          Copying, bulk downloading, republishing, transferring, or creating derivative works based on 1Cademy content
          and services.
        </li>
        <li>
          Altering functionalities, such as advertisements or voting/commenting features, by modifying HTML/CSS codes or
          any other means.
        </li>
        <li>
          The use of automated tools or bots, which are not provided by 1Cademy, to submit or receive 1Cademy content.
        </li>
        <li>
          Attempts to put excessive load on 1Cademy servers or technologies, causing interruptions to 1Cademy services
          and network functionality.
        </li>
        <li>
          The use of inappropriate images, photos, avatars, or profile pictures that contain advertisements, illegal
          content, taboo subjects, sexual content, propaganda, hate speech, or anything else deemed unacceptable
          according to 1Cademy's terms of use.
        </li>
        <li>
          Submitting disruptive or irrelevant content, such as casting random votes, submitting multiple identical or
          similar contents, using language or symbols that are difficult for the majority of users to understand,
          posting threads for no reason, submitting large blank contents, plain images or tables with no content, using
          a writing style that is difficult to read (such as all caps, no space, unusual use of punctuation, acronyms,
          or symbols), or using alternate capital letters.
        </li>
      </ul>
      <p>
        It is the responsibility of all 1Cademy users to abide by these guidelines. If you encounter any prohibited
        behavior on 1Cademy, please report it to the 1Cademy team immediately.
      </p>
      <h4>1Cademy System Development and Updating</h4>
      <p>
        1Cademy is committed to providing its users with the best possible experience on our platform. As part of this
        commitment, we may occasionally implement new services and products, or modify existing features and offerings,
        in order to improve our platform and meet the evolving needs of our users.
      </p>
      <p>
        Please note that these changes may be made without prior notice, and that updates and modifications to our
        services and products may not always be reflected in our terms of use. However, we will always strive to provide
        our users with the best possible experience and to continue improving the 1Cademy platform.
      </p>
      <h4>Using 1Cademy on Hand-Held Devices</h4>
      <p>
        To make it easier for users to interact with 1Cademy, we offer several functionalities that can be accessed on
        hand-held devices such as smartphones, tablets, and other smart devices. These functionalities may include, but
        are not limited to, submitting new content, editing or modifying proposals, voting, posting comments and
        feedback, viewing your account information and achievements, communicating with other users, and more.
      </p>
      <p>
        In some cases, 1Cademy may require users to pay a fee or subscribe to access certain features on hand-held
        devices. If this is the case, we will make it clear in advance and will seek confirmation from users before any
        charges are applied.
      </p>
      <p>
        Please note that using hand-held devices to access 1Cademy features requires an internet or messaging
        connection, and that any costs associated with this connection should be taken into account. We recommend that
        users consult with their service providers to learn more about these costs and fees.
      </p>
      <p>
        Additionally, 1Cademy may communicate with users by sending messages to the mobile phone number provided during
        account registration. These messages may include security alerts, notifications, advertisements, and other
        communications. By providing your mobile phone number, you confirm that it belongs to you and that you will
        update it as soon as it changes or is transferred to someone else. Failure to do so may result in inconvenience
        or difficulty in contacting you through your phone number, and you will be solely responsible for these issues.
      </p>
      <h4>1Cademy Email Communications</h4>
      <p>
        1Cademy may communicate with you through email, using the email address provided during your account
        registration. It is your responsibility to keep this email active and accessible. Please be aware that 1Cademy,
        its affiliates, and employees will never request sensitive information such as your login credentials, payment
        information (e.g. credit card details), or any other confidential information through email or text messages. If
        you receive any suspicious email or text message that appears to be from 1Cademy, do not respond and immediately
        inform us for further investigation. 1Cademy cannot be held responsible for any issues that may arise from you
        revealing your sensitive information to third parties posing as 1Cademy.
      </p>
      <h4>Termination of 1Cademy Account</h4>
      <p>
        You have the option to terminate your 1Cademy account and subscriptions at any time. However, to be eligible for
        account termination, you must have fulfilled all of your obligations, such as paying any outstanding fees or
        subscriptions. Additionally, 1Cademy reserves the right to terminate your account for any reason, at its
        discretion. Please note that even after your account is terminated, some information such as your content,
        proposals, votes, achievements, comments, feedback, profile picture/avatar, and/or username may still remain on
        1Cademy's systems.
      </p>
      <h4>Financial Transactions and Payments on 1Cademy</h4>
      <p>
        To participate in financial transactions on 1Cademy, you will be required to provide a valid payment method.
        This may include but is not limited to credit/debit cards, PayPal, and other authorized online payment service
        providers. In some cases, and in accordance with 1Cademy's policies and applicable laws and regulations, you may
        also be able to use cryptocurrency payment methods such as Bitcoin.
      </p>
      <p>
        As part of the payment verification process, 1Cademy may run a pending charge. This is not a confirmed charge,
        and you will not be charged. This verification may be initiated when you edit or modify your payment
        information, or if there is a problem with your payment. Please note that some financial transactions on
        1Cademy, such as buying products or services or earning money from 1Cademy, may be subject to governmental
        taxes. If additional fees or taxes apply to your transaction, you will be informed in advance.
      </p>
      <p>
        By providing your payment information, you agree to deliver your billing address and phone number to your
        financial organization, along with any necessary card verification data (e.g. CSC, CVD, CVV, CVC, V-code, SPC).
      </p>
      <p>
        It is important to note that 1Cademy will never request your user name and password or payment information such
        as credit card information through email or text message. If you receive any such deceitful messages, do not
        reveal your information and immediately inform 1Cademy for further investigation.
      </p>
      <h4>Other Entities' Links, Content, and Services</h4>
      <p>
        On 1Cademy, you may come across content or links to external sources or websites. It's important to note that
        1Cademy does not supervise, monitor, validate, or authenticate these materials. If you are allowed to share
        1Cademy's content on third-party services like social networks (e.g. Facebook, Instagram, Twitter), you will be
        required to log in to those websites.
      </p>
      <p>
        By using 1Cademy, you acknowledge that the platform does not endorse, validate, or guarantee the completeness,
        correctness, or availability of any advertising services, products provided by third-party entities. It's your
        responsibility to validate and verify these services and products. 1Cademy will not be held responsible for any
        contract, agreement, financial transactions, payments, or personal information exchange that you make with these
        external entities.
      </p>
      <h4>Employment/ Job Offers and Academic/Research Positions</h4>
      <p>
        1Cademy may announce job offers or academic and research positions to you based on the information you provide
        on the platform and your interaction with the 1Cademy network. The platform tries to personalize these
        announcements and limit their scope to fit your requirements. 1Cademy may also suggest that you acquire certain
        knowledge or skills to better match these positions. However, 1Cademy does not guarantee that you will find a
        matching position or offer.
      </p>

      <h3>1Cademy Disclaimer</h3>
      <p>
        1Cademy is a platform for user-generated content. The majority of the information and materials provided on
        1Cademy are created and submitted by users like yourself. All content on 1Cademy is considered to be the
        property of 1Cademy and is licensed in accordance with these Terms of Use.
      </p>
      <p>
        It is your responsibility to ensure that you are not infringing upon any copyrights of original sources when you
        provide content to 1Cademy. This includes content taken from books, papers, journals, websites, or any other
        media. If you submit any content that is password protected, licensed under Creative Commons, GNU Free
        Documentation Licensed, or any similar license that prohibits restrictive licensed derivative works, commercial
        use, or is inconsistent with 1Cademy's terms and policies, you will be solely responsible for any legal issues
        that arise.
      </p>
      <p>
        If you engage in any activities that infringe upon the copyrights of third parties, 1Cademy reserves the right
        to temporarily or permanently restrict or end its services and products to you, and may refer the matter to
        legal institutions if necessary.
      </p>
      <h3>DMCA Compliance</h3>
      <p>
        At 1Cademy, we are dedicated to adhering to the Digital Millennium Copyright Act (DMCA) by acknowledging any
        reports of alleged violation. However, we also recognize that not every takedown notification is legitimate. If
        any third parties or license holders believe that their content has been submitted on 1Cademy without their
        consent, they can request its deletion under the provisions of the DMCA. Additionally, they may raise their
        concerns directly on the relevant forum or proposal node on 1Cademy, enabling the contributors to respond in a
        more time-efficient manner.
      </p>
      <p>
        All requests must be submitted through the contact information provided at the end of this document. To submit a
        request, your request must include the following:
      </p>
      <ul>
        <li>Your physical or electronic signature;</li>
        <li>A complete description of the copyrighted material that is claimed to have been infringed;</li>
        <li>
          Identification of the work that is claimed to have been infringed or to be the subject of infringing activity;
        </li>
        <li>Your contact information including an address, telephone number, and email;</li>
        <li>
          A declaration that the claimed content is not legitimate as per the copyright owner, its agent, or the law;
        </li>
        <li>
          A statement that the information in the request is valid and that, under penalty of perjury, you hold an
          exclusive right that is allegedly infringed or are authorized to act on behalf of the copyright owner.
        </li>
      </ul>
      <p>If you wish to submit a counter-notification, you must provide the following information:</p>
      <ul>
        <li>Your physical or electronic signature;</li>
        <li>
          A description of the node (including the title/ID) that has been deleted or to which access has been disabled;
        </li>
        <li>
          A declaration under penalty of perjury that you strongly believe that the node was removed or disabled due to
          a misunderstanding or misidentification of the material;
        </li>
        <li>
          Your name/username, address, and telephone number, and a declaration that you consent to the jurisdiction of
          the Federal District Court for the judicial district in which you reside, or for any judicial district outside
          of the U.S in which 1Cademy may be found, and that you will accept service of process from the person who
          reported the alleged infringement or their agent.
        </li>
      </ul>
    </Box>
  );
};
