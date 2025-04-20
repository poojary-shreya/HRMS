// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Box,
//   Typography,
//   Paper,
//   Grid,
//   TextField,
//   Button,
//   CircularProgress,
//   InputAdornment,
//   IconButton,
//   Divider,
//   Avatar,
//   Chip,
//   Card,
//   CardContent,
//   Tooltip
// } from "@mui/material";
// import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
// import SearchIcon from '@mui/icons-material/Search';
// import BusinessIcon from '@mui/icons-material/Business';
// import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
// import EditIcon from '@mui/icons-material/Edit';
// import WorkIcon from '@mui/icons-material/Work';
// import BadgeIcon from '@mui/icons-material/Badge';
// import EmailIcon from '@mui/icons-material/Email';
// import PhoneIcon from '@mui/icons-material/Phone';
// import LocationOnIcon from '@mui/icons-material/LocationOn';

// const SearchEmployee = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [hierarchyPath, setHierarchyPath] = useState([]);
//   const [subordinates, setSubordinates] = useState([]);
//   const [apiLoading, setApiLoading] = useState(true);
//   const [expandedNodes, setExpandedNodes] = useState({});

 
//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         setApiLoading(true);
       
//         const response = await axios.get('http://localhost:5000/api/employees');
        
      
//         const employeeData = response.data.success 
//           ? response.data.data 
//           : (Array.isArray(response.data) ? response.data : []);
        
