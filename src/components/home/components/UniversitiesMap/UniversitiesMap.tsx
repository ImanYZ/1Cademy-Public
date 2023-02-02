// import "./UniversitiesMap.css";

import { Box } from "@mui/material";
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import dynamic from "next/dynamic";
import React, { Suspense, useEffect, useState } from "react";
const GoogleMapCom = dynamic(() => import("./GoogleMapCom"), {
  suspense: true,
  ssr: false,
});

import { useInView } from "../../../../hooks/useObserver";

const UniversitiesMap = (props: any) => {
  const db = getFirestore();
  const [institutions, setInstitutions] = useState<any[]>([]);
  const { inViewOnce: universityMapInViewOnce, ref: universityMapRef } = useInView();

  useEffect(() => {
    if (!db) return;

    const fetchInstitutions = async () => {
      const institutionsCollection = collection(db, "institutions");
      const q = query(institutionsCollection, where("hasLogo", "==", true));
      const institutionsDataList = await getDocs(q);
      const tt = institutionsDataList.docs.map(inst => inst.data());
      setInstitutions(tt);
    };

    fetchInstitutions();
  }, [db]);

  return (
    <Box
      ref={universityMapRef}
      component="section"
      sx={{ minHeight: 400, mt: "64px" }}
      className={universityMapInViewOnce ? "slide-bottom-top" : "hide"}
    >
      <div className="UniversitiesAndColleges" ref={props.schoolsRef}>
        <div id="googleMapDiv">
          {universityMapInViewOnce && (
            <Suspense fallback={<div></div>}>
              <GoogleMapCom institutions={institutions} />
            </Suspense>
          )}
        </div>
      </div>
    </Box>
  );
};

export default React.memo(UniversitiesMap);
