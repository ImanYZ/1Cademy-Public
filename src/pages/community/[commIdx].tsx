import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import EmailIcon from "@mui/icons-material/Email";
import LinkIcon from "@mui/icons-material/Link";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  styled,
  Typography,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Stack } from "@mui/system";
import { collection, DocumentChange, DocumentData, getFirestore, onSnapshot, query } from "firebase/firestore";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { User } from "src/knowledgeTypes";

import AppFooter from "@/components/AppFooter";
import AppHeaderMemoized from "@/components/Header/AppHeader";
import { allCommunities } from "@/components/home/CommunitiesOrder";
import YoutubeEmbed from "@/components/home/components/YoutubeEmbed";
import { ONE_CADEMY_SECTIONS } from "@/components/home/SectionsItems";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { ONECADEMY_DOMAIN } from "@/lib/utils/1cademyConfig";
import ROUTES from "@/lib/utils/routes";

import JoinUs from "../../components/community/JoinUs";
// import { ONE_CADEMY_SECTIONS } from "@/components/home/SectionsItems";
import {
  darkBase,
  gray01,
  gray02,
  gray200,
  gray400,
  gray600,
  gray800,
  orange250,
  orangeDark,
  orangeLight,
} from "../home";

const subSections = [
  {
    title: "Qualifications",
    image: "/static/requirements/qualifications_dark_mode.svg",
    component: (community: any) => {
      return community ? (
        <ul>
          {community.qualifications &&
            community.qualifications.map((qualifi: any, qIdx: number) => {
              return <li key={qIdx}>{qualifi}</li>;
            })}
          <li>Submit your most current resume and unofficial transcripts, indicating a GPA above 3.4/4.0</li>
          <li>Explain in a few paragraphs why you apply to this specific community.</li>
          <li>
            Complete our community-specific quiz by answering a set of questions about some research papers or book
            chapters and get a satisfying score.
          </li>
          {community.coursera && (
            <li>
              Complete{" "}
              <a href={community.coursera} target="_blank" rel="noreferrer">
                this Coursera course
              </a>{" "}
              and upload your certificate as a part of the application.
            </li>
          )}
        </ul>
      ) : null;
    },
  },
  {
    title: "By Joining Us, You Will ...",
    image: "/static/requirements/by_joining_us_dark_mode.svg",

    component: (community: any) => {
      return community ? (
        <ul>
          {community.gains &&
            community.gains.map((gain: any, gIdx: number) => {
              return <li key={gIdx}>{gain}</li>;
            })}
        </ul>
      ) : null;
    },
  },
  {
    title: "Responsibilities",
    image: "/static/requirements/responsibilities_dark_mode.svg",
    component: (community: any) => {
      return community ? (
        <ul>
          {community.responsibilities &&
            community.responsibilities.map((responsibility: any, rIdx: number) => {
              return <li key={rIdx}>{responsibility}</li>;
            })}
        </ul>
      ) : null;
    },
  },
];

const accumulatePoints = (
  groups: any,
  reputationData: DocumentData,
  user: Pick<User, "uname" | "fName" | "lName" | "imageUrl">,
  points: number
) => {
  for (let communi of groups) {
    for (let deTag of communi.tags) {
      if (reputationData.tag === deTag.title) {
        const userIdx = communi.allTime.findIndex((obj: any) => obj.uname === reputationData.uname);
        if (userIdx !== -1) {
          communi.allTime[userIdx].points += points;
        } else {
          communi.allTime.push({
            ...user,
            uname: reputationData.uname,
            points,
          });
        }
      }
    }
  }
};

const DividerStyled = styled(props => <Divider {...props} />)(({ theme }) => ({
  marginTop: "32px",
  marginBottom: "32px",
  borderColor: theme.palette.mode === "dark" ? gray600 : gray200,
}));

type Params = {
  commIdx: string;
};

type Props = {
  commIdx: string;
};

export const getStaticProps: GetStaticProps<Props, Params> = ({ params }) => {
  return {
    props: {
      commIdx: String(params?.commIdx),
    },
  };
};

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  return {
    paths: allCommunities.map(community => ({
      params: {
        commIdx: community.id,
      },
    })),
    fallback: "blocking",
  };
};

