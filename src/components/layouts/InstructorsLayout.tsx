import { useMediaQuery, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { NextPage } from "next";
import React, { FC, ReactNode } from "react";

import HeaderNavbar from "../instructors/HeaderNavbar";
import HeaderNavbarMovil from "../instructors/HeaderNavbarMovil";
import { SemesterFilter } from "../instructors/SemesterFilter";
import { useSemesterFilter } from "../instructors/useSemesterFilter";

export type Option = {
  id: string;
  label: string;
  title: string;
  route: string;
};

const OPTIONS: Option[] = [
  { id: "02", label: "DASHBOARD", title: "DASHBOARD", route: "/instructors/dashboard" },
  { id: "03", label: "STUDENTS", title: "STUDENTS", route: "/instructors/students" },
  { id: "05", label: "SETTINGS", title: "SETTINGS", route: "/instructors/settings" },
];

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

  const theme = useTheme();
  const isMovil = useMediaQuery(theme.breakpoints.down("md"));

  const { semesters, selectedSemester, setSelectedSemester, courses, selectedCourse, setSelectedCourse } =
    useSemesterFilter();

  return (
    <Box
      sx={{
        background: theme => (theme.palette.mode === "light" ? "#F5F5F5" : "#28282A"),
        border: "solid 2px royalBlue",
      }}
    >
      {!isMovil && <HeaderNavbar options={OPTIONS} />}
      {isMovil && <HeaderNavbarMovil options={OPTIONS} />}
      {/* <HeaderNavbar /> */}
      <Box sx={{ maxWidth: "1384px", py: "10px", m: "auto", px: { xs: "10px", xl: "0px" } }}>
        <SemesterFilter
          semesters={semesters}
          selectedSemester={selectedSemester}
          setSelectedSemester={setSelectedSemester}
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          isMovil={isMovil}
        />
      </Box>

      {children({ selectedSemester, selectedCourse })}
    </Box>
  );
};
