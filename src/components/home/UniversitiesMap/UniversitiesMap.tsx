import styled from "@emotion/styled";
import Container from "@mui/material/Container";
import { collection, getDocs, getFirestore, query } from "firebase/firestore";
import React, { Suspense,useEffect, useState } from "react";

import Typography from "../Typography";

const GoogleMapCom = React.lazy(() => import("./GoogleMapCom"));

const UniversitiesAndColleges = styled.div`
  & .gradientText {
    padding-bottom: 3vh;
  }

  @media screen and (max-width: 900px) and (orientation: portrait) {
    & .gradientText {
      font-size: 6vw;
      background: linear-gradient(to right, #ff9800, #ff9800);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    & .headline {
      font-size: 4vw;
    }
  }

  @media screen and (max-width: 900px) and (orientation: landscape) {
    & .gradientText {
      font-size: 6vh;
      background: linear-gradient(to right, #ff9800, #ff9800);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    & .headline {
      font-size: 4vh;
    }
  }
`;

const UniversitiesMap = (props: any) => {
  const db = getFirestore();
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {
    (async () => {
      const institutionsCollection = await getDocs(query(collection(db, "institutions")));
      let institutionsDataList: any = [];
      institutionsCollection.docs.map(institution => {
        const institutionInfo = institution.data();
        institutionsDataList.push(institutionInfo);
      });
      setInstitutions(institutionsDataList);
    })();
  }, []);

  return (
    <Container id="SchoolsSection" component="section" sx={{ mt: 8, mb: 4 }}>
      <UniversitiesAndColleges className="UniversitiesAndColleges" ref={props.schoolsRef}>
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
      </UniversitiesAndColleges>
    </Container>
  );
};

export default React.memo(UniversitiesMap);
