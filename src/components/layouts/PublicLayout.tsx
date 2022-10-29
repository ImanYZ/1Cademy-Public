import { Box } from "@mui/system";
import { useRouter } from "next/router";
import { FC, ReactNode, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

import ROUTES from "../../lib/utils/routes";

type Props = {
  children: ReactNode;
};

const PublicLayout: FC<Props> = ({ children }) => {
  const [{ isAuthenticated }] = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(ROUTES.dashboard);
    }
  }, [isAuthenticated, router]);

  return <Box>{children}</Box>;
};

export default PublicLayout;
