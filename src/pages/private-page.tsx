import withAuthUser from "@/components/hoc/withAuthUser";

const PrivatePage = () => {
  return <div>this is a private page</div>;
};

export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false
})(PrivatePage);
