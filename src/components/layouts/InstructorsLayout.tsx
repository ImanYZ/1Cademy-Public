import { Paper } from "@mui/material";
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
export type NextPageWithLayout<P = InstructorsLayoutPageProps, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: NextPageWithLayout) => ReactNode;
};
export const PublicLayout: FC<Props> = ({ children }) => {
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
    <Box>
      <HeaderNavbar />
      <Paper sx={{ p: "10px" }}>
        <SemesterFilter
          semesters={semesters}
          selectedSemester={selectedSemester}
          setSelectedSemester={setSelectedSemester}
          courses={courses}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
        />
      </Paper>
      {children({ selectedSemester, selectedCourse })}
    </Box>
  );
};
