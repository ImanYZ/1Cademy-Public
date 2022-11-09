import { InstructorLayoutPage, InstructorsLayout } from "@/components/layouts/InstructorsLayout";
const Page: InstructorLayoutPage = ({ selectedSemester, selectedCourse, currentSemester, isLoading, setIsLoading }) => {
  console.log("snapshot:currentSemester", currentSemester);
  return (
    <div>
      <p>
        hello world {selectedSemester} + {selectedCourse}
      </p>
      {isLoading && <h1>Is loading</h1>}
      {selectedCourse && <h2>config selected course</h2>}
      {!selectedCourse && <h2>create course</h2>}

      <button
        onClick={() => {
          setIsLoading(true);
          setTimeout(() => {
            setIsLoading(false);
          }, 5000);
        }}
      >
        Show loader from 5s
      </button>
    </div>
  );
};

// This wrapper expose the shared variables from filters
const PageWrapper = () => {
  return <InstructorsLayout>{props => <Page {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
