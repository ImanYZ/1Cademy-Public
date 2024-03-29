import { Box, Typography } from "@mui/material";
import { getFirestore } from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { getSemesterById } from "../../../client/firestore/semesters.firestore";
import { getUserByUname } from "../../../client/firestore/user.firestore";
import { Dashboard } from "../../../components/map/dashboard/Dashboard";
import { useAuth } from "../../../context/AuthContext";
import { User } from "../../../knowledgeTypes";
import { DESIGN_SYSTEM_COLORS } from "../../../lib/theme/colors";
import ROUTES from "../../../lib/utils/routes";
import { ISemester } from "../../../types/ICourse";

const db = getFirestore();

const StudentDashboard = () => {
  const router = useRouter();
  const [{ user }] = useAuth();
  const [queryData, setQueryData] = useState<{ uname: string; semester: string } | null>(null);
  const [semester, setSemester] = useState<ISemester | null>(null);
  const [student, setStudent] = useState<User | null>(null);

  useEffect(() => {
    const uname = router.query["uname"] as string;
    const semester = router.query["semester"] as string;
    setQueryData({ uname, semester });
  }, [router.query]);

  // validate user role, redirect if user doesn't have required role
  useEffect(() => {
    if (!queryData) return;
    const allowAccessByRole = async () => {
      if (!user) return;

      const role = user?.role;
      if (!role) return router.push(ROUTES.notebook);

      if ("INSTRUCTOR" !== role) return router.push(ROUTES.notebook);
    };
    allowAccessByRole();
  }, [queryData, router, user, user?.role]);

  useEffect(() => {
    if (!queryData?.semester || !queryData.uname) return;
    const getData = async () => {
      console.error({ queryData });
      const resSemester = await getSemesterById(db, queryData.semester);
      if (!resSemester) return router.push(ROUTES.notebook);

      const resUser = await getUserByUname(db, queryData.uname);
      if (!resUser) return router.push(ROUTES.notebook);

      setSemester(resSemester);
      setStudent({ ...resUser, role: "STUDENT" });
    };
    getData();
  }, [queryData, router]);

  if (!queryData) return null;

  if (!student || !semester) return null;

  return (
    <Box
      className="wide scroll-styled"
      sx={{
        p: "32px",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: theme =>
          theme.palette.mode === "dark"
            ? theme.palette.common.darkGrayBackground
            : theme.palette.common.lightGrayBackground,
      }}
    >
      {user?.role === "INSTRUCTOR" ? (
        <Dashboard user={student} currentSemester={semester} />
      ) : (
        <Typography
          sx={{
            color: theme =>
              theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray600 : DESIGN_SYSTEM_COLORS.gray200,
          }}
        >
          Loading Student Dashboard ...
        </Typography>
      )}
    </Box>
  );
};

export default StudentDashboard;
