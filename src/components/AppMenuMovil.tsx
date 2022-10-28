import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { Box, Button, Link, MenuItem, MenuList } from "@mui/material";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";

import SECTIONS from "@/lib/utils/navbarSections";

interface AppMenuMovilProps {
  onSendFeedback: () => void;
  isSignedIn: boolean;
}

const AppMenuMovil = ({ onSendFeedback, isSignedIn }: AppMenuMovilProps) => {
  const router = useRouter();
  const handleSignout = async () => {
    //TODO: Remove thhis button before deploying
    await getAuth().signOut();
    router.push("/signin");
  };
  const onRedirectToSignin = () => {
    router.push("/signin");
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "calc(100vh - var(--navbar-height) )",
        display: { xs: "flex", md: "none" },
        alignItems: "center",
        justifyContent: "center",
        background: theme => theme.palette.common.darkGrayBackground,
        color: theme => theme.palette.common.white,
        position: "fixed",
        bottom: "0px",
        zIndex: "10",
      }}
    >
      <MenuList>
        {SECTIONS.map((page, idx) => (
          <MenuItem key={idx} sx={{ justifyContent: "center" }}>
            <Link
              key={idx}
              color="inherit"
              href={page.route}
              padding="13px 20px"
              sx={{
                fontSize: "18px",
                fontWeight: "400",
                color: theme => theme.palette.common.white,
              }}
              underline="none"
              target={page.label === "Node" ? "_self" : "_blank"}
              rel="noreferrer"
            >
              {page.label.toUpperCase()}
            </Link>
            {/* </NextLink> */}
          </MenuItem>
        ))}
        <MenuItem>
          <Button
            size="large"
            variant="contained"
            sx={{
              px: "30px",
              fontSize: "18px",
              fontWeight: "500",
              borderRadius: 40,
            }}
          >
            APPLY!
          </Button>
        </MenuItem>
        {isSignedIn ? (
          <MenuItem title="Sign Out">
            <Button
              variant="outlined"
              onClick={handleSignout}
              sx={{
                color: theme => theme.palette.common.white,
                borderColor: theme => theme.palette.common.white,
                minWidth: "116px",
                fontSize: 16,
                fontWeight: "700",
                marginTop: "18px",
                borderRadius: 40,
                textAlign: "center",
                width: "120px",
              }}
            >
              SIGN OUT
            </Button>
          </MenuItem>
        ) : (
          <MenuItem title="Sign In/Out">
            <Button
              variant="outlined"
              onClick={onRedirectToSignin}
              sx={{
                color: theme => theme.palette.common.white,
                borderColor: theme => theme.palette.common.white,
                minWidth: "120px",
                fontSize: 16,
                fontWeight: "700",
                marginTop: "18px",
                borderRadius: 40,
                textAlign: "center",
              }}
            >
              SIGN IN/UP
            </Button>
          </MenuItem>
        )}
      </MenuList>
      <Button
        size="large"
        variant="outlined"
        sx={{
          position: "absolute",
          bottom: "10px",
          px: "30px",
          color: theme => theme.palette.common.white,
          fontSize: "18px",
          fontWeight: "500",
          borderColor: theme => theme.palette.common.white,
          borderRadius: 40,
        }}
        onClick={onSendFeedback}
      >
        <QuestionMarkIcon sx={{ mr: "10px" }} />
        Question/Feedback
      </Button>
    </Box>
  );
};

export default AppMenuMovil;
