import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";
import { Button, CircularProgress, Paper, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { collection, deleteDoc, doc, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

import { useAuth } from "../../context/AuthContext";
const CreateModalComp = dynamic(() => import("../../components/coauthor/CreateModalComp"), { ssr: false });

const CoAuthor = () => {
  const router = useRouter();
  const db = getFirestore();
  const [{ user }] = useAuth();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [userArticles, setUserArticles] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);

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
    if (!user?.userId) return;
    const unsubscribe = onSnapshot(
      query(collection(db, "articles"), where("editors", "array-contains", user?.uname)),
      snapshot => {
        let articlesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any),
        }));

        articlesData = articlesData.filter(article => !article.deleted);
        setUserArticles(articlesData);
      }
    );
    return () => unsubscribe();
  }, [db, user]);

  const deleteArticle = async (event: any, articleId: string) => {
    event.stopPropagation();
    if (confirm("Are you sure to delete article")) {
      await deleteDoc(doc(db, "articles", articleId));
      const querySnapshot = await getDocs(
        query(collection(db, "articleMessages"), where("articleId", "==", articleId))
      );

      querySnapshot.forEach(async doc => {
        try {
          await deleteDoc(doc.ref);
        } catch (error) {
          console.error(`Error deleting document with ID ${doc.id}:`, error);
        }
      });
    }
  };

  const theme = createTheme({
    palette: {
      mode: prefersDarkMode ? "dark" : "light",
      secondary: {
        main: "#FF8C00",
      },
    },
  });

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
          display: "none",
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
      <Box sx={{ width: "100%", height: "100vh", background: DESIGN_SYSTEM_COLORS.notebookG450, textAlign: "center" }}>
        <Typography variant="h2">Welcome to CoAuthor</Typography>
        <Box sx={{ width: "800px", m: "auto", background: DESIGN_SYSTEM_COLORS.notebookG450 }}>
          <Button onClick={() => setOpen(true)} variant="contained" color="success" sx={{ width: "100%", mb: "5px" }}>
            Create Article
          </Button>
          {userArticles.map((article: any, idx: number) => {
            return (
              <Paper
                key={idx}
                onClick={() => router.push({ pathname: `/coauthor/${article.id}` })}
                sx={{
                  p: "10px",
                  mb: "5px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Typography sx={{ color: theme => (theme.palette.mode === "dark" ? "inherit" : "black") }}>
                    {article.title}
                  </Typography>
                  {article?.user !== user?.uname && <PeopleIcon />}
                </Box>
                {article?.user === user?.uname && (
                  <DeleteIcon sx={{ cursor: "pointer" }} color="error" onClick={e => deleteArticle(e, article.id)} />
                )}
              </Paper>
            );
          })}
        </Box>
      </Box>
      <CreateModalComp open={open} setOpen={setOpen} />
    </ThemeProvider>
  );
};

export default CoAuthor;