//         setEmployees(employeeData);
//         setApiLoading(false);
//       } catch (error) {
//         console.error("Error fetching employees:", error);
//         setErrorMessage("Failed to load employee data. Please try again later.");
//         setApiLoading(false);
//       }
//     };
//     fetchEmployees();
//   }, []);

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) {
//       setErrorMessage("Please enter an employee ID or name to search");
//       return;
//     }

//     try {
//       setLoading(true);
//       setErrorMessage("");
//       setSelectedEmployee(null);
//       setHierarchyPath([]);
//       setSubordinates([]);
//       setExpandedNodes({});

     
//       const foundEmployee = employees.find(emp => 
//         emp.employee_id.toLowerCase() === searchQuery.toLowerCase() ||
//         `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (emp.companyemail && emp.companyemail.toLowerCase().includes(searchQuery.toLowerCase()))
//       );

//       if (foundEmployee) {
//         setSelectedEmployee(foundEmployee);
//         buildHierarchyPath(foundEmployee);
//         findSubordinates(foundEmployee.employee_id);
//       } else {
       
//         try {
//           const response = await axios.get(`http://localhost:5000/api/search-employee?query=${encodeURIComponent(searchQuery)}`);
          
//           if (response.data.success && response.data.data) {
//             const apiEmployee = response.data.data;
//             setSelectedEmployee(apiEmployee);
            
          
//             if (!employees.some(e => e.employee_id === apiEmployee.employee_id)) {
//               setEmployees(prev => [...prev, apiEmployee]);
//             }
            
//             buildHierarchyPath(apiEmployee);
//             findSubordinates(apiEmployee.employee_id);
//           } else {
//             setErrorMessage("No employee found with the provided details");
//           }
//         } catch (error) {
//           setErrorMessage("Error searching for employee");
//         }
//       }
//     } catch (error) {
//       setErrorMessage("Error processing search request");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const buildHierarchyPath = (employee) => {
//     const path = [employee];
//     let currentEmployeeId = employee.reportingManagerId;
    
   
//     const processed = new Set([employee.employee_id]);

//     while (currentEmployeeId) {
//       const manager = employees.find(emp => emp.employee_id === currentEmployeeId);
      
//       if (manager && !processed.has(manager.employee_id)) {
//         path.push(manager);
//         processed.add(manager.employee_id);
//         currentEmployeeId = manager.reportingManagerId;
//       } else {
//         break;
//       }
//     }
    
//     setHierarchyPath(path.reverse()); 
//   };


//   const findSubordinates = (employeeId) => {
//     const directReports = employees.filter(emp => emp.reportingManagerId === employeeId);
    
 
//     const buildSubordinateHierarchy = (manager) => {
//       const directSubs = employees.filter(emp => emp.reportingManagerId === manager.employee_id);
      
//       return {
//         ...manager,
//         subordinates: directSubs.map(sub => buildSubordinateHierarchy(sub))
//       };
//     };
    
//     setSubordinates(directReports.map(emp => buildSubordinateHierarchy(emp)));
    

//     const initialExpandedState = {};
//     directReports.forEach(emp => {
//       initialExpandedState[emp.employee_id] = true;
//     });
//     setExpandedNodes(initialExpandedState);
//   };

//   const getInitials = (firstName, lastName) => {
//     return (firstName?.[0] || '') + (lastName?.[0] || '');
//   };

//   const handleEditRoles = (employee) => {
   
//     console.log("Edit roles for", employee.employee_id);
    
//   };
  
//   const toggleExpandNode = (employeeId) => {
//     setExpandedNodes(prev => ({
//       ...prev,
//       [employeeId]: !prev[employeeId]
//     }));
//   };

//   const renderEnhancedHierarchyView = () => {
//     if (!hierarchyPath.length) return null;

//     return (
//       <Box sx={{ mt: 2, p: 2, position: 'relative', minHeight: 200 }}>
//         <Box sx={{
//           position: 'absolute',
//           left: 24,
//           top: 0,
//           bottom: 0,
//           width: '2px',
//           bgcolor: 'primary.light',
//           zIndex: 0
//         }} />

//         {hierarchyPath.map((member, index) => (
//           <Box key={index} sx={{ position: 'relative', zIndex: 1, ml: 4, mb: 4 }}>
//             {index > 0 && (
//               <Box sx={{
//                 position: 'absolute',
//                 left: -34,
//                 top: '50%',
//                 width: 34,
//                 height: '2px',
//                 bgcolor: 'primary.light'
//               }} />
//             )}

//             <Card elevation={3} sx={{
//               position: 'relative',
//               bgcolor: member.employee_id === selectedEmployee?.employee_id 
//                 ? 'rgba(25, 118, 210, 0.08)'
//                 : 'background.paper',
//               border: member.employee_id === selectedEmployee?.employee_id 
//                 ? '1px solid #1976d2' 
//                 : '1px solid rgba(0, 0, 0, 0.12)',
//               width: '100%',
//               borderRadius: '8px',
//               transition: 'all 0.3s ease'
//             }}>
//               <CardContent>
//                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                   <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                     <Avatar sx={{ 
//                       width: 50,
//                       height: 50,
//                       mr: 2,
//                       bgcolor: getRoleColor(member.roleType),
//                       border: '2px solid white',
//                       boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
//                     }}>
//                       {getInitials(member.firstName, member.lastName)}
//                     </Avatar>
//                     <Box>
//                       <Typography variant="h6" fontWeight="bold">
//                         {member.firstName} {member.lastName}
//                       </Typography>
//                       <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
//                         <WorkIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
//                         <Typography variant="body2" color="text.secondary">
//                           {member.designation || "No designation"}
//                         </Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
//                         <BadgeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
//                         <Typography variant="body2" color="text.secondary">
//                           {member.employee_id}
//                         </Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', mt: 1 }}>
//                         <Chip 
//                           size="small" 
//                           label={member.department || "No Department"}
//                           sx={{ mr: 1, bgcolor: 'rgba(0,0,0,0.08)' }}
//                         />
//                         <Chip 
//                           size="small" 
//                           label={getRoleTitle(member.roleType) || "No Role"}
//                           color="primary"
//                           sx={{ bgcolor: getRoleColor(member.roleType), color: 'white' }}
//                         />
//                       </Box>
//                     </Box>
//                   </Box>
//                   <Box>
//                     {member.companyemail && (
//                       <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                         <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
//                         <Typography variant="body2" color="text.secondary">
//                           {member.companyemail}
//                         </Typography>
//                       </Box>
//                     )}
//                     {member.contactNumber && (
//                       <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                         <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
//                         <Typography variant="body2" color="text.secondary">
//                           {member.contactNumber}
//                         </Typography>
//                       </Box>
//                     )}
//                     {/* <Button
//                       variant="outlined"
//                       size="small"
//                       startIcon={<EditIcon />}
//                       onClick={() => handleEditRoles(member)}
//                       sx={{ mt: 1 }}
//                     >
//                       Edit Roles
//                     </Button> */}
//                   </Box>
//                 </Box>
//               </CardContent>
//             </Card>

//             {index < hierarchyPath.length - 1 && (
//               <Box sx={{
//                 position: 'absolute',
//                 left: -24,
//                 top: '100%',
//                 display: 'flex',
//                 alignItems: 'center',
//                 height: 40
//               }}>
//                 <ArrowDownwardIcon sx={{ 
//                   color: 'primary.main',
//                   fontSize: 28
//                 }} />
//               </Box>
//             )}
//           </Box>
//         ))}
//       </Box>
//     );
//   };

//   const renderSubordinateTree = (subordinate, level = 0) => {
//     const hasSubordinates = subordinate.subordinates && subordinate.subordinates.length > 0;
//     const isExpanded = expandedNodes[subordinate.employee_id];
    
//     return (
//       <Box key={subordinate.employee_id} sx={{ position: 'relative', zIndex: 1, ml: 4, mb: 2 }}>
//         {level > 0 && (
//           <Box sx={{
//             position: 'absolute',
//             left: -34,
//             top: '50%',
//             width: 34,
//             height: '2px',
//             bgcolor: 'primary.light'
//           }} />
//         )}
        
//         <Card elevation={2} sx={{
//           position: 'relative',
//           bgcolor: 'background.paper',
//           width: '100%',
//           borderRadius: '8px',
//           transition: 'all 0.3s ease',
//           '&:hover': {
//             boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
//           }
//         }}>
//           <CardContent>
//             <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
//               <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
//                 <Avatar sx={{ 
//                   width: 45,
//                   height: 45,
//                   mr: 2,
//                   bgcolor: getRoleColor(subordinate.roleType),
//                   border: '2px solid white',
//                   boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
//                 }}>
//                   {getInitials(subordinate.firstName, subordinate.lastName)}
//                 </Avatar>
//                 <Box>
//                   <Typography variant="subtitle1" fontWeight="bold">
//                     {subordinate.firstName} {subordinate.lastName}
//                     {hasSubordinates && (
//                       <IconButton
//                         size="small"
//                         onClick={() => toggleExpandNode(subordinate.employee_id)}
//                         sx={{ ml: 1, p: 0.5 }}
//                       >
//                         {isExpanded ? "−" : "+"}
//                       </IconButton>
//                     )}
//                   </Typography>
//                   <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
//                     <WorkIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
//                     <Typography variant="body2" color="text.secondary">
//                       {subordinate.designation || "No designation"}
//                     </Typography>
//                   </Box>
//                   <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
//                     <BadgeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
//                     <Typography variant="body2" color="text.secondary">
//                       {subordinate.employee_id}
//                     </Typography>
//                   </Box>
//                   <Box sx={{ display: 'flex', mt: 1 }}>
//                     <Tooltip title={subordinate.department || "No Department"}>
//                       <Chip 
//                         size="small" 
//                         label={subordinate.department || "No Department"}
//                         sx={{ mr: 1, bgcolor: 'rgba(0,0,0,0.08)' }}
//                       />
//                     </Tooltip>
//                     <Tooltip title={getRoleDescription(subordinate.roleType)}>
//                       <Chip 
//                         size="small" 
//                         label={getRoleTitle(subordinate.roleType) || "No Role"}
//                         color="primary"
//                         sx={{ bgcolor: getRoleColor(subordinate.roleType), color: 'white' }}
//                       />
//                     </Tooltip>
//                   </Box>
//                 </Box>
//               </Box>
//               <Box>
//                 {subordinate.location && (
//                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                     <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
//                     <Typography variant="body2" color="text.secondary">
//                       {subordinate.location}
//                     </Typography>
//                   </Box>
//                 )}
//                 <Button
//                   variant="outlined"
//                   size="small"
//                   startIcon={<EditIcon />}
//                   onClick={() => handleEditRoles(subordinate)}
//                 >
//                   Edit
//                 </Button>
//               </Box>
//             </Box>
//           </CardContent>
//         </Card>
        
//         {hasSubordinates && isExpanded && (
//           <Box sx={{ position: 'relative', pl: 4 }}>
//             <Box sx={{
//               position: 'absolute',
//               left: 24,
//               top: 0,
//               bottom: 0,
//               width: '2px',
//               bgcolor: 'primary.light',
//               zIndex: 0
//             }} />
            
//             {subordinate.subordinates.map(sub => (
//               renderSubordinateTree(sub, level + 1)
//             ))}
//           </Box>
//         )}
//       </Box>
//     );
//   };

//   const getRoleColor = (roleType) => {
//     if (!roleType) return '#888888';
    
//     const role = (roleType || '').toLowerCase();
    
//     if (role.includes('ceo') || role.includes('chief')) return '#D32F2F';
//     if (role.includes('director')) return '#7B1FA2';
//     if (role.includes('hr')) return '#E91E63';
//     if (role.includes('manager')) return '#1976D2';
//     if (role.includes('lead')) return '#388E3C';
//     if (role.includes('senior')) return '#F57C00';
//     if (role.includes('intern')) return '#0097A7';
    
//     return '#888888';
//   };
  
//   const getRoleTitle = (roleType) => {
//     if (!roleType) return 'Employee';
    
//     const role = (roleType || '').toLowerCase();
    
//     if (role.includes('ceo') || role.includes('chief')) return 'Executive';
//     if (role.includes('director')) return 'Director';
//     if (role.includes('hr manager')) return 'HR Manager';
//     if (role.includes('hr')) return 'HR';
//     if (role.includes('manager')) return 'Manager';
//     if (role.includes('lead')) return 'Team Lead';
//     if (role.includes('senior')) return 'Senior';
//     if (role.includes('intern')) return 'Intern';
    
//     return roleType;
//   };
  
//   const getRoleDescription = (roleType) => {
//     if (!roleType) return 'General Employee';
    
//     const role = (roleType || '').toLowerCase();
    
//     if (role.includes('ceo') || role.includes('chief')) 
//       return 'Executive leadership responsible for company-wide decisions';
//     if (role.includes('director')) 
//       return 'Oversees multiple departments or major initiatives';
//     if (role.includes('hr manager')) 
//       return 'Manages HR department and personnel policies';
//     if (role.includes('hr')) 
//       return 'Human Resources personnel';
//     if (role.includes('manager')) 
//       return 'Manages team members and department operations';
//     if (role.includes('lead')) 
//       return 'Leads a team and reports to management';
//     if (role.includes('senior')) 
//       return 'Senior level individual contributor';
//     if (role.includes('intern')) 
//       return 'Temporary trainee position';
    
//     return 'General employee position';
//   };

//   return (
//     <Box sx={{ maxWidth: 1500, margin: "auto", padding: 3 }}>
//       <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
//         Employee Search
//       </Typography>
      
//       <Paper elevation={3} sx={{ padding: 3, marginBottom: 3, borderRadius: '12px' }}>
//         <Grid container spacing={2} alignItems="center">
//           <Grid item xs={10}>
//             <TextField
//               fullWidth
//               label="Search by Employee ID, Name or Email"
//               variant="outlined"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton onClick={handleSearch}>
//                       <SearchIcon />
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           </Grid>
//           <Grid item xs={2}>
//             <Button
//               variant="contained"
//               color="primary"
//               fullWidth
//               onClick={handleSearch}
//               disabled={loading || apiLoading}
//               sx={{ height: '56px', borderRadius: '8px' }}
//             >
//               {loading ? <CircularProgress size={24} /> : "Search"}
//             </Button>
//           </Grid>
//         </Grid>
//       </Paper>

//       {errorMessage && (
//         <Paper elevation={3} sx={{ padding: 2, marginBottom: 3, bgcolor: '#ffebee', borderRadius: '8px' }}>
//           <Typography color="error">{errorMessage}</Typography>
//         </Paper>
//       )}

//       {apiLoading ? (
//         <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
//           <CircularProgress />
//         </Box>
//       ) : (
//         <Grid container spacing={3}>
//           <Grid item xs={12}>
//             {selectedEmployee ? (
//               <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
//                 <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
//                   <SupervisorAccountIcon sx={{ mr: 1, color: 'primary.main' }} />
//                   Upward Hierarchy
//                 </Typography>
//                 {renderEnhancedHierarchyView()}

//                 {subordinates.length > 0 && (
//                   <>
//                     <Divider sx={{ my: 4 }} />
//                     <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
//                       <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
//                       Team Structure & Direct Reports
//                     </Typography>
//                     <Box sx={{ mt: 2, position: 'relative' }}>
//                       <Box sx={{
//                         position: 'absolute',
//                         left: 24,
//                         top: 0,
//                         bottom: 0,
//                         width: '2px',
//                         bgcolor: 'primary.light',
//                         zIndex: 0
//                       }} />
//                       {subordinates.map(subordinate => renderSubordinateTree(subordinate))}
//                     </Box>
//                   </>
//                 )}
                
//                 {/* <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: '8px', border: '1px dashed rgba(25, 118, 210, 0.3)' }}>
//                   <Typography variant="subtitle1" fontWeight="bold">Role Legend:</Typography>
//                   <Grid container spacing={2} sx={{ mt: 1 }}>
//                     {[
//                       { type: 'CEO', title: 'Executive', color: '#D32F2F' },
//                       { type: 'Director', title: 'Director', color: '#7B1FA2' },
//                       { type: 'HR Manager', title: 'HR Manager', color: '#E91E63' },
//                       { type: 'Manager', title: 'Manager', color: '#1976D2' },
//                       { type: 'Team Lead', title: 'Team Lead', color: '#388E3C' },
//                       { type: 'Senior', title: 'Senior', color: '#F57C00' },
//                       { type: 'Intern', title: 'Intern', color: '#0097A7' },
//                       { type: 'Employee', title: 'Employee', color: '#888888' },
//                     ].map((role) => (
//                       <Grid item key={role.type}>
//                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                           <Box sx={{ 
//                             width: 20, 
//                             height: 20, 
//                             borderRadius: '50%', 
//                             bgcolor: role.color,
//                             mr: 1 
//                           }} />
//                           <Typography variant="body2">{role.title}</Typography>
//                         </Box>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </Box> */}
//               </Paper>
//             ) : (
//               <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.02)' }}>
//                 <Box sx={{ textAlign: 'center', py: 4 }}>
//                   <SupervisorAccountIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
//                   <Typography variant="h6" color="text.secondary">
//                     Search for an employee to view their hierarchy
//                   </Typography>
//                   <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 500, mx: 'auto', mt: 1 }}>
//                     Enter an employee ID, name, or email address to find and explore their position in the organization
//                   </Typography>
//                 </Box>
//               </Paper>
//             )}
//           </Grid>
//         </Grid>
//       )}
//     </Box>
//   );
// };

// export default SearchEmployee;
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Tooltip,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import BadgeIcon from '@mui/icons-material/Badge';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const EmployeeHierarchyTree = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddRoleDialog, setOpenAddRoleDialog] = useState(false);
  const [selectedManager, setSelectedManager] = useState("");
  const [newRole, setNewRole] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    department: "",
    reportingManagerId: "",
    companyemail: "",
    contactNumber: "",
    location: "",
    roleType: ""
  });

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/employees');
      
      const employeeData = response.data.success 
        ? response.data.data 
        : (Array.isArray(response.data) ? response.data : []);
      
      setEmployees(employeeData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setErrorMessage("Failed to load employee data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/roles');
      
      const rolesData = response.data.success 
        ? response.data.data 
        : (Array.isArray(response.data) ? response.data : []);
      
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setErrorMessage("Failed to load role data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const mergeEmployeeAndRoleData = () => {
    return employees.map(employee => {
      const employeeRole = roles.find(role => role.employee_id === employee.employee_id);
      return {
        ...employee,
        ...employeeRole,
        // Make sure reportingManagerId is preserved for the tree structure
        reportingManagerId: employee.reportingManagerId || 
                           (employeeRole?.reportingManager ? findEmployeeIdByEmail(employeeRole.reportingManager) : null)
      };
    });
  };

  const findEmployeeIdByEmail = (email) => {
    const employee = employees.find(emp => emp.companyemail === email);
    return employee ? employee.employee_id : null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setErrorMessage("Please enter an employee ID, name, or email to search");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSelectedEmployee(null);

      const mergedData = mergeEmployeeAndRoleData();
      
      const foundEmployee = mergedData.find(emp => 
        emp.employee_id?.toLowerCase() === searchQuery.toLowerCase() ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.companyemail && emp.companyemail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.fullName && emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      if (foundEmployee) {
        setSelectedEmployee(foundEmployee);
      } else {
        try {
          const response = await axios.get(`http://localhost:5000/api/search-employee?query=${encodeURIComponent(searchQuery)}`);
          
          if (response.data.success && response.data.data) {
            const apiEmployee = response.data.data;
            
            // Try to find role information
            const roleInfo = roles.find(role => role.employee_id === apiEmployee.employee_id);
            const enrichedEmployee = {
              ...apiEmployee,
              ...roleInfo
            };
            
            setSelectedEmployee(enrichedEmployee);
            
            if (!employees.some(e => e.employee_id === apiEmployee.employee_id)) {
              setEmployees(prev => [...prev, apiEmployee]);
            }
          } else {
            setErrorMessage("No employee found with the provided details");
          }
        } catch (error) {
          setErrorMessage("Error searching for employee");
        }
      }
    } catch (error) {
      setErrorMessage("Error processing search request");
    } finally {
      setLoading(false);
    }
  };

  // Find direct reports based on reportingManagerId from employee data 
  // and reportingManager (email) from role data
  const findDirectReports = (employeeId) => {
    const mergedData = mergeEmployeeAndRoleData();
    
    return mergedData.filter(emp => {
      // First check direct reportingManagerId
      if (emp.reportingManagerId === employeeId) {
        return true;
      }
      
      // Then check email match with reportingManager field from roles
      const manager = employees.find(e => e.employee_id === employeeId);
      if (manager && manager.companyemail && emp.reportingManager === manager.companyemail) {
        return true;
      }
      
      return false;
    });
  };

  const handleEmployeeClick = (employee) => {
    // Get role information
    const roleInfo = roles.find(role => role.employee_id === employee.employee_id);
    
    // Merge employee and role data
    const enrichedEmployee = {
      ...employee,
      ...roleInfo
    };
    
    setEmployeeDetails(enrichedEmployee);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
  };
  
  const openAddRole = (managerId = "") => {
    setNewRole({...newRole, reportingManagerId: managerId});
    setSelectedManager(managerId);
    setOpenAddRoleDialog(true);
  };
  
  const closeAddRoleDialog = () => {
    setOpenAddRoleDialog(false);
    setNewRole({
      firstName: "",
      lastName: "",
      designation: "",
      department: "",
      reportingManagerId: "",
      companyemail: "",
      contactNumber: "",
      location: "",
      roleType: ""
    });
  };
  
  const handleRoleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRole({...newRole, [name]: value});
  };
  
  const handleManagerChange = (e) => {
    const managerId = e.target.value;
    setSelectedManager(managerId);
    setNewRole({...newRole, reportingManagerId: managerId});
  };
  
  const addNewRole = async () => {
    if (!newRole.firstName || !newRole.lastName || !newRole.designation) {
      alert("Please fill in the required fields");
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/employees', newRole);
      
      if (response.data.success) {
        const newEmployee = response.data.data;
        setEmployees([...employees, newEmployee]);
        
        // Also add role information
        const managerEmail = employees.find(emp => emp.employee_id === newRole.reportingManagerId)?.companyemail || "";
        
        const roleData = {
          employee_id: newEmployee.employee_id,
          fullName: `${newEmployee.firstName} ${newEmployee.lastName}`,
          email: newEmployee.companyemail,
          designation: newEmployee.designation,
          department: newEmployee.department,
          roleType: newEmployee.roleType,
          reportingManager: managerEmail,
          teamSize: 0
        };
        
        await axios.post('http://localhost:5000/api/roles', roleData);
        
        // Refresh roles
        fetchRoles();
        closeAddRoleDialog();
        
        // If the current selected employee is the manager, refresh the view
        if (selectedEmployee && selectedEmployee.employee_id === newRole.reportingManagerId) {
          setSelectedEmployee({...selectedEmployee}); // Trigger re-render
        }
      } else {
        alert("Failed to add new role: " + response.data.message);
      }
    } catch (error) {
      console.error("Error adding new role:", error);
      alert("An error occurred while adding the new role");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    if (firstName && lastName) {
      return (firstName[0] || '') + (lastName[0] || '');
    } else if (firstName) {
      return firstName[0] || '';
    } else {
      return "??";
    }
  };

  const getRoleColor = (roleType) => {
    switch (roleType) {
      case 'Manager':
        return "#2196f3"; // Blue for managers
      case 'Team Lead':
        return "#4caf50"; // Green for team leads
      case 'Individual Contributor':
        return "#d32f2f"; // Red for ICs
      case 'Support Staff':
        return "#ff9800"; // Orange for support
      default:
        return "#d32f2f"; // Default red color
    }
  };

  const formatFullName = (employee) => {
    if (employee.firstName && employee.lastName) {
      return `${employee.firstName} ${employee.lastName}`;
    } else if (employee.fullName) {
      return employee.fullName;
    } else {
      return "Unknown";
    }
  };

  // Get employee team count for showing the count in the node
  const getDirectReportCount = (employeeId) => {
    const directReports = findDirectReports(employeeId);
    return directReports.length;
  };
  // This is the fixed renderFamilyTree function with proper manager email display
const renderFamilyTree = (employee, level = 0) => {
  const directReports = findDirectReports(employee.employee_id);
  const roleInfo = roles.find(role => role.employee_id === employee.employee_id);
  
  // Merge employee and role information
  const enrichedEmployee = {
    ...employee,
    ...roleInfo
  };
  
  const reportCount = getDirectReportCount(employee.employee_id);
  
  // Find manager information - improved version
  let managerInfo = null;
  let managerEmail = "";
  
  if (employee.reportingManagerId) {
    managerInfo = employees.find(emp => emp.employee_id === employee.reportingManagerId);
  } else if (employee.reportingManager) {
    // First try to find by email match
    managerInfo = employees.find(emp => 
      emp.companyemail === employee.reportingManager || 
      emp.email === employee.reportingManager
    );
    
    // Store the reporting manager email even if we can't find the employee
    managerEmail = employee.reportingManager;
  }
  
  // Find manager's role information if available
  let managerRoleInfo = null;
  if (managerInfo) {
    managerRoleInfo = roles.find(role => role.employee_id === managerInfo.employee_id);
  }
  
  const employeeColor = getRoleColor(enrichedEmployee.roleType);
  const managerColor = managerInfo ? getRoleColor(managerRoleInfo?.roleType || 'Manager') : '#2196f3';
  
  return (
    <Box key={employee.employee_id} sx={{ textAlign: 'center', width: '100%' }}>
      {/* Manager information above the employee - Always displayed */}
      <Box sx={{ mb: 4, position: 'relative' }}>
        <Box 
          sx={{ 
            display: 'inline-block',
            position: 'relative'
          }}
        >
          {managerInfo ? (
            // Show actual manager if available
            <>
              <Avatar 
                sx={{ 
                  mx: 'auto',
                  mb: 1,
                  bgcolor: '#fff',
                  width: 60,
                  height: 60,
                  fontSize: '1.2rem',
                  border: '3px solid #1976d2',
                  color: '#333'
                }}
              >
                {getInitials(managerInfo.firstName, managerInfo.lastName)}
              </Avatar>
              
              <Card 
                sx={{ 
                  width: 220,
                  borderRadius: '4px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  '&:hover': {
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    cursor: 'pointer'
                  }
                }}
                onClick={() => handleEmployeeClick(managerInfo)}
              >
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                    {formatFullName(managerInfo)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                    {managerInfo.designation || managerRoleInfo?.roleType || "Manager"}
                  </Typography>
                  {managerRoleInfo?.department && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'white', opacity: 0.8 }}>
                      {managerRoleInfo.department}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'white', opacity: 0.8 }}>
                    {managerInfo.companyemail || managerInfo.email || managerEmail || "No email available"}
                  </Typography>
                </CardContent>
              </Card>
            </>
          ) : (
            // Show placeholder for no manager or just email if available
            <>
              <Avatar
                sx={{
                  mx: 'auto',
                  mb: 1,
                  bgcolor: '#f5f5f5',
                  width: 60,
                  height: 60,
                  fontSize: '1.2rem',
                  border: '3px solid #90a4ae',
                  color: '#888'
                }}
              >
                {managerEmail ? managerEmail.split('@')[0].split('.').map(part => part[0].toUpperCase()).join('') : "?"}
              </Avatar>
  
              <Card
                sx={{
                  width: 220,
                  borderRadius: '4px',
                  backgroundColor: '#90a4ae',
                  color: 'white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
                    {managerEmail ? "Manager" : "No Manager Assigned"}
                  </Typography>
                  
                  {/* Show email even if we don't have full manager info */}
                  {managerEmail && (
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'white', opacity: 0.9 }}>
                      {managerEmail}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </>
          )}
          
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', fontWeight: 'bold' }}>
            Reporting Manager
          </Typography>
        </Box>
        
        {/* Connecting line between manager and employee */}
        <Box sx={{ position: 'relative', mt: 0, mb: 2, height: 70 }}>
          {/* Vertical line */}
          <Box
            sx={{
              position: 'absolute',
              height: '100%',
              width: 2,
              bgcolor: '#546e7a',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
          {/* Arrow head - POINTING UP */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '12px solid #546e7a'
            }}
          />
        </Box>
      </Box>
      
      {/* Employee node */}
      <Box sx={{ display: 'inline-block', position: 'relative' }}>
        <Avatar 
          sx={{ 
            mx: 'auto',
            mb: 1,
            bgcolor: '#fff',
            width: 60,
            height: 60,
            fontSize: '1.2rem',
            border: '3px solid #2e7d32',
            color: '#333'
          }}
        >
          {getInitials(employee.firstName, employee.lastName)}
        </Avatar>
        
        <Card 
          sx={{ 
            width: 220,
            borderRadius: '4px',
            backgroundColor: '#2e7d32',
            color: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            '&:hover': {
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              cursor: 'pointer'
            }
          }}
          onClick={() => handleEmployeeClick(enrichedEmployee)}
        >
          <CardContent sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'white' }}>
              {formatFullName(employee)}
            </Typography>
            {enrichedEmployee.department && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'white', opacity: 0.8 }}>
                {enrichedEmployee.department}
              </Typography>
            )}
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'white', opacity: 0.8 }}>
              {enrichedEmployee.companyemail || employee.companyemail || enrichedEmployee.email || employee.email || "No email available"}
            </Typography>
          </CardContent>
        </Card>
        
        {reportCount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: '#455a64',
              color: 'white',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              border: '2px solid white',
              zIndex: 2
            }}
          >
            {reportCount}
          </Box>
        )}
      </Box>
      
      {/* Direct reports container */}
      {directReports.length > 0 && (
        <>
          <Box 
            sx={{ 
              height: 30, 
              width: 2, 
              bgcolor: '#546e7a', 
              mx: 'auto',
              mt: 2
            }} 
          /> 
          
          <Box sx={{ position: 'relative', mt: 1, mb: 2 }}>
            {directReports.length > 1 && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  height: 2,
                  bgcolor: '#546e7a',
                  top: 0,
                  left: `calc(${100 / directReports.length / 2}%)`,
                  right: `calc(${100 / directReports.length / 2}%)`
                }} 
              />
            )}
            
            <Grid container spacing={4} justifyContent="center">
              {directReports.map((report) => (
                <Grid item key={report.employee_id} xs="auto">
                  <Box sx={{ position: 'relative' }}>
                    <Box 
                      sx={{ 
                        position: 'relative',
                        height: 30, 
                        width: 2, 
                        bgcolor: '#546e7a', 
                        mx: 'auto',
                        mb: 1
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 0,
                          height: 0,
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderTop: '10px solid #546e7a'
                        }}
                      />
                    </Box>
                    {renderFamilyTree(report, level + 1)}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}
    </Box>
  );
}
  return (
    <Box sx={{ maxWidth: 1400, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Employee search
      </Typography>
      
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3, borderRadius: '12px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={10}>
            <TextField
              fullWidth
              label="Search by Employee ID, Name or Email"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSearch}
              disabled={loading}
              sx={{ height: '56px', borderRadius: '8px' }}
            >
              {loading ? <CircularProgress size={24} /> : "Search"}
            </Button>
          </Grid>
          
         
        </Grid>
      </Paper>

      {errorMessage && (
        <Paper elevation={3} sx={{ padding: 2, marginBottom: 3, bgcolor: '#ffebee', borderRadius: '8px' }}>
          <Typography color="error">{errorMessage}</Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* Family Tree Visualization */}
          {selectedEmployee && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: '12px',
                overflowX: 'auto'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                Organization Hierarchy Visualization
              </Typography>
              <Box sx={{ 
                minWidth: 800, 
                paddingX: 4,
                paddingBottom: 10,
                display: 'flex',
                justifyContent: 'center'
              }}>
                {renderFamilyTree(selectedEmployee)}
              </Box>
            </Paper>
          )}

          {!selectedEmployee && !loading && (
            <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: '12px' }}>
              <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Search for an employee to view their organizational hierarchy
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Enter an employee ID, name or email to explore their organizational structure
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Employee Details Dialog - Modified to remove manager details */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
          Employee & Role Details
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {employeeDetails && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      fontSize: 48, 
                      mb: 2,
                      bgcolor: getRoleColor(employeeDetails.roleType)
                    }}
                  >
                    {getInitials(employeeDetails.firstName, employeeDetails.lastName)}
                  </Avatar>
                  <Typography variant="h6" align="center">
                    {formatFullName(employeeDetails)}
                  </Typography>
                  <Chip 
                    label={employeeDetails.designation || employeeDetails.roleType || "Employee"} 
                    color="primary" 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <Typography variant="h6" gutterBottom>Employee Information</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BadgeIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Employee ID</Typography>
                        <Typography variant="body1">{employeeDetails.employee_id}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Department</Typography>
                        <Typography variant="body1">{employeeDetails.department || "Not specified"}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Email</Typography>
                        <Typography variant="body1">{employeeDetails.companyemail || employeeDetails.email || "Not available"}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Contact Number</Typography>
                        <Typography variant="body1">{employeeDetails.contactNumber || "Not available"}</Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {employeeDetails.location && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Location</Typography>
                          <Typography variant="body1">{employeeDetails.location}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  
                  {employeeDetails.joiningDate && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Joining Date</Typography>
                          <Typography variant="body1">{employeeDetails.joiningDate}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Role Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Role Type</Typography>
                        <Typography variant="body1">{employeeDetails.roleType || "Not specified"}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  {employeeDetails.teamSize && (
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Team Size</Typography>
                          <Typography variant="body1">{employeeDetails.teamSize}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                  
                  {employeeDetails.selectedResponsibilities && employeeDetails.selectedResponsibilities.length > 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <ListAltIcon sx={{ mr: 1, color: 'primary.main', mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Responsibilities</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                            {employeeDetails.selectedResponsibilities.map((resp, index) => (
                             
                                <Chip 
                                  key={index} 
                                  label={resp} 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ mr: 1, mb: 1 }} 
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} color="primary">
              Close
            </Button>
           
          </DialogActions>
        </Dialog>
  
        {/* Add New Role Dialog */}
        <Dialog open={openAddRoleDialog} onClose={closeAddRoleDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
            Add New Employee
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="First Name"
                  name="firstName"
                  value={newRole.firstName}
                  onChange={handleRoleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Last Name"
                  name="lastName"
                  value={newRole.lastName}
                  onChange={handleRoleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Designation"
                  name="designation"
                  value={newRole.designation}
                  onChange={handleRoleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={newRole.department}
                  onChange={handleRoleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Company Email"
                  name="companyemail"
                  value={newRole.companyemail}
                  onChange={handleRoleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Number"
                  name="contactNumber"
                  value={newRole.contactNumber}
                  onChange={handleRoleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={newRole.location}
                  onChange={handleRoleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="role-type-label">Role Type</InputLabel>
                  <Select
                    labelId="role-type-label"
                    id="roleType"
                    name="roleType"
                    value={newRole.roleType}
                    onChange={handleRoleInputChange}
                    label="Role Type"
                  >
                    <MenuItem value="Manager">Manager</MenuItem>
                    <MenuItem value="Team Lead">Team Lead</MenuItem>
                    <MenuItem value="Individual Contributor">Individual Contributor</MenuItem>
                    <MenuItem value="Support Staff">Support Staff</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="reporting-manager-label">Reporting Manager</InputLabel>
                  <Select
                    labelId="reporting-manager-label"
                    id="reportingManagerId"
                    value={selectedManager}
                    onChange={handleManagerChange}
                    label="Reporting Manager"
                  >
                    <MenuItem value="">None (Top Level)</MenuItem>
                    {employees.map((emp) => (
                      <MenuItem key={emp.employee_id} value={emp.employee_id}>
                        {formatFullName(emp)} ({emp.employee_id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAddRoleDialog} color="secondary">
              Cancel
            </Button>
            <Button 
              onClick={addNewRole} 
              color="primary" 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Add Employee"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };
  
  export default EmployeeHierarchyTree;