import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  Link,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { collection, doc, getDoc, getFirestore, onSnapshot, query, where, writeBatch } from "firebase/firestore";
import moment from "moment";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { roundNum } from "src/utils/common.utils";

import { useAuth } from "@/context/AuthContext";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";
import { getAvatarName } from "@/lib/utils/Map.utils";
const DEFAULT_PROFILE_URL = "https://storage.googleapis.com/onecademy-1.appspot.com/ProfilePictures/no-img.png";

const StudentDetailHoursTracking = ({
  uname,
  setSelectedStudent,
}: {
  uname: string;
  user?: any;
  setSelectedStudent?: any;
}) => {
  const db = getFirestore();
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [currentStudent, setCurrentStudent] = useState<any>({});
  const [selectedGranularity, setSelectedGranularity] = useState<string>("Month"); // Default to Month
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableWeeks, setAvailableWeeks] = useState<any>([]);
  const [{ user }] = useAuth();
  const adminView = !!user?.claims?.tracking;
  const loadUser = async (uname: string) => {
    const userDoc = await getDoc(doc(collection(db, "users"), uname));
    const userData: any = userDoc.data();
    if (userData) {
      const user = {
        imageUrl: userData.imageUrl,
        fullName: userData.fName + " " + userData.lName,
        fName: userData.fName,
        lName: userData.lName,
        uname: userData.uname,
      };
      setCurrentStudent(user);
    }
  };

  useEffect(() => {
    if (!uname) return;
    const leading: any = user?.claims?.leading || [];
    const queryTrack = query(collection(db, "trackHours"), where("uname", "==", uname));
    const unsubscribe = onSnapshot(queryTrack, snapshot => {
      const data: any = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedData = data.sort((a: any, b: any) => {
        const dateA = moment(a.day, "DD-MM-YYYY");
        const dateB = moment(b.day, "DD-MM-YYYY");
        return dateA.diff(dateB);
      });
      if (!data.length) return;
      if (uname !== user?.uname && !adminView && !leading.includes(data[0].semesterId)) return;
      setTrackingData(sortedData);

      const monthsSet = new Set<string>();
      const daysSet = new Set<string>();
      const weeksSet = new Set<number>();
      const weekStartDate = moment("10-06-2024", "DD-MM-YYYY").startOf("isoWeek");

      sortedData.forEach((entry: any) => {
        const date = moment(entry.day, "DD-MM-YYYY");
        const monthName = date.format("MMMM");
        monthsSet.add(monthName);
        const formattedDate = date.format("MM/DD/YYYY");
        daysSet.add(formattedDate);
        const weekNumber = getWeekNumberFromStart(weekStartDate.toDate(), date.toDate());
        weeksSet.add(weekNumber);
      });

      setAvailableMonths(Array.from(monthsSet));
      setAvailableDays(Array.from(daysSet));
      setAvailableWeeks(Array.from(weeksSet));
    });

    loadUser(uname);

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [uname, user]);

  // Function to calculate week number from the first tracking date
  const getWeekNumberFromStart = (start: any, date: any) => {
    const startDate = moment(start);
    const currentDate = moment(date);
    // Calculate the number of days difference and then divide by 14 to get two-week periods
    const daysDifference = currentDate.diff(startDate, "days");
    return Math.floor(daysDifference / 14) + 1;
  };

  // Function to filter data based on selected granularity
  const filterData = () => {
    switch (selectedGranularity) {
      case "Month":
        return availableMonths;
      case "Day":
        return availableDays;
      case "Week":
        return availableWeeks;
      default:
        return [];
    }
  };

  // Function to get hours tracked for the selected granularity
  const getHoursTracked = (granularity: string) => {
    const filteredData = trackingData.filter(entry => {
      const startWeek = moment("10-06-2024", "DD-MM-YYYY");
      const date = moment(entry.day, "DD-MM-YYYY");
      const formattedDay = date.format("MM/DD/YYYY");
      const monthName = date.format("MMMM");
      switch (selectedGranularity) {
        case "Month":
          return monthName === granularity;
        case "Day":
          return formattedDay === granularity;
        case "Week":
          return getWeekNumberFromStart(startWeek.toDate(), date.toDate()) === parseInt(granularity);
        default:
          return false;
      }
    });
    return filteredData.reduce((total, entry) => total + entry.totalMinutes / 60, 0);
  };

  // Function to check if an entry is paid
  const isPaid = (granularity: string) => {
    const startWeek = moment("10-06-2024", "DD-MM-YYYY");

    // Function to get the week number from the start date

    switch (selectedGranularity) {
      case "Month":
        return trackingData.every(entry => {
          const date = moment(entry.day, "DD-MM-YYYY");
          const monthName = date.format("MMMM");
          return monthName === granularity && entry.paid;
        });
      case "Day":
        return trackingData.some(entry => {
          const date = moment(entry.day, "DD-MM-YYYY");
          const formattedDay = date.format("MM/DD/YYYY");
          return formattedDay === granularity && entry.paid;
        });
      case "Week":
        const weekNumber = parseInt(granularity);
        return trackingData.every(entry => {
          const date = moment(entry.day, "DD-MM-YYYY");
          return getWeekNumberFromStart(startWeek.toDate(), date.toDate()) === weekNumber && entry.paid;
        });
      default:
        return false;
    }
  };

  // Function to toggle paid status
  const togglePaidStatus = async (granularity: string, newValue: boolean) => {
    const batch = writeBatch(db);

    trackingData.forEach(entry => {
      let shouldUpdate = false;
      const startWeek = moment("10-06-2024", "DD-MM-YYYY");
      const date = moment(entry.day, "DD-MM-YYYY");
      const formattedDay = date.format("MM/DD/YYYY");
      const monthName = date.format("MMMM");
      switch (selectedGranularity) {
        case "Month":
          shouldUpdate = monthName === granularity;
          break;
        case "Day":
          shouldUpdate = formattedDay === granularity;
          break;
        case "Week":
          shouldUpdate = getWeekNumberFromStart(startWeek.toDate(), date.toDate()) === parseInt(granularity);
          break;
        default:
          break;
      }

      if (shouldUpdate) {
        const docRef = doc(db, "trackHours", entry.id);
        batch.update(docRef, { paid: newValue });
      }
    });

    await batch.commit();
  };
  const generateTwoWeekPeriods = (startDate: any) => {
    let periods = [];
    let currentDate = moment(startDate);
    let now = moment();
    let index = 0;

    while (currentDate.isBefore(now)) {
      const periodStart = currentDate;
      const periodEnd = moment(periodStart).add(13, "days");
      periods.push({
        start: periodStart,
        end: periodEnd,
        label: `${periodStart.format("MM/DD/YYYY")} - ${periodEnd.format("MM/DD/YYYY")}`,
        index: index,
      });
      currentDate = moment(periodStart).add(14, "days");
      index++;
    }

    return periods;
  };
  const periods = generateTwoWeekPeriods("2024-06-10");

  return (
    <Box
      sx={{
        background: theme =>
          theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
        height: "100vh",
      }}
    >
      <Container>
        <Box sx={{ display: "flex", gap: "15px", pt: "15px" }}>
          {setSelectedStudent && (
            <Link
              onClick={() => {
                setSelectedStudent(null);
              }}
            >
              <Button variant="contained" color="primary" sx={{ mt: "15px" }}>
                <ArrowBackIcon />
              </Button>
            </Link>
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "15px" }}>
              {/* <Avatar src={student.imageUrl} alt={student.uname} sx={{ mr: 2 }} /> */}
              <Box
                id={`${currentStudent.uname}-picture`}
                sx={{ "& img": { borderRadius: "50%" }, borderRadius: "8px" }}
              >
                {currentStudent.imageUrl &&
                currentStudent.imageUrl !== "" &&
                currentStudent.imageUrl !== DEFAULT_PROFILE_URL ? (
                  <Image
                    src={currentStudent.imageUrl || ""}
                    alt={`${currentStudent.fName} ${currentStudent.lName}`}
                    width={50}
                    height={50}
                    objectFit="cover"
                    objectPosition="center center"
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: "50px",
                      height: "50px",
                      color: "white",
                      fontSize: "24px",
                      fontWeight: "600",
                      background: "linear-gradient(143.7deg, #FDC830 15.15%, #F37335 83.11%);",
                    }}
                  >
                    {getAvatarName(currentStudent.fName, currentStudent.lName)}
                  </Avatar>
                )}
              </Box>
            </Box>
            <Typography variant="h4" gutterBottom sx={{ ml: "5px", mt: "5px" }}>
              {currentStudent.fullName}
            </Typography>
          </Box>
          <Box sx={{ marginBottom: 2, ml: "auto" }}>
            <Select
              value={selectedGranularity}
              onChange={event => setSelectedGranularity(event.target.value)}
              variant="outlined"
              sx={{ marginRight: 2 }}
              MenuProps={{
                sx: {
                  zIndex: "9999",
                },
              }}
            >
              <MenuItem value="Month">Per Month</MenuItem>
              <MenuItem value="Week">Per 2-Weeks</MenuItem>
              <MenuItem value="Day">Per Day</MenuItem>
            </Select>
          </Box>
        </Box>
        <TableContainer component={Paper} sx={{ overflow: "auto", height: "100vh" }}>
          <Table>
            <TableHead
              sx={{
                position: "sticky",
                top: 0,
                background: theme =>
                  theme.palette.mode === "dark" ? DESIGN_SYSTEM_COLORS.notebookG900 : DESIGN_SYSTEM_COLORS.gray100,
              }}
            >
              <TableRow>
                <TableCell>{selectedGranularity === "Week" ? "2-Weeks" : selectedGranularity}</TableCell>
                <TableCell>Hours Tracked</TableCell>
                <TableCell>Paid</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filterData().map((entry: any, index: number) => (
                <TableRow key={index}>
                  {(periods[entry - 1]?.label || selectedGranularity !== "Week") && (
                    <TableCell>{selectedGranularity === "Week" ? periods[entry - 1]?.label : entry}</TableCell>
                  )}
                  {(periods[entry - 1]?.label || selectedGranularity !== "Week") && (
                    <TableCell>{roundNum(getHoursTracked(entry))}</TableCell>
                  )}

                  {(periods[entry - 1]?.label || selectedGranularity !== "Week") && (
                    <TableCell>
                      {isPaid(entry) ? (
                        <Checkbox
                          checked={true}
                          onChange={() => togglePaidStatus(entry, false)}
                          disabled={!adminView || roundNum(getHoursTracked(entry)) === 0}
                          sx={{
                            "&.Mui-disabled": {
                              color: "green",
                            },
                            "& .MuiSvgIcon-root": {
                              color: !adminView || roundNum(getHoursTracked(entry)) === 0 ? "green" : "primary.main",
                            },
                          }}
                        />
                      ) : (
                        <Checkbox
                          checked={false}
                          onChange={() => togglePaidStatus(entry, true)}
                          disabled={!adminView || roundNum(getHoursTracked(entry)) === 0}
                          sx={{
                            "&.Mui-disabled": {
                              color: "gray",
                            },
                            "& .MuiSvgIcon-root": {
                              color: !adminView || roundNum(getHoursTracked(entry)) === 0 ? "gray" : "primary.main",
                            },
                          }}
                        />
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default StudentDetailHoursTracking;
