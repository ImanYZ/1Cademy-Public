import withAuthUser from "../../components/hoc/withAuthUser";
import { InstructorsLayout } from "../../components/layouts/InstructorsLayout";
export type Chapter = {
  [key: string]: number[];
};

const PageWrapper = () => {
  return <InstructorsLayout>{props => <h1>{props.user.uname}</h1>}</InstructorsLayout>;
};

// if session: page continue here and managed role by layout
// if no session redirect to login
export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(PageWrapper);
