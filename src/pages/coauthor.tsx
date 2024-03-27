import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
const ContentComp = dynamic(() => import("../components/coauthor/ContentComp"), { ssr: false });
import { Bar, Container, Resizer, Section } from "@column-resizer/react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgress } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { collection, getFirestore, onSnapshot, query, where } from "firebase/firestore";

import SideBar from "../components/coauthor/Sidebar";
import { useAuth } from "../context/AuthContext";
if (typeof window !== "undefined") {
  const Popper = require("popper.js").default;
  const jQuery = require("jquery");
  (window as any).Popper = Popper.default;
  (window as any).$ = (window as any).jQuery = jQuery;
  require("bootstrap");
}

const defaultSize = 400;

const App = () => {
  const db = getFirestore();
  const [{ user }] = useAuth();
  const [articleContent, setArticleContent] = useState<string>("");
  const [articleDOM, setArticleDOM] = useState<HTMLElement[]>([]);
  const [rightPanelVisible, setRightPanelVisible] = useState<boolean>(true);
  const [sideBarWidth, setSideBarWidth] = useState<number>(defaultSize);
  const columnResizerRef = useRef<any>();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [email, setEmail] = useState("");
  const [page, setPage] = useState("Main");
  const [userProfile, setUserProfile] = useState<any>({});
  const [openSettings, setOpenSettings] = useState<boolean>(false);
  const [articleTypePath, setArticleTypePath] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState({
    id: "",
    content: "",
  });
  const [userArticles, setUserArticles] = useState<any>([]);
  const [selection, setSelection] = useState<any>(null);
  const quillRef: any = useRef(false);

  useEffect(() => {
    setTimeout(() => {
      const element = document.getElementById("loader-overlay") as HTMLElement;
      if (element) {
        element.style.display = "none";
      }
    }, 8000);
  }, []);

  useEffect(() => {
    (async () => {
      if (user) {
        setPage("Main");
        setEmail(user.email);
        setUserProfile(user);
      } else {
        setPage("Login");
        setEmail("");
        setUserProfile({});
        setOpenSettings(false);
      }
    })();
  }, [user]);
  useEffect(() => {
    if (!user?.userId) return;
    const unsubscribe = onSnapshot(query(collection(db, "articles"), where("user", "==", user?.userId)), snapshot => {
      let articlesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      articlesData = articlesData.filter(article => !article.deleted);
      if (articlesData.length === 0) {
        const element = document.getElementById("loader-overlay") as HTMLElement;
        if (element) {
          element.style.display = "none";
        }
        return;
      }
      setUserArticles(articlesData);
      const latestArticle = articlesData.reduce((prev, current) => {
        const prevTimestamp = Math.max(prev.createdAt, prev.updatedAt || 0);
        const currentTimestamp = Math.max(current.createdAt, current.updatedAt || 0);
        return currentTimestamp > prevTimestamp ? current : prev;
      }, articlesData[0]);
      setSelectedArticle(latestArticle);
    });
    return () => unsubscribe();
  }, [db, userProfile]);

  const theme = createTheme({
    palette: {
      mode: prefersDarkMode ? "dark" : "light",
      secondary: {
        main: "#FF8C00",
      },
    },
  });

  useEffect(() => {
    setTimeout(() => {
      handleResize(defaultSize);
    }, 1000);
  }, []);

  useEffect(() => {
    const controller = columnResizerRef.current;
    if (controller) {
      const resizer = controller.getResizer();
      resizer.resizeSection(0, { toSize: rightPanelVisible ? defaultSize : 0 });
      controller.applyResizer(resizer);
    }
  }, [rightPanelVisible]);

  const handleResize = (sideWidth: number) => {
    setSideBarWidth(sideWidth);
    // const element = document.querySelector('#editor-container') as HTMLElement
    //   if (element) {
    //     element.style.position = 'absolute'
    //     element.style.top = '0px'
    //     element.style.left = `${sideWidth + 7}px`
    //     element.style.zIndex = '10'
    //     element.style.width = `calc(100% - ${sideWidth + 7}px)`
    //     element.style.height = '100%'
    //   }
  };

  const beforeApplyResizer = (resizer: Resizer): void => {
    const sectionSize = resizer.getSectionSize(0);
    handleResize(sectionSize);
  };

  // const changeOpenSettings = () => {
  //   setOpenSettings(previourValue => !previourValue);
  // };

  return (
    <ThemeProvider theme={theme}>
      <Box
        id="loader-overlay"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "start",
          justifyContent: "center",
          overflow: "hidden",
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress color="secondary" size={100} thickness={4} />
        </Box>
      </Box>
      {/* <NavbarComp
        email={email}
        userProfile={userProfile}
        openSettings={openSettings}
        changeOpenSettings={changeOpenSettings}
        articleContent={articleContent}
        articleTypePath={articleTypePath}
        setArticleTypePath={setArticleTypePath}
      /> */}
      <Container
        columnResizerRef={columnResizerRef}
        beforeApplyResizer={beforeApplyResizer}
        style={{
          height: "100vh",
          width: "100%",
          zIndex: 0,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }}
      >
        <Section minSize={0} defaultSize={defaultSize}>
          <SideBar
            articleContent={articleContent}
            articleDOM={articleDOM}
            theme={theme}
            sideBarWidth={sideBarWidth}
            email={email}
            openSettings={openSettings}
            page={page}
            articleTypePath={articleTypePath}
            setArticleTypePath={setArticleTypePath}
            selectedArticle={selectedArticle}
            quillRef={quillRef}
            selection={selection}
            user={user}
          />
        </Section>
        <Bar
          size={7}
          style={{
            background: "#2f3a4c",
            // cursor: 'col-resize',
            cursor: "ew-resize",
            position: "relative",
          }}
        >
          <Box
            sx={{
              background: "#2f3a4c",
              "&:hover": {
                backgroundColor: theme.palette.mode === "dark" ? "#3f4a5c" : "#1f2a3c",
              },
              width: "100%",
              height: "100%",
            }}
          >
            <MoreVertIcon
              style={{
                position: "absolute",
                top: "28.6%",
                left: "50%",
                transform: "translate(-50%, -28.6%)",
                color: "lightgray",
              }}
            />
            <Button
              onClick={() => {
                setRightPanelVisible(prev => !prev);
              }}
              sx={{
                position: "absolute",
                top: "calc(50% - 5px)",
                left: "calc(50% - 5px)",
                transform: "translate(-50%, -calc(50% - 5px))",
                borderRadius: "0px",
                color: "lightgray",
                backgroundColor: "#848d9e",
                "&:hover": {
                  backgroundColor: "#138a07",
                },
                cursor: "pointer",
                width: "10px",
                minWidth: "10px",
                height: "50px",
                padding: "0px",
                zIndex: 25,
              }}
            >
              {rightPanelVisible ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </Button>
            <MoreVertIcon
              style={{
                position: "absolute",
                top: "77.8%",
                left: "50%",
                transform: "translate(-50%, -77.8%)",
                color: "lightgray",
              }}
            />
          </Box>
        </Bar>
        <Section>
          <ContentComp
            user={user}
            userArticles={userArticles}
            selectedArticle={selectedArticle}
            setSelectedArticle={setSelectedArticle}
            setArticleContent={setArticleContent}
            setArticleDOM={setArticleDOM}
            quillRef={quillRef}
            selection={selection}
            setSelection={setSelection}
            articleContent={articleContent}
            articleTypePath={articleTypePath}
            setArticleTypePath={setArticleTypePath}
          />
        </Section>
      </Container>
    </ThemeProvider>
  );
};

export default App;