const Communities = (props: Props) => {
  const { commIdx } = props;
  const db = getFirestore();
  const [reputationsChanges, setReputationsChanges] = useState<DocumentChange<DocumentData>[]>([]);
  const [reputations, setReputations] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [reputationsLoaded, setReputationsLoaded] = useState(false);
  const [usersChanges, setUsersChanges] = useState<DocumentChange<DocumentData>[]>([]);
  const [users, setUsers] = useState<{ [key: string]: Pick<User, "uname" | "fName" | "lName" | "imageUrl"> }>({});
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [communities, setCommunities] = useState(allCommunities);

  const community = useMemo(() => {
    return allCommunities.find(e => e.id === commIdx) ?? allCommunities[0];
  }, [commIdx, allCommunities]);
  // const [expandedOption, setExpandedOption] = useState("");
  const [limit, setLimit] = useState(3);

  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // if (firebase) {}
    // const usersQuery = firebase.db.collection("users");
    const userRef = collection(db, "users");
    const q = query(userRef);
    const usersSnapshot = onSnapshot(q, snapshot => {
      const docChanges = snapshot.docChanges();
      setUsersChanges(oldUsersChanges => {
        return [...oldUsersChanges, ...docChanges];
      });
    });
    return () => {
      setUsersChanges([]);
      usersSnapshot();
    };
  }, [db]);

  useEffect(() => {
    if (usersChanges.length > 0) {
      const tempUsersChanges = [...usersChanges];
      setUsersChanges([]);
      let members = { ...users };
      for (let change of tempUsersChanges) {
        const userData = change.doc.data();
        if (change.type === "removed" || userData.deleted) {
          if (change.doc.id in members) {
            delete members[change.doc.id];
          }
        } else {
          members[change.doc.id] = {
            uname: userData.uname,
            fName: userData.fName,
            lName: userData.lName,
            imageUrl: userData.imageUrl,
          };
        }
      }
      setUsers(members);
      setUsersLoaded(true);
    }
  }, [usersChanges, users]);

  useEffect(() => {
    if (!usersLoaded) return;
    const reputationsQuery = collection(db, "reputations");
    const reputationsSnapshot = onSnapshot(reputationsQuery, snapshot => {
      const docChanges = snapshot.docChanges();
      setReputationsChanges(oldReputationsChanges => {
        return [...oldReputationsChanges, ...docChanges];
      });
    });
    return () => {
      setReputationsChanges([]);
      reputationsSnapshot();
    };
  }, [db, usersLoaded]);

  useEffect(() => {
    if (reputationsChanges.length > 0) {
      setReputationsLoaded(false);
      const tempReputationsChanges = [...reputationsChanges];
      setReputationsChanges([]);
      let rpts = { ...reputations };
      const groups = [...communities];
      for (let change of tempReputationsChanges) {
        const reputationData = change.doc.data();
        const points =
          reputationData.cdCorrects +
          reputationData.iCorrects +
          reputationData.mCorrects -
          reputationData.cdWrongs -
          reputationData.iWrongs -
          reputationData.mWrongs;
        if (change.type === "removed" || reputationData.deleted) {
          if (reputationData.uname in rpts) {
            delete rpts[reputationData.uname];
          }
        } else {
          const user = users[reputationData.uname];
          if (!(reputationData.uname in rpts)) {
            accumulatePoints(groups, reputationData, user, points);
            rpts[reputationData.uname] = { [reputationData.tag]: points };
          } else {
            if (!(reputationData.tag in rpts[reputationData.uname])) {
              accumulatePoints(groups, reputationData, user, points);
              rpts[reputationData.uname][reputationData.tag] = points;
            } else {
              accumulatePoints(groups, reputationData, user, points - rpts[reputationData.uname][reputationData.tag]);
              rpts[reputationData.uname][reputationData.tag] = points;
            }
          }
        }
      }
      for (let communi of groups) {
        communi.allTime.sort((a: any, b: any) => b.points - a.points);
      }
      setReputations(rpts);
      setCommunities(groups);
      setReputationsLoaded(true);
    }
  }, [reputationsChanges, reputations, communities, users]);

  // const handleChangeOption = option => (event, newExpanded) => {
  //   setExpandedOption(newExpanded ? option : false);
  // };

  const joinUsClick = () => {
    window.location.replace("#JoinUsSection");
  };
  const onSwitchSection = (sectionId: string) => {
    window.location.href = `/#${sectionId}`;
  };
  return (
    <>
      <Head>
        <link rel="canonical" href={`${ONECADEMY_DOMAIN}community/${commIdx}`} key="canonical" />
        <title>{`1Cademy - ${community?.title}`}</title>
      </Head>
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
            px: { xs: "12px", lg: "0px" },
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Button
              variant="outlined"
              onClick={() => {
                if (!carouselRef.current) return;

                carouselRef.current.scrollBy(600, 0);
              }}
              sx={{
                background: gray02,
                position: "absolute",
                right: { xs: "0px", xl: "-28px" },
                top: "calc(50% - 28px)",
                zIndex: "9",
                ":hover": { background: gray01, opacity: "0.9", borderColor: gray02 },
                width: { xs: "32px", md: "56px" },
                minWidth: { xs: "32px", md: "56px" },
                height: { xs: "32px", md: "56px" },
                p: "0px",
                borderRadius: "50%",
                borderColor: "transparent",
                opacity: "0.7",
                transition: "opacity .3s",
              }}
            >
              <ArrowForwardIcon sx={{ color: "white" }} />
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                if (!carouselRef.current) return;

                carouselRef.current.scrollBy(-600, 0);
              }}
              sx={{
                background: gray02,
                position: "absolute",
                left: { xs: "0px", xl: "-28px" },
                top: "calc(50% - 28px)",
                zIndex: "9",
                ":hover": { background: gray01, opacity: "0.9", borderColor: gray02 },
                width: { xs: "32px", md: "56px" },
                minWidth: { xs: "32px", md: "56px" },
                height: { xs: "32px", md: "56px" },
                p: "0px",
                borderRadius: "50%",
                borderColor: gray02,
                opacity: "0.7",

                transition: "opacity .3s",
              }}
            >
              <ArrowBackIcon sx={{ color: "common.white" }} />
            </Button>
            <Stack
              ref={carouselRef}
              direction={"row"}
              alignItems="stretch"
              spacing={"24px"}
              sx={{
                position: "relative",
                overflowX: "scroll",
                maxWidth: "1280px",
                py: "16px",
                scrollBehavior: "smooth",
                "&::-webkit-scrollbar": {
                  width: "4px",
                  height: "4px",
                },
                "::-webkit-scrollbar-thumb": {
                  backgroundColor: gray400,
                  borderRadius: "10px",
                },
                a: {
                  display: "flex",
                  textDecoration: "none",
                },
              }}
            >
              {communities.map(item => (
                <Link
                  key={item.id}
                  href={`/community/${item.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                  passHref
                >
                  <a>
                    <Card
                      elevation={0}
                      sx={{
                        minWidth: { xs: "150px", sm: "210px" },
                        maxWidth: { xs: "160px", sm: "220px" },
                        flex: 1,
                        backgroundColor: "transparent",
                      }}
                      square
                    >
                      <CardActionArea
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          p: "16px",
                          border: theme => `1px solid ${theme.palette.mode === "dark" ? darkBase : gray200}`,
                          backgroundColor: theme => (theme.palette.mode === "dark" ? "#181818" : "transparent"),
                          borderRadius: "8px",
                          cursor: "pointer",
                          height: "100%",
                          borderColor: community.id === item.id ? orangeDark : "",
                          ":hover": {
                            borderColor: orangeDark,
                          },
                        }}
                      >
                        <CardMedia
                          component={"img"}
                          image={item.url}
                          alt={item.title}
                          sx={{ borderRadius: "8px", height: { xs: "100px", sm: "140px" } }}
                        />
                        <CardContent sx={{ p: "16px 0 0 0" }}>
                          <Typography
                            sx={{
                              fontSize: "14px",
                              fontWeight: 600,
                              pt: "16px",
                            }}
                          >
                            {item.title}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </a>
                </Link>
              ))}
            </Stack>
          </Box>

          <DividerStyled />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: "16px", sm: "0px" }}
            alignItems="center"
            justifyContent={"space-between"}
            mb="16px"
          >
            <Typography
              variant="h1"
              gutterBottom
              align="center"
              sx={{ textTransform: "capitalize", m: "0px", fontWeight: 600 }}
            >
              {community.title}
            </Typography>
            <Button
              onClick={joinUsClick}
              sx={{
                textTransform: "initial",
                color: "common.white",
                backgroundColor: orangeDark,
                cursor: "pointer",
                ":hover": {
                  cursor: "pointer",
                  backgroundColor: orangeLight,
                },
              }}
            >
              Apply to join this community
            </Button>
          </Stack>

          <Box sx={{ py: "10px", px: { xs: "10px" }, mb: "19px" }}>
            {/* Community video */}

            <YoutubeEmbed embedId={community.YouTube} />

            <br />

            {/* Community description */}

            {typeof community.description === "object" && community.description !== null ? (
              community.description
            ) : (
              <Typography variant="body1" sx={{ textAlign: "left" }}>
                {community.description}
              </Typography>
            )}

            <br />

            {/* Communiiity leader */}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
                placeItems: "center",
                gap: "16px",
                m: "2.5px",
                minHeight: "130px",
              }}
            >
              {community.leaders &&
                community.leaders.map((leader, idx: number) => {
                  return (
                    <Stack
                      key={idx}
                      alignItems={"center"}
                      spacing="8px"
                      sx={{
                        padding: "24px ",
                        border: theme => `1px solid ${theme.palette.mode === "dark" ? darkBase : gray200}`,
                        borderRadius: "12px",
                        width: "280px",
                        backgroundColor: theme => (theme.palette.mode === "dark" ? "#181818" : "transparent"),
                      }}
                    >
                      <Avatar
                        src={"/static/CommunityLeaders/" + leader.image}
                        alt={leader.name}
                        sx={{
                          width: "100px",
                          height: "100px",
                          mb: "4px",
                        }}
                      />
                      <Typography variant="h5" component="div" fontWeight={600}>
                        {leader.name}
                      </Typography>
                      <Typography variant="h5" component="div" sx={{ fontSize: "16px" }}>
                        Community leader
                      </Typography>
                      <Stack direction={"row"} spacing="8px">
                        {leader.websites &&
                          leader.websites.map((wSite, wIdx) => {
                            return (
                              <IconButton
                                key={wIdx}
                                component="a"
                                href={wSite.url}
                                target="_blank"
                                aria-label={wSite.name}
                                sx={{ color: gray400 }}
                              >
                                {wSite.name === "LinkedIn" ? <LinkedInIcon /> : <LinkIcon />}
                              </IconButton>
                            );
                          })}
                        <IconButton
                          component="a"
                          href={
                            "mailto:onecademy@umich.edu?subject=" + community.title + " Question for " + leader.name
                          }
                          target="_blank"
                          aria-label="email"
                          sx={{ color: gray400 }}
                        >
                          <EmailIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  );
                })}
            </Box>
          </Box>

          <DividerStyled />

          {/* Qualification, Joinning and responsabilities */}

          <Box>
            {subSections.map((subSection, idx) => (
              <Stack
                key={idx}
                direction={{ xs: "column", sm: "row" }}
                alignItems="center"
                spacing={{ xs: "24px", sm: "100px" }}
                sx={{ mb: { xs: "40px", sm: "16px" } }}
              >
                <Box
                  sx={{
                    flex: 1,
                    maxWidth: "650px",
                    "& ul": {
                      pl: "28px",
                    },
                    "& li": {
                      listStyle: "none",
                      position: "relative",
                    },
                    "& li:before": {
                      content: '""',
                      width: "6px",
                      height: "6px",
                      backgroundColor: theme => (theme.palette.mode === "dark" ? gray200 : gray800),
                      color: theme => (theme.palette.mode === "dark" ? gray200 : gray800),
                      borderRadius: "2px",
                      position: "absolute",
                      left: "-20px",
                      top: "8px",
                    },
                    "& li:not(:last-child)": {
                      marginBottom: "12px",
                    },
                  }}
                >
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {subSection.title}
                  </Typography>
                  {subSection.component(community)}
                </Box>
                <Box sx={{ width: { sm: "250px", lg: "300px" }, height: { sm: "250px", lg: "300px" } }}>
                  <Image src={subSection.image} alt={subSection.title} width="100%" height="100%" />
                </Box>
              </Stack>
            ))}

            {/* {getImage(expandedOption, { display: { xs: "none", md: "block" } })} */}
          </Box>

          <DividerStyled />

          <Typography variant="h4" gutterBottom align="center" sx={{ textTransform: "capitalize", p: { xs: "10px" } }}>
            Apply to Join this Community
          </Typography>

          <JoinUs community={community} themeName="dark" />

          {typeof community.accomplishments === "object" &&
            !Array.isArray(community.accomplishments) &&
            community.accomplishments !== null && (
              <>
                <DividerStyled />

                <Box
                  sx={{
                    padding: "10px",
                    mb: "19px",
                    "& a:link": {
                      color: orangeDark,
                    },
                    "& a:visited": {
                      color: orange250,
                    },
                  }}
                >
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{
                      pt: "19px",
                      pb: "19px",
                    }}
                  >
                    Community Accomplishments
                  </Typography>

                  {community.accomplishments}
                </Box>
              </>
            )}
          <DividerStyled />
          {!reputationsLoaded && (
            <Stack direction={"row"} alignItems={"center"} justifyContent={"center"} mb="32px">
              <CircularProgress />
            </Stack>
          )}
          {reputationsLoaded && (
            <Box
              sx={{
                m: "24px 2.5px",
                minHeight: "130px",
              }}
            >
              <Typography
                sx={{
                  display: "block",
                }}
              >
                <b>Leaderboard</b>
                <br />
                <span> Only those with &gt; 25 points </span>
              </Typography>
              <br />
              <Stack
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
                  placeItems: "stretch",
                  gap: "8px",
                  listStyle: "none",
                  p: 0.5,
                  m: 0,
                }}
              >
                {community.allTime &&
                  community.allTime.slice(0, limit).map((member: any, idx) => {
                    return member.points >= 25 ? (
                      <Stack
                        key={idx}
                        direction={"row"}
                        alignItems={"center"}
                        sx={{
                          minWidth: "150px",
                          maxWidth: "100%",
                          height: "84px",
                          borderRadius: "12px",
                          border: `1px solid ${gray800}`,
                          backgroundColor: "black",
                          p: { xs: "6px 8px", sm: "16px 24px" },
                        }}
                      >
                        <Avatar
                          src={member.imageUrl}
                          alt={member.fullname}
                          sx={{
                            width: "50px",
                            height: "50px",
                            mr: 2.5,
                          }}
                        />
                        <Stack>
                          <Typography
                            sx={{ fontSize: "16px", fontWeight: 600 }}
                          >{`${member.fName} ${member.lName}`}</Typography>
                          <Typography variant="body2" component="div" sx={{ display: "flex" }}>
                            {idx < 3 ? (
                              "🏆"
                            ) : (
                              <DoneRoundedIcon sx={{ color: DESIGN_SYSTEM_COLORS.success500, alignSelf: "center" }} />
                            )}
                            {" " + Math.round((member.points + Number.EPSILON) * 100) / 100}
                          </Typography>
                        </Stack>
                      </Stack>
                    ) : null;
                  })}
                <Button
                  onClick={() => (community.allTime ? setLimit(community.allTime.length) : setLimit(3))}
                  sx={{
                    display: limit === 3 ? "block" : "none",
                    textTransform: "capitalize",
                    color: orangeDark,
                    cursor: "pointer",
                    // placeSelf: "center"
                  }}
                >
                  View more...
                </Button>
              </Stack>
            </Box>
          )}
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
    </>
  );
};

export default Communities;
