// import "./SidebarTabs.css";

// import { TabPanel } from "@mui/lab";
// import Tab from "@material-ui/core/Tab";
// import Tabs from "@material-ui/core/Tabs";
// import { TabPanelProps } from "@mui/lab";
import { Box, Tab, Tabs /* Typography */ } from "@mui/material";
import React /* useCallback ,*/ /* useState */ from "react";

// import { a11yProps, TabPanel } from "./TabPanel/TabPanel";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const SidebarTabs = (props: any) => {
  // const [tabIndex, setTabIndex] = useState(0);

  const [value, setValue] = React.useState(0);

  // const tabChange = useCallback((event, newIndex) => {
  //   setTabIndex(newIndex);
  // }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div id="SidebarTabsContainer">
      {/* <Tabs
        value={tabIndex}
        onChange={tabChange}
        variant="fullWidth"
        aria-label={props.tabsTitle + " Tabs"}
      >
        {props.tabsItems.map((tabItem, idx) => (
          <Tab key={tabItem.title} label={tabItem.title} {...a11yProps(idx)} />
        ))}
      </Tabs>
      {props.tabsItems.map((tabItem, idx) => (
        <TabPanel className="TabPannel" key={tabItem.title} value={tabIndex} index={idx}>
          {tabItem.content}
        </TabPanel>
      ))} 
      */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={value} onChange={handleChange} aria-label={props.tabsTitle + " Tabs"}>
          {props.tabsItems.map((tabItem: any, idx: number) => (
            <Tab key={tabItem.title} label={tabItem.title} {...a11yProps(idx)} />
          ))}
        </Tabs>
      </Box>
      {props.tabsItems.map((tabItem: any, idx: number) => (
        // <TabPanel className="TabPannel" key={tabItem.title} value={tabIndex} index={idx}>
        //   {tabItem.content}
        // </TabPanel>
        <TabPanel key={idx} value={value} index={idx}>
          {tabItem.content}
        </TabPanel>
      ))}
      {/* <TabPanel value={value} index={0}>
        Item One
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
      <TabPanel value={value} index={2}>
        Item Three
      </TabPanel> */}
    </div>
  );
};

// export default React.memo(SidebarTabs);
export const MemoizedSidebarTabs = React.memo(SidebarTabs);

export const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}
