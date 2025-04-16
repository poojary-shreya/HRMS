import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Menu,
  MenuItem,
  Container,
  Divider,
  ListItemIcon,
  Badge,
  IconButton,
  ListItemText,
  List,
  ListItem,
  Avatar,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

import img from "../assets/bdot-removebg-preview.png";

const getNotifications = () => {
  try {
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    return notifications;
  } catch (error) {
    console.error("Error parsing notifications from localStorage:", error);
    return [];
  }
};

const saveNotification = (notification) => {
  const notifications = getNotifications();
  notifications.push(notification);
  localStorage.setItem("notifications", JSON.stringify(notifications));
};

const rolePermissions = {
  hr: ["recruitment", "employeeManagement", "employeeRequest", "payroll", "leave", "attendance", "performance", "training"],
  manager: ["recruitment", "employeeManagement", "leave", "attendance", "performance", "payroll"],
  employee: ["employeeManagement", "employeeRequest", "leave", "performance", "attendance", "payroll", "recruitment", "training"],
};

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role")?.toLowerCase();
  const isLoggedIn = !!token;
  const role = userRole || null;

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [employeeManagementAnchor, setEmployeeManagementAnchor] = useState(null);
  const [addEmployeeAnchor, setAddEmployeeAnchor] = useState(null);
  const [viewEmployeeAnchor, setViewEmployeeAnchor] = useState(null);
  const [payrollAnchor, setPayrollAnchor] = useState(null);
  const [employeeRequestAnchor, setEmployeeRequestAnchor] = useState(null);
  const [leaveAnchor, setLeaveAnchor] = useState(null);
  const [trainingAnchor, setTrainingAnchor] = useState(null);
  const [taxAnchor, setTaxAnchor] = useState(null);
  const [performanceAnchor, setPerformanceAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [attendanceAnchor, setAttendanceAnchor] = useState(null);
  const [form16, setform16]=useState(null);

  const handleMenuOpen = (event, setter) => setter(event.currentTarget);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(getNotifications().filter((n) => !n.read));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (notificationId) => {
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem("notifications", JSON.stringify(updated));
    setNotifications(updated);
  };

  const handleCloseMenus = () => {
    setMenuAnchor(null);
    setEmployeeManagementAnchor(null);
    setAddEmployeeAnchor(null);
    setViewEmployeeAnchor(null);
    setPayrollAnchor(null);
    setEmployeeRequestAnchor(null);
    setLeaveAnchor(null);
    setTrainingAnchor(null);
    setTaxAnchor(null);
    setPerformanceAnchor(null);
    setform16(null);
    setAttendanceAnchor(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const handleNavigation = (path, feature) => {
    handleCloseMenus();
    const currentToken = localStorage.getItem("token");
    const currentRole = localStorage.getItem("role")?.toLowerCase();

    if (!currentToken) {
      localStorage.setItem("redirectPath", path);
      localStorage.setItem("requiredFeature", feature);
      navigate("/login");
    } else {
      const allowedFeatures = rolePermissions[currentRole] || [];
      if (allowedFeatures.includes(feature)) {
        navigate(path);
      } else {
        alert("You don't have access to this feature!");
      }
    }
  };

  const isManager = role === "manager" || role === "hr";
  const isHR = role === "hr";
  const isEmployee = role === "employee";

  return (
    <AppBar position="sticky" sx={{ bgcolor: "#B2D8E9", top: 0, zIndex: 1100 }}>
     
      <Container maxWidth="xl">
        <Toolbar sx={{ padding: "0.3rem 0" }}>
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, gap: 0.7 }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              <img src={img} alt="HR Logo" style={{ height: "40px", cursor: "pointer", backgroundColor:"#B2D8E9",}} />
            </Link>

            <Button color="inherit" onClick={(e) => handleMenuOpen(e, setMenuAnchor)} sx={{ color: "black" }} endIcon={<KeyboardArrowDownIcon />}>
              Recruitment & Onboarding
            </Button>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleCloseMenus}>
              {isHR ? (
                <>
                  <MenuItem onClick={() => handleNavigation("/job-posting", "recruitment")}>Job Posting</MenuItem>
                  <MenuItem onClick={() => handleNavigation("/jobview", "recruitment")}>Job View</MenuItem>
                  <MenuItem onClick={() => handleNavigation("/candidates", "recruitment")}>Candidate Filter</MenuItem>
                  <MenuItem onClick={() => handleNavigation("/interview-scheduling", "recruitment")}>Interview Scheduling</MenuItem>
                  <MenuItem onClick={() => handleNavigation("/status", "recruitment")}>Interview Status</MenuItem>
                  <MenuItem onClick={() => handleNavigation("/offer", "recruitment")}>Offer Management</MenuItem>
                  <MenuItem onClick={() => handleNavigation("/onboarding", "recruitment")}>Onboarding Processes</MenuItem>
                  <MenuItem onClick={() => handleNavigation("/OnboardingList", "recruitment")}> OnboardingList </MenuItem>
                 
                </>
              ) : isEmployee ? (
               
                <>
                  
                  <MenuItem onClick={() => handleNavigation("/upload", "recruitment")}> upload </MenuItem>
                </>
              ) : (
                
                <>
                  <MenuItem onClick={() => handleNavigation("/jobview", "recruitment")}>Job View</MenuItem>
                </>
              )}
            </Menu>


            <Button color="inherit" onClick={(e) => handleMenuOpen(e, setEmployeeManagementAnchor)} sx={{ color: "black" }} endIcon={<KeyboardArrowDownIcon />}>
              Employee Management
            </Button>
            <Menu anchorEl={employeeManagementAnchor} open={Boolean(employeeManagementAnchor)} onClose={handleCloseMenus}>

              <MenuItem onClick={(e) => handleMenuOpen(e, setAddEmployeeAnchor)}>Add Employee</MenuItem>
              <Menu anchorEl={addEmployeeAnchor} open={Boolean(addEmployeeAnchor)} onClose={handleCloseMenus} PaperProps={{ sx: { ml: 18 } }} endIcon={<KeyboardArrowDownIcon sx={{ color: 'black' }} />}>
                <MenuItem onClick={() => handleNavigation("/addpersonal", "employeeManagement")}>Add Personal Details</MenuItem>
                <MenuItem onClick={() => handleNavigation("/addfinancial", "employeeManagement")}>Add Financial Details</MenuItem>
                <MenuItem onClick={() => handleNavigation("/addrole", "employeeManagement")}>Add Roles</MenuItem>
              </Menu>

             


              <MenuItem onClick={(e) => handleMenuOpen(e, setViewEmployeeAnchor)}>View Employees</MenuItem>
              <Menu anchorEl={viewEmployeeAnchor} open={Boolean(viewEmployeeAnchor)} onClose={handleCloseMenus} PaperProps={{ sx: { ml: 18 } }} endIcon={<KeyboardArrowDownIcon sx={{ color: 'black' }} />}>
                <MenuItem onClick={() => handleNavigation("/viewpersonal", "employeeManagement")}>View Personal Details</MenuItem>
                <MenuItem onClick={() => handleNavigation("/viewfinancial", "employeeManagement")}>View Financial Details</MenuItem>
                <MenuItem onClick={() => handleNavigation("/viewrole", "employeeManagement")}>View Roles</MenuItem>
              </Menu>
              <MenuItem key="payroll-calc" onClick={() => handleNavigation("/search", "employeeManagement")}>Search Employees</MenuItem>
            </Menu>
           
           
              



            <Button
        color="inherit"
        onClick={(e) => handleMenuOpen (e, setPayrollAnchor)}
        sx={{ color: "black" }}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Payroll
      </Button>

      <Menu anchorEl={payrollAnchor} open={Boolean(payrollAnchor)} onClose={handleCloseMenus}>
  {role === "hr"
    ? [
        <MenuItem key="company-details" onClick={() => handleNavigation("/companydetails", "payroll")}>Company Account Details</MenuItem>,
        <MenuItem key="upload-ctc" onClick={() => handleNavigation("/upload-salary", "payroll")}>Upload CTC details</MenuItem>,
        <MenuItem key="view-doc" onClick={() => handleNavigation("/view-document", "payroll")}>View Document</MenuItem>,
        <MenuItem key="payroll-calc" onClick={() => handleNavigation("/payroll-calculation", "payroll")}>Payroll Calculation</MenuItem>,
        <MenuItem key="generate-payslip" onClick={() => handleNavigation("/generate-payslip", "payroll")}>Generate Payslip</MenuItem>,
        <MenuItem key="form16" onClick={(e) => handleMenuOpen(e, setform16)}>Form16</MenuItem>,
        <Menu
        key="form16-submenu"
          anchorEl={form16}
          open={Boolean(form16)}
          onClose={handleCloseMenus}
          PaperProps={{
            style: {
              marginLeft: "196px", 
            },
          }}
        >
        <MenuItem key="form-16A" onClick={() => handleNavigation("/form16-partA", "payroll")}>Form16(Part A)</MenuItem>
        <MenuItem key="form-16B" onClick={() => handleNavigation("/form16-partB", "payroll")}>Form16(Part B)</MenuItem>

        </Menu>,
        <MenuItem key="tax" onClick={(e) => handleMenuOpen(e, setTaxAnchor)}>Tax</MenuItem>,
        <Menu
          key="tax-submenu"
          anchorEl={taxAnchor}
          open={Boolean(taxAnchor)}
          onClose={handleCloseMenus}
          PaperProps={{
            style: {
              marginLeft: "146px", 
            },
          }}
        >
          <MenuItem onClick={() => handleNavigation("/monthly-tax-specific", "payroll")}>Monthly Tax (Specific Employee)</MenuItem>
          <MenuItem onClick={() => handleNavigation("/yearly-tax-specific", "payroll")}>Yearly Tax (Specific Employee)</MenuItem>
          <MenuItem onClick={() => handleNavigation("/monthly-tax-all", "payroll")}>Monthly Tax Paid (All Employee)</MenuItem>
          <MenuItem onClick={() => handleNavigation("/yearly-tax-all", "payroll")}>Yearly Tax Paid (All Employee)</MenuItem>
        </Menu>,
      ]
    : [
        <MenuItem key="submit-doc" onClick={() => handleNavigation("/submit-document", "payroll")}>Submit Financial Document</MenuItem>,
        <MenuItem key="projected-tax" onClick={() => handleNavigation("/projected-tax", "payroll")}>Projected Tax</MenuItem>,
        <MenuItem key="view-payslip" onClick={() => handleNavigation("/view-payslip", "payroll")}>Employee Payslip</MenuItem>,
        <MenuItem key="getForm16" onClick={() => handleNavigation("/form16", "payroll")}>Form 16</MenuItem>,
      ]}
</Menu>



<Button 
        color="inherit" 
        onClick={(e) => handleMenuOpen(e, setEmployeeRequestAnchor)} 
        sx={{ color: "black" }} 
        endIcon={<KeyboardArrowDownIcon />}
      >
        Employee Request
      </Button>

      <Menu 
        anchorEl={employeeRequestAnchor} 
        open={Boolean(employeeRequestAnchor)} 
        onClose={handleCloseMenus}
      >
    
        {role === "employee" && (
          <>
            <MenuItem onClick={() => handleNavigation("/bonafied", "employeeRequest")}>
              Bonafide
            </MenuItem>
          
            <MenuItem onClick={() => handleNavigation("/advancesalary", "employeeRequest")}>
              Advance Salary
            </MenuItem>
            <MenuItem onClick={() => handleNavigation("/certificate", "employeeRequest")}>
              View certificates
            </MenuItem>
            
          </>
        )}

      
        {role === "hr" && (
          <>
            <MenuItem onClick={() => handleNavigation("/bonafiedlist", "employeeRequest")}>
              Bonafide Request List
            </MenuItem>
            <MenuItem onClick={() => handleNavigation("/salaryrequest", "employeeRequest")}>
              Advance Salary Request List
            </MenuItem>
          </>
        )}
      </Menu>


            <Button
  color="inherit"
  onClick={(e) => handleMenuOpen(e, setLeaveAnchor)}
  sx={{ color: "black" }}
  endIcon={<KeyboardArrowDownIcon />}
>
  Leave
</Button>
<Menu
  anchorEl={leaveAnchor}
  open={Boolean(leaveAnchor)}
  onClose={handleCloseMenus}
>
  {isManager ? (
    <MenuItem onClick={() => handleNavigation("/manager", "leave")}>
      Manage Leave Requests
    </MenuItem>
  ) : (
    <MenuItem onClick={() => handleNavigation("/leave", "leave")}>
      Apply for Leave
    </MenuItem>
  )}
</Menu>


<Button color="inherit" 
            onClick={(e)=>handleMenuOpen (e,setAttendanceAnchor)}
            sx={{ color: "black" }}
        endIcon={<KeyboardArrowDownIcon />}>
              Attendance
            </Button>
            <Menu anchorEl={attendanceAnchor} open={Boolean(attendanceAnchor)} onClose={handleCloseMenus}>
              {role==="employee"?
              [
                <MenuItem key="manualentry" onClick={()=> handleNavigation("/manual-entry","attendance")}>Manual Entry</MenuItem>
              ]:[
                <MenuItem key="attendance" onClick={()=> handleNavigation("/attendance","attendance")}>Attendance List</MenuItem>

              ]}

            </Menu>
            <Button
  color="inherit"
  onClick={(e) => handleMenuOpen(e, setPerformanceAnchor)}
  sx={{ color: "black" }}
  endIcon={<KeyboardArrowDownIcon />}
>
  Performance
</Button>

<Menu
  anchorEl={performanceAnchor}
  open={Boolean(performanceAnchor)}
  onClose={handleCloseMenus}
>
  {isManager ? (
    <MenuItem onClick={() => 
      handleNavigation("/performance", "performance")}
    >
      Performance Management
    </MenuItem>
  ) : (
    <MenuItem onClick={() =>  
      handleNavigation("/view", "performance")}
    >
      View Performance
    </MenuItem>
  )}
</Menu>


           
           
              <Button color="inherit" onClick={(e) => handleMenuOpen(e, setTrainingAnchor)} sx={{ color: "black" }} endIcon={<KeyboardArrowDownIcon />}>
                Training
              </Button>
           
            <Menu anchorEl={trainingAnchor} open={Boolean(trainingAnchor)} onClose={handleCloseMenus}>
          
              {isHR ? (
                <>
                  <MenuItem onClick={() => handleNavigation("/training", "training")}>Knowledge Management</MenuItem>
                  <MenuItem onClick={() => handleNavigation("/trainings", "training")}>Training List</MenuItem>
                  {/* <MenuItem onClick={() => handleNavigation("/details", "training")}>Training details</MenuItem> */}
                  <MenuItem onClick={() => handleNavigation("/video", "training")}>Add videos</MenuItem>
                  <MenuItem onClick={() => handleNavigation("/test", "training")}>Add test</MenuItem>
                </>
              ) : isEmployee ? (
                <>
              
                  <MenuItem onClick={() => handleNavigation("/updatetraining", "training")}>View training</MenuItem>
                </>
              ) : (
             
                <MenuItem onClick={() => handleNavigation("/trainings", "training")}>Training List</MenuItem>
              )}
            </Menu>
          </Box>

          {(
  <IconButton 
    color="inherit"
    onClick={(e) => isLoggedIn && userRole === 'hr' ? setNotificationAnchor(e.currentTarget) : null}
  >
    <Badge 
      badgeContent={isLoggedIn && userRole === 'hr' ? notifications.filter(n => !n.read).length : 0} 
      color="error"
    >
      <NotificationsIcon sx={{ color: "black" }} />
    </Badge>
  </IconButton>
)}

{isLoggedIn && userRole === 'hr' && (
  <Menu
    anchorEl={notificationAnchor}
    open={Boolean(notificationAnchor)}
    onClose={() => setNotificationAnchor(null)}
  >
    <List sx={{ width: 300 }}>
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <ListItem 
            key={notification.id}
            button
            onClick={() => {
              handleNotificationClick(notification.id);
              navigate(notification.link);
            }}
          >
            <ListItemIcon>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <NotificationsIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={notification.message}
              secondary={new Date(notification.date).toLocaleString()}
              sx={{ 
                textDecoration: notification.read ? 'none' : 'underline',
                fontWeight: notification.read ? 400 : 600
              }}
            />
          </ListItem>
        ))
      ) : (
        <ListItem>
          <ListItemText primary="No new notifications" />
        </ListItem>
      )}
    </List>
  </Menu>
)}


          {isLoggedIn ? (
            <Button color="inherit" onClick={handleLogout} sx={{ color: "black", }}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" component={Link} to="/login" sx={{ color: "black" }}>
              Login
            </Button>
          )}

          
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;