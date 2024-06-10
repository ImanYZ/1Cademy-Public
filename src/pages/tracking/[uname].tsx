import { useRouter } from "next/router";
import React from "react";

import StudentDetail from "@/components/instructors/StudentDetail";

const TrackingUser = () => {
  const router = useRouter();
  const { uname }: any = router.query;

  return <StudentDetail uname={uname} />;
};

export default TrackingUser;
