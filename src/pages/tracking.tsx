import withAuthUser from "@/components/hoc/withAuthUser";
import TrackingHours from "@/components/instructors/TrackingHours";

const Tracking = () => {
  return <TrackingHours />;
};

export default withAuthUser({
  shouldRedirectToLogin: true,
  shouldRedirectToHomeIfAuthenticated: false,
})(Tracking);
