import { Box } from "@mui/system";
import { NextPage } from "next";
import React, { FC, ReactNode } from "react";

import HeaderNavbar from "../instructors/HeaderNavbar";
import { SemesterFilter } from "../instructors/SemesterFilter";
import { useSemesterFilter } from "../instructors/useSemesterFilter";
// import { useAuth } from "@/context/AuthContext";
// import ROUTES from "../../lib/utils/routes";

type InstructorsLayoutPageProps = {
  selectedSemester: string | undefined;
  selectedCourse: string | undefined;
};

type Props = {
  children: (props: InstructorsLayoutPageProps) => ReactNode;
};
export type InstructorLayoutPage<P = InstructorsLayoutPageProps, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: InstructorLayoutPage) => ReactNode;
};
export const InstructorsLayout: FC<Props> = ({ children }) => {
  // const [{ isAuthenticated }] = useAuth();
  // const router = useRouter();
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     router.replace(ROUTES.dashboard);
  //   }
  // }, [isAuthenticated, router]);
  const { semesters, selectedSemester, setSelectedSemester, courses, selectedCourse, setSelectedCourse } =
    useSemesterFilter();
  return (
    <Box
      sx={{
        // width: "100vw",
        background: theme => (theme.palette.mode === "light" ? "#F5F5F5" : "#28282A"),
        border: "solid 2px royalBlue",
      }}
    >
      <HeaderNavbar />
      <Box sx={{ maxWidth: "1384px", py: "10px", m: "auto", px: { xs: "10px", xl: "0px" } }}>
        <SemesterFilter
          semesters={semesters}
          selectedSemester={selectedSemester}
          setSelectedSemester={setSelectedSemester}
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
        />
      </Box>

      {children({ selectedSemester, selectedCourse })}
    </Box>
  );
};
