import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

import NotFoundImage from "../../public/404.svg";

const Custom404 = () => {
  const router = useRouter();
  return (
    <Box
      sx={{
        position: "absolute",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme =>
          theme.palette.mode === "dark" ? theme.palette.common.notebookMainBlack : theme.palette.common.gray50,
        p: "20px",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1187px",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ width: "326px" }}>
          <Typography
            sx={{
              fontSize: "72px",
              fontWeight: 600,
              color: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.gray25 : theme.palette.common.gray800,
              mb: "16px",
            }}
          >
            404
          </Typography>
          <Typography
            sx={{
              fontSize: "20px",
              fontWeight: 500,
              color: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.gray25 : theme.palette.common.gray800,
              mb: "10px",
            }}
          >
            Something went wrong
          </Typography>
          <Typography
            sx={{
              fontWeight: 400,
              color: theme =>
                theme.palette.mode === "dark" ? theme.palette.common.notebookG200 : theme.palette.common.gray600,
              mb: "24px",
            }}
          >
            The page you are looking for doesn’t exist or has been removed.{" "}
          </Typography>
          <Link href={"/"} passHref>
            <a>
              <Button
                variant="contained"
                fullWidth
                onClick={() => router.back()}
                sx={{ borderRadius: "26px", background: theme => theme.palette.common.primary800 }}
              >
                Go Back
              </Button>
            </a>
          </Link>
        </Box>
        <Box
          sx={{
            width: { xs: "300px", sm: "400px", md: "694px" },
            height: { xs: "234px", sm: "312px", md: "509px" },
            backgroundImage: `url(${NotFoundImage.src})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        ></Box>
      </Box>
    </Box>
  );
};

export default Custom404;
