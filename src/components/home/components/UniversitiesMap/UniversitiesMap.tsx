// import "./UniversitiesMap.css";

import { Box } from "@mui/material";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import React, { Suspense, useEffect, useState } from "react";

import { useInView } from "../../../../hooks/useObserver";

// import { useRecoilValue } from "recoil";

// import { firebaseOneState } from "../../../../../store/OneCademyAtoms";
// import Typography from "../../components/Typography";

const GoogleMapCom = React.lazy(() => import("./GoogleMapCom"));

const UniversitiesMap = (props: any) => {
  const db = getFirestore();
  // const firebase = useRecoilValue(firebaseOneState);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const { inViewOnce: universityMapInViewOnce, ref: univesityMapRef } = useInView();

  useEffect(() => {
    if (!db) return;

    const fetchInstitutions = async () => {
      // const userNodesRef = collection(db, "institutions");
      // const q = query(userNodesRef);

      const institutionsCollection = collection(db, "institutions");
      const q = query(institutionsCollection, where("hasLogo", "==", true));
      const institutionsDataList = await getDocs(q);
      const tt = institutionsDataList.docs.map(inst => inst.data());

      // const institutionsCollection = await getDocs(q);
      // let institutionsDataList: any[] = [];
      // institutionsCollection.docs.map(institution => {
      //   const institutionInfo = institution.data();
      //   institutionsDataList.push(institutionInfo);
      // });
      setInstitutions(tt);
    };

    fetchInstitutions();
  }, [db]);

  return (
    <Box
      ref={univesityMapRef}
      component="section"
      sx={{ minHeight: 400 }}
      className={universityMapInViewOnce ? "slide-bottom-top" : "hide"}
    >
      <div className="UniversitiesAndColleges" ref={props.schoolsRef}>
        {/* <Typography
          variant="h4"
          marked="center"
          align="center"
          component="h2"
          sx={{ mb: 7, color: "#f8f8f8" }}
        >
          Our Researchers Are From
        </Typography> */}
        <div id="googleMapDiv">
          <Suspense fallback={<div></div>}>
            <GoogleMapCom institutions={institutions} />
          </Suspense>
        </div>
      </div>
    </Box>
  );
};

export default React.memo(UniversitiesMap);
