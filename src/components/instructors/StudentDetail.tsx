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
import React, { useEffect, useState } from "react";
import { roundNum } from "src/utils/common.utils";

import { useAuth } from "@/context/AuthContext";
import { DESIGN_SYSTEM_COLORS } from "@/lib/theme/colors";

const StudentDetail = ({ uname }: { uname: string; user: any }) => {
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
      if (uname !== user?.uname && !adminView && !leading.includes(data.semesterId)) return;
      setTrackingData(sortedData);

      // Extract available months, days, and weeks from the data
      const monthsSet = new Set<string>();
      const daysSet = new Set<string>();
      const weeksSet = new Set<number>();
      const weekStartDate = moment("09-06-2024", "DD-MM-YYYY");
      weekStartDate.startOf("week"); // Set to the start of the week (Sunday)

      sortedData.forEach((entry: any) => {
        // Convert date string to Date object
        const date = moment(entry.day, "DD-MM-YYYY");
        // Get month name
        const monthName = date.format("MMMM");
        monthsSet.add(monthName);
        // Get formatted date
        const formattedDate = date.format("MM/DD/YYYY");
        daysSet.add(formattedDate);
        // Calculate week number based on the first tracking date
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
  function getWeekNumberFromStart(startDate: Date, currentDate: Date): number {
    const millisecondsInDay = 86400000; // 1000 * 60 * 60 * 24
    const millisecondsInWeek = 14 * millisecondsInDay;

    const diffInMilliseconds = currentDate.getTime() - startDate.getTime();
    const weekNumber = Math.floor(diffInMilliseconds / millisecondsInWeek) + 1;

    return weekNumber;
  }

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
      const startWeek = moment("09-06-2024", "DD-MM-YYYY");
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
    return trackingData.some(entry => {
      const startWeek = moment("09-06-2024", "DD-MM-YYYY");
      const date = moment(entry.day, "DD-MM-YYYY");
      const formattedDay = date.format("MM/DD/YYYY");
      const monthName = date.format("MMMM");
      switch (selectedGranularity) {
        case "Month":
          return monthName === granularity && entry.paid;
        case "Day":
          return formattedDay === granularity && entry.paid;
        case "Week":
          return getWeekNumberFromStart(startWeek.toDate(), date.toDate()) === parseInt(granularity) && entry.paid;
        default:
          return false;
      }
    });
  };

  // Function to toggle paid status
  const togglePaidStatus = async (granularity: string) => {
    const batch = writeBatch(db);

    trackingData.forEach(entry => {
      let shouldUpdate = false;
      const startWeek = moment("09-06-2024", "DD-MM-YYYY");
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
        batch.update(docRef, { paid: !entry.paid });
      }
    });

    await batch.commit();
  };

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
          {adminView && (
            <Link href="/tracking">
              <Button variant="contained" color="primary" sx={{ mt: "15px" }}>
                <ArrowBackIcon />
              </Button>
            </Link>
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar src={currentStudent.imageUrl} alt={currentStudent.fullName} />
            <Typography variant="h4" gutterBottom sx={{ ml: "5px" }}>
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
                  <TableCell>{entry}</TableCell>
                  <TableCell>{roundNum(getHoursTracked(entry))}</TableCell>

                  <TableCell>
                    <Checkbox
                      checked={isPaid(entry)}
                      onChange={() => togglePaidStatus(entry)}
                      disabled={!adminView || roundNum(getHoursTracked(entry)) === 0}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default StudentDetail;
