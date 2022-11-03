import { NextPageWithLayout, PublicLayout } from "@/components/layouts/InstructorsLayout";
const Page: NextPageWithLayout = ({ selectedSemester, selectedCourse }) => {
  return (
    <p>
      hello world {selectedSemester} + {selectedCourse}
    </p>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <PublicLayout>{props => <Page {...props} />}</PublicLayout>;
};
export default PageWrapper;
