import dynamic from "next/dynamic";
import React, { useEffect, useRef, useState } from "react";
const ContentComp = dynamic(() => import("../../components/coauthor/ContentComp"), { ssr: false });
import { Bar, Container, Resizer, Section } from "@column-resizer/react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { CircularProgress, Paper } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/router";
import { useQuery } from "react-query";

import { getArticleTypes } from "@/lib/coauthor";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import SideBar from "../../components/coauthor/Sidebar";
import { useAuth } from "../../context/AuthContext";
if (typeof window !== "undefined") {
  const Popper = require("popper.js").default;
  const jQuery = require("jquery");
  (window as any).Popper = Popper.default;
  (window as any).$ = (window as any).jQuery = jQuery;
  require("bootstrap");
}

const defaultSize = 400;

const Article = () => {
  const db = getFirestore();
  const [{ user }] = useAuth();
  const router = useRouter();
  const [articleContent, setArticleContent] = useState<string>("");
  const [articleDOM, setArticleDOM] = useState<HTMLElement[]>([]);
  const [rightPanelVisible, setRightPanelVisible] = useState<boolean>(true);
  const [sideBarWidth, setSideBarWidth] = useState<number>(defaultSize);
  const columnResizerRef = useRef<any>();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [email, setEmail] = useState("");
  const [page, setPage] = useState("Main");
  const [openSettings, setOpenSettings] = useState<boolean>(false);
  const [articleTypePath, setArticleTypePath] = useState<string[]>([]);
  const [articleTypes, setArticleTypes] = useState<any>({});
  const [selectedArticle, setSelectedArticle] = useState<any>({});
  const [selection, setSelection] = useState<any>(null);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const quillRef: any = useRef(false);
  const articleId = router.query.id as string;
  const { data } = useQuery("articleTypes", getArticleTypes);
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    if (mediaQuery?.matches) {
      document.body.classList.add("LightTheme");
    }

    const handleChange = (e: any) => {
      if (e?.matches) {
        document.body.classList.add("LightTheme");
      }
    };
    mediaQuery.addListener(handleChange);

    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, []);

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
      } else {
        setPage("Login");
        setEmail("");
        setOpenSettings(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!user?.userId) return;
    if (!articleId) return;
    const articleRef = doc(db, "articles", articleId);
    const unsubscribe = onSnapshot(
      articleRef,
      doc => {
        if (doc.exists()) {
          const articleData = doc.data();
          if (articleData?.editors.includes(user?.uname)) {
            setIsEditable(true);
          }

          setSelectedArticle({ ...articleData, id: doc.id });
          setArticleTypePath(articleData?.path || []);
        } else {
          console.error("No such document!");
        }
      },
      error => {
        console.error("Error listening for document:", error);
      }
    );
    return () => unsubscribe();
  }, [db, user, articleId]);

  useEffect(() => {
    if (data) {
      setArticleTypes(data);
    }
  }, [data]);

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
      {isEditable ? (
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
              expandedIssue={expandedIssue}
              setExpandedIssue={setExpandedIssue}
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
              selectedArticle={selectedArticle}
              setArticleContent={setArticleContent}
              setArticleDOM={setArticleDOM}
              quillRef={quillRef}
              selection={selection}
              setSelection={setSelection}
              articleContent={articleContent}
              articleTypePath={articleTypePath}
              setArticleTypePath={setArticleTypePath}
              articleTypes={articleTypes}
              expandedIssue={expandedIssue}
            />
          </Section>
        </Container>
      ) : (
        <Box sx={{ width: "100%", height: "100vh", background: DESIGN_SYSTEM_COLORS.notebookG500 }}>
          <Box sx={{ width: "900px", m: "auto", height: "92%" }}>
            <Paper sx={{ p: "10px", textAlign: "center" }}>{selectedArticle?.title}</Paper>
            <Box
              sx={{
                mt: "10px",
                p: "10px",
                height: "100%",
                overflowY: "auto",
                background: DESIGN_SYSTEM_COLORS.notebookG400,
              }}
              dangerouslySetInnerHTML={{ __html: selectedArticle?.content }}
            />
          </Box>
        </Box>
      )}
    </ThemeProvider>
  );
};

export default Article;
