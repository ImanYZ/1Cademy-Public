import EmailIcon from "@mui/icons-material/Email";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import { Autocomplete, Checkbox, Link, Paper, TextField } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import axios from "axios";
import { sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDoc, getDocs, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { Suspense, useEffect, useState } from "react";
import { Institution } from "src/knowledgeTypes";

import darkModeLibraryImage from "../../public/darkModeLibraryBackground.jpg";
import { auth, dbExp } from "../../src/lib/firestoreClient/firestoreClient.config";
import { a11yProps, TabPanel } from "../utils/TabPanel";
import ValidatedInput from "../utils/ValidatedInput";

const GDPRPolicy = React.lazy(() => import("../components/modals/GDPRPolicy"));
const CookiePolicy = React.lazy(() => import("../components/modals/CookiePolicy"));
const PrivacyPolicy = React.lazy(() => import("../components/modals/PrivacyPolicy"));
const TermsOfUse = React.lazy(() => import("../components/modals/TermsOfUse"));
const InformedConsent = React.lazy(() => import("../components/modals/InformedConsent"));
import { signUpExp as signUpExpApi } from "@/lib/knowledgeApi";
const isEmail = (email: string): boolean => {
  const regEx =
    // eslint-disable-next-line
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};
const DEFAULT_PROJECT = "H2K2";

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
  const [signUpAgreement, setSignUpAgreement] = useState(false);
  const [GDPRAgreement, setGDPRAgreement] = useState(false);
  const [privacyAgreement, setPrivacyAgreement] = useState(false);
  const [termAgreement, setTermAgreement] = useState(false);
  const [cookieAgreement, setCookieAgreement] = useState(false);

  const [openInformedConsent, setOpenInformedConsent] = useState(false);
  const [openTermOfUse, setOpenTermsOfUse] = useState(false);
  const [openPrivacyPolicy, setOpenPrivacyPolicy] = useState(false);
  const [openCookiePolicy, setOpenCookiePolicy] = useState(false);
  const [openGDPRPolicy, setOpenGDPRPolicy] = useState(false);
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const [projectSpecs, setProjectSpecs] = useState({});
  const haveProjectSpecs = Object.keys(projectSpecs).length > 0;
  const [fullname, setFullname] = useState<string>("");
  const isDisabled =
    isSignUp === 0
      ? !submitable || isSubmitting
      : !submitable ||
        isSubmitting ||
        !signUpAgreement ||
        !privacyAgreement ||
        !termAgreement ||
        !cookieAgreement ||
        !GDPRAgreement;

  const db = getFirestore();

  const processAuth = async (user: any) => {
    // const uid = user.uid;
    const uEmail = user.email.toLowerCase();
    const users = await getDocs(query(collection(dbExp, "users"), where("email", "==", uEmail)));

    let userData: any = null;
    let fullName: string = "";
    if (!users.docs.length) {
      const usersStudentSurvey = await getDocs(
        query(collection(dbExp, "usersStudentCoNoteSurvey"), where("email", "==", uEmail))
      );
      if (usersStudentSurvey.docs.length) {
        fullName = usersStudentSurvey.docs[0].id;
        userData = usersStudentSurvey.docs[0].data();
      }
    } else {
      fullName = users.docs[0].id;
      userData = users.docs[0].data();
    }
    setFullname(fullName);
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
        setFullname("");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setInvalidAuth(false);
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

  useEffect(() => {
    const getNameFromInstitutionSelected = async () => {
      if (email !== "") {
        const data = await axios.post("/checkEmailInstitution", { email });
        if (data?.data.institution) {
          setNameFromInstitutionSelected(data.data.institution);
        }
      }
    };
    getNameFromInstitutionSelected();
  }, [email]);
  const switchAccount = (event: any) => {
    event.preventDefault();
    setIsSubmitting(false);
    if (isSignUp === 1) {
      auth.delete();
    }
    auth.logout();
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
    const institutionsQuery = query(collection(db, "institutions"), where("usersNum", ">=", 1));
    const unsubscribe = onSnapshot(institutionsQuery, snapshot => {
      setInstitutions((insitutions: Institution[]) => {
        let _insitutions = [...insitutions];
        const docChanges = snapshot.docChanges();
        for (const docChange of docChanges) {
          const institutionData: Institution | any = docChange.doc.data();
          if (docChange.type === "added") {
            _insitutions.push(institutionData);
            continue;
          }
          const idx = _insitutions.findIndex(insitution => insitution.name === institutionData.name);
          if (docChange.type === "modified") {
            _insitutions[idx] = institutionData;
          } else {
            _insitutions.splice(idx, 1);
          }
        }
        return _insitutions;
      });
    });
    return () => unsubscribe();
  }, [db]);
  console.log("fullname", fullname);
  return (
    <Box>
      <Box
        data-testid="auth-layout"
        sx={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          filter: "brightness(1.95)",
          zIndex: -2,
        }}
      >
        <Image alt="Library" src={darkModeLibraryImage} layout="fill" objectFit="cover" priority />
      </Box>

      <Box
        sx={{
          p: { xs: "0px", width: "100%" },
          height: "100vh",
          overflowY: "auto",
          overflowX: "auto",
          position: "relative",
          scrollBehavior: "smooth",
        }}
        id="ScrollableContainer"
      >
        <Paper
          sx={{
            m: "10px 500px 200px 500px",
            "@media (max-width: 1120px)": {
              m: "0px",
            },
          }}
        >
          {emailVerified === "Sent" ? (
            <div
              style={{
                height: "200px",
                marginTop: "200px",
                flexDirection: "column",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box>
                <p>
                  We just sent you a verification email. Please click the link in the email to verify and complete your
                  sign-up.
                </p>
              </Box>
              <Box>
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
            </div>
          ) : (
            <Box>
              <Alert severity="error">
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
                  <Box sx={{ m: "20px 20px 0px 20px" }}>
                    <ValidatedInput
                      className="inputValidate"
                      label="Email address"
                      onChange={emailChange}
                      name="email"
                      value={email}
                      errorMessage={validEmail ? null : "Please enter your valid email address!"}
                      onKeyPress={onKeyPress}
                    />
                  </Box>
                  <Box sx={{ m: "0px 20px 0px 20px" }}>
                    <ValidatedInput
                      className="inputValidate"
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
                  </Box>
                </TabPanel>
                <TabPanel value={isSignUp} index={1}>
                  <Box sx={{ m: "0px 20px 0px 20px" }}>
                    <ValidatedInput
                      className="inputValidate"
                      label="Firstname"
                      onChange={firstnameChange}
                      name="firstname"
                      value={firstname}
                      errorMessage={validFirstname ? null : "Please enter your firstname!"}
                      onKeyPress={onKeyPress}
                    />
                  </Box>
                  <Box sx={{ m: "0px 20px 0px 20px" }}>
                    <ValidatedInput
                      className="inputValidate"
                      label="lastname"
                      onChange={lastnameChange}
                      name="lastname"
                      value={lastname}
                      errorMessage={validlastname ? null : "Please enter your lastname!"}
                      onKeyPress={onKeyPress}
                    />
                  </Box>
                  <Box sx={{ m: "0px 20px 0px 20px" }}>
                    <ValidatedInput
                      className="inputValidate"
                      label="Email address"
                      onChange={emailChange}
                      name="email"
                      value={email}
                      errorMessage={validEmail ? null : "Please enter your valid email address!"}
                      onKeyPress={onKeyPress}
                    />
                  </Box>
                  <Box sx={{ m: "0px 20px 0px 20px" }}>
                    <Autocomplete
                      className="inputValidate"
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
                  </Box>
                  <Box sx={{ m: "0px 20px 0px 20px" }}>
                    <ValidatedInput
                      className="inputValidate"
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
                  </Box>
                  <Box sx={{ m: "0px 20px 0px 20px" }}>
                    <ValidatedInput
                      className="inputValidate"
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
                  </Box>
                  <Box sx={{ ml: "20px" }}>
                    <Checkbox checked={signUpAgreement} onChange={(_, value) => setSignUpAgreement(value)} />I
                    acknowledge and agree that any data generated from my use of 1Cademy may be utilized for research
                    purposes by the investigators at 1Cademy, the University of Michigan School of Information, and
                    Honor Education.
                  </Box>

                  <Box sx={{ ml: "20px" }}>
                    <Checkbox checked={GDPRAgreement} onChange={(_, value) => setGDPRAgreement(value)} />I acknowledge
                    and agree to{" "}
                    <Link
                      onClick={() => {
                        setOpenGDPRPolicy(true);
                      }}
                      sx={{ cursor: "pointer", textDecoration: "none", color: "#ed6c02" }}
                    >
                      1Cademy's General Data Protection Regulation (GDPR) Policy.
                    </Link>
                  </Box>

                  <Box sx={{ ml: "20px" }}>
                    <Checkbox checked={termAgreement} onChange={(_, value) => setTermAgreement(value)} />I acknowledge
                    and agree to{" "}
                    <Link
                      onClick={() => {
                        setOpenTermsOfUse(true);
                      }}
                      sx={{ cursor: "pointer", textDecoration: "none", color: "#ed6c02" }}
                    >
                      1Cademy's Terms of Service.
                    </Link>
                  </Box>

                  <Box sx={{ ml: "20px" }}>
                    <Checkbox checked={privacyAgreement} onChange={(_, value) => setPrivacyAgreement(value)} />I
                    acknowledge and agree to{" "}
                    <Link
                      onClick={() => {
                        setOpenPrivacyPolicy(true);
                      }}
                      sx={{ cursor: "pointer", textDecoration: "none", color: "#ed6c02" }}
                    >
                      1Cademy's Privacy Policy.
                    </Link>
                  </Box>

                  <Box sx={{ ml: "20px" }}>
                    <Checkbox checked={cookieAgreement} onChange={(_, value) => setCookieAgreement(value)} />I
                    acknowledge and agree to{" "}
                    <Link
                      onClick={() => {
                        setOpenCookiePolicy(true);
                      }}
                      sx={{ cursor: "pointer", textDecoration: "none", color: "#ed6c02" }}
                    >
                      1Cademy's Cookies Policy.
                    </Link>
                  </Box>
                </TabPanel>
                {invalidAuth && <div className="Error">{invalidAuth.replace("Firebase:", "")}</div>}

                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <Button
                    id="SignButton"
                    className={isDisabled ? "Button" : "Button Disabled"}
                    onClick={signUp}
                    sx={{ width: isSignUp === 0 ? "150px" : "250" }}
                    variant="contained"
                    color="secondary"
                    disabled={isDisabled}
                  >
                    {isSignUp === 0 ? "Sign In" : isSubmitting ? "Creating your account..." : " Sign Up"}
                  </Button>
                </div>

                <Suspense fallback={<div></div>}>
                  <>
                    <InformedConsent open={openInformedConsent} handleClose={() => setOpenInformedConsent(false)} />
                    <GDPRPolicy open={openGDPRPolicy} handleClose={() => setOpenGDPRPolicy(false)} />
                    <CookiePolicy open={openCookiePolicy} handleClose={() => setOpenCookiePolicy(false)} />
                    <PrivacyPolicy open={openPrivacyPolicy} handleClose={() => setOpenPrivacyPolicy(false)} />
                    <TermsOfUse open={openTermOfUse} handleClose={() => setOpenTermsOfUse(false)} />
                  </>
                </Suspense>
                <div style={{ textAlign: "center", marginTop: "10px" }}>
                  <Button
                    onClick={openForgotPassword}
                    sx={{ m: "0px 10px 10px 10px" }}
                    variant="contained"
                    color="warning"
                  >
                    Forgot Password?
                  </Button>
                </div>
                {forgotPassword && (
                  <>
                    <Box sx={{ m: "20px 20px 0px 20px" }}>
                      <p>Enter your account email below to receive a password reset link.</p>
                      <ValidatedInput
                        identification="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        label="Email"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setResetPasswordEmail(event.target.value)
                        }
                        value={resetPasswordEmail}
                        errorMessage={passwordResetError}
                        // autocomplete="off"
                      />
                    </Box>
                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                      {isPasswordReset && <h4>Check your email to reset the password.</h4>}
                    </div>
                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                      <Button
                        id="ForgotPasswordEmailButton"
                        onClick={handleResetPassword}
                        className={!isSubmitting && validPasswordResetEmail ? "Button" : "Button Disabled"}
                        disabled={isSubmitting || !validPasswordResetEmail}
                      >
                        Send Email
                      </Button>
                    </div>
                  </>
                )}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default React.memo(SignUpExpPage);
