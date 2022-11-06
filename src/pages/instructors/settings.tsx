import { InstructorLayoutPage, InstructorsLayout } from "@/components/layouts/InstructorsLayout";
const Page: InstructorLayoutPage = ({ selectedSemester, selectedCourse }) => {
  return (
    <>
      <h1>Settings page</h1>
      <p>
        hello world {selectedSemester} + {selectedCourse}
      </p>
    </>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <InstructorsLayout>{props => <Page {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
