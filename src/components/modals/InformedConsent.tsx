import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

type ConsentFormProps = {
  open: boolean;
  handleClose: () => void;
};

export const InformedConsent = ({ open, handleClose }: ConsentFormProps) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll={"paper"}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <DialogTitle id="scroll-dialog-title">1Cademy Informed Consent</DialogTitle>
      <DialogContent dividers>
        <DialogContentText id="scroll-dialog-description" tabIndex={-1} component={"div"}>
          <InformedConsentContent />
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

export default InformedConsent;

const InformedConsentContent = () => {
  return (
    <Box>
      <h3>Introduction</h3>
      <p>
        By retrieving any data from 1Cademy, through an Internet browser, API, or any other means, you guarantee and
        authorize that you only use the data, content, source, or information; including text, graphs, photographs,
        images, source code, video, maps, logos, and animations; for your own personal use. You are granted only a
        personal, non-transferable, limited, non-commercial, non-exclusive, and revocable license to view the content
        provided to you through 1Cademy. You guarantee and authorize not to view, use, procure, or reproduce the data,
        content, source, or information provided to you through 1Cademy, by any automated means; including scrapers,
        spiders, crawlers, scripts, or bots; or to use any other technologies or procedures to retrieve, frame, mask,
        copy, or simulate the 1Cademy data, content, source, or information, unless formally authorized by 1Cademy under
        separate written agreement or through standard search engine or Internet browser usage. You guarantee and
        authorize not to copy, reproduce, modify, republish, download, upload, post, transmit, or distribute the 1Cademy
        data, content, source, or information in any form or by any means without 1Cademy's prior written permission or
        as indicated in these Terms of Use document. By using, viewing, retrieving, or downloading the 1Cademy content
        or services, as authorized by these Terms of Use, you guarantee and authorize that you (a) do not modify any and
        all copyright and other proprietary notices and (b) do not copy, adapt, reproduce, modify, reverse engineer, or
        attempt to discover any object or source code associated with the 1Cademy services, or you permit or support any
        third party(whether to yours or the third party's benefit or not) to do so.
      </p>
      <p>
        By purchasing a subscription or a license to access any 1Cademy content or service, you guarantee and authorize
        that you do not share that subscription or license with others. 1Cademy reserves its right to impose limits on
        your scope of access to 1Cademy content or services.
      </p>
      <p>
        By creating an account on 1Cademy, you guarantee and authorize that (1) you own (or have the permission to
        publically publish) the content you post to 1Cademy; (2) the content you post does not violate the privacy
        rights, publicity rights, copyrights, contract rights, or any other rights of any entity; and (3) you do not
        post any content under any sort of viral license. You are solely responsible for any and all of the content you
        submit and your interactions with other users. When you contribute, upload, or otherwise provide content, you
        accept full responsibility if any of it was illegally obtained or illegal in any other manner. 1Cademy has no
        responsibility to monitor or enforce your intellectual property rights to content but does have the right to
        protect its rights to your content. Additionally, you agree that 1Cademy does not have any commitment to your
        content and may or may not monitor, display, accept, or delete it at any time.
      </p>
      <p>
        All content displayed, written, or created on 1Cademy, including text, graphs, photographs, images, source code,
        video, maps, logos, and animations are the property of 1Cademy and are protected by the United States and
        international copyright laws. Use of the website means you agree to follow all U.S. copyright laws,
        international covenants, and other copyright laws.
      </p>
      <p>
        By creating an account on 1Cademy, you agree that any and all the data, source, content, or information that you
        provide to the website is permanently licensed to 1Cademy. 1Cademy has the right and license to publicly
        publish, share, use, display, copy, modify, and distribute the content posted by users even if the content has
        been removed by the user. When you submit any content on the website, you grant 1Cademy a non-exclusive,
        perpetual, irrevocable, unlimited, royalty-free, and fully transferable right and license to now or in the
        future publicly publish, share, use, modify, reproduce, copy, display, distribute, and sell the information. You
        authorize 1Cademy to publish your content in a way that may be accessed by other users. After posting any
        content to 1Cademy, it is not possible to revoke permission for 1Cademy to use the content as is necessary for
        the function, security, and features of 1Cademy. 1Cademy reserves the right to alter or change the format,
        sizing, wording, and any other display specifications as it sees fit, even if it is not agreeable to you.
        1Cademy also has the right to remove any user content at any time. All rights not expressly granted herein are
        reserved. All contents, source/object codes, designs, representations or any visual features on 1Cademy are
        protected by copyright and the Digital Millennium Copyright Act (DMCA). More detailed information about our
        Terms of Use are described below.
      </p>
      <h3>1Cademy Terms of Use</h3>
      <p>
        You have to carefully read and understand this document about 1Cademy's terms of use. These terms of service
        impact your lawful rights and Responsibilities. Any websites, mobile applications or any other application that
        refers to this document must comply with these terms. In this document, we may use the word like "we" or "our"
        to refer to 1Cademy and its products and services. Also the terms "you" or "yours" and "user" are used to infer
        any individual or authority/organization who uses 1Cademy and/or its products and services. When you use 1Cademy
        as a registered user or a guest user whether directly or indirectly via a third-party website from any device or
        technology including a computer, mobile devices these Terms of use will apply to you. You express your consent
        to these terms of use when you connect out network and use 1Cademy. You are required to prevent using 1Cademy
        and its products if you do not want to conform to these Terms of use. Important: When you confirm and accept
        these Terms of use (i.e. by using 1Cademy and its products and services) you confirm that arguments between you
        and 1Cademy might be solved through binding, individual mediation, and you renunciate your right to engage in a
        representative action or classwide arbitration.
      </p>
      <p>
        You may be provided with some extra requirements in addition to these Terms of use when you use some specific
        products and services. If there are any discrepancies between those extra Terms and the Terms stated in this
        document, those additional Terms will be Criterion of your action unless the opposite is explicitly stated in
        those extra Terms.
      </p>
      <h4>Registering/ unregistering on 1Cademy</h4>
      <p>
        1Cademy offers diverse services and products both online and/or offline. 1Cademy provides users with a
        collaborative community to share knowledge and learn from others. Users are required to have a unique account to
        use 1Cademy and its products and services. You are discouraged to create multiple accounts and you are required
        not to share your account with other individuals or users. 1Cadmemy may not allow you to create fake or
        fraudulent accounts so you are required to provide your real personal information and identity. It is not
        allowed for you to use personal information of others (e.g. name, contact information, photo, ...). You are
        supposed to keep your information up to date, otherwise, 1Cademy does not accept any accountability if any
        inconvenience happens as a result of wrong or outdated information you have provided for your account. When you
        create an account on 1Cademy you are required to choose a password. We strongly recommend you to choose a strong
        password to keep your account safe. you may not share your account information with anybody else. To create a
        strong password, it is advised that your password: 1-to consist of at least six characters (and the more
        characters, the stronger the password) 2- to have a combination of letters, numbers and symbols (@, #, $, %,
        etc.) if allowed. 3-to contain letters in both uppercase and lowercase. 4-not to contain words that can be found
        in a dictionary or parts of the user's own name or information. When you create an account on 1Cademy you are
        not allowed to share or sell it to others, also you consent not to use or buy other's account information or
        membership. In any case that you notice any unwanted use of your 1Cademy account/membership, you conform to
        inform 1Cademy about it. 1Cademy preserves the right to stop providing products and services to your account.
        1Cademy may also block your account on its own preference for any purpose without notifying you.
      </p>
      <h4>Conditions about age and living place</h4>
      <p>
        In order to use 1Cademy and its products and services, you are supposed to be older than 16. If you are older
        than 16 but you have reached the majority age of the country you live in, you must provide us with a written
        letter that you and your parent/guardian have fully read and agreed to these Terms of use. You can create an
        account from almost anywhere around the world except from countries or organizations that are banned by the
        government of the U.S. 1Cademy provides most of its services and products within the U.S. 1Cademy does not
        guarantee that its services and products are suitable to use in any other countries outside the U.S. and it is
        your responsibility to be assured that the use of 1Cademy and its products are lawful/appropriate in the place
        you reside. By using 1Cademy, you agree to adhere to the laws and regulations of the United States to
        collaborate online, generate/share contents and using other features and tools. 1Cademy may stop providing its
        products and services to any individuals/entity, countries, or authority without notification at any time and
        for any purpose.
      </p>
      <h4>Proprietary Rights</h4>
      <p>
        All services belong to and administered by 1Cademy. All contents and information on 1Cademy, including domain
        names, contents, source and object code and all their previous and future versions, graphic designs, logos,
        icons, content representations, and interfaces are possessed, managed or licensed by 1Cademy or 1Cademy's
        authorized partners. All contents and information on 1Cademy are preserved from being used by third parties or
        any unapproved entities. Based on legal rights, patents, trademark and copyright regulations, all contents and
        source/object code of 1Cademy are not allowed to be copied, shared, or reused by other entities. It should be
        noted that if any content like images, tables and book sections on 1Cademy are copyrighted by other entities,
        their rights are preserved on their original work/object. If you redistribute, share, copy and/or reverse
        engineer the contents, information and design of 1Cademy you may infringe copyright, trademark, patent, and
        other related laws and regulations. By violating those laws and regulations you may commit a crime and will
        result in penalties of fines.
      </p>
      <h4>The License of 1Cademy Content</h4>
      <p>
        By agreeing to these Terms of use, 1Cademy offers you a license to view its contents. This license is
        non-exclusive and non-commercial. This license might be terminated at any time and for any purpose by 1Cademy.
        Also please note that this license is granted to you and you cannot transfer it to others. You are required to
        use 1Cademy and its products and services for your personal/non-commercial purposes. By agreeing to these Terms
        of Use you confirm that you will not access our network, copy or collect 1Cademy content and/or information by
        any methodical /automated tools (e.g. scripts, bots, spiders, crawlers, or scrapers). You may not copy,
        disseminate, reproduce, share, download, upload or transfer any 1Cademy contents or information. You are
        required to gain a written letter from 1Cademy to be able to copy, download, share , modify and redistribute any
        1Cademy contents. For the contents and information permitted by these Terms of use to be downloaded or used, you
        should not copy or alter 1Cademy contents, you should not try to procure, copy m reverse engineer any part or
        all parts of the source and object code, you should not cooperate with or support any other entities to collect,
        copy, redistribute of modify and contents and/or codes. 1Cademy provides many products and services to be bought
        by users. If you buy such a product or service, you may not transfer that product or service to third parties.
        To prevent unapproved use of 1Cademy contents and services, 1Cademy may restrict users' access to its contents
        and products.
      </p>
      <h4>Public sharing</h4>
      <p>
        You may be granted a written license from 1Cademy for some personal use of 1Cademy contents or share specific
        limited 1Cademy contents with others. This may include sending/sharing 1Cademy contents to a friend, inserting
        in your personal web site or sharing 1Cademy content on other websites or social media like Instagram, Facebook,
        Twitter, ... To do so you should state that you have obtained that content from 1Cademy and you have to cite
        1Cademy so that anyone who views your shared contents can see and refer to it. It should be noted that based on
        our legal interests, we may rescind this license and permission on our preferences.
      </p>
      <h4>User's contribution and Content generation</h4>
      <p>
        Users can generate content individually or collaboratively with their peers and share on 1Cademy. These
        user-generated contents/contributions (referred to as User Content or 1Cademy content in general) may include:
        creating and /or proposing a new content/relationship or reference node, image, video, comments and feedback,
        text, profile information, modification proposals on previously generated nodes, communication with 1Cademy and
        peers. By posting, submitting, linking to, emailing/sharing any 1Cademy contents (some of which mentioned
        above), you agree that 1Cademy and its authorized third parties or associates have a non-exclusive, unlimited,
        permanent, fully sublicensable and transferable license to perform, utilize, reproduce, copy, show, distribute,
        modify, sell, offer for sale, derivative the User Content. Additionally, you grant 1Cademy the right to apply
        any kind of copyright/ trademark or licenses to those contents. 1Cademy may produce, promote or show you
        advertisements. 1Cademy may process your account information including your name and picture to promote products
        and services to you. To this end, 1Cademy may process your activities on 1Cademy network and utilization of
        different products and services. Also, you declare your consent that 1Cademy may utilize your account
        information such as name and profile photo in relationship with advertisements and promotions. When you
        contribute on 1Cademy and you generate any content on 1Cademy, you grant 1Cademy to unconditionally and
        unlimitedly utilize ideas or concepts in any user content on its own preference at any time for any reason,
        including but not limited to business, research, marketing and progression. For this purpose,1Cademy will not
        pay you or grant you any other kind of compensations or refunds. The contents you generate and contribute on
        1Cademy will be searchable and accessible publicly on 1Cademy and the internet. Based on our lawful interests,
        you agree to waive any rights you may have now, in the past or in the future in any User Content you contribute
        and share, even if such User Content is modified or edited in a fashion you may not agree with Contents on
        1Dademy are generated, modified and established by users' contribution and collaboration. 1Cademy is not obliged
        to host and provide those contents and may delete any user content in compliance with its legal interests. Also,
        1Cademy may alter, modify its design and representation or any interface design and features to improve the user
        experience or any other reasons at any time. When you submit any content on 1Cademy it is your responsibility to
        be assured that the content you have contributed does not violate any laws, privacy, and copyrights or any other
        rights of other individuals and entities. You agree to provide 1Cademy with supporting documentation to justify
        your agreement with these Terms of use if required. You agree that the user content you submit on 1Cademy are
        non-confidential and non-proprietary and will not be reverted. please note that your contents will not be
        treated confidentially except the ones stated in the Privacy Policy document. 1Cademy does not admit or
        acknowledge any kind of content, ideas, proposals, innovations, and opinions unless the ones we have officially
        declared. This will prohibit possible conflicts in the case that your ideas, innovations, suggestions are
        resembling those we have developed or are developing separately. You acknowledge and confirm that 1Cademy has no
        responsibility to control or administer your intellectual property rights to the content you generate and submit
        on 1Cademy individually or collaboratively. However, 1Cademy can freely apply its licenses and rights to your
        contents. Additionally, you agree that to the permissible legal limits,1Cademy has no duty and responsibility
        toward user contents and may hide, reject or remove your user content on its own preference without prior
        notification. 1Cademy may monitor and revise your user contents and your communications and messages before
        being submitted on the network and being publicly displayed in order to prevent any hate speech or illegal
        activities.
      </p>
      <h4>Allowable Terms of Use</h4>
      <p>
        You are the only responsible one for the user contents you generate and contribute or the contents to share or
        convey to other users on 1Cademy. If you contribute any unlawful or non-acceptable contents, 1Cademy not only
        preserve the right to delete those contents but also may opt-out those accounts and inform legal authorities for
        further investigations if required. Not allowable user contents are those contents that are legally, socially,
        culturally not accepted or those defined by 1Cademy. Some examples of such contents are: aggressive assaulting
        or promoting racism, intolerance, hate speech or corporal harm of any kind against any society or person;
        persecution or promoting persecution of other individuals or groups. sexual, pornography, nudity and violence
        revealing or abusing others' personal and confidential information. Deliberately propagating wrong or unlawful
        information copying and redistributing copyrighted materials without gaining permission from the copyright
        holder. submitting cracked software or pirated soundtracks, pieces of music or photos or any other kind of
        password protected and dedicated contents. any content about illegal actions, Cybercrimes, or computer-oriented
        crimes including but not limited to hacking, copyright infringement, unwarranted mass-surveillance, sextortion,
        child pornography, and child grooming, illegal weapon and drugs marketing/trafficking, computer
        viruses/malwares, Cyberbullying and harassment, Financial extortion, Internet bomb threats, Classified global
        security data theft, Password trafficking, Enterprise trade secret theft, Personally data hacking, Counterfeit
        trademarks, Credit card theft and fraud, Email phishing and domain name hijacking. any commercial/ beneficiary
        actions or advertisements, unless having obtained official written permission from 1Cademy. unauthorized posting
        of others' personal information such as pictures, voice, or videos. posting copyright, privacy rights or patent
        protected contents.
      </p>
      <h4>Forbidden operations on 1Cademy</h4>
      <p>
        1Cademy, based on its lawful interests, inhibit users from some actions some which are mentioned below:Any kind
        of advertisement or promoting any products or services, for your own profit or on behalf of any third parties
        without obtaining prior permission from 1Cademy.
      </p>
      <p>
        any attempt to prevent or bypass any 1Cademy security technologies or any kind of alteration or manipulation in
        any part of codes and security technologies.
      </p>
      <p>
        any kind of cybercrime or sabotage which may include but not limited to: viruses, malwares, bots, worms, or any
        kind of computer program that crash, damage or restrict the operation of any computer software or hardware or
        technologies, or facilitating any unwanted access to a technology.
      </p>
      <p>
        copying, bulk downloading, republishing, transferring,or making any kind of derivative work upon any 1Cademy
        contents and services.
      </p>
      <p>
        any manipulation to hinder or remove some functionalities like advertisements or voting /commenting features by
        modifying HTML/CSS codes or any other means.
      </p>
      <p>using automated tools or bots to submit or receive any kind of 1Cademy content.</p>
      <p>
        any attempts to put extra/unusual load on our servers or technologies to interrupt our services and the network
        functionality.
      </p>
      <p>
        to choose any kind of photos/avatars or pictures as your profile pictures or submit any contents or
        communications which contain advertisements, illegal contents, taboos, sexual contents, propaganda or hate
        speech or anything that is not acceptable based on this Terms of use.
      </p>
      <p>
        submitting disruptive or irrelevant contents such as casting random votes, multiple identical/similar contents,
        using a language or symbols which cannot be easily understood by the majority of users, posting a thread for no
        reason but to have it go to the top, large blank contents, plain pictures/ tables with no contents, using a
        writing style which is difficult to read such as all caps, no space, unusual use of punctuations/acronyms and
        symbols, alternate capital letters.
      </p>
      <h4>1Cademy system developments and up-to-dating</h4>
      <p>
        In order to improve users' experience on 1Cademy, developing new products and services, applying innovative
        features or any other purpose, 1Cademy may implement new services and products and/or terminate providing any or
        all of its services and products at any time on its own preference without prior notifications. Please note that
        these changes and modifications may not be stated in terms of use.
      </p>
      <h4>Using 1Cademy via hand-held technologies</h4>
      <p>
        To facilitate and ease users; interaction with 1Cademy we may provide some functionalities of our services to be
        fulfilled on hand-held/portable technologies like cell phones. tablets, smart devices,... these facilities may
        include but are not limited to submitting new content, editing or modifying proposals, voting, posting comments
        and feedback, viewing your account information and achievements, communicate/chat with peers. 1Cademy may
        require you to pay or buy a subscription to use those features. If 1Cademy decides to charge you for using these
        features, it will be clearly stated in advance and will acquire your confirmation. Please note that to use these
        features you need to have access to internet or messaging technologies and the corresponding cost should be
        taken into account. please contact your service provider to get more information about those costs and fees.
        1Cademy may contact you by sending messages to your mobile phone via the number you have provided in your
        account registration. These messages may belong to verifications/notifications/security alerts/ads and
        communications. You confirm that the phone number belongs to you and you will update the phone number as soon as
        it has been changed or dismissed or transferred to others, otherwise, you will be solely responsible for any
        inconvenience in contacting you through your phone number.
      </p>
      <h4>1Cademy Email Messages</h4>
      <p>
        1Cademy will usually contact you via the email you have provided in your account registration. So it is your
        responsibility to keep your email active and reachable. According to our policy, 1Cademy or any of its
        affiliates or employees will not request for your user name and password of payment information like your credit
        card information. So, in any case, you receive any deceitful Email or text message, asking for such information
        you should not reveal your information and should inform 1Cademy for further investigation if needed. Otherwise,
        1Cademy will not be responsible for any problem/deception.
      </p>
      <h4>Termination of 1Cademy Account</h4>
      <p>
        1Cademy provides you a perpetual option to terminate your account and subscriptions. In order to be eligible to
        terminate your account, you need to have fulfilled all your transactions and responsibilities such as ongoing
        payments or subscription fees. Also, 1Cademy preserves the right to terminate your account for any purpose at
        any time. You agree and acknowledge that when you request for terminating and deleting your account, some
        information such as your contents, proposals, votes, achievements, comments feedback, your profile
        picture/avatar and/or username will remain on 1Cademy even after deleting your account.
      </p>
      <h4>Payments Financial Transaction on 1Cademy</h4>
      <p>
        You may be required to provide a legitimate payment means to approve your affordability and qualification to
        make a financial transaction on 1Cademy. This may include but not limited to credit/debit/visa cards, Paypal or
        any other authorized online payment service providers. Additionally to the extent that laws and regulations
        permit and based on 1Cademy's policies, you might be able to use cryptocurrency payment methods such as Bitcoin.
        To verify your payment system, 1Cademy may run a pending charge which will not be confirmed and you will not be
        charged. You agree and acknowledge that this verification might be launched when you edit or modify your payment
        information or in a case that a problem occurs in your payment. Please notice that some financial transactions
        on 1Cademy such as buying some products or services or earning money from 1Cademy might be a subject of
        governmental taxes. If such additional fees or taxes are applicable to your transaction you will be informed in
        advance. You also agree and confirm that you will deliver the address and phone number you have provided your
        financial organization, along with card's verification data (e.g. CSC, CVD, CVV, CVC, V-code or V code, SPC) in
        the case that you are required to provide your billing address.
      </p>

      <h4>Other Entities' Links, Content, and Services</h4>
      <p>
        1cademy contents, messages, and communications may contain contents or links to external sources or web sites.
        You should be aware that 1Cademy does not and cannot supervise, monitor, validate or authenticate those
        materials. In a situation where you are permitted to share 1Cademy contents on external services like social
        networks (e.g. Facebook, Instagram, Twitter,...) you might need to log in those third-party web sites and you
        should consider that 1Cademy does not monitor, collect or supervise any content from those systems. You confirm
        that you recognize 1Cademy does not endorse, validate or guaranties the completeness, correctness, or
        availability of any advertising services, products provided by third-parties on 1Cademy and it is your own
        responsibility to validate and verify those services and products. 1Cademy has no responsibility to you towards
        any contract, agreement, financial transactions, payments or personal information exchange that you perform with
        those external entities.
      </p>

      <h4>Employment/ Job Offers and Academic/Research Positions</h4>
      <p>
        1Cademy may announce to you specific job offers or academic and research positions. Based on the information you
        provide on 1Cademy and your interaction with our Network we try to personalize and limit the scope of those
        announcements to best fit your requirements. 1Cademy may also suggest you acquire some knowledge or skills to be
        able to better match those positions. However, 1Cademy does not warrant or ensure to find a matching position or
        offer.
      </p>
      <h3>1Cademy disclaimer</h3>
      <p>
        1Cademy is a collaborative content generation technology, in which most of the contents are generated and
        submitted by users like YOU. All contents on 1Cademy are 1Cademy's property and are licensed based on these
        Terms of Use. In any case that you provide contents from a book chapter, paper, journals, websites any other
        media it is solely your responsibility to be assured that you are not infringing the copyrights of the original
        source. If you submit any content which is password protected, Creative Commons licensed, GNU Free Documentation
        Licensed or similar licenses that prohibit more restrictive licensed derivative work, commercial use or are
        inconsistent with our Terms of Use and policies you will be solely responsible for any inconvenience and legal
        issues. If you engage in such an action to infringe copyrights of third parties 1Cademy reserves the right to
        temporally or permanently end or restrict providing its services and products to you and may refer you to legal
        institutions if needed.
      </p>
      <h3>DMCA Compliance</h3>
      <p>
        Pursuing the Digital Millennium Copyright Act (DMCA) 1Cademy's policy is to acknowledge reports of any alleged
        violation. Though, we also understand that not every takedown notification is legitimate. We recommend users to
        submit counter-notifications if they strongly believe DMCA takedown demand is not legitimate or valid. If any
        third parties or license holders think their contents are inappropriately submitted on 1Cademy without their
        consent, they can ask for the deletion of the contents under the DMCA. Additionally, they can directly reflect
        their issues on the related forum/ proposal node on 1Cademy so that the contributors can respond to their
        request more time efficiently. All requests to 1Cademy should be only submitted via the contact information
        provided at the end of this document.
      </p>
      <p>
        <i>To do so, your request should include:</i>
      </p>
      <ul>
        <li>Your physical or electronic signature; </li>
        <li>A complete description of the copyrighted material claimed to have been infringed; </li>
        <li>
          Identification of the work that is claimed to be infringing or to be the subject of infringing activity and
          that is to be removed;
        </li>
        <li>
          Providing contact information so that 1Cademy can easily reach you contact you, Including an address/
          telephone number/ Email;
        </li>
        <li>
          A declaration of how the claimed content is not legitimate by the copyright owner, its agent or the law;
        </li>
        <li>
          A statement that the data in the notice is valid and that, under penalty of perjury, you hold an exclusive
          right that is allegedly infringed or are allowed to act on behalf of such owner;
        </li>
      </ul>
      <p>
        <i>To submit counter-notification you must provide:</i>
      </p>
      <ul>
        <li>Your physical or electronic signature;</li>
        <li>Description, the node title/ID of the node that has been deleted or to which access has been disabled ;</li>
        <li>
          A declaration under penalty of perjury that you strongly believe that the node was removed or disabled as a
          result of misconception or misidentification of the material to be removed or disabled;
        </li>
        <li>
          Your name/username, address, and telephone number, and a declaration that you consent to the jurisdiction of
          Federal District Court for the judicial district in which you reside, or for any judicial district out of the
          U.S in which 1Cademy may be found, and that you will accept service of process from the person who reported
          1Cademyof the alleged infringement or an agent of such person;
        </li>
      </ul>
    </Box>
  );
};
