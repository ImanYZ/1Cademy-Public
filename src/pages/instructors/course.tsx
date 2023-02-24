import { Box } from "@mui/system";
import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Institution } from "src/knowledgeTypes";

import LoadingImg from "../../../public/animated-icon-1cademy.gif";
import NewCourse from "../../components/instructors/setting/NewCourse";
import { InstructorLayoutPage, InstructorsLayout } from "../../components/layouts/InstructorsLayout";

const CourseSetting: InstructorLayoutPage = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const retrieveInstitutions = async () => {
      const db = getFirestore();
      const institutionsRef = collection(db, "institutions");
      const q = query(institutionsRef);

      const querySnapshot = await getDocs(q);
      let institutions: Institution[] = [];
      querySnapshot.forEach(doc => {
        institutions.push({ id: doc.id, ...doc.data() } as Institution);
      });

      const institutionSorted = institutions
        .sort((l1, l2) => (l1.name < l2.name ? -1 : 1))
        .sort((l1, l2) => (l1.country < l2.country ? -1 : 1));
      setInstitutions(institutionSorted);
      setLoaded(true);
    };
    retrieveInstitutions();
  }, []);

  if (!loaded) {
    return (
      <Box
        className="CenterredLoadingImageContainer"
        sx={{ background: theme => (theme.palette.mode === "dark" ? "#28282A" : "#F5F5F5") }}
      >
        <Image
          className="CenterredLoadingImage"
          loading="lazy"
          src={LoadingImg}
          alt="Loading"
          width={250}
          height={250}
        />
      </Box>
    );
  }

  return <NewCourse institutions={institutions} />;
};

const PageWrapper = () => {
  return <InstructorsLayout>{props => <CourseSetting {...props} />}</InstructorsLayout>;
};
export default PageWrapper;
