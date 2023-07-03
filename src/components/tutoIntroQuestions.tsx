import BookmarkIcon from "@mui/icons-material/Bookmark";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import CreateIcon from "@mui/icons-material/Create";
import EmailIcon from "@mui/icons-material/Email";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RemoveIcon from "@mui/icons-material/Remove";
import ShareIcon from "@mui/icons-material/Share";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
let secCounter = 0;
let quCounter = 0;

const newSec = () => {
  secCounter += 1;
  quCounter = 0;
  return secCounter + ". ";
};

const quNum = () => {
  quCounter += 1;
  return secCounter + "." + quCounter + ". ";
};

const tutoIntroQuestions: any = {
  Introduction_What_is_a_node_on_1Cademy: {
    title: newSec() + "1Cademy Introduction: What is a node on 1Cademy?",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          This is the first video in a series that will cover what a node is on 1Cademy. A node is a single, rectangular
          box that contains a unit of information that is presented in the title and described in the content.
        </Typography>
        <Typography>
          A node represents the smallest unit of knowledge on 1Cademy. Nodes can be used to connect to other nodes.
          Every node contains a header, footer, proposer, and type. There are several node types, including a concept
          node.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/WhatIsaNodeOn1Cademy.png" width="80%" height="80%" />
        </Box>
        <Typography>
          A concept node defines a single concept of information and its definition. Relation nodes compare and explain
          a relationship between two topics or explain the relationship relating to multiple concepts. Reference nodes
          display a cited source in an APA format. Idea nodes are new, original ideas that are not summarized from a
          external source or contain any needed citations. Question nodes ask a multiple-choice question that user's
          answer by selecting the options provided.
        </Typography>
      </Box>
    ),
    video: "pOzQ81TW8Os",
    questions: {
      What_is_all_knowledge_on_1Cademy_summarized_into: {
        stem: quNum() + "What is all knowledge on 1Cademy summarized into?",
        answers: ["b"],
        choices: {
          a: "Paragraphs",
          b: "Nodes",
          c: "Articles",
        },
      },
      What_kind_of_content_can_be_contained_in_a_node: {
        stem: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
            <Typography>
              {quNum()}What kind of content can be contained in a <strong>single</strong> node?
            </Typography>
            <Typography>
              <strong>Note:</strong> "Idea" nodes do not require citations.
            </Typography>
          </Box>
        ),
        answers: ["a", "b", "c", "e", "f"],
        choices: {
          a: "Cited sources",
          b: "A single concept",
          c: "Relating multiple concepts",
          d: "Definitions of multiple concepts",
          e: "An idea without any citations",
          f: "A multiple-choice question",
        },
      },
      Which_of_the_following_choices_are_true_about_a_node_on_1Cademy: {
        stem: quNum() + "Which of the following choices are true about a node on 1Cademy?",
        answers: ["a", "b", "d", "e", "f", "g"],
        choices: {
          a: "It is shown as a single rectangular box.",
          b: "It contains information described in its content.",
          c: "There should be multiple nodes on 1Cademy explaining the exact same concept.",
          d: "It is presented with a title.",
          e: "It represents the smallest unit of knowledge on 1Cademy.",
          f: "It can be connected to other nodes.",
          g: "It can cite sources.",
        },
      },
    },
  },
  Introduction_The_Shared_Knowledge_Graph: {
    title: newSec() + "1Cademy Introduction: The Shared Knowledge Graph",
    description: "First, please watch this video to learn more about how the 1Cademy knowledge map is organized.",
    video: "CSO-TleAge0",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          The shared knowledge graph is the large shared graph of nodes and prerequisite relations between them. 1Cademy
          users generate evaluate and improve nodes by proposing changes to the graph. The shared knowledge graph on
          1Cademy contains every single node that has been proposed and accepted by 1Cademy users.
        </Typography>
        <Typography>
          It is important to note that every user has access to the contents of the shared knowledge graph, but what a
          user sees on their 1Cademy knowledge map is known as the personalized knowledge map view.
        </Typography>
      </Box>
    ),
    questions: {
      Users_generate_evaluate_and__: {
        stem: quNum() + "Users generate, evaluate, and ________________ nodes by proposing changes to the graph.",
        answers: ["c"],
        choices: {
          a: "Change",
          b: "Expand",
          c: "Improve",
          d: "Increase",
        },
      },
      What_is_contained_in_the_1Cademy_shared_knowledge_graph: {
        stem: quNum() + "What is contained in the 1Cademy shared knowledge graph?",
        answers: ["b"],
        choices: {
          a: "Nodes and prerequisite relations (links) only you have proposed that have been accepted",
          b: "All nodes and prerequisite relations (links) that have been proposed and accepted by 1Cademy users",
          c: "Only nodes and prerequisite relations (links) that you have accepted",
          d: "Only nodes and prerequisite relations (links) that are visible to you",
        },
      },
      Is_the_content_of_the_shared_knowledge_graph_accessible_to_all_users: {
        stem: quNum() + "Is the content of the shared knowledge graph accessible to all users?",
        answers: ["a"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
    },
  },
  Introduction_Personalizing_Your_Knowledge_Map: {
    title: newSec() + "1Cademy Introduction: Notebooks - Personalizing Your Knowledge Map",
    description:
      "This next video is about creating your own Notebooks (personalized knowledge map views) from the nodes created in the 1Cademy knowledge graph.",
    video: "OyUSCZ3YcCk",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          1Cademy’s personalized knowledge map view is a visualization of certain nodes and prerequisite links between
          them which is hierarchically organized and personalized for a specific 1Cademy user. The personalized
          knowledge map supports four overarching learning activities: navigation, summarization, evaluation, and
          improvement.
        </Typography>
        <Typography>
          Every user's personalized knowledge map view will be different and unique to them. If you choose to hide a
          node from your map, your personalized knowledge map view will change. It is important to note that closing or
          hiding a node on your knowledge map will not affect another user's map. Your personalized knowledge map can
          look like anything you would like it to. If you prefer to have very little nodes in view, you can do that. If
          you would rather have many nodes open, you can choose to leave as many nodes open as you would like on your
          map (examples of different knowledge maps shown in video). There are endless ways in which your personalized
          knowledge map view can be organized, it just depends on what you personally like.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/PersonalizingYourKnowledgeMap1.png" width="80%" height="80%" alt="" />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/PersonalizingYourKnowledgeMap2.png" width="80%" height="80%" alt="" />
        </Box>
      </Box>
    ),
    questions: {
      True_or_False_Closing_a_node_on_your_map_view_changes_everyone_else_s_map_view: {
        stem: quNum() + "True or False? Closing a node on your map view changes everyone else's map view.",
        answers: ["b"],
        choices: {
          a: "True",
          b: "False",
        },
      },
      // What_are_the_overarching_learning_activities_supported_by_the_personalized:
      //   {
      //     stem: (
      //       <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem",mt: "1rem"  }}>
      //         {quNum()}What are the overarching learning activities supported by
      //         the personalized knowledge map view? [Hint: one of the correct
      //         answers was not mentioned in the video, but you can find it from{" "}
      //         <a href="https://1cademy.com/home" target="_blank">
      //           the 1Cademy homepage
      //         </a>
      //       </Box>
      //     ),
      //     answers: ["a", "b", "c", "d", "e"],
      //     choices: {
      //       a: "Navigation",
      //       b: "Summarization",
      //       c: "Evaluation",
      //       d: "Improvement",
      //       e: "Linking",
      //     },
      //   },
    },
  },
  Introduction_Ways_to_View_Nodes_on_Your_Personalized_Map: {
    title: newSec() + "1Cademy Introduction: Ways to View Nodes in Your Notebooks (Personalized Map Views)",
    description: "This video explains the different ways nodes can be viewed while you're on 1Cademy.",
    video: "rcOqKCGmljY",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          A closed node on 1Cademy only has its title visible. To open it, select the left-most button in the node
          header.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/WaystoViewNodesonYourPersonalizedMap1.png" width="80%" height="80%" alt="" />
        </Box>
        <Typography>
          After opening, you will be able to read the content of the node. To close it again, select the same left-most
          button in the node header.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/WaystoViewNodesonYourPersonalizedMap2.png" width="80%" height="80%" alt="" />
        </Box>
        <Typography>
          To hide all the offspring of a node, select the middle button in the node header to quickly hide all of the
          children from your view of the map. Finally, if you want to hide a single node from your view of the map, you
          can select the “x” button (the right-most button) in the node header to hide it. Examples are explained
          further in the video.
        </Typography>
      </Box>
    ),
    questions: {
      Which_icon_closes_collapses_a_node_on_your_personalized_knowledge_map_view: {
        stem: quNum() + "Which icon closes (collapses) a node on your personalized knowledge map view?",
        answers: ["a"],
        choices: {
          a: <RemoveIcon />,
          b: <FullscreenIcon />,
          c: "⇤",
          d: <CloseIcon />,
        },
      },
      Which_icon_opens_expands_a_node_on_your_personalized_knowledge_map_view: {
        stem: quNum() + "Which icon opens (expands) a node on your personalized knowledge map view?",
        answers: ["b"],
        choices: {
          a: <RemoveIcon />,
          b: <FullscreenIcon />,
          c: "⇤",
          d: <CloseIcon />,
        },
      },
      Which_icon_hides_a_node_on_your_personalized_knowledge_map_view: {
        stem: quNum() + "Which icon hides a node on your personalized knowledge map view?",
        answers: ["d"],
        choices: {
          a: <RemoveIcon />,
          b: <FullscreenIcon />,
          c: "⇤",
          d: <CloseIcon />,
        },
      },
      Which_icon_hides_the_descendants_of_a_node_on_your_personalized_knowledge_map_view: {
        stem: quNum() + "Which icon hides the descendants of a node on your personalized knowledge map view?",
        answers: ["c"],
        choices: {
          a: <RemoveIcon />,
          b: <FullscreenIcon />,
          c: "⇤",
          d: <CloseIcon />,
        },
      },
    },
  },
  Introduction_Opening_Nodes_on_1Cademy: {
    title: newSec() + "1Cademy Introduction: Opening Nodes on 1Cademy",
    description: "This video goes over the ways a user can open nodes on 1Cademy.",
    video: "zXedPM2xPCc",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          We are going to go over the 10 different ways you can open up a node on your personalized view of the
          knowledge map.
        </Typography>
        <Typography sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Typography>
            1. Using the search function you can search for any key term on the map. If a node has the term in its
            title, it will show up in the results. Click on a result to open up that node
          </Typography>
          <Typography>
            2. You can use your notifications tab to track any updates made to nodes you've contributed to. To open up a
            node that someone has voted on or edited, you can click on the notification.
          </Typography>
          <Typography>
            3. If you've bookmarked any nodes, when a change is made to the bookmarked node it will show up in the
            bookmarked updates tab and you can click on it directly to open it on your map.
          </Typography>
          <Typography>
            4. The pending list will show all of the pending proposals within your tag. If you open the pending
            proposals bar, you will see pending proposals listed. Click on one to open up the node which the pending
            proposal was made to.
          </Typography>
          <Typography>
            5. You can also use the chat feature to link nodes so that people can easily access them. Any user of
            1Cademy can easily open up a linked node sent in the chat.
          </Typography>
          <Typography>
            6. Another way to open up nodes is by going to a user profile by clicking on a profile picture in the
            leaderboard. Once the profile loads, you can scroll down to see all of the past proposals this user has
            made. You can click on any proposal to open up that node.
          </Typography>
          <Typography>
            7. On any of your open nodes, you can click to view the parent links. To open parents, go to the button
            underneath the parents or prerequisites section of a node and click on it.
          </Typography>
          <Typography>
            8. On any of your open nodes, you can click to view the child links. To open the children, you can either
            select one of the children listed in the children section of the node or you can select the “All children”
            button to open up all of them.
          </Typography>
          <Typography>
            9. You can also go to the tags and citations section to open up the node that contains the reference. Click
            on the title listed under “References” to open up the reference node.
          </Typography>
          <Typography>
            10. To open up the tag for a node, go to the tags and citation section of a node and click on any of the
            tags listed under the “Tags” section.{" "}
          </Typography>
        </Typography>
      </Box>
    ),
    questions: {
      How_many_ways_are_there_to_open_nodes_on_1Cademy: {
        stem: quNum() + "How many ways are there to open nodes on 1Cademy?",
        answers: ["b"],
        choices: {
          a: "8",
          b: "10",
          c: "5",
          d: "7",
        },
      },
      Which_of_the_following_are_considered_a_method_of_opening_nodes: {
        stem:
          quNum() + "Which of the following methods are used to display nodes to your personalized knowledge map view?",
        answers: ["a", "b", "c", "d", "e", "f", "g", "h", "j", "k"],
        choices: {
          a: "Search box",
          b: "Notifications",
          c: "Bookmark",
          d: "Pending proposals list",
          e: "Chat room",
          f: "User mini profiles",
          g: "Parent links",
          h: "Child links",
          i: "Open/close buttons",
          j: "Citation links",
          k: "Tag links",
        },
      },
    },
  },
  Introduction_1Cademy_Sidebar: {
    title: newSec() + "1Cademy Introduction: 1Cademy Sidebar",
    description: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>In this section, you will be introduced to the sidebar on 1Cademy.</Typography>
        <Typography>
          <strong>Notes:</strong>
        </Typography>
        <ul>
          <li>The sidebar holds all the important functions and information users need on 1Cademy.</li>
          <li>The sidebar includes your community's leaderboard.</li>
          <li>
            By clicking your user profile picture, on top of the sidebar, you can open your user settings, where you can
            change your default community tag, profile picture, and the light/dark themes.
          </li>
          <li>
            If you click any other user's profile picture, in the leaderboard, it'll open their user profile, where you
            can see their history of contributions.
          </li>
          <li>The notifications tab displays upvotes, downvotes, and proposed edits on nodes you contributed to.</li>
        </ul>
      </Box>
    ),
    video: "vedBocVh0hk",
    questions: {
      What_tools_are_accessible_through_the_sidebar: {
        stem: quNum() + "What tools are accessible through the sidebar?",
        answers: ["a", "b", "c", "d", "e", "f", "g"],
        choices: {
          a: "User settings",
          b: "Search box",
          c: "Notifications",
          d: "Bookmark",
          e: "Pending proposals list",
          f: "Chat room",
          g: "leaderboard",
        },
      },
      OneCademy_interface_is_in_dark_mode_by_default: {
        stem: quNum() + "1Cademy interface is in dark mode by default. How can you change it to light mode?",
        answers: ["a"],
        choices: {
          a: "Open the user settings by clicking your profile picture in the sidebar ⇨ Click the switch button, below your reputation points, and change it to light.",
          b: "You cannot, because there is no light mode for 1Cademy.",
          c: "You should change it outside of 1Cademy website.",
        },
      },
      True_or_False_You_can_change_the_background_color_and_image: {
        stem: quNum() + "True or False: You can switch the background image to a solid color on your 1Cademy map view.",
        answers: ["a"],
        choices: {
          a: "True",
          b: "False",
        },
      },
      What_does_the_clustering_feature_do: {
        stem: quNum() + "What does the clustering feature do?",
        answers: ["a"],
        choices: {
          a: "Puts a labeled box around nodes with the same tag",
          b: "Moves similar nodes closer together",
          c: "Spreads nodes out",
        },
      },
      What_are_you_notified_of_on_1Cademy: {
        stem: quNum() + "What are you notified of on 1Cademy?",
        answers: ["a", "b", "c"],
        choices: {
          a: "Upvotes on the nodes you contributed to",
          b: "Downvotes on the nodes you contributed to",
          c: "Proposed edits to the nodes you contributed to",
          d: "Other proposed nodes in your community",
        },
      },
      Which_pending_proposals_do_you_see_in_the_list_of_pending_proposals_in_the_sidebar: {
        stem: quNum() + "Which pending proposals do you see in the list of pending proposals in the sidebar?",
        answers: ["b"],
        choices: {
          a: "All pending proposals",
          b: "Only pending proposals in the community corresponding to your chosen default tag",
          c: "Only pending proposals in the communities other than the one corresponding to your chosen default tag",
        },
      },
      What_is_the_weekly_leaderboard: {
        stem: quNum() + "What is the weekly leaderboard?",
        answers: ["a"],
        choices: {
          a: "Rankings of all contributors of the week in your community",
          b: "Rankings of all contributors across the platform",
          c: "Rankings of all contributors",
        },
      },
      What_is_the_all_time_leaderboard: {
        stem: quNum() + "What is the all-time leaderboard?",
        answers: ["d"],
        choices: {
          a: "Top contributors across the platform",
          b: "All contributors",
          c: "Top contributors in your community",
          d: "All contributors in your community",
        },
      },
    },
  },
  Introduction_Changing_Your_Profile_Picture: {
    title: newSec() + "1Cademy Introduction: Changing Your Profile Picture",
    description: "We highly encourage you to upload your profile picture by following the procedure in this video.",
    video: "oRv8CEjF1Bw",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          Having a profile picture increases your social presence within 1Cademy, therefore it is recommended (but not
          required) to upload a profile picture of yourself. To change your profile picture, go to the sidebar that is
          on the left of the page and click on your current profile picture.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/ChangingYourProfilePicture1.png" width="80%" height="80%" />
        </Box>
        <Typography>
          This will bring up your user profile. Next, click on your profile picture again and a file finder window will
          appear allowing you to browse your files for a new profile picture.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/ChangingYourProfilePicture2.png" width="80%" height="80%" />
        </Box>
        <Typography>
          Once you have your desired image located and selected, you can click “open” to upload your new picture. Once
          you change your profile picture, every node you have proposed will now have a new profile picture in the
          footer.
        </Typography>
      </Box>
    ),
    questions: {
      Which_choices_are_true_regarding_your_profile_picture_on_1Cademy: {
        stem: quNum() + "Which choices are true regarding your profile picture on 1Cademy?",
        answers: ["a", "b", "c", "d"],
        choices: {
          a: "It increases your social presence within 1Cademy.",
          b: "We highly encourage you to upload yours, but not required.",
          c: "To change it, go to the sidebar located on the left of your map view, and click on your current profile picture. Then, click on your profile picture again in the user settings sidebar, and upload your new profile picture.",
          d: "Once you change your profile picture, it updates on all the nodes and proposals that you contributed to.",
        },
      },
    },
  },
  Introduction_Bookmarking_and_Marking_Nodes_as_Studied: {
    title: newSec() + "1Cademy Introduction: Bookmarking and Marking Nodes as Studied",
    description: "This video goes over how to bookmark nodes and how to mark nodes as studied.",
    video: "ohhJvJ0yhqs",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          In this section, we are going to go over marking a node as studied and bookmarking. These two functions are
          intertwined as marking a node as studied will affect your bookmarks. Marking a node as studied can be a great
          way to track your progress as you navigate through the 1Cademy map. Any unstudied node on the map will have a
          red border (this is the default state). When you have gone over a node's content and feel confident with the
          information, you can click on the envelope icon in the node footer and the border will turn yellow, therefore
          marking it as studied. It is important to note that if a node you marked as studied is changed in any way, it
          will default back to the not studied state with a red border.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/BookmarkingandMarkingNodesasStudied1.png" width="80%" height="80%" />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/BookmarkingandMarkingNodesasStudied2.png" width="80%" height="80%" />
        </Box>
        <Typography>
          This is why bookmarking can be important because it will help you keep track of nodes that you like that have
          been updated. When you have found a node on the map that you think is particularly useful, you can bookmark it
          to be notified of any proposed changes. To bookmark a node, click on the banner icon in the node footer. Any
          changes to a bookmarked node are reflected in the “bookmarked updates” tab in the sidebar that is to the left
          of the screen.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/BookmarkingandMarkingNodesasStudied3.png" width="80%" height="80%" />
        </Box>
        <Typography>
          A node will only appear in the bookmarked updates tab when it is marked as not studied. To easily navigate to
          a node in your bookmarked updates tab, click on the node title. Once you have reviewed the changes that have
          been made to the node you can mark the node as studied again it will disappear from the bookmarked updates tab
          (until it is edited again). If you do not want to have a node bookmarked anymore, you can simply click on the
          banner icon again.
        </Typography>
      </Box>
    ),
    questions: {
      Which_icon_at_the_node_footer_should_you_click_to_mark_a_node_as_studied: {
        stem: quNum() + "Which icon in the node footer should you click to mark a node as studied?",
        answers: ["a"],
        choices: {
          a: <EmailIcon />,
          b: <LocalOfferIcon />,
          c: <BookmarkIcon />,
          d: <CreateIcon />,
          e: <MenuBookIcon />,
          f: <EventAvailableIcon />,
        },
      },
      After_marking_a_node_as_studied_the_border_turns_to_which_color: {
        stem: quNum() + "After marking a node as studied, the border turns to which color?",
        answers: ["b"],
        choices: {
          a: "Red",
          b: "Yellow",
          c: "Green",
          d: "Blue",
        },
      },
      If_a_node_is_NOT_marked_as_studied_what_is_its_border_color: {
        stem: quNum() + "If a node is NOT marked as studied, what is its border color?",
        answers: ["a"],
        choices: {
          a: "Red",
          b: "Yellow",
          c: "Green",
          d: "Blue",
        },
      },
      If_a_node_is_marked_as_studied_but_someone_updates_the_node: {
        stem:
          quNum() +
          "If a node is marked as studied, but someone updates the node through a proposal, what is its border color?",
        answers: ["a"],
        choices: {
          a: "Red",
          b: "Yellow",
          c: "Green",
          d: "Blue",
        },
      },
      Which_icon_at_the_node_footer_should_you_click_to_bookmark_a_node: {
        stem:
          quNum() + "Which icon in the node footer should you click to bookmark a node to be notified of its updates?",
        answers: ["c"],
        choices: {
          a: <EmailIcon />,
          b: <LocalOfferIcon />,
          c: <BookmarkIcon />,
          d: <CreateIcon />,
          e: <MenuBookIcon />,
          f: <EventAvailableIcon />,
        },
      },
      When_do_you_see_a_bookmarked_node_in_your_bookmarked_updates_tab: {
        stem: quNum() + "When do you see a bookmarked node in your bookmarked updates tab?",
        answers: ["b", "c"],
        choices: {
          a: "When it is marked as studied",
          b: "When it is marked as not studied",
          c: "When it is marked as studied, but is updated through others' proposals",
        },
      },
    },
  },
  Introduction_Chatroom: {
    title: newSec() + "1Cademy Introduction: Chatroom",
    description: "In this video, we go over how to use the 1Cademy chatroom.",
    video: "BSmoSN4RTxk",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          The chat room feature can be used to send text, images, or specific nodes. All 1Cademy users have access to
          the chat room, and all the messages sent can be seen by every user. This fosters a collaborative environment
          and allows users to easily communicate. To access the chat room, go to the sidebar on the left side of the
          screen and click on “chat.”
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/Chatroom.png" width="80%" height="80%" />
        </Box>
        <Typography>
          To send a message, simply type what you would like to say and click “message” to post it. To send an image in
          the chat, click on the “image” button and a file browser window will appear allowing you to choose an image to
          send. To post a specific node first make sure that the node you want to post is open, then click on the “node”
          button. Next, click on the node that you would like to post. To navigate to nodes that other users have sent
          in the chat, click on the node titles and the node will open on your map.
        </Typography>
      </Box>
    ),
    questions: {
      What_kind_of_messages_can_be_sent_in_the_chatroom: {
        stem: quNum() + "What kind of messages can be sent in the chatroom?",
        answers: ["a", "c", "d"],
        choices: {
          a: "Text",
          b: "Video",
          c: "Node link",
          d: "Image (jpg, png, gif, svg)",
        },
      },
      Who_will_see_the_messages_your_send_in_1Cademy_chatroom: {
        stem: quNum() + "Who will see the messages you send in 1Cademy chatroom?",
        answers: ["a"],
        choices: {
          a: "Every member of every community",
          b: "Only members of your community",
          c: "Only those people you specify",
          d: "Only your friends",
          e: "Only yourself",
        },
      },
      How_can_you_share_the_link_to_a_node_in_the_chatroom: {
        stem: quNum() + "How can you share the link to a node in the chatroom?",
        answers: ["b"],
        choices: {
          a: "Click the title of the node you want to share ⇨ Click the node button in the chatroom",
          b: "Click the node button in the chatroom ⇨ Click the title of the node you want to share",
          c: "You cannot share a node link in the chatroom",
          d: "Click the share button at the node footer",
        },
      },
    },
  },
  Introduction_Search_Engine: {
    title: newSec() + "1Cademy Introduction: Search Engine",
    description: "This video goes over how to use the search tool on 1Cademy.",
    video: "WRUld8vA3i4",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          In 1Cademy, you can use the search tool to find a specific node, reference, or topic. To search for a node,
          first click on the orange “search” icon in the sidebar that's to the left of the screen. Then, select the tag
          you would like to conduct your search in. By default, 1Cademy will search only within your current community
          tag. If you'd like to search all the tags, unselect all the options. If you’d like to search within multiple
          tags, you are able to select more than one.{" "}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/SearchEngine1.png" width="80%" height="80%" alt="" />
        </Box>
        <Typography>
          After selecting your tag(s), select the types of nodes you want to search from the drop down menu that's next
          to the search bar.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/SearchEngine2.png" width="80%" height="80%" alt="" />
        </Box>
        <Typography>
          Now you're ready to type in what you'd like to search. Once you have your key word or phrase typed out, click
          on the magnifying glass icon. You will now see a list of results listed in the sidebar.To open one of these
          results click on the title and it will appear on your map.
        </Typography>
      </Box>
    ),
    questions: {
      How_do_you_search_within_all_community_tags: {
        stem: quNum() + "How do you search within all community tags?",
        answers: ["b"],
        choices: {
          a: 'Select the "All" option under "Tags"',
          b: "Unselect all tags",
          c: "Searching all tags is the default option",
        },
      },
      How_do_you_specify_the_node_type_while_using_the_search_engine: {
        stem: quNum() + "How do you specify the node type while using the search engine?",
        answers: ["a"],
        choices: {
          a: "Select node types you want in a dropdown menu",
          b: "Select node type through tagging",
          c: "Type in the node type you want to search",
        },
      },
    },
  },
  Introduction_Changing_Your_Default_Community_Tag: {
    title: newSec() + "1Cademy Introduction: Changing Your Default Community Tag",
    description:
      "Now, it is time for you to change your default tag. Please watch this video to help you change it to the correct community tag that you are a member of, otherwise you'll not receive points on the community leaderboard.",
    video: "D_2A4s__SfM",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          To change your 1Cademy community membership, the first thing you will need to do is to make sure the node you
          want to tag your community membership as is open on your map. If it is not, you can easily use the search
          function to perform a keyword search and open it up. Once you have the default tag open on your map, you can
          now change your community membership by first going to user profile and clicking on your community membership
          or tag.{" "}
        </Typography>
        <Typography>
          After you click this button, you will see a prompt in red that says “click the node you would like to link
          to.” Now all you have to do is click the node you would like to set as your community tag. When you exit out
          of your user profile, you will see that your leaderboard in the sidebar also reflects this change.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/ChangingYourDefaultCommunityTag.png" width="80%" height="80%" alt="" />
        </Box>
      </Box>
    ),
    questions: {
      How_can_you_change_your_default_tag_on_1Cademy: {
        stem: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
            <Typography>{quNum()} What is the correct order for changing your default tag on 1Cademy?</Typography>
            <ul>
              <li>
                <strong>Open Settings</strong>: open the user settings sidebar.
              </li>
              <li>
                <strong>Click the Node</strong>: click the node corresponding to your desired tag.
              </li>
              <li>
                <strong>Open the Node</strong>: if the node corresponding to your desired tag does not exist on your map
                view, open it.
              </li>
              <li>
                <strong>Click the Tag Button</strong>: click the default tag button.
              </li>
            </ul>
          </Box>
        ),
        answers: ["c"],
        choices: {
          a: "Open Settings ⇨ Click the Node ⇨ Open the Node ⇨ Click the Tag Button",
          b: "Click the Tag Button ⇨ Open Settings ⇨ Click the Node ⇨ Open the Node",
          c: "Open the Node ⇨ Open Settings ⇨ Click the Tag Button ⇨ Click the Node",
          d: "Click the Node ⇨ Open the Node ⇨ Open Settings ⇨ Click the Tag Button",
        },
      },
      Have_you_changed_your_tag_to_the_correct_community: {
        stem: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
            <Typography>{quNum()} Have you changed your tag to the correct community?</Typography>
            <Typography>
              Note that on top of this page, we asked you:{" "}
              <strong>
                Before moving forward, please create an account on{" "}
                <a href="https://1cademy.com/signin" target="_blank" rel="noreferrer">
                  1Cademy web app
                </a>
                , which is different from the account you created before on this web app.
              </strong>{" "}
              After creating your account, please go through this tutorial to learn more about 1Cademy and how it works.
            </Typography>
          </Box>
        ),
        answers: ["b"],
        choices: {
          a: "No",
          b: "Yes",
          c: "I'll change it later!",
        },
      },
    },
  },
  Nodes_Node_Header: {
    title: newSec() + "1Cademy Nodes: Node Header",
    description: "This video goes over the node header.",
    video: "m6qIjU4tpL4",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          To close a node, select the far left button on the header toolbar. This will minimize the node, only
          displaying the node header, title, and part of the footer.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/NodeHeader1.png" width="80%" height="80%" alt="" />
        </Box>
        <Typography>To open the node back up select the same button.</Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/NodeHeader2.png" width="80%" height="80%" alt="" />
        </Box>
        <Typography>
          When the node you are viewing has children open, you can select the middle button in the node header to hide
          all the offsprings of the node. The right-most button in the header you can use to hide the node completely
          from your map.
        </Typography>
      </Box>
    ),
    questions: {
      What_functions_are_in_the_node_header: {
        stem: quNum() + "What functions are in the node header?",
        answers: ["b", "c", "e"],
        choices: {
          a: "Open offspring",
          b: "Hide offspring",
          c: "Hide node",
          d: "Open parents",
          e: "Close (collapse) node",
        },
      },
    },
  },
  Nodes_Node_Footer: {
    title: newSec() + "1Cademy Nodes: Node Footer",
    description: "This video goes over the node footer.",
    video: "mhj3OeF1iFQ",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          There are many icons and buttons along the node footer. First, on the far left you will see the top
          contributor or proposer of the node. Next to the profile picture, is an icon that shows the node type. Next to
          that, you will see the adjust node height button. You can select this when your nodes are overlapping and you
          cannot read your content. To the right of that, you will see the narration button. Select this to have the
          node content read out loud for you. After the narration button, there is the version history button with the
          calendar icon. When you select this, a sidebar will pop up showing you all the previous versions and edits
          proposed on a node. You can also see when the last edit was made next to the calendar icon.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/NodeFooter1.png" width="80%" height="80%" alt="" />
        </Box>
        <Typography>
          The pencil button will allow you to edit the node’s content directly or add a child node. The number next to
          the pencil indicates how many different proposed edits have been made to this node. Next you will see the tags
          and citations button. If you click this, you will be able to see the references and the different tags
          associated with a node.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/NodeFooter2.png" width="80%" height="80%" alt="" />
        </Box>
        <Typography>
          To the right of that you will see the downvote button. If you find that a node is not organized properly,
          inaccurate, or unhelpful, you can vote to delete it. Alternatively, the upvote button will allow you to vote
          to prevent further changes. You should use this for nodes that you find helpful. Note that up/downvoting a
          node directly impacts all the accepted proposals in the edit history of the node, proportionally based on
          their total upvotes minus downvotes. This consequently impacts the reputation points of the users who
          contributed those proposals. This is because in the history of evolution of a node, each accepted proposal has
          contributed to the extent that it has received upvotes minus downvotes and users' expressions of
          helpfulness/unhelpfulness of each nodes should impact all the proposals that have contributed to the evolution
          of the node.
        </Typography>
        <Typography>
          The next button, a banner icon, allows you to bookmark a node for later use. Next, you can use the envelope
          button to mark a node as studied. This is a great way to track your progress as you navigate through the map.
          Finally, you can click the right-most button to view the parents and children of a node.
        </Typography>
      </Box>
    ),
    questions: {
      Which_icon_should_you_click_to_get_access_to_the_node_s_parent_and_child_links: {
        stem: quNum() + "Which icon should you click to get access to the node's parent and child links?",
        answers: ["g"],
        choices: {
          a: <EmailIcon />,
          b: <LocalOfferIcon />,
          c: <BookmarkIcon />,
          d: <CreateIcon />,
          e: <MenuBookIcon />,
          f: <EventAvailableIcon />,
          g: "2⇄2",
          h: "↕",
          i: <CheckIcon />,
          j: <CloseIcon />,
        },
      },
      If_your_nodes_overlap_like_this_which_icon_in_the_node_footer_can: {
        stem: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
            {quNum()}If your nodes overlap like this, which icon in the node footer can you click to fix them?
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <img src="/static/tutorial/OverlappingNodes.jpg" width="80%" height="80%" alt="" />
            </Box>
          </Box>
        ),
        answers: ["h"],
        choices: {
          a: <EmailIcon />,
          b: <LocalOfferIcon />,
          c: <BookmarkIcon />,
          d: <CreateIcon />,
          e: <MenuBookIcon />,
          f: <EventAvailableIcon />,
          g: "2⇄2",
          h: "↕",
          i: <CheckIcon />,
          j: <CloseIcon />,
        },
      },
      If_you_find_a_node_helpful_to_your_learning_what_icon_do_you_click_to_upvote_it: {
        stem: quNum() + "If you find a node helpful to your learning, what icon do you click to upvote it?",
        answers: ["i"],
        choices: {
          a: <EmailIcon />,
          b: <LocalOfferIcon />,
          c: <BookmarkIcon />,
          d: <CreateIcon />,
          e: <MenuBookIcon />,
          f: <EventAvailableIcon />,
          g: "2⇄2",
          h: "↕",
          i: <CheckIcon />,
          j: <CloseIcon />,
        },
      },
      If_you_find_a_node_unhelpful_and_youd_like_to_vote_to_delete_it_what_icon_do_you_click: {
        stem: quNum() + "If you find a node unhelpful and you'd like to vote to delete it, what icon do you click?",
        answers: ["j"],
        choices: {
          a: <EmailIcon />,
          b: <LocalOfferIcon />,
          c: <BookmarkIcon />,
          d: <CreateIcon />,
          e: <MenuBookIcon />,
          f: <EventAvailableIcon />,
          g: "2⇄2",
          h: "↕",
          i: <CheckIcon />,
          j: <CloseIcon />,
        },
      },
    },
  },
  Nodes_Node_Body: {
    title: newSec() + "1Cademy Nodes: Node Body",
    description: "This video goes over the node body.",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          The body of a node includes its title and content. First, the title of each node should clearly, concisely,
          and comprehensively introduce the information that will be elaborated on in the content. Creating a complete
          and clear node title improves the searchability and the comprehensibility of the node itself. Next, the
          content of the node should elaborate on the information presented in the node title. This information should
          also be clear, concise, and comprehensive.
        </Typography>
      </Box>
    ),
    video: "pRK5SpjMPlI",
    questions: {
      What_components_does_the_node_body_contain: {
        stem: quNum() + "What components does the node body contain?",
        answers: ["a", "b"],
        choices: {
          a: "Title",
          b: "Content",
          c: "Header",
          d: "Footer",
        },
      },
      Both_the_node_title_and_content_should_be: {
        stem: quNum() + "Both the node title and content should be:",
        answers: ["a", "c", "d"],
        choices: {
          a: "Comprehensive",
          b: "Cryptic",
          c: "Concise",
          d: "Clear",
        },
      },
    },
  },
  Nodes_Types_of_Nodes: {
    title: newSec() + "1Cademy Nodes: Types of Nodes",
    description: "This video goes over the types of nodes.",
    video: "UD9kCb9LKWU",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          There are six different types of nodes on 1Cademy: concept, relation, question, code, reference, and idea. You
          can tell the type of node by looking at the icon next to a profile picture on the bottom left hand corner of
          each node.{" "}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/TypesofNodes.png" width="80%" height="80%" alt="" />
        </Box>
        <Typography>
          Each type of node presents a certain piece of information. For example, a concept node defines a concept from
          an external source. However, an idea node shows an original thought or idea from the proposer.
        </Typography>
      </Box>
    ),
    questions: {
      Which_of_the_following_types_of_nodes_exist_on_1Cademy: {
        stem: quNum() + "Which of the following types of nodes exist on 1Cademy?",
        answers: ["a", "c", "d", "e", "f", "g"],
        choices: {
          a: 'A "Concept" node defines a concept.',
          b: 'A "Multimedia" node contains an image or video.',
          c: 'A "Relation" node explains relationships between multiple concepts.',
          d: 'A "Reference" node cites a reference.',
          e: 'A "Question" node asks a multiple-choice question.',
          f: 'An "Idea" node represents a new idea.',
          g: 'A "Code" node contains a code snippet in its content.',
        },
      },
    },
  },
  Nodes_Concept_Nodes: {
    title: newSec() + "1Cademy Nodes: Concept Nodes",
    description: "This video introduces the purpose of concept nodes on 1Cademy.",
    video: "stRxLxXVsGw",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          {" "}
          A concept node displays a single concept and its definition. You can tell if a node is showing a concept by
          hovering over the icon that is next to the profile picture on the bottom left-hand corner of the node.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img src="/static/tutorial/ConceptNodes.png" width="80%" height="80%" alt="" />
        </Box>
        <Typography>
          There are two different types of concepts that you will find on 1Cademy. A superordinate which is a general
          topic and subordinate which is a specific category. Language is an example of a superordinate concept as it is
          a general topic that includes a lot of other more specific concepts.{" "}
        </Typography>
        <Typography>
          An example of a subordinate concept includes language comprehension because it is a subordinate topic within
          the superordinate topic: language. It is important to note that it does not matter whether a concept is
          superordinate or subordinate, all concepts on 1Cademy will be indicated by the concept node
        </Typography>
      </Box>
    ),
    questions: {
      A_concept_node: {
        stem: quNum() + "A concept node:",
        answers: ["c"],
        choices: {
          a: "Displays multiple concepts and their definitions",
          b: "Compares concepts",
          c: "Displays a single concept and its definition",
        },
      },
      Which_of_the_following_icons_represent_a_concept_node: {
        stem: quNum() + "Which of the following icons represent a concept node?",
        answers: ["b"],
        choices: {
          a: <MenuBookIcon />,
          b: <LocalLibraryIcon />,
          c: <EmojiObjectsIcon />,
          d: <CodeIcon />,
          e: <HelpOutlineIcon />,
          f: <ShareIcon />,
        },
      },
    },
  },
  Nodes_Relation_Nodes_vs_Concept_Nodes: {
    title: newSec() + "1Cademy Nodes: Relation Nodes vs. Concept Nodes",
    description:
      "Understanding the difference between relation nodes and concept nodes can be difficult. Please watch this video to gain a deeper understanding of the differences between these two types of nodes.",
    video: "Z9TzJUuLj9A",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          Learning the difference between concept nodes and relation nodes on 1Cademy is one of the biggest challenges
          while proposing content on the knowledge graph. So, here are a few methods for figuring out whether a new node
          you are proposing should be a concept or a relation node. The first step is to think through what layout your
          node will have. Many relation nodes will be in the form of bulleted lists while concept nodes will most be be
          in paragraph form. However, this is not always the case as every once in a while you will have a bulleted list
          that is actually a concept node or a relation node that is in paragraph form. So even though knowing the the
          layout of your node can help in a terms of a realizing whether it is a concept node or a relation node, there
          are still more steps and critical thing necessary to truly nail down what type of node your node should be.
        </Typography>
        <Typography>
          The second step is to think through what the purpose of your node will be. If the node exists to introduce a
          new piece of information onto the map, it is a concept node. While all child nodes are related to their parent
          node, concept nodes define or describe a piece of information that can stand on its own. For example, even
          though the node “homelessness and runaways” is informed by the node “library as a place” by a virtue of being
          its child, it still shows a singular piece of information that can exist on its own and thus is a concept
          node.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/RelationNodesvsConceptNodes1.png" width="80%" height="80%" />
        </Box>
        <Typography>
          However, a relation node will reflect either how two or more nodes are connected to one another. Or, if it is
          a bulleted list, all of the bullets will relate to one another as a function of what the what the node is
          attempting to communicate. So if either of those cases are a true, then that is a a good sign that your node
          will be a relation node.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/RelationNodesvsConceptNodes2.png" width="80%" height="80%" />
        </Box>
        <Typography>
          However, there are cases where a node with the layout and purpose of a concept node are still a relation node
          so more evaluation and critical thinking about the node may still be necessary.
        </Typography>
        <Typography>
          The final step and perhaps the most difficult, is to understand the transformative nature of the node you are
          proposing. What this means is if adding the node changes the meaning or conceptualization of the nodes that
          come before it. For example adding a concept node after a parent node does not change anything about the
          meaning of the parent node or how we conceptualize it. However, a relation node is transformative and will
          change our conceptualization of its parent nodes. For an example, we examine the node “Contested Definitions
          of Non-Formal and Informal Education” (shown in video). At first glance, it may seem like a concept node. It
          has the layout most often ascribed to concept nodes and it shows a singular idea that arguably can stand on
          its own. However, what makes it a relation node is its transformative nature. Through this node, the
          conceptualization of its parents, that being “non-formal education” and “informal education,” is changed and
          the node itself shows a relationship between the definitions of non-formal and informal education. So, in
          fact, the “Contested Definitions of Non-Formal and Informal Education” node is a relation node. This is
          definitely the most difficult way to comprehend the difference between concept and and relation nodes and is
          the one that requires the most critical thinking, but it is the most useful especially when you are proposing
          a node that arguably could either be a concept or a relation node.
        </Typography>
      </Box>
    ),
    questions: {
      A_relation_node____________topics_and_a_concept_node___________topics: {
        stem: quNum() + "A relation node __________ topics, and a concept node _________ topics.",
        answers: ["a"],
        choices: {
          a: "compares; defines",
          b: "introduces; defines",
          c: "compares; relates",
        },
      },
      Relation_Is_the_following_node_a_relation_node_or_a_concept_node: {
        stem: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
            {quNum()}Is the following node a relation node, or a concept node?
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <img alt="" src="/static/tutorial/RelationNode.jpg" width="80%" height="80%" />
            </Box>
          </Box>
        ),
        answers: ["b"],
        choices: {
          a: "Concept node because it is going over a single topic",
          b: "Relation node because it is comparing/discussing two topics",
          c: "Concept node because it is defining multiple topics",
          d: "Relation node because it has two parents",
        },
      },
      Concept_Is_the_following_node_a_relation_node_or_a_concept_node: {
        stem: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
            {quNum()}Is the following node a relation node, or a concept node?
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <img alt="" src="/static/tutorial/ConceptNode.jpg" width="80%" height="80%" />
            </Box>
          </Box>
        ),
        answers: ["a"],
        choices: {
          a: "Concept node because it is going over a single topic",
          b: "Relation node because it is comparing/discussing two topics",
          c: "Concept node because it is defining multiple topics",
          d: "Relation node because it has two parents",
        },
      },
    },
    Which_of_the_following_icons_represent_a_relation_node: {
      stem: quNum() + "Which of the following icons represent a relation node?",
      answers: ["f"],
      choices: {
        a: <MenuBookIcon />,
        b: <LocalLibraryIcon />,
        c: <EmojiObjectsIcon />,
        d: <CodeIcon />,
        e: <HelpOutlineIcon />,
        f: <ShareIcon />,
      },
    },
  },
  Nodes_Code_Nodes: {
    title: newSec() + "1Cademy Nodes: Code Nodes",
    description: "This video goes over the purpose of code nodes on 1Cademy and how to create them.",
    video: "C0r6W2gC_Wc",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          A code node displays a code snippet of a specified programming language. You can tell if a node is a code node
          by hovering over the icon located next to the profile picture on the bottom left hand corner.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/CodeNodes.png" width="80%" height="80%" />
        </Box>
        <Typography>
          There are four languages that can be specified in codenodes on 1Cademy: Python, R, HTML, and Javascript
          (examples shown in video). It is important to note that each node is color-coded according to the specified
          language.
        </Typography>
      </Box>
    ),
    questions: {
      What_languages_can_be_specified_in_code_nodes: {
        stem: quNum() + "What languages can be specified in code nodes?",
        answers: ["a", "c", "d", "e"],
        choices: {
          a: "JavaScript",
          b: "C++",
          c: "Python",
          d: "HTML",
          e: "R",
        },
      },
      Which_of_the_following_icons_represent_a_code_node: {
        stem: quNum() + "Which of the following icons represent a code node?",
        answers: ["d"],
        choices: {
          a: <MenuBookIcon />,
          b: <LocalLibraryIcon />,
          c: <EmojiObjectsIcon />,
          d: <CodeIcon />,
          e: <HelpOutlineIcon />,
          f: <ShareIcon />,
        },
      },
    },
  },
  Nodes_Reference_Nodes: {
    title: newSec() + "1Cademy Nodes: Reference Nodes",
    description: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>This video introduces reference nodes on 1Cademy.</Typography>
        <Typography>
          <strong>Note:</strong> You cannot cite a book chapter, video section, or webpage in a reference node, instead
          you should cite the encompassing book, video, or website. You can cite the specific section of the reference
          when putting it in the context of a concept, relation, question, or code node.
        </Typography>
      </Box>
    ),
    video: "2mFzBfEX9mE",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          {" "}
          In this video, we discuss reference nodes. A reference node contains a single citation that references a
          source used to summarize information. On 1Cademy, reference nodes cannot cite a book chapter, video section,
          or webpage.{" "}
        </Typography>
        <Typography>
          The icon shown on the screen in the bottom corner of the node indicates the node type as a reference node.
          Reference nodes are always cited in an APA format. They include citations for videos, scholarly articles,
          books, websites, and audio.
        </Typography>
        <Typography>
          So, to create a reference node, first you want to click the pencil icon to edit, then you are going to click
          reference child node. From there you are going to add the title, and in the content put your APA source. In
          the node, you can add your reason for adding the child reference node and ensure your tags are correct then
          click propose.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/ReferenceNodes.png" width="80%" height="80%" />
        </Box>
        <Typography>
          Shown in the video are examples of videos, scholarly articles, books, webpages, and audio cited into reference
          nodes. You can cite the specific section of references within a specific node, including a concept, relation,
          and question node but do not add the specific section of a reference into a reference node. A reference node
          only contains a single APA citation for the resource used. All citations and reference nodes on 1Cademy are in
          APA format.{" "}
        </Typography>
      </Box>
    ),
    questions: {
      What_format_of_citation_should_be_used_in_reference_nodes: {
        stem: quNum() + "What format of citation should be used in reference nodes?",
        answers: ["b"],
        choices: {
          a: "MLA",
          b: "APA",
          c: "Chicago",
          d: "AMA",
        },
      },
      Which_of_the_following_icons_represent_a_reference_node: {
        stem: quNum() + "Which of the following icons represent a reference node?",
        answers: ["a"],
        choices: {
          a: <MenuBookIcon />,
          b: <LocalLibraryIcon />,
          c: <EmojiObjectsIcon />,
          d: <CodeIcon />,
          e: <HelpOutlineIcon />,
          f: <ShareIcon />,
        },
      },
      Which_of_the_following_can_a_reference_node_represent: {
        stem: quNum() + "Which of the following can a reference node represent?",
        answers: ["a", "b", "c", "d", "f"],
        choices: {
          a: "Video (e.g YouTube)",
          b: "Book",
          c: "Scholarly article",
          d: "Audio",
          e: "Book chapter",
          f: "Website (which may include many webpages)",
          g: "Webpage (i.e., a specific page of a website)",
        },
      },
    },
  },
  Nodes_Idea_Nodes: {
    title: newSec() + "1Cademy Nodes: Idea Nodes",
    description: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        This video introduces "idea" nodes on 1Cademy. We can use this type of node to:
        <ul>
          <li>Explain one of our ideas to others in a consice way</li>
          <li>Relate our ideas to others' idea, concept, and relation nodes</li>
          <li>Organize our ideas</li>
        </ul>
      </Box>
    ),
    video: "5dXSNS4npFk",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          An idea node shows a user's original thoughts or ideas that are not adapted from any external resources. These
          can be research ideas providing feedback on a node or used for note taking.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/IdeaNodes.png" width="80%" height="80%" />
        </Box>
      </Box>
    ),
    questions: {
      For_what_purpose_should_we_propose_an_idea_node_on_1Cademy: {
        stem: quNum() + "For what purpose should we propose an idea node on 1Cademy?",
        answers: ["b", "c", "d"],
        choices: {
          a: "To enforce others to listen to our ideas",
          b: "To explain one of our ideas to others in a consice way",
          c: "To relate our ideas to others' idea, concept, and relation nodes",
          d: "To organize our ideas",
        },
      },
      Which_of_the_following_icons_represent_a_idea_node: {
        stem: quNum() + "Which of the following icons represent a idea node?",
        answers: ["c"],
        choices: {
          a: <MenuBookIcon />,
          b: <LocalLibraryIcon />,
          c: <EmojiObjectsIcon />,
          d: <CodeIcon />,
          e: <HelpOutlineIcon />,
          f: <ShareIcon />,
        },
      },
    },
  },
  Nodes_Question_Nodes: {
    title: newSec() + "1Cademy Nodes: Question Nodes",
    description: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>This video introduces question nodes on 1Cademy.</Typography>
        <Typography>
          We propose multiple-choice questions as "Question" type nodes to test, and improve others' learning through
          testing them.
        </Typography>
        <Typography>
          We only propose multiple-choice questions about topics that we have already learned, and we'd like to help
          others learn them.
        </Typography>
      </Box>
    ),
    video: "4lgJqIr1BJA",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          A question node contains a user-generated multiple choice question that users can answer by directly selecting
          one or more options.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/QuestionNodes.png" width="80%" height="80%" />
        </Box>
        <Typography>
          When a user selects an answer (either correctly or incorrectly), there is feedback written by the creator of
          the question explaining why the answer is correct or incorrect.
        </Typography>
      </Box>
    ),
    questions: {
      For_what_purpose_should_we_propose_a_question_node_on_1Cademy: {
        stem: quNum() + "For what purpose should we propose a question node on 1Cademy?",
        answers: ["c", "d"],
        choices: {
          a: "To ask others' help to solve our problems",
          b: "To ask experts solutions to difficult problems",
          c: "To design a multiple-choice question to test others' learning",
          d: "To design a multiple-choice question to improve others' learning",
        },
      },
      Which_of_the_following_icons_represent_a_question_node: {
        stem: quNum() + "Which of the following icons represent a question node?",
        answers: ["e"],
        choices: {
          a: <MenuBookIcon />,
          b: <LocalLibraryIcon />,
          c: <EmojiObjectsIcon />,
          d: <CodeIcon />,
          e: <HelpOutlineIcon />,
          f: <ShareIcon />,
        },
      },
    },
  },
  Proposal_System_Getting_Started_as_a_User: {
    title: newSec() + "1Cademy Proposal System: Getting Started as a User",
    description: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        Before going into the specifics of the proposal system, here is a brief video going over what your first steps
        as a user on 1Cademy may look like when you are proposing nodes.
        <strong>Note: </strong>{" "}
        <i>
          To propose a new reference node, first consult with your community leaders or a liaison librarian to figure
          out the right prerequisites for that new reference node.
        </i>
      </Box>
    ),
    video: "jhFAmGAr2fU",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          As a single user, the first thing you need to do is make sure that you set your community tag. As you can see,
          mine is psychology and to change it I need to click on my profile picture and select the tag button. Here I've
          decided that I no longer want to be a part of the psychology community and that I'm going to switch to
          sociology. Once I click the button, you'll see that I'm prompted in red to click the node I would like to link
          to and I would like to link to sociology. Once it loads, you'll see an update on my profile and when I exit
          out of my profile you will also see it update on my sidebar.{" "}
        </Typography>
        <Typography>
          Next thing I have to do is add a reference node, so first I have to identify where all the sociology
          references are, in this case, they are linked to the relation node sociology references. I select the propose
          version of this node and then pick the reference child node option and when I do I'll get a blank node that
          allows me to copy in the citation and the title
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/GettingStartedAsaUser1.png" width="80%" height="80%" />
        </Box>
        <Typography>
          I've already added my reference node so I'm going to go ahead and cancel that. Now that I've added my
          citation, I'm going to look at the information I want to summarize. So, there are two different kinds of
          social structures, one is horizontal and one is vertical and I would like to add the horizontal social
          structure term to the map.
        </Typography>
        <Typography>
          First, I need to find the prerequisite link, the immediate prerequisite link, so starting out in sociology,
          I'm going to start opening children until I distill the information far enough where I find the immediate
          prerequisite. I see that sociological structures are already added as a child so I'm going to go ahead and
          open that and see what it has to offer. I see that sociological structures are the different structures that
          societies are organized in and they can either be classified as horizontal or vertical. This is exactly where
          I want to add my content, I'll look at the children that already exist just to make sure that the information
          I want to add is not already on the map. So, I'll click to view the parent and child nodes and I see that the
          horizontal social structure has not been added as a child yet. So, I'll propose an edit to add a concept node,
          because horizontal social structures is a concept, and I'll see a blank node pop up.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/GettingStartedAsaUser2.png" width="80%" height="80%" />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/GettingStartedAsaUser3.png" width="80%" height="80%" />
        </Box>
        <Typography>
          You want to title your node as specifically, clearly, and concisely as possible. I'm going to just title the
          child node by what i'm defining, which is the horizontal social structure and then I need to define it in my
          own words. All content on 1Cademy should be paraphrased in your own words to help your learning and make sure
          that we're not actually plagiarizing. So the horizontal structure lets me refer to my source again, which is
          the social relationships and the social and physical characteristics of communities to which inBoxiduals
          belong. In my own words, I'm going to talk about how horizontal social structures refer to the relationships
          and communities that are connected to inBoxiduals.{" "}
        </Typography>
        <Typography>
          This is the first draft of my node, later we'll talk about the peer review process and I'm counting on the
          other people in my community to come in and help me improve this node as best we can, but for now what i'm
          going to do is go ahead and cite my reference. All you have to do is click cite an existing reference and then
          select the reference node that you want to cite, also this is chapter 1.2 Understanding Society, so i'm going
          to specify the chapter, page number or the url that you want to use. I'm going to propose the node and I'll
          see that it now exists.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/GettingStartedAsaUser4.png" width="80%" height="80%" />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/GettingStartedAsaUser5.png" width="80%" height="80%" />
        </Box>
      </Box>
    ),
    questions: {
      What_should_your_first_step_be_as_a_new_user_on_1Cademy: {
        stem: quNum() + "What should your first step be as a new user on 1Cademy?",
        answers: ["a"],
        choices: {
          a: "Changing your default tag to reflect your community membership",
          b: "Adding nodes",
          c: "Upvoting nodes you find helpful",
        },
      },
      Which_of_these_steps_are_needed_to_link_a_concept_node_to_a_reference_node: {
        stem: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
            {quNum()}Which of these steps are needed to link a concept node to a reference node?
            <ul>
              <li>
                <strong>Find reference node</strong>: find your desired reference node, or consult a liaison librarian
                to create it if the reference node does not exist.
              </li>
              <li>
                <strong>Click "Cite an existing reference"</strong>: click "Cite an existing reference" button on the
                node that you are proposing/improving.
              </li>
              <li>
                <strong>Click reference node</strong>: click the reference node that you want to cite.
              </li>
              <li>
                <strong>Add pages/URL/timeslot</strong>: depending on the type of the reference, add the corresponding
                chapter, page numbers, webpage URL, or video/audio timeslot.
              </li>
              <li>
                <strong>Click "Propose"</strong>: after finalizing everything, you need to click the "Propose" button to
                submit your proposal.
              </li>
            </ul>
          </Box>
        ),
        answers: ["a"],
        choices: {
          a: 'Find reference node ⇨ Click "Cite an existing reference" ⇨ Click reference node ⇨ Add pages/URL/timeslot ⇨ Click "Propose"',
          b: 'Click "Cite an existing reference" ⇨ Find reference node ⇨ Click reference node ⇨ Add pages/URL/timeslot ⇨ Click "Propose"',
          c: 'Find reference node ⇨ Add pages/URL/timeslot ⇨ Click "Propose" ⇨ Click "Cite an existing reference" ⇨ Click reference node',
          d: 'Click reference node ⇨ Add pages/URL/timeslot ⇨ Find reference node ⇨ Click "Cite an existing reference" ⇨ Click "Propose"',
        },
      },
      How_can_one_figure_out_whether_a_node_they_want_to_propose_already_exists_on_the_map: {
        stem:
          quNum() +
          "How can one figure out whether a node they want to propose already exists on the map? (Hint: part of the answer is in the section where we explained the search engine.)",
        answers: ["a", "e"],
        choices: {
          a: "By navigating through the prerequisite nodes and their children to find the immediate prerequisite, and then seeing if the proposed information is already there.",
          b: "Asking the community leader.",
          c: "It is OK to add repetitive information on 1Cademy.",
          d: "Using Ctrl+F or (Command+F on MAC).",
          e: "Using 1Cademy search engine",
        },
      },
    },
  },
  Proposal_System_Prerequisite_Linking_on_1Cademy: {
    title: newSec() + "1Cademy Proposal System: Prerequisite Linking on 1Cademy",
    description: "This video defines prerequisite linking and how it is used on 1Cademy",
    video: "76MSksNQYN0",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          To help you better understand the structure of information on 1Cademy, we are going to go over prerequisite
          linking. First, we're going to break down the term and then we will define it within the context of 1Cademy.
          Breaking down the term “prerequisite linking,” we see that “prerequisite” is the knowledge or information
          required before one can proceed to learning any new knowledge or information. So for example, you need to
          learn <strong>how to count</strong> (prerequisite information) before you can learn{" "}
          <strong>how to add</strong> (new information). Then, “linking” is defined as connecting one thing to something
          else - like moving from counting to adding.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/PrerequisiteLinkingon1Cademy1.png" width="80%" height="80%" />
        </Box>
        <Typography>
          When we put the terms together, we see that prerequisite linking is when new units of information are
          connected to foundational units of information. These foundational units need to be learned before one can
          move onto the new units.{" "}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/PrerequisiteLinkingon1Cademy2.png" width="80%" height="80%" />
        </Box>
        <Typography>
          Prerequisite linking on 1Cademy is defined as: the nodes are organized in a hierarchy where what is needed to
          learn a concept is connected as a parent node. Looking at an example on the 1Cademy map, you can see that you
          need to know what concepts are before learning what a conceptual model is, and you need to know what a
          conceptual model is before you can understand concept mapping. You will see that the parent nodes are linked
          on the left, and the green arrow denotes the child node linked on the right (example is explained in the
          video).
        </Typography>
      </Box>
    ),
    questions: {
      What_do_you_think_the_phrase_prerequisite_relation_means: {
        stem: quNum() + 'What does the phrase "prerequisite link" mean? (Please select all that apply.)',
        answers: ["b", "e"],
        choices: {
          a: "A relation of parallel concepts in different disciplines",
          b: "A relation in which a certain knowledge is required to learn another piece of information",
          c: "An example from a source related to a certain topic",
          d: "A relation of two similar principles",
          e: "If you need to learn concept A to be able to learn concept B, there is a prerequisite link from A to B.",
        },
      },
      The_following_boxes_are_two_nodes_on_1Cademy_each_of_them_defining_a_concept: {
        stem: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
            {quNum()}The following boxes are two nodes on 1Cademy, each of them defining a concept: "1Cademy" or
            "1Cademy's Goal." Which of these is the correct order of prerequisite linking? (Hint: try reading the
            content in the nodes if you are confused.)
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <img alt="" src="/static/tutorial/TwoPrerequisiteNodes.jpg" width="80%" height="80%" />
            </Box>
          </Box>
        ),
        answers: ["a"],
        choices: {
          a: "[ 1Cademy ] ⇨ [ 1Cademy's goal ]",
          b: "[ 1Cademy's goal ] ⇨ [ 1Cademy ]",
        },
      },
      You_want_to_teach_a_friend_about_how_to_use_exponents: {
        stem:
          quNum() +
          "You want to teach a friend about how to use exponents. How would you organize the prerequisite links for them? (Assume each node already has a definition.)",
        answers: ["b"],
        choices: {
          a: "[ Summation ] ⇨  [ Exponents ] ⇨ [ Multiplication ]",
          b: "[ Summation ] ⇨ [ Multiplication ] ⇨ [ Exponents ]",
          c: "[ Exponents ] ⇨ [ Multiplication ] ⇨ [ Summation ]",
          d: "[ Exponents ] ⇨ [ Summation ] ⇨ [ Multiplication ]",
        },
      },
      What_is_the_correct_prerequisite_linking_of_these_three_nodes: {
        stem: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
              {quNum()}What is the correct prerequisite linking of these three nodes? (Hint: try reading the node
              contents if you are confused.)
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <img alt="" src="/static/tutorial/ThreePrerequisiteNodes.jpg" width="80%" height="80%" />
            </Box>
          </Box>
        ),
        answers: ["d"],
        choices: {
          a: "[ Problem ] ⇨ [ Group brainstorming ] ⇨ [ Problem solving ]",
          b: "[ Group brainstorming ] ⇨ [ Problem ] ⇨ [ Problem solving ]",
          c: "[ Problem solving ] ⇨ [ Problem ] ⇨ [ Group brainstorming ]",
          d: "[ Problem ] ⇨ [ Problem solving ] ⇨ [ Group brainstorming ]",
          e: "[ Group brainstorming ] ⇨ [ Problem solving ] ⇨ [ Problem ]",
        },
      },
    },
  },
  Proposal_System_Finding_the_Immediate_Prerequisite: {
    title: newSec() + "1Cademy Proposal System: Finding the Immediate Prerequisite",
    description:
      "This video goes over how to find the immediate prerequisite information when you want to add nodes to the 1Cademy map.",
    video: "2idtxBKxS08",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          The first step in adding a new node to 1Cademy is finding the immediate prerequisite or the parent node. All
          parent nodes should contain the direct or immediate prerequisite information that a user needs to understand
          or learn through a follow-up child node. Users must first find or add the parent node that contains the
          immediate prerequisite information to the child node that they want to add.{" "}
        </Typography>
        <Typography>
          You can check to see if the immediate prerequisite already exists on the map or you can add or link the
          prerequisites that are necessary for the information that you want to add. First, do a search for the
          immediate prerequisite, using the search feature. You can watch the video by using the search feature on
          1Cademy to help you out. If you use a search feature you can perform a keyword search to look for terms that
          might be in an immediate prerequisite node.
        </Typography>
        <Typography>
          A user can also click through the links in the area that they want to add their node to and as they click
          through the links they might find that the immediate prerequisite already exists. If your immediate
          prerequisite does not already exist in your area of the map, or if it does exist somewhere else, what you're
          going to have to do is link it to your area of the map.
        </Typography>
        <Typography>
          Alternatively, you could add a node to your area of the map and link your child node there. Sometimes, you
          will have to go through all the ancestor or all the prerequisites available within the topic. These ancestors
          may provide prerequisite information but they may not provide the direct or immediate prerequisite
          information, therefore, you should go through these nodes until you find the gap in knowledge and add your own
          prerequisites.
        </Typography>
        <Typography>
          So, the direct information needed for your new child node will now exist on the map. Those are the two main
          ways you can either look to see if an immediate prerequisite already exists, add or link your own
          prerequisites to make sure that your new child node has the direct prerequisite information it needs so that
          users can learn through the links on 1Cademy without any gaps in knowledge.
        </Typography>
      </Box>
    ),
    questions: {
      When_can_a_node_be_defined_as_a_parent_node_on_1Cademy: {
        stem: quNum() + "When can a node be defined as a parent node on 1Cademy?",
        answers: ["a"],
        choices: {
          a: "When it contains direct (immediate) prerequisite information to the information you would like to add",
          b: "When it contains information a user needs to know to understand the information you would like to add",
          c: "When it contains unrelated information",
        },
      },
      What_is_an_ancestor_node: {
        stem: quNum() + "An ancestor node ...",
        answers: ["b"],
        choices: {
          a: "Contains direct (immediate) prerequisite information to the information you would like to add",
          b: "Contains direct or indirect information a user needs to know to understand the information you would like to add",
          c: "Contains unrelated information",
          // d: "Can be a parent node",
        },
      },
    },
  },
  Proposal_System_Demonstration_of_Finding_the_Immediate_Prerequisite: {
    title: newSec() + "1Cademy Proposal System: Demonstration of Finding the Immediate Prerequisite",
    description:
      "This video goes over the process a user might go through while trying to find an immediate prerequisite node.",
    video: "fc6varqBW4s",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          To begin, I want to add the node open access publishing to the map. I searched for open access publishing and
          it doesn't show up, but open access does and I know that open access offers prerequisite knowledge to my
          proposed node.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img
            alt=""
            src="/static/tutorial/DemonstrationofFindingtheImmediatePrerequisite1.png"
            width="100%"
            height="100%"
          />
        </Box>
        <Typography>
          I click on open access to go to that node and here I can see what relationships it has by viewing the parent
          and child nodes. I can also navigate to this prerequisite node by browsing through the map.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img
            alt=""
            src="/static/tutorial/DemonstrationofFindingtheImmediatePrerequisite2.png"
            width="100%"
            height="100%"
          />
        </Box>
        <Typography>
          Let's start with the node, types of librarianship and move over to the academic librarianship node, as I think
          this is a common topic in that field, then we move to topics in Academic Librarianship, which takes us to open
          access. I need to know what open access is before I can understand the concept of open access publishing, so I
          want to add open access publishing as a child node to open access; however, after considering what open access
          entails I realize there are many other topics in open access. So, it would be better to add a child relation
          node to open access for topics and open access first. Alternatively, we could link any appropriate
          prerequisite that already exists on the map by editing that node to add open access as a parent once the
          knowledge gap is filled with the appropriate prerequisite nodes. Then, I can link my open access publishing
          node to the topics in the open access node as a child concept node.
        </Typography>
      </Box>
    ),
    questions: {
      What_is_the_first_step_in_finding_a_parent_node_on_1Cademy: {
        stem: quNum() + "When proposing a new node, what is the first step to find a potential parent node?",
        answers: ["a"],
        choices: {
          a: "Using the search tool",
          b: "Navigating through our knowledge map view",
          c: "Looking at the current nodes visible on our map",
        },
      },
    },
  },
  Proposal_System_Proposals_on_1Cademy: {
    title: newSec() + "1Cademy Proposal System: Proposals on 1Cademy",
    description: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          Now that you are well versed in prerequisite and immediate prerequisite linking, it is time to learn about
          proposals on 1Cademy.
        </Typography>
        <Typography>
          A proposal is needed to create or modify a node. This includes creating or editing a title, the content, an
          image, a citation, a tag, or parent/child links.
        </Typography>
      </Box>
    ),
    video: "9dKL7ojJvro",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          The proposal system enables the creation, evaluation, and improvement of nodes and prerequisite links on the
          1Cademy shared knowledge graph. It also supports peer review and reputation building through proposing and
          editing notes as well as voting on node proposals. A node proposal on 1Cademy is needed to add a new node or
          modify an existing node on the shared knowledge graph.
        </Typography>
      </Box>
    ),
    questions: {
      For_what_purposes_should_we_submit_a_proposal_on_1Cademy: {
        stem: quNum() + "For what purpose(s) should we submit a proposal on 1Cademy?",
        answers: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
        choices: {
          a: "Creating a node",
          b: "Updating the title of a node",
          c: "Updating the content of a node",
          d: "Uploading an image to a node",
          e: "Adding a new citation to a node",
          f: "Editing a citation on a node",
          g: "Adding a new tag to a node",
          h: "Editing a tag on a node",
          i: "Adding/removing a parent link to/from a node",
          j: "Adding/removing a child link to/from a node",
        },
      },
    },
  },
  Proposal_System_Proposing_a_Child_Node_on_1Cademy: {
    title: newSec() + "1Cademy Proposal System: Proposing a Child Node on 1Cademy",
    description: "This video gives an overview of the steps to proposing a child node on 1Cademy.",
    video: "bhMvCqXbvbg",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          To propose a child node, you first need to find the immediate prerequisite or parent node and click the pencil
          button to propose a change to that parent node.{" "}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/ProposingaChildNodeon1Cademy1.png" width="80%" height="80%" />
        </Box>
        <Typography>
          When you click the pencil button, a list of child node types will pop up on the left-hand side. Then, select
          which type of node you want to propose, and a template will show up on your map.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/ProposingaChildNodeon1Cademy2.png" width="80%" height="80%" />
        </Box>
        <Typography>
          {" "}
          Now you can fill in the title and the content in the new node template. Next, you will want to link a
          reference node to cite the information you are summarizing in the title and content. You will also want to
          check the tag of the node to make sure it is tagged in the correct area on 1Cademy. Finally, check to make
          sure all the information is correct and click the green propose button in the bottom left-hand side of the
          node, and that is how you propose a child node on 1Cademy.
        </Typography>
      </Box>
    ),
    questions: {
      How_many_steps_are_there_to_proposing_a_child_node_on_1Cademy: {
        stem: quNum() + "How many steps are there to proposing a child node on 1Cademy?",
        answers: ["b"],
        choices: {
          a: "6",
          b: "7",
          c: "8",
          d: "9",
        },
      },
    },
  },
  Proposal_System_Proposing_an_edit_on_1Cademy: {
    title: newSec() + "1Cademy Proposal System: Proposing an edit on 1Cademy",
    description: "This video goes over how to propose an edit to a node on 1Cademy.",
    video: "rb0-ZvYTavE",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          It is recommended that you consider editing a node before downvoting it, especially if you think it could be
          improved. First, go to the node that you want to propose an edit for and select the pencil icon from the
          bottom menu. The left sidebar will open, showing you the options available. At the bottom of the list, you
          will see the edit or improve this node option, and beneath this list, you will see any currently pending
          proposals where you're welcome to vote on proposals.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/ProposinganEditon1Cademy1.png" width="80%" height="80%" />
        </Box>
        <Typography>
          Select the “edit or improve this node option”, and you will be returned to your selected node, which is now
          available for editing. Here, you can change the title. This will open the search option on the left so you can
          check for existing nodes with that title. You can also alter the content within the node and provide a reason
          for the proposed edit so that others can review your recommendation and vote on your proposed edit.
        </Typography>
        <Typography>
          If you look beneath the explanation field, at the bottom of the node, you will see the “references and tags”
          option is open, revealing that you can delete current links to a reference, enter a page number for the
          existing reference, enter a timestamp for voice or video material, and you can cite an existing reference.
          When you select “cite an existing reference”, you will see a message appear that instructs you to click the
          node you'd like to link to then navigate over to the desired reference node and you click it, which returns
          you to your edit proposal node now showing the added citation.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/ProposinganEditon1Cademy2.png" width="80%" height="80%" />
        </Box>
        <Typography>
          If you look to the node’s bottom right, you see the current tags, which you can also remove or add an existing
          tag. In adding an existing tag, this option will instruct you to click the node you'd like to link to,
          navigate to the desired node, and select. The new tag will appear in the edit proposal node. When you select
          the image icon, it will open your local file explorer so that you can select your proposed image. You can also
          select the parent and child nodes to view on the left; you have the option of linking to an existing parent.
          Once selected, you are prompted to click the node you want to add as a parent. On the right, you have the
          option to remove existing child nodes or link to an existing child node which will also ask you to click the
          node to be added as a child node.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/ProposinganEditon1Cademy3.png" width="80%" height="80%" />
        </Box>
        <Typography>
          If you want to remove a parent node from your current edit proposal node, select a new parent node here before
          proposing a separate edit to remove this child node from the old parent node. Once you are satisfied with your
          proposed edits, you can click the propose button or cancel if you have changed your mind, and this is how you
          propose an edit in 1Cademy.
        </Typography>
      </Box>
    ),
    questions: {
      What_can_users_edit_in_a_node: {
        stem: quNum() + "What can users edit in a node?",
        answers: ["a", "b", "c", "d", "e", "f", "h"],
        choices: {
          a: "Node title",
          b: "Node content",
          c: "Parent links",
          d: "Child links",
          e: "References",
          f: "Tags",
          g: "Node type",
          h: "Node image",
        },
      },
    },
  },
  Proposal_System_What_Happens_to_Proposals_on_1Cademy: {
    title: newSec() + "1Cademy Proposal System: What Happens to Proposals on 1Cademy",
    description: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          This video gives an overview of what happens after a node edit is proposed, how the pending proposals list
          works, and what happens when one up/down-votes nodes and proposals.
        </Typography>
        <Typography>
          <strong>Note:</strong>
          <ul>
            <li>
              Any proposed change to a node gets implemented as soon as it receives net-votes (number of upvotes minus
              downvotes) greater than or equal to half the net-votes that the corresponding node has received.
            </li>
            <li>
              If the number of down-votes on a node gets greater than its number of up-votes, the node will be deleted
              from the whole knowledge graph and no one will be able to retrieve it.
            </li>
          </ul>
        </Typography>
      </Box>
    ),
    video: "KaKYHZgQ7aM",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          Once you make a proposal it will either be immediately accepted or sent to the pending proposals list. The
          route it takes depends on how many upvotes and downvotes there are for the edited node. The total number of
          downvotes is subtracted from the total number of upvotes. If this number is less than three, any proposals
          will automatically be accepted and if this number is three or more, such as with the Library Science node,
          which has eight upvotes and zeroes downvotes, the proposal will go to the pending proposals list.
        </Typography>
        <Typography>
          The pending proposal list is based on your community tag and can be found on the sidebar. In evaluating a
          pending proposal, click on the proposal in the pending list, the node that the proposal is for will pop up.
          Then, click propose/evaluate versions of this node, located at the bottom of the node, and click on the
          pending proposal you want to evaluate.
        </Typography>
        <Typography>
          Evaluate whether you think the proposal is helpful or unhelpful by looking at the parent or ancestor nodes to
          understand the node you are editing. The proposal will be accepted when it receives a sum of upvotes minus
          downvotes equal to over half the sum of upvotes minus downvotes to the node it is changing. So, for the
          Focuses of Library Science node that has thirteen upvotes, any proposal will need to get seven upvotes to go
          through.{" "}
        </Typography>
        <Typography>
          Pending proposals cannot be downvoted off of the pending proposals list. To evaluate them, you should open the
          list of pending proposals on a specific node by clicking the pencil button on the node. Pending proposals will
          continue to get up or down votes until they either qualify as an accepted edit or the original creator deletes
          the proposal.
        </Typography>
      </Box>
    ),
    questions: {
      Can_a_node_be_downvoted_off_the_pending_proposals_list: {
        stem: quNum() + "Can a node be downvoted directly off the pending proposals list?",
        answers: ["b"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
      You_are_making_a_proposal_on_a_node_with_____________downvotes_and_____________upvotes: {
        stem:
          quNum() +
          "If you make a proposal on a node with ___________ and ___________, your proposal is accepted right away.",
        answers: ["a", "c", "d"],
        choices: {
          a: "0 downvotes; 2 upvotes",
          b: "3 downvotes; 6 upvotes",
          c: "8 downvotes; 9 upvotes",
          d: "0 downvotes; 0 upvotes",
          e: "0 downvotes; 3 upvotes",
        },
      },
      Which_of_the_following_combinations_of_upvotes_and_downvotes_will_result_in_2_net_votes: {
        stem: quNum() + "Which of the following combinations of upvotes and downvotes will result in 2 net votes?",
        answers: ["b"],
        choices: {
          a: "3 downvotes; 6 upvotes",
          b: "6 downvotes; 8 upvotes",
          c: "0 downvotes; 1 upvote",
        },
      },
      // When_will_a_proposal_appear_on_the_pending_proposals_list: {
      //   stem:
      //     quNum() +
      //     "When will a proposal appear on the pending proposals list?",
      //   answers: ["b"],
      //   choices: {
      //     a: "Anytime you make a proposal on a node",
      //     b: "When you make a proposal on a node with a netvote higher than 2",
      //     c: "When you make a proposal on a node with 2 votes",
      //   },
      // },
      What_steps_are_needed_to_evaluate_a_proposed_edit_to_a_node: {
        stem: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
            {quNum()}Which choice shows the correct order of steps needed to evaluate a proposed edit to a node?
            <ol>
              <li>Select the pending proposal you would like to evaluate.</li>
              <li>Click the tags and citations icon to find pending proposals to a specific node.</li>
              <li>Click propose/evaluate versions of this node to see the pending proposals to a specific node.</li>
              <li>Click the pending list on the sidebar (for nodes in your community).</li>
              <li>Click notifications in the side bar to view proposed edits to nodes.</li>
              <li>Click on a proposal in the pending list to open a specific node with a proposed edit.</li>
            </ol>
          </Box>
        ),
        answers: ["b"],
        choices: {
          a: "2 ⇨ 6 ⇨ 3 ⇨ 4",
          b: "4 ⇨ 6 ⇨ 3 ⇨ 1",
          c: "6 ⇨ 1 ⇨ 3 ⇨ 5",
          d: "1 ⇨ 2 ⇨ 4 ⇨ 6",
        },
      },
      What_happens_to_a_node_with_more_downvotes_than_upvotes: {
        stem:
          quNum() +
          "What happens to a node with more downvotes than upvotes? HINT: A node is different from a proposal.",
        answers: ["a"],
        choices: {
          a: "It gets deleted from the whole knowledge graph.",
          b: "It remains untouched.",
          c: "It gets locked.",
          d: "It is kept as a proposal.",
        },
      },
    },
  },
  Proposal_System_Summarizing_a_Paper_on_1Cademy: {
    title: newSec() + "1Cademy Proposal System: Summarizing a Paper on 1Cademy",
    description: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>This video gives an overview of how to summarize papers on 1Cademy.</Typography>
        <Typography>
          Our communities care a lot about the integrity of the knowledge shared on 1Cademy. For this purpose, in
          addition to the community leaders who supervise your contributions to 1Cademy, we have a dedicated community
          of liaison librarians who supervise all communities to ensure cohesion of the content across 1Cademy
          communities. If you're not sure about the credibility of the sources that you'd like to summarize, please do
          one of the followings:
        </Typography>
        <ul>
          <li>Ask the 1Cademy liaison librarians working with your community.</li>
          <li>Ask your 1Cademy community leader(s).</li>
          <li>Discuss in your community weekly meetings.</li>
        </ul>
      </Box>
    ),
    video: "zrVh93YXHfY",
    stem: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        <Typography>
          Research papers are structured differently than a textbook. We want to ensure we know how to summarize
          research papers and apply that information when proposing nodes on 1Cademy. The general process for proposing
          new information to the platform is to find the appropriate area of the map. Then, propose a reference node for
          your source. Next, find the immediate prerequisite for the new content you'd like to add and propose your
          nodes.
        </Typography>
        <Typography>
          Some considerations for research papers; make sure to summarize the paper's findings as discrete concepts and
          relations. You don't want to have multiple concepts all in the same node. You also don't need to propose a
          node for every section of the research paper. You don't need to have a methods node or an analysis node but
          include nodes based on the concepts rather than the structure of the paper. That means you don't need to
          summarize the entire paper when you're adding new content from it on the platform. Focus mostly on the
          findings, their discussion, and what they contributed to the body of knowledge for the field they’re studying.
        </Typography>
        <Typography>
          For example, take a paper about teaching specifically about Dialogic Pedagogy. Pedagogy is an approach to
          teaching. Dialogic means discussion based. So, for this example, I would work in the education area on the
          1Cademy platform. Once you have found the specific topics your paper focuses on, use the search tool, or
          navigate through the nodes on the platform to find where your content will need to be added.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/SummarizingaPaperon1Cademy1.png" width="80%" height="80%" />
        </Box>
        <Typography>
          The first thing you will add is a reference node. That way you can use this node when you're citing later
          nodes. Each broad topic on 1Cademy should have a reference parent node, and this is where you'll add the
          reference node for your paper. It is important to make sure you use APA format when you are adding this new
          reference node. Once you have done that, your next step is to find the specific nodes that will be the
          immediate prerequisite for the content you want to add. Make sure that you're not duplicating content that
          already exists on the map. If the immediate prerequisite that you need doesn't exist, then you can always
          propose it.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/SummarizingaPaperon1Cademy2.png" width="80%" height="80%" />
        </Box>
        <Typography>
          {" "}
          Your next step is to propose the nodes. Make sure that you are paraphrasing or summarizing information. We
          don't use direct quotes on 1Cademy. You also should be citing the page numbers for the paper when adding
          content for each node. Keep in mind what concepts the research paper is contributing to the larger body of
          knowledge for the field. For example, in the earlier mentioned pedagogy paper, what new concepts is the paper
          contributing to the field of education?
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <img alt="" src="/static/tutorial/SummarizingaPaperon1Cademy3.png" width="80%" height="80%" />
        </Box>
        <Typography>
          Still using the pedagogy paper as an example, on 1Cademy, there are no nodes about the pedagogy paper’s
          methods, specifically there are no nodes about the literature review. All of the information has been
          summarized conceptually. However, there is an immediate prerequisite node called Discussion in Education. The
          prerequisite already existed, so I did not need to create a prerequisite for myself. The paper went over
          several different features of discussion in education, discussing some theories of dialogic teaching. I then
          added some nodes after these child relation nodes about dialogism and sociocultural theory of learning. I
          found that the third theory it discusses, social constructivism, already exists and linked it to my relation
          node Theories of Dialogistic Teaching as a child node. I have also added nodes on the features of dialogic
          teaching and obstacles to dialogic teaching that the paper discusses, but I do not have any specific nodes
          based on the structure of the paper, only concepts proposed or discussed in the paper.
        </Typography>
      </Box>
    ),
    questions: {
      When_summarizing_a_research_paper_should_you_propose_nodes_about_each_section_in_the_paper: {
        stem: quNum() + "When summarizing a research paper, should you propose nodes about each section in the paper?",
        answers: ["b"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
      Is_it_okay_to_duplicate_content_on_the_knowledge_graph: {
        stem: quNum() + "Is it okay to duplicate content on the knowledge graph?",
        answers: ["b"],
        choices: {
          a: "Yes",
          b: "No",
        },
      },
      Is_it_okay_to_use_direct_quotes_when_summarizing_a_paper_on_1Cademy_s_knowledge_graph: {
        stem: quNum() + "Is it okay to block quote when summarizing a paper on 1Cademy?",
        answers: ["b"],
        choices: {
          a: "Yes.",
          b: "No. We should paraphrase it.",
        },
      },
      What_should_you_do_if_you_re_not_sure: {
        stem: quNum() + "What should you do if you're not sure whether a source is reputable to cite on 1Cademy?",
        answers: ["c", "d", "e"],
        choices: {
          a: "Ask other people on the Internet.",
          b: "Trust your best guess.",
          c: "Ask the leaders of your 1Cademy community.",
          d: "Ask the 1Cademy liaison librarians working with your community.",
          e: "Discuss in your community weekly meetings.",
        },
      },
    },
  },
  Congratulations: {
    title: "Congratulations!",
    description: (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "1rem" }}>
        You successfully completed the 1Cademy tutorial.
      </Box>
    ),
    video: "",
    questions: {},
  },
};
export default tutoIntroQuestions;
