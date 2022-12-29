import GitHubIcon from "@mui/icons-material/GitHub";
import { Container, Divider, IconButton, SxProps, Theme, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import NextImage from "next/image";

import logo1cademy from "../../public/1cademy.svg";
import iconEmail from "../../public/icon-email.svg";
import iconYoutube from "../../public/icon-youtube.svg";
import logoGoogleCloud from "../../public/logo-google-cloud.svg";
import logoHonor from "../../public/logo-honor.svg";
import logoSchoolOfInformation from "../../public/logo-school-of-information.svg";

type AppFooterProps = {
  sx?: SxProps<Theme>;
};

export default function AppFooter({ sx }: AppFooterProps) {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        height: "var(--footer-height)",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: { xs: "center", md: "space-between" },
        color: theme => theme.palette.common.white,
        background: theme => theme.palette.common.darkGrayBackground,
        ...sx,
      }}
    >
      <Container
        sx={{
          maxWidth: { xs: "207px", md: "700px", lg: "1058px" },
          height: { xs: "391px", md: "136px" },
          p: "0px",
          display: "flex",
          alignItems: "center",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ width: "177px" }}>
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <NextImage alt="logo 1cademy" src={logo1cademy} width="147px"></NextImage>
          </Box>
          <Box sx={{ display: "flex", justifyContent: { xs: "center", md: "start" }, mt: "5px", mb: "30px" }}>
            <IconButton
              rel="noreferrer"
              aria-label="Open Youtube channel"
              target="_blank"
              href="https://www.youtube.com/channel/UCKBqMjvnUrxOhfbH1F1VIdQ/"
              sx={{ color: theme => theme.palette.common.white }}
            >
              <NextImage alt="Youtube channel" src={iconYoutube} height="20px" />
            </IconButton>
            <IconButton
              href="mailto:oneweb@umich.edu"
              sx={{ color: theme => theme.palette.common.white }}
              aria-label="Mail us"
            >
              <NextImage alt="Email" src={iconEmail} height="20px" />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Link
              target="_blank"
              href="https://1cademy.us/terms"
              underline="none"
              sx={{ color: theme => theme.palette.grey[500] }}
            >
              Terms
            </Link>
            <Link
              target="_blank"
              href="https://1cademy.us/privacy"
              underline="none"
              sx={{ color: theme => theme.palette.grey[500] }}
            >
              Privacy
            </Link>
            <Link
              target="_blank"
              href="https://1cademy.us/cookie"
              underline="none"
              sx={{ color: theme => theme.palette.grey[500] }}
            >
              Cookie
            </Link>
          </Box>
        </Box>
        <Box sx={{ width: { md: "400px", lg: "493px" } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: "20px", md: "50px" },
            }}
          >
            <Typography fontSize={"16px"} component="h6" sx={{ whiteSpace: "nowrap", color: "common.white" }}>
              Supported by
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: "50px",
                display: "flex",
                justifyContent: { xs: "space-between", md: "left" },
                gap: { md: "50px" },
              }}
            >
              <Link
                rel="noreferrer"
                target="_blank"
                href="https://www.si.umich.edu/"
                aria-label="Go to School of information"
              >
                <NextImage src={logoSchoolOfInformation} alt="School of Information" height={41} width={47} />
              </Link>
              <Link
                rel="noreferrer"
                target="_blank"
                href="https://www.honor.education/"
                aria-label="Go to Honor Education"
              >
                <NextImage src={logoHonor} alt="Honor Education" height={41} width={41} />
              </Link>
              <Link
                rel="noreferrer"
                target="_blank"
                href="https://cloud.google.com/edu/researchers"
                aria-label="Go to Google Cloud"
              >
                <NextImage src={logoGoogleCloud} alt="Google Cloud" height={41} width={49} />
              </Link>
            </Box>
          </Box>
          <Divider
            sx={{ my: "30px", color: theme => theme.palette.grey[500], borderColor: theme => theme.palette.grey[500] }}
          />
          <Box
            sx={{
              width: { lg: "511px" },
              display: "flex",
              flexDirection: { xs: "row", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: { xs: "10px", md: "10px" },
            }}
          >
            <Link
              href="https://github.com/ImanYZ/1Cademy-Public/"
              target="_blank"
              rel="noreferrer"
              sx={{
                display: { xs: "flex", md: "none" },
                color: theme => theme.palette.common.white,
                textDecorationColor: theme => theme.palette.common.white,
              }}
            >
              <GitHubIcon fontSize="inherit" />
            </Link>
            <Typography color={theme => theme.palette.common.white} sx={{ display: { xs: "none", md: "block" } }}>
              We're committed to OpenSource on{" "}
              <Link
                href="https://github.com/ImanYZ/1Cademy-Public/"
                target="_blank"
                rel="noreferrer"
                sx={{
                  color: theme => theme.palette.common.white,
                  textDecorationColor: theme => theme.palette.common.white,
                }}
              >
                Github
              </Link>{" "}
              <GitHubIcon fontSize="inherit" />
            </Typography>
            <Typography color={theme => theme.palette.grey[500]}>{`©  1Cademy ${new Date().getFullYear()}`}</Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
