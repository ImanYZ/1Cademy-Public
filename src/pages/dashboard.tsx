import { useRouter } from "next/router";
import { useEffect } from "react";

import withAuthUser from "../components/hoc/withAuthUser";
import ROUTES from "../lib/utils/routes";

const NodeBook = () => {
  let router = useRouter();

  useEffect(() => {
    router.push(ROUTES.dashboard);
  }, [router]);

  return <div></div>;
};
export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(NodeBook);
