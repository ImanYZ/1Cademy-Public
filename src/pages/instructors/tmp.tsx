import { InstructorLayoutPage, InstructorsLayout } from "@/components/layouts/InstructorsLayout";
const Page: InstructorLayoutPage = ({ selectedSemester, selectedCourse }) => {
  return (
    <div>
      <p>
        hello world {selectedSemester} + {selectedCourse}
      </p>
      {selectedCourse && <h2>config selected course</h2>}
      {!selectedCourse && <h2>create course</h2>}
    </div>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <InstructorsLayout>{props => <Page {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
