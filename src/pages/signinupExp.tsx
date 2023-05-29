import EmailIcon from "@mui/icons-material/Email";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import { Autocomplete, Paper, TextField, Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Institution } from "src/knowledgeTypes";

import { signUpExp as signUpExpApi } from "@/lib/knowledgeApi";

import { auth, dbExp } from "../../src/lib/firestoreClient/firestoreClient.config";
import { DESIGN_SYSTEM_COLORS } from "../lib/theme/colors";
import { a11yProps, TabPanel } from "../utils/TabPanel";
import ValidatedInput from "../utils/ValidatedInput";
import ConsentDocument from "./ConsentDocument";
const isEmail = (email: string): boolean => {
  const regEx =
    // eslint-disable-next-line
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};
const DEFAULT_PROJECT = "H1L2";

const SignUpExpPage = () => {
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState("");
  const [project /* , setProject */] = useState(DEFAULT_PROJECT);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(0);
  const [invalidAuth, setInvalidAuth] = useState<any>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState(null);
  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [validConfirmPassword, setValidConfirmPassword] = useState(false);
  const [validFirstname, setValidFirstname] = useState(false);
  const [validlastname, setValidlastname] = useState(false);
  const [signInSubmitable, setSignInSubmitable] = useState(false);
  const [signUpSubmitable, setSignUpSubmitable] = useState(false);
  const [submitable, setSubmitable] = useState(false);
  const [validPasswordResetEmail, setValidPasswordResetEmail] = useState(false);
  const [nameFromInstitutionSelected, setNameFromInstitutionSelected] = useState<any>({});
  const [participatedBefore, setParticipatedBefore] = useState(false);
  const [databaseAccountNotCreatedYet, setDatabaseAccountNotCreatedYet] = useState(false);
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const [projectSpecs, setProjectSpecs] = useState({});
  const haveProjectSpecs = Object.keys(projectSpecs).length > 0;

  const db = getFirestore();

  const processAuth = async (user: any) => {
    // const uid = user.uid;
    const uEmail = user.email.toLowerCase();
    const users = await getDocs(query(collection(dbExp, "users"), where("email", "==", uEmail)));

    let userData: any = null;

    if (!users.docs.length) {
      const usersSurvey = await getDocs(query(collection(dbExp, "usersSurvey"), where("email", "==", uEmail)));
      if (usersSurvey.docs.length) {
        userData = usersSurvey.docs[0].data();
      }
    } else {
      userData = users.docs[0].data();
    }

    if (!userData) return; // if user document doesn't exists
    router.push("/community/clinical-psychology");
    setEmailVerified("Verified");
    setEmail(uEmail);
    // if redirects required
    const nonAuthUrls = ["/auth", "/InstructorCoNoteSurvey", "/StudentCoNoteSurvey"];
    for (const nonAuthUrl of nonAuthUrls) {
      if (String(window.location.pathname).startsWith(nonAuthUrl)) {
        router.push("https://1cademy.us/auth");
        break;
      }
    }
  };
  useEffect(() => {
    auth.onAuthStateChanged(async (user: any) => {
      if (user) {
        // sign in logic
        if (!user.emailVerified) {
          setEmailVerified("Sent");
          await sendEmailVerification(auth.currentUser);
          const intvl = setInterval(() => {
            if (!auth.currentUser) {
              clearInterval(intvl);
              return;
            }
            auth.currentUser.reload();
            if (auth.currentUser.emailVerified) {
              processAuth(user);
              clearInterval(intvl);
            }
          }, 1000);
        } else {
          processAuth(user);
        }
      } else {
        // setShowSignInorUp(true);
        setEmailVerified("NotSent");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setParticipatedBefore(false);
    setInvalidAuth(false);
    setDatabaseAccountNotCreatedYet(false);
  }, [firstname, lastname, email]);
  useEffect(() => {
    const getProjectSpecs = async () => {
      const projectSpecRef = doc(dbExp, "projectSpecs", "H2K2");
      const pSpec = await getDoc(projectSpecRef);
      setProjectSpecs({ ...pSpec.data() });
    };

    if (project) {
      getProjectSpecs();
    }
    // update project settings
  }, [project]);

  useEffect(() => {
    setValidEmail(isEmail(email));
  }, [email]);

  useEffect(() => {
    setValidPassword(password.length >= 7);
  }, [password]);

  useEffect(() => {
    setValidConfirmPassword(confirmPassword === password);
  }, [password, confirmPassword]);

  useEffect(() => {
    setValidFirstname(firstname.length > 1 && firstname.slice(-1) !== " ");
  }, [firstname]);

  useEffect(() => {
    setValidlastname(lastname.length > 1 && lastname.slice(-1) !== " ");
  }, [lastname]);

  useEffect(() => {
    setSignInSubmitable(validEmail && validPassword);
  }, [validEmail, validPassword]);

  useEffect(() => {
    setSignInSubmitable(validEmail && validPassword);
  }, [validEmail, validPassword]);

  useEffect(() => {
    setSignUpSubmitable(signInSubmitable && validFirstname && validlastname && validConfirmPassword);
  }, [signInSubmitable, validFirstname, validlastname, validConfirmPassword]);

  useEffect(() => {
    setSubmitable((isSignUp === 0 && signInSubmitable) || (isSignUp === 1 && signUpSubmitable && haveProjectSpecs));
  }, [isSignUp, signInSubmitable, signUpSubmitable, projectSpecs]);

  useEffect(() => {
    setValidPasswordResetEmail(isEmail(resetPasswordEmail));
  }, [resetPasswordEmail]);

  const switchAccount = (event: any) => {
    event.preventDefault();
    setIsSubmitting(false);
    if (isSignUp === 1) {
      auth.currentUser.delete();
    }
    auth.signOut();
  };

  const resendVerificationEmail = () => {
    auth.currentUser.sendEmailVerification();
  };

  const firstnameChange = (event: any) => {
    let fName = event.target.value;
    fName = fName.replace(/[0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;\.:[\]]/gi, "");
    setFirstname(fName);
  };

  const lastnameChange = (event: any) => {
    let lName = event.target.value;
    lName = lName.replace(/[0-9_!¡?÷?¿/\\+=@#$%ˆ&*(){}|~<>;\.:[\]]/gi, "");
    setLastname(lName);
  };

  const emailChange = (event: any) => {
    setEmail(event.target.value.toLowerCase());
  };

  const passwordChange = (event: any) => {
    setPassword(event.target.value);
  };

  const confirmPasswordChange = (event: any) => {
    setConfirmPassword(event.target.value);
  };

  const switchSignUp = (event: any, newValue: any) => {
    setIsSignUp(newValue);
    setForgotPassword(false);
  };

  const openForgotPassword = () => {
    setForgotPassword(oldValue => !oldValue);
    setTimeout(() => {
      let window = document.getElementById("ScrollableContainer");
      window?.scrollTo(0, window?.scrollHeight);
    }, 100);
  };

  const signUp = async (event: any) => {
    event.preventDefault();
    setIsSubmitting(true);
    const loweredEmail = email.toLowerCase();
    try {
      await signInWithEmailAndPassword(auth, loweredEmail, password);
    } catch (err: any) {
      console.log({ err });
      // err.message is "There is no user record corresponding to this identifier. The user may have been deleted."
      if (err.code !== "auth/user-not-found") {
        setInvalidAuth(err.message);
      } else {
        // setInvalidAuth(
        //   "There is no user record corresponding to this email address. Please create a new account!"
        // );
        setIsSignUp(1);
        if (signUpSubmitable) {
          await signUpExpApi({
            email,
            password,
            firstName: firstname,
            lastName: lastname,
            institutionName: nameFromInstitutionSelected.name ? nameFromInstitutionSelected.name : "",
            projectName: project,
          });
          await signInWithEmailAndPassword(auth, loweredEmail, password);
        }
      }
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setIsPasswordReset(true);
        setPasswordResetError(null);
      } catch (err: any) {
        console.error("Error sending email", err);
        setPasswordResetError(err.message);
        setIsPasswordReset(false);
      }
      setIsSubmitting(false);
    }
  };

  const onKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && submitable) {
      signUp(event);
    }
  };
  useEffect(() => {
    const checkEmailInstitution = async () => {
      try {
        const domainName = email.match("@(.+)$")?.[0];
        const institutionsQuery = query(
          collection(db, "institutions"),
          where("domains", "array-contains", domainName),
          limit(1)
        );
        const institutionDoc = await getDocs(institutionsQuery);

        if (institutionDoc && institutionDoc.docs.length > 0) {
          const institutionData = institutionDoc.docs[0].data();
          setNameFromInstitutionSelected(institutionData);
          return institutionData;
        } else {
          setNameFromInstitutionSelected({});
        }
      } catch (err) {
        console.log("err", err);
      }
    };
    checkEmailInstitution();
  }, [email]);
  function removeDuplicates(arr: any) {
    return arr.reduce((accumulator: any, current: any) => {
      if (!accumulator.find((item: any) => item.id === current.id)) {
        accumulator.push(current);
      }
      return accumulator;
    }, []);
  }
  useEffect(() => {
    const institutionsQuery = query(collection(db, "institutions"));
    const unsubscribe = onSnapshot(institutionsQuery, snapshot => {
      setInstitutions((insitutions: Institution[]) => {
        let _insitutions = [...insitutions];
        const docChanges = snapshot.docChanges();
        for (const docChange of docChanges) {
          const institutionData: Institution | any = docChange.doc.data();
          if (institutionData.usersNum >= 1 || institutionData.country === "United States") {
            if (docChange.type === "added") {
              _insitutions.push({ id: docChange.doc.id, ...institutionData });
              continue;
            }
            const idx = _insitutions.findIndex(insitution => insitution.name === institutionData.name);
            if (docChange.type === "modified") {
              _insitutions[idx] = { id: docChange.doc.id, ...institutionData };
            } else {
              _insitutions.splice(idx, 1);
            }
          }
        }

        return removeDuplicates(_insitutions);
      });
    });
    return () => unsubscribe();
  }, [db]);

  return (
    <Grid
      container
      spacing={{ xs: 1, md: 2.2 }}
      sx={{
        width: "100%",
        height: "150vh",
        overflowY: { xs: "auto", md: "hidden" },
        overflowX: "hidden",
        backgroundColor: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.gray850 : DESIGN_SYSTEM_COLORS.gray250,
        background: "transprant",
      }}
    >
      <Grid
        item
        xs={12}
        md={8}
        style={{
          overflowY: "hidden",
          overflowX: "hidden",
        }}
      >
        <Paper
          sx={{
            overflowY: "auto",
            overflowX: "hidden",
            margin: "10px 0px 25px 10px",
            width: "100%",
            height: "100vh",
          }}
        >
          <ConsentDocument />
        </Paper>
      </Grid>
      <Grid
        item
        xs={12}
        md={4}
        style={{
          overflowY: "hidden",
          overflowX: "hidden",
        }}
      >
        <Paper
          sx={{
            overflowY: "auto",
            overflowX: "hidden",
            margin: "10px 0px 25px 0px",
            width: "100%",
            height: "100vh",
          }}
        >
          <Box sx={{ m: "0px 13px 13px 13px", p: "9px", pb: "100px", overflowY: "auto", overflowX: "hidden" }}>
            {emailVerified === "Sent" ? (
              <Box>
                <p>
                  We just sent you a verification email. Please click the link in the email to verify and complete your
                  sign-up.
                </p>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={resendVerificationEmail}
                  style={{ marginRight: "19px" }}
                >
                  <EmailIcon /> Resend Verification Email
                </Button>
                <Button variant="contained" color="error" onClick={switchAccount}>
                  <SwitchAccountIcon /> Switch Account
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="h3">Sign the Consent Form to Get Started!</Typography>
                <Typography paragraph sx={{ mt: 5, mb: 5 }}>
                  Please read the consent form on the left carefully. By creating and account or signing into this
                  website, you sign the consent form and allow us to analyze your data collected throughout this study.
                </Typography>
                <Alert severity="error" sx={{ fontSize: "14px" }}>
                  Please only use your Gmail address to create an account. You can also use your school email address,
                  only if your school email is provided by Google.
                </Alert>
                <Box sx={{ width: "100%" }}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={isSignUp} onChange={switchSignUp} aria-label="basic tabs" variant="fullWidth">
                      <Tab label="Sign In" {...a11yProps(0)} />
                      <Tab label="Sign Up" {...a11yProps(1)} />
                    </Tabs>
                  </Box>
                  <TabPanel value={isSignUp} index={0}>
                    <ValidatedInput
                      className="PleaseSpecify"
                      label="Email address"
                      onChange={emailChange}
                      name="email"
                      value={email}
                      errorMessage={validEmail ? null : "Please enter your valid email address!"}
                      onKeyPress={onKeyPress}
                    />
                    <ValidatedInput
                      className="PleaseSpecify"
                      onChange={passwordChange}
                      name="password"
                      type="password"
                      placeholder="Password"
                      label="Password"
                      errorMessage={
                        validPassword ? null : "Please enter your desired password with at least 7 characters!"
                      }
                      onKeyPress={onKeyPress}
                    />
                  </TabPanel>
                  <TabPanel value={isSignUp} index={1}>
                    <ValidatedInput
                      className="PleaseSpecify"
                      label="Firstname"
                      onChange={firstnameChange}
                      name="firstname"
                      value={firstname}
                      errorMessage={validFirstname ? null : "Please enter your firstname!"}
                      onKeyPress={onKeyPress}
                    />
                    <ValidatedInput
                      className="PleaseSpecify"
                      label="lastname"
                      onChange={lastnameChange}
                      name="lastname"
                      value={lastname}
                      errorMessage={validlastname ? null : "Please enter your lastname!"}
                      onKeyPress={onKeyPress}
                    />
                    <ValidatedInput
                      className="PleaseSpecify"
                      label="Email address"
                      onChange={emailChange}
                      name="email"
                      value={email}
                      errorMessage={validEmail ? null : "Please enter your valid email address!"}
                      onKeyPress={onKeyPress}
                    />
                    <Autocomplete
                      id="institution"
                      value={nameFromInstitutionSelected}
                      options={institutions}
                      onChange={(_, value) => setNameFromInstitutionSelected(value || null)}
                      renderInput={params => (
                        <TextField {...params} value={nameFromInstitutionSelected} label="Institution" />
                      )}
                      getOptionLabel={option => (option.name ? option.name : "")}
                      renderOption={(props, option) => (
                        <li key={option.id} {...props}>
                          {option.name}
                        </li>
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      fullWidth
                      sx={{ mb: "16px" }}
                    />
                    <ValidatedInput
                      className="PleaseSpecify"
                      onChange={passwordChange}
                      name="password"
                      type="password"
                      placeholder="Password"
                      label="Password"
                      value={password}
                      errorMessage={
                        validPassword ? null : "Please enter your desired password with at least 7 characters!"
                      }
                      onKeyPress={onKeyPress}
                    />
                    <ValidatedInput
                      className="PleaseSpecify"
                      onChange={confirmPasswordChange}
                      name="ConfirmPassword"
                      type="password"
                      placeholder="Re-enter Password"
                      label="Confirm Password"
                      value={confirmPassword}
                      errorMessage={
                        validConfirmPassword ? null : "Your password and the re-entered password should match!"
                      }
                      onKeyPress={onKeyPress}
                    />
                  </TabPanel>
                  {databaseAccountNotCreatedYet && (
                    <Alert severity="error">
                      Please sign up using the same email address, firstname, and lastname so that we link your existing
                      account with your authentication.
                    </Alert>
                  )}
                  {invalidAuth && (
                    <Alert severity="error" sx={{ fontSize: "13px" }}>
                      {invalidAuth}
                    </Alert>
                  )}
                  {participatedBefore && (
                    <Box className="Error">You've participated in this study before and cannot participate again!</Box>
                  )}
                  <Box sx={{ margin: "auto", textAlign: "center", mt: "10px" }}>
                    <Button
                      id="SignButton"
                      onClick={signUp}
                      className={submitable && !isSubmitting ? "Button" : "Button Disabled"}
                      variant="contained"
                      disabled={submitable && !isSubmitting ? false : true}
                      sx={{ borderRadius: "26px", backgroundColor: DESIGN_SYSTEM_COLORS.primary800 }}
                    >
                      {isSignUp === 0 ? "Sign In" : isSubmitting ? "Creating your account..." : "Consent and Sign Up"}
                    </Button>
                  </Box>
                  <Box style={{ textAlign: "center", marginTop: "10px" }}>
                    <Button onClick={openForgotPassword} variant="outlined" sx={{ borderRadius: "26px" }}>
                      Forgot Password?
                    </Button>
                  </Box>
                  {forgotPassword && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <p>Enter your account email below to receive a password reset link.</p>
                      <ValidatedInput
                        identification="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        label="Email"
                        onChange={(event: any) => setResetPasswordEmail(event.target.value)}
                        value={resetPasswordEmail}
                        errorMessage={passwordResetError}
                        // autocomplete="off"
                      />
                      <Button
                        id="ForgotPasswordEmailButton"
                        variant="contained"
                        onClick={handleResetPassword}
                        className={!isSubmitting && validPasswordResetEmail ? "Button" : "Button Disabled"}
                        disabled={isSubmitting || !validPasswordResetEmail}
                        sx={{ borderRadius: "26px", backgroundColor: DESIGN_SYSTEM_COLORS.primary800 }}
                      >
                        Send Email
                      </Button>

                      {isPasswordReset && <h4>Check your email to reset the password.</h4>}
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default React.memo(SignUpExpPage);
