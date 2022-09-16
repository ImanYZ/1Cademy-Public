// import "./PersonalInfo.css";

// // import Checkbox from "@material-ui/core/Checkbox";
// // import FormControl from "@material-ui/core/FormControl";
// // import InputLabel from "@material-ui/core/InputLabel";
// // import ListItemText from "@material-ui/core/ListItemText";
// // import MenuItem from "@material-ui/core/MenuItem";
// // import Select from "@material-ui/core/Select";
// // import Done from "@material-ui/icons/Done";
// import React, { Suspense, useCallback, useEffect, useState } from "react";

// // import CSCObjLoader from "../../Auth/CSCObjLoader";
// // import ValidatedInput from "../../Editor/ValidatedInput/ValidatedInput";
// // import { ETHNICITY_VALUES, FOUND_FROM_VALUES } from "./DemographicConstants";

// // const CountryStateCity = React.lazy(() => import("../CountryStateCity/CountryStateCity"));
// // const DateAndGenderPickers = React.lazy(() => import("./DateAndGenderPickers"));

// const sameThing = (value: any) => value;

// const arrayToString = (value: any) => value.join(", ");

// const MUISelectMenuItem = item => option => {
//   return (
//     <MenuItem key={option} className={item === option ? "" : "selectOption"} value={option}>
//       {item === option ? <Done /> : ""}
//       {option}
//     </MenuItem>
//   );
// };

// const PersonalInfo = props => {
//   const [sortedLanguages, setSortedLanguages] = useState(["English"]);

//   const populateLanguages = useCallback(async () => {
//     if (sortedLanguages.length >= 1) {
//       const ISO6391Obj = await import("iso-639-1");
//       const ISO6391 = [...ISO6391Obj.default.getAllNames().sort((l1, l2) => (l1 < l2 ? -1 : 1)), "Prefer not to say"];
//       setSortedLanguages(ISO6391);
//     }
//   }, [sortedLanguages]);

//   useEffect(() => {
//     populateLanguages();
//   }, []);

//   const loadCSCObj = CSCObjLoader(props.CSCObj, props.setCSCObj, props.setAllCountries);

//   const languageItems = useCallback(MUISelectMenuItem(props.values.language), [props.values.language]);

//   const foundFromItems = useCallback(MUISelectMenuItem(props.values.foundFrom), [props.values.foundFrom]);

//   const ethnicityItems = useCallback(
//     option => {
//       return (
//         <MenuItem key={option} value={option}>
//           <Checkbox className="checkbox" checked={props.values.ethnicity.includes(option)} />
//           <ListItemText primary={option} />
//         </MenuItem>
//       );
//     },
//     [props.values.ethnicity]
//   );

//   return (
//     <>
//       {/* <div id="SignUpPersonalPage">
//           Help us get to know you so we can create a more inclusive and meaningful
//           experience.
//         </div> */}
//       <FormControl className="select" variant="outlined">
//         <InputLabel>Language</InputLabel>
//         <Select
//           label="Language"
//           name="language"
//           onChange={props.handleChange}
//           onBlur={props.handleBlur}
//           value={props.values.language}
//           renderValue={sameThing}
//         >
//           {sortedLanguages.map(languageItems)}
//         </Select>
//       </FormControl>

//       <div className="DoubleInputRow">
//         <DateAndGenderPickers
//           birthDate={props.birthDate}
//           setBirthDate={props.setBirthDate}
//           handleChange={props.handleChange}
//           handleBlur={props.handleBlur}
//           values={props.values}
//           onGenderOtherValueChange={props.onGenderOtherValueChange}
//           genderOtherValue={props.genderOtherValue}
//           MUISelectMenuItem={MUISelectMenuItem}
//           inSidebar={props.inSidebar}
//         />
//       </div>

//       <FormControl className="select" variant="outlined">
//         <InputLabel>Ethnicity</InputLabel>
//         <Select
//           multiple
//           onChange={props.handleChange}
//           onBlur={props.handleBlur}
//           name="ethnicity"
//           label="Ethnicity"
//           value={props.values.ethnicity}
//           renderValue={arrayToString}
//           MenuProps={{ className: "EthnicityMenu" }}
//         >
//           {
//             // structure based from https://blog.hubspot.com/service/survey-demographic-questions
//             ETHNICITY_VALUES.map(ethnicityItems)
//           }
//         </Select>
//         {props.values.ethnicity &&
//           props.values.ethnicity.length > 0 &&
//           props.values.ethnicity.includes("Not listed (Please specify)") && (
//             <ValidatedInput
//               className="PleaseSpecify"
//               label="Please specify your ethnicity."
//               onChange={props.onEthnicityOtherValueChange}
//               name="ethnicity"
//               value={props.ethnicityOtherValue}
//             />
//           )}
//       </FormControl>
//       {props.CSCObj.length > 0 && (
//         <Suspense fallback={<div></div>}>
//           <CountryStateCity
//             handleChange={props.handleChange}
//             handleBlur={props.handleBlur}
//             values={props.values}
//             CSCObj={props.CSCObj}
//             allCountries={props.allCountries}
//             inSidebar={props.inSidebar}
//           />
//         </Suspense>
//       )}

//       <ValidatedInput
//         identification="reason"
//         name="reason"
//         type="text"
//         placeholder="Reason for Joining"
//         label="Reason for Joining"
//         onChange={props.handleChange}
//         onBlur={props.handleBlur}
//         value={props.values.reason}
//         errorMessage={props.errors.reason || props.serverError.reason}
//       />

//       <FormControl className="select" variant="outlined">
//         <InputLabel>How did you hear about us?</InputLabel>
//         <Select
//           onChange={props.handleChange}
//           onBlur={props.handleBlur}
//           name="foundFrom"
//           label="How did you hear about us?"
//           value={props.values.foundFrom}
//           renderValue={sameThing}
//         >
//           {FOUND_FROM_VALUES.map(foundFromItems)}
//         </Select>

//         {props.values.foundFrom && props.values.foundFrom === "Not listed (Please specify)" && (
//           <ValidatedInput
//             className="PleaseSpecify"
//             label="Please specify"
//             onChange={props.onFoundFromOtherValueChange}
//             name="foundFrom"
//             value={props.foundFromOtherValue}
//           />
//         )}
//       </FormControl>
//     </>
//   );
// };

// export default React.memo(PersonalInfo);
import React from "react";

const PersonalInfo = () => {
  return <div>PersonalInfo</div>;
};

export default PersonalInfo;
