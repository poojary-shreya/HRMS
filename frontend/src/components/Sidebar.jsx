import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  Collapse,
  Divider,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  Dashboard as DashboardIcon,
  Work as RecruitmentIcon,
  People as PeopleIcon,
  MonetizationOn as PayrollIcon,
  RequestPage as RequestIcon,
  EventNote as LeaveIcon,
  AccessTime as AttendanceIcon,
  School as TrainingIcon,
  Assessment as PerformanceIcon,
  PersonAdd as AddPersonIcon,
  Notifications as NotificationsIcon,
  Receipt as Form16Icon,
  Visibility as ViewIcon,
  KeyboardArrowDown,
  KeyboardArrowUp,Search
} from '@mui/icons-material';
import PaymentsIcon from '@mui/icons-material/Payments';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role")?.toLowerCase();
  const isLoggedIn = !!token;
  const role = userRole || null;
  const [notifications, setNotifications] = useState([]);

  const [openMenus, setOpenMenus] = useState({
    recruitment: false,
    employeeManagement: false,
    payroll: false,
    employeeRequest: false,
    leave: false,
    attendance: false,
    performance: false,
    training: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const storedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
        setNotifications(storedNotifications.filter((n) => !n.read));
      } catch (error) {
        console.error("Error parsing notifications:", error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

 
  if (!isLoggedIn) {
    return null;
  }

  const toggleSidebar = () => {
    setOpen(!open);
  };

  const handleMenuToggle = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const rolePermissions = {
    hr: ["recruitment", "employeeManagement", "employeeRequest", "payroll", "leave", "attendance", "performance", "training"],
    manager: ["recruitment", "employeeManagement", "leave", "attendance", "performance", "payroll"],
    employee: ["employeeManagement", "employeeRequest", "leave", "performance", "attendance", "payroll", "recruitment","training"],
  };

  const isHR = role === "hr";
  const isManager = role === "manager" || role === "hr";
  const isEmployee = role === "employee";

  const getMenuItems = () => {
    const items = [];

   
    if (rolePermissions[role]?.includes("recruitment")) {
      items.push({
        title: "Recruitment & Onboarding",
        icon: <RecruitmentIcon />,
        key: "recruitment",
        submenu: isHR ? [
          { name: "Job Posting", path: "/job-posting" },
          { name: "Job View", path: "/jobview" },
          { name: "Candidate Filter", path: "/candidates" },
          { name: "Interview Scheduling", path: "/interview-scheduling" },
          { name: "Interview Status", path: "/status" },
          { name: "Offer Management", path: "/offer" },
          { name: "Onboarding Processes", path: "/onboarding" },
          { name: "Onboarding List", path: "/OnboardingList" }
        ] : isEmployee ? [
         
          { name: "Upload Documents", path: "/upload" }
        ] : [
         
        ]
      });
    }

 
if (rolePermissions[role]?.includes("employeeManagement")) {
  items.push({
    title: "Employee Management",
    icon: <PeopleIcon />,
    key: "employeeManagement",
    submenu: role === "hr" ? [
      { 
        name: "Add Employee", 
        path: null,
        icon: <AddPersonIcon />,
        submenu: [
          { name: "Add Personal Details", path: "/addpersonal" },
          { name: "Add Financial Details", path: "/addfinancial" },
          { name: "Add Roles", path: "/addrole" }
        ]
      },
      { 
        name: "View Employees", 
        path: null,
        icon: <ViewIcon />,
        submenu: [
          { name: "View Personal Details", path: "/viewpersonal" },
          { name: "View Financial Details", path: "/viewfinancial" },
          { name: "View Roles", path: "/viewrole" }
        ]
      },
      { 
        name: "Search Employees", 
        path: "/search",
        icon: <Search />
      }
    ] : role === "employee" ? [
      { name: "Employee Profile", path: "/employee" },
     
    ] 
  :[]
  })
}


   
    if (rolePermissions[role]?.includes("payroll")) {
      items.push({
        title: "Payroll",
        icon: <PayrollIcon />,
        key: "payroll",
        submenu: role === "hr" ? [
          { name: "Company Account Details", path: "/companydetails" },
          { name: "Upload CTC details", path: "/upload-salary" },
          { name: "View Document", path: "/view-document" },
          { name: "Payroll Calculation", path: "/payroll-calculation" },
          { name: "Generate Payslip", path: "/generate-payslip" },
          { 
            name: "Form16", 
            path: null,
            icon: <Form16Icon />,
            submenu: [
              { name: "Form16 (Part A)", path: "/form16-partA" },
              { name: "Form16 (Part B)", path: "/form16-partB" }
            ]
          },
          {name:"Form12BB", path:"/viewform12bb"},
          { 
            name: "Tax", 
            path: null,
            icon:<PaymentsIcon/>,
            submenu: [
              { name: "Monthly Tax (Specific)", path: "/monthly-tax-specific" },
              { name: "Yearly Tax (Specific)", path: "/yearly-tax-specific" },
              { name: "Monthly Tax (All)", path: "/monthly-tax-all" },
              { name: "Yearly Tax (All)", path: "/yearly-tax-all" }
            ]
          }
        ] : role==="manager"?[
          {name:"Claims",path:"/viewclaims"}
        ]:
         [
          { name: "View CTC Details", path: "/view-ctc" },
          { name: "Submit Financial Document", path: "/submit-document" },
          { name: "Projected Tax", path: "/projected-tax" },
          { name: "Employee Payslip", path: "/view-payslip" },
          { name: "Form 16", path: "/form16" },
          {name: "Form12BB", path:"/form12bb"},
          {name: "Claims", path:"/claims"},

        ]
      });
    }

   
    if (rolePermissions[role]?.includes("employeeRequest")) {
      items.push({
        title: "Employee Request",
        icon: <RequestIcon />,
        key: "employeeRequest",
        submenu: role === "employee" ? [
          { name: "Bonafide", path: "/bonafied" },
          { name: "Advance Salary", path: "/advancesalary" },
          { name: "View certificates", path: "/certificate" }
        ] : role === "hr" ? [
          { name: "Bonafide Request List", path: "/bonafiedlist" },
          { name: "Advance Salary Request List", path: "/salaryrequest" }
        ] : []
      });
    }

    
    if (rolePermissions[role]?.includes("leave")) {
      items.push({
        title: "Leave",
        icon: <LeaveIcon />,
        key: "leave",
        submenu: isManager ? [
          { name: "Manage Leave Requests", path: "/manager" }
        ] : [
          { name: "Apply for Leave", path: "/leave" }
        ]
      });
    }

  
    if (rolePermissions[role]?.includes("attendance")) {
      items.push({
        title: "Attendance",
        icon: <AttendanceIcon />,
        key: "attendance",
        submenu: role === "employee" ? [
          { name: "Manual Entry", path: "/manual-entry" }
        ] : [
          { name: "Attendance List", path: "/attendance" }
        ]
      });
    }

   
    if (rolePermissions[role]?.includes("performance")) {
      items.push({
        title: "Performance",
        icon: <PerformanceIcon />,
        key: "performance",
        submenu: isManager ? [
          { name: "Performance Management", path: "/performance" }
        ] : [
          { name: "View Performance", path: "/viewreview" }
        ]
      });
    }

 
    if (rolePermissions[role]?.includes("training")) {
      items.push({
        title: "Training",
        icon: <TrainingIcon />,
        key: "training",
        submenu: role === "hr" ? [
          { name: "Knowledge Management", path: "/training" },
          { name: "Training List", path: "/trainings" },
             { name: "Add videos", path: "/video" },
          { name: "Add test", path: "/test" }
        ] : role === "employee" ? [
          { name: "View training", path: "/updatetraining" }
      ]:[]
      });
    }

    return items;
  };


  const renderNestedSubmenu = (submenuItems, parentPath = "") => {
    return submenuItems.map((subItem) => {
      if (subItem.submenu) {
        return (
          <React.Fragment key={subItem.name}>
            <ListItem
              button
              sx={{
                pl: open ? 6 : 2,
                '&:hover': { backgroundColor: '#dee3dc' },
                backgroundColor: 'transparent',
                justifyContent: open ? 'flex-start' : 'center',
                color: 'black'
              }}
              onClick={() => handleMenuToggle(`${subItem.name.replace(/\s+/g, '')}`)}
            >
              {subItem.icon && (
                <ListItemIcon 
                  sx={{ 
                    minWidth: open ? 30 : 'auto', 
                    justifyContent: 'center', 
                    color: 'inherit',
                    '& .MuiSvgIcon-root': { 
                      fontSize: '1.2rem' 
                    }
                  }}
                >
                  {subItem.icon}
                </ListItemIcon>
              )}
              <ListItemText 
                primary={open ? subItem.name : ''} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    color: 'black'
                  } 
                }}
              />
              {open && (openMenus[`${subItem.name.replace(/\s+/g, '')}`] ? <KeyboardArrowUp /> : <KeyboardArrowDown />)}
            </ListItem>
            <Collapse in={open && openMenus[`${subItem.name.replace(/\s+/g, '')}`]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {subItem.submenu.map((nestedItem) => (
                  <ListItem
                    key={nestedItem.name}
                    button
                    component={Link}
                    to={nestedItem.path}
                    sx={{
                      pl: open ? 11 : 2,
                      '&:hover': { backgroundColor: '#dee3dc' },
                      backgroundColor: location.pathname === nestedItem.path ? '#d5e2e5' : 'transparent',
                      justifyContent: open ? 'flex-start' : 'center',
                      color: 'black',
                      textDecoration: 'none',
                      '& .MuiListItemText-root': { 
                        color: 'black'
                      }
                    }}
                  >
                    {nestedItem.icon && (
                      <ListItemIcon 
                        sx={{ 
                          minWidth: open ? 30 : 'auto', 
                          justifyContent: 'center', 
                          color: 'inherit',
                          '& .MuiSvgIcon-root': { 
                            fontSize: '1.2rem' 
                          }
                        }}
                      >
                        {nestedItem.icon}
                      </ListItemIcon>
                    )}
                    <ListItemText 
                      primary={open ? nestedItem.name : ''} 
                      sx={{ 
                        '& .MuiTypography-root': { 
                          color: 'black'
                        } 
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        );
      } else {
        return (
          <ListItem
            key={subItem.name}
            button
            component={Link}
            to={subItem.path}
            sx={{
              pl: open ? 8 : 2,
              '&:hover': { backgroundColor: '#dee3dc' },
              backgroundColor: location.pathname === subItem.path ? '#d5e2e5' : 'transparent',
              justifyContent: open ? 'flex-start' : 'center',
              color: 'black',
              textDecoration: 'none',
              '& .MuiListItemText-root': { 
                color: 'black'
              }
            }}
          >
            {subItem.icon && (
              <ListItemIcon 
                sx={{ 
                  minWidth: open ? 30 : 'auto', 
                  justifyContent: 'center', 
                  color: 'inherit',
                  '& .MuiSvgIcon-root': { 
                    fontSize: '1.2rem' 
                  }
                }}
              >
                {subItem.icon}
              </ListItemIcon>
            )}
            <ListItemText 
              primary={open ? subItem.name : ''} 
              sx={{ 
                '& .MuiTypography-root': { 
                  color: 'black'
                } 
              }}
            />
          </ListItem>
        );
      }
    });
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? 290 : 72,
        flexShrink: 0,
        boxSizing: 'border-box',
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: open ? 290 : 72,
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          overflowY: 'auto', 
          marginTop: "70px",
          backgroundColor: '#f0f4f8',
          borderRight: '1px solid #e0e0e0',
          height: 'calc(100vh - 70px)',
          '&::-webkit-scrollbar': {
            width: '1px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#f0f4f8',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#f0f4f8',
          }
        },
        '& a': {
          color: 'black',
          textDecoration: 'none'
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: open ? 'space-between' : 'center', 
          p: 1,
          position: 'sticky',
          top: 0,
          backgroundColor: '#f0f4f8',
          zIndex: 1,
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <IconButton onClick={toggleSidebar}>
          {open ? <ChevronLeft /> : <MenuIcon />}
        </IconButton>
      </Box>

      <List sx={{ pb: 8 }}> 
        {getMenuItems().map((item) => (
          <React.Fragment key={item.key}>
            <ListItem
              button
              onClick={() => handleMenuToggle(item.key)}
              sx={{
                backgroundColor: 'transparent',
                '&:hover': { backgroundColor: '#dee3dc' },
                justifyContent: open ? 'flex-start' : 'center',
                color: 'black'
              }}
            >
              <ListItemIcon sx={{ minWidth: open ? 30 : 'auto', justifyContent: 'center', color: 'inherit',
                '& .MuiSvgIcon-root': { 
      fontSize: '1.3rem' 
    }
               }}>
                {item.icon}
              </ListItemIcon>
              {open && <ListItemText 
                primary={item.title} 
                sx={{ 
                  '& .MuiTypography-root': { 
                    color: 'black'
                  } 
                }}
              />}
              {open && (openMenus[item.key] ? <KeyboardArrowUp /> : <KeyboardArrowDown />)}
            </ListItem>
            <Collapse in={open && openMenus[item.key]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {renderNestedSubmenu(item.submenu)}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;