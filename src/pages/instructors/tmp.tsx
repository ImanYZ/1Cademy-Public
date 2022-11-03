import { InstructorLayoutPage, InstructorsLayout } from "@/components/layouts/InstructorsLayout";
const Page: InstructorLayoutPage = ({ selectedSemester, selectedCourse }) => {
  return (
    <p>
      hello world {selectedSemester} + {selectedCourse}
    </p>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <InstructorsLayout>{props => <Page {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
