import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/system";
import Image from "next/image";
import { forwardRef, MutableRefObject, useImperativeHandle, useRef } from "react";

import { loadHomeSearchBackground, toBase64 } from "@/lib/utils/utils";

import heroImage from "../../public/darkModeLibraryBackground.jpg";
import logoHero from "../../public/LogoExtended.svg";
import SearchInput from "./SearchInput";
import Stats from "./Stats";

type HomeSearchProps = {
  sx?: SxProps<Theme>;
  onSearch: (text: string) => void;
  setOpenAdvanceFilter: React.Dispatch<React.SetStateAction<boolean>>;
};

export type HomeSearchRef = {
  scroll: () => void;
  containerRef: MutableRefObject<HTMLDivElement | null>;
};

const HomeSearch = forwardRef<HomeSearchRef, HomeSearchProps>(({ sx, onSearch, setOpenAdvanceFilter }, ref) => {
  const beginFiltersRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    scroll: () => {
      const clientPosition = beginFiltersRef.current?.getBoundingClientRect();
      const yPosition = clientPosition ? clientPosition.y + clientPosition.height - 40 : 500;
      setTimeout(() => window.scrollBy({ top: yPosition, behavior: "smooth" }), 150);
    },
    containerRef,
  }));

  const handleOpenFilter = () => {
    setOpenAdvanceFilter(prev => !prev);
  };
  return (
    <Box
      ref={beginFiltersRef}
      data-testid="home-search"
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: "236px", md: "479px" },
        margin: "auto",
        padding: 6,
        flexDirection: "column",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        top: 0,
        left: 0,
        color: theme => theme.palette.common.white,
        ...sx,
      }}
    >
      <Image
        // style={{ filter: "brightness(.6)" }}
        alt="1cademy library"
        src={heroImage}
        layout="fill"
        objectFit="cover"
        priority
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(loadHomeSearchBackground())}`}
      />
      <Box sx={{ position: "absolute", maxWidth: "100vw", width: { md: "60%", xs: "85%" } }}>
        <Box
          sx={{
            textAlign: "center",
            display: {
              md: "block",
              xs: "none",
            },
          }}
        >
          <Image src={logoHero} alt="1Cademy Logo" width="421px" height="130px" />
        </Box>
        <Box
          ref={containerRef}
          sx={{ width: "100%", display: "flex", flexDirection: { xs: "column", md: "row" }, mt: { xs: 15, md: 5 } }}
        >
          <SearchInput onSearch={onSearch}></SearchInput>
          <Button
            variant="contained"
            onClick={handleOpenFilter}
            sx={{
              color: theme => theme.palette.common.white,
              background: theme => theme.palette.common.orange,
              height: { xs: "40px", md: "55px" },
              width: { xs: "50%", md: "auto" },
              fontSize: 16,
              fontWeight: "700",
              my: { xs: "0px", md: "auto" },
              mt: { xs: "15px", md: "auto" },
              marginLeft: { xs: "0px", md: "5px" },
              paddingX: "30px",
              borderRadius: 1,
              textAlign: "center",
              alignSelf: "center",
            }}
          >
            ADVANCE
          </Button>
        </Box>
        <Stats />
      </Box>
    </Box>
  );
});

HomeSearch.displayName = "HomeSearch";
export default HomeSearch;
