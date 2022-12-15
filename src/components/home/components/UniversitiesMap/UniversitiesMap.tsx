// import "./UniversitiesMap.css";

import Container from "@mui/material/Container";
import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import React, { Suspense, useEffect, useState } from "react";

import Typography from "../Typography";
// import { useRecoilValue } from "recoil";

// import { firebaseOneState } from "../../../../../store/OneCademyAtoms";
// import Typography from "../../components/Typography";

const GoogleMapCom = React.lazy(() => import("./GoogleMapCom"));

const UniversitiesMap = (props: any) => {
  const db = getFirestore();
  // const firebase = useRecoilValue(firebaseOneState);
  const [institutions, setInstitutions] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;

    const fetchInstitutions = async () => {
      const userNodesRef = collection(db, "institutions");
      const q = query(userNodesRef);

      const institutionsCollection = await getDocs(q);
      let institutionsDataList: any[] = [];
      institutionsCollection.docs.map(institution => {
        const institutionInfo = institution.data();
        institutionsDataList.push(institutionInfo);
      });
      setInstitutions(institutionsDataList);
    };

    fetchInstitutions();
  }, [db]);

  return (
    <Container id="SchoolsSection" component="section" sx={{ mt: 8, mb: 4 }}>
      <div className="UniversitiesAndColleges" ref={props.schoolsRef}>
        <Typography variant="h4" marked="center" align="center" component="h2" sx={{ mb: 7 }}>
          Our Researchers Are From
        </Typography>
        <div id="googleMapDiv">
          {institutions.length > 0 ? (
            <Suspense fallback={<div></div>}>
              <GoogleMapCom institutions={institutions} />
            </Suspense>
          ) : null}
        </div>
      </div>
    </Container>
  );
};

export default React.memo(UniversitiesMap);
