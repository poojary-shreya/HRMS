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
  Divider,
  Avatar,
  Chip,
  Card,
  CardContent,
  Tooltip
} from "@mui/material";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EditIcon from '@mui/icons-material/Edit';
import WorkIcon from '@mui/icons-material/Work';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const SearchEmployee = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [hierarchyPath, setHierarchyPath] = useState([]);
  const [subordinates, setSubordinates] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState({});

 
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setApiLoading(true);
       
        const response = await axios.get('http://localhost:5000/api/employees');
        
      
        const employeeData = response.data.success 
          ? response.data.data 
          : (Array.isArray(response.data) ? response.data : []);
        
        setEmployees(employeeData);
        setApiLoading(false);
      } catch (error) {
        console.error("Error fetching employees:", error);
        setErrorMessage("Failed to load employee data. Please try again later.");
        setApiLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setErrorMessage("Please enter an employee ID or name to search");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSelectedEmployee(null);
      setHierarchyPath([]);
      setSubordinates([]);
      setExpandedNodes({});

     
      const foundEmployee = employees.find(emp => 
        emp.employee_id.toLowerCase() === searchQuery.toLowerCase() ||
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.companyemail && emp.companyemail.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      if (foundEmployee) {
        setSelectedEmployee(foundEmployee);
        buildHierarchyPath(foundEmployee);
        findSubordinates(foundEmployee.employee_id);
      } else {
       
        try {
          const response = await axios.get(`http://localhost:5000/api/search-employee?query=${encodeURIComponent(searchQuery)}`);
          
          if (response.data.success && response.data.data) {
            const apiEmployee = response.data.data;
            setSelectedEmployee(apiEmployee);
            
          
            if (!employees.some(e => e.employee_id === apiEmployee.employee_id)) {
              setEmployees(prev => [...prev, apiEmployee]);
            }
            
            buildHierarchyPath(apiEmployee);
            findSubordinates(apiEmployee.employee_id);
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

  const buildHierarchyPath = (employee) => {
    const path = [employee];
    let currentEmployeeId = employee.reportingManagerId;
    
   
    const processed = new Set([employee.employee_id]);

    while (currentEmployeeId) {
      const manager = employees.find(emp => emp.employee_id === currentEmployeeId);
      
      if (manager && !processed.has(manager.employee_id)) {
        path.push(manager);
        processed.add(manager.employee_id);
        currentEmployeeId = manager.reportingManagerId;
      } else {
        break;
      }
    }
    
    setHierarchyPath(path.reverse()); 
  };


  const findSubordinates = (employeeId) => {
    const directReports = employees.filter(emp => emp.reportingManagerId === employeeId);
    
 
    const buildSubordinateHierarchy = (manager) => {
      const directSubs = employees.filter(emp => emp.reportingManagerId === manager.employee_id);
      
      return {
        ...manager,
        subordinates: directSubs.map(sub => buildSubordinateHierarchy(sub))
      };
    };
    
    setSubordinates(directReports.map(emp => buildSubordinateHierarchy(emp)));
    

    const initialExpandedState = {};
    directReports.forEach(emp => {
      initialExpandedState[emp.employee_id] = true;
    });
    setExpandedNodes(initialExpandedState);
  };

  const getInitials = (firstName, lastName) => {
    return (firstName?.[0] || '') + (lastName?.[0] || '');
  };

  const handleEditRoles = (employee) => {
   
    console.log("Edit roles for", employee.employee_id);
    
  };
  
  const toggleExpandNode = (employeeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const renderEnhancedHierarchyView = () => {
    if (!hierarchyPath.length) return null;

    return (
      <Box sx={{ mt: 2, p: 2, position: 'relative', minHeight: 200 }}>
        <Box sx={{
          position: 'absolute',
          left: 24,
          top: 0,
          bottom: 0,
          width: '2px',
          bgcolor: 'primary.light',
          zIndex: 0
        }} />

        {hierarchyPath.map((member, index) => (
          <Box key={index} sx={{ position: 'relative', zIndex: 1, ml: 4, mb: 4 }}>
            {index > 0 && (
              <Box sx={{
                position: 'absolute',
                left: -34,
                top: '50%',
                width: 34,
                height: '2px',
                bgcolor: 'primary.light'
              }} />
            )}

            <Card elevation={3} sx={{
              position: 'relative',
              bgcolor: member.employee_id === selectedEmployee?.employee_id 
                ? 'rgba(25, 118, 210, 0.08)'
                : 'background.paper',
              border: member.employee_id === selectedEmployee?.employee_id 
                ? '1px solid #1976d2' 
                : '1px solid rgba(0, 0, 0, 0.12)',
              width: '100%',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ 
                      width: 50,
                      height: 50,
                      mr: 2,
                      bgcolor: getRoleColor(member.roleType),
                      border: '2px solid white',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                      {getInitials(member.firstName, member.lastName)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {member.firstName} {member.lastName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <WorkIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {member.designation || "No designation"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <BadgeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {member.employee_id}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', mt: 1 }}>
                        <Chip 
                          size="small" 
                          label={member.department || "No Department"}
                          sx={{ mr: 1, bgcolor: 'rgba(0,0,0,0.08)' }}
                        />
                        <Chip 
                          size="small" 
                          label={getRoleTitle(member.roleType) || "No Role"}
                          color="primary"
                          sx={{ bgcolor: getRoleColor(member.roleType), color: 'white' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    {member.companyemail && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {member.companyemail}
                        </Typography>
                      </Box>
                    )}
                    {member.contactNumber && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {member.contactNumber}
                        </Typography>
                      </Box>
                    )}
                    {/* <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditRoles(member)}
                      sx={{ mt: 1 }}
                    >
                      Edit Roles
                    </Button> */}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {index < hierarchyPath.length - 1 && (
              <Box sx={{
                position: 'absolute',
                left: -24,
                top: '100%',
                display: 'flex',
                alignItems: 'center',
                height: 40
              }}>
                <ArrowDownwardIcon sx={{ 
                  color: 'primary.main',
                  fontSize: 28
                }} />
              </Box>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  const renderSubordinateTree = (subordinate, level = 0) => {
    const hasSubordinates = subordinate.subordinates && subordinate.subordinates.length > 0;
    const isExpanded = expandedNodes[subordinate.employee_id];
    
    return (
      <Box key={subordinate.employee_id} sx={{ position: 'relative', zIndex: 1, ml: 4, mb: 2 }}>
        {level > 0 && (
          <Box sx={{
            position: 'absolute',
            left: -34,
            top: '50%',
            width: 34,
            height: '2px',
            bgcolor: 'primary.light'
          }} />
        )}
        
        <Card elevation={2} sx={{
          position: 'relative',
          bgcolor: 'background.paper',
          width: '100%',
          borderRadius: '8px',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Avatar sx={{ 
                  width: 45,
                  height: 45,
                  mr: 2,
                  bgcolor: getRoleColor(subordinate.roleType),
                  border: '2px solid white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                }}>
                  {getInitials(subordinate.firstName, subordinate.lastName)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {subordinate.firstName} {subordinate.lastName}
                    {hasSubordinates && (
                      <IconButton
                        size="small"
                        onClick={() => toggleExpandNode(subordinate.employee_id)}
                        sx={{ ml: 1, p: 0.5 }}
                      >
                        {isExpanded ? "−" : "+"}
                      </IconButton>
                    )}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <WorkIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {subordinate.designation || "No designation"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <BadgeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {subordinate.employee_id}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', mt: 1 }}>
                    <Tooltip title={subordinate.department || "No Department"}>
                      <Chip 
                        size="small" 
                        label={subordinate.department || "No Department"}
                        sx={{ mr: 1, bgcolor: 'rgba(0,0,0,0.08)' }}
                      />
                    </Tooltip>
                    <Tooltip title={getRoleDescription(subordinate.roleType)}>
                      <Chip 
                        size="small" 
                        label={getRoleTitle(subordinate.roleType) || "No Role"}
                        color="primary"
                        sx={{ bgcolor: getRoleColor(subordinate.roleType), color: 'white' }}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
              <Box>
                {subordinate.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {subordinate.location}
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditRoles(subordinate)}
                >
                  Edit
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        {hasSubordinates && isExpanded && (
          <Box sx={{ position: 'relative', pl: 4 }}>
            <Box sx={{
              position: 'absolute',
              left: 24,
              top: 0,
              bottom: 0,
              width: '2px',
              bgcolor: 'primary.light',
              zIndex: 0
            }} />
            
            {subordinate.subordinates.map(sub => (
              renderSubordinateTree(sub, level + 1)
            ))}
          </Box>
        )}
      </Box>
    );
  };

  const getRoleColor = (roleType) => {
    if (!roleType) return '#888888';
    
    const role = (roleType || '').toLowerCase();
    
    if (role.includes('ceo') || role.includes('chief')) return '#D32F2F';
    if (role.includes('director')) return '#7B1FA2';
    if (role.includes('hr')) return '#E91E63';
    if (role.includes('manager')) return '#1976D2';
    if (role.includes('lead')) return '#388E3C';
    if (role.includes('senior')) return '#F57C00';
    if (role.includes('intern')) return '#0097A7';
    
    return '#888888';
  };
  
  const getRoleTitle = (roleType) => {
    if (!roleType) return 'Employee';
    
    const role = (roleType || '').toLowerCase();
    
    if (role.includes('ceo') || role.includes('chief')) return 'Executive';
    if (role.includes('director')) return 'Director';
    if (role.includes('hr manager')) return 'HR Manager';
    if (role.includes('hr')) return 'HR';
    if (role.includes('manager')) return 'Manager';
    if (role.includes('lead')) return 'Team Lead';
    if (role.includes('senior')) return 'Senior';
    if (role.includes('intern')) return 'Intern';
    
    return roleType;
  };
  
  const getRoleDescription = (roleType) => {
    if (!roleType) return 'General Employee';
    
    const role = (roleType || '').toLowerCase();
    
    if (role.includes('ceo') || role.includes('chief')) 
      return 'Executive leadership responsible for company-wide decisions';
    if (role.includes('director')) 
      return 'Oversees multiple departments or major initiatives';
    if (role.includes('hr manager')) 
      return 'Manages HR department and personnel policies';
    if (role.includes('hr')) 
      return 'Human Resources personnel';
    if (role.includes('manager')) 
      return 'Manages team members and department operations';
    if (role.includes('lead')) 
      return 'Leads a team and reports to management';
    if (role.includes('senior')) 
      return 'Senior level individual contributor';
    if (role.includes('intern')) 
      return 'Temporary trainee position';
    
    return 'General employee position';
  };

  return (
    <Box sx={{ maxWidth: 1500, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Employee Search
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
              disabled={loading || apiLoading}
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

      {apiLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {selectedEmployee ? (
              <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                  <SupervisorAccountIcon sx={{ mr: 1, color: 'primary.main' }} />
                  Upward Hierarchy
                </Typography>
                {renderEnhancedHierarchyView()}

                {subordinates.length > 0 && (
                  <>
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                      <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                      Team Structure & Direct Reports
                    </Typography>
                    <Box sx={{ mt: 2, position: 'relative' }}>
                      <Box sx={{
                        position: 'absolute',
                        left: 24,
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        bgcolor: 'primary.light',
                        zIndex: 0
                      }} />
                      {subordinates.map(subordinate => renderSubordinateTree(subordinate))}
                    </Box>
                  </>
                )}
                
                {/* <Box sx={{ mt: 4, p: 2, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: '8px', border: '1px dashed rgba(25, 118, 210, 0.3)' }}>
                  <Typography variant="subtitle1" fontWeight="bold">Role Legend:</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {[
                      { type: 'CEO', title: 'Executive', color: '#D32F2F' },
                      { type: 'Director', title: 'Director', color: '#7B1FA2' },
                      { type: 'HR Manager', title: 'HR Manager', color: '#E91E63' },
                      { type: 'Manager', title: 'Manager', color: '#1976D2' },
                      { type: 'Team Lead', title: 'Team Lead', color: '#388E3C' },
                      { type: 'Senior', title: 'Senior', color: '#F57C00' },
                      { type: 'Intern', title: 'Intern', color: '#0097A7' },
                      { type: 'Employee', title: 'Employee', color: '#888888' },
                    ].map((role) => (
                      <Grid item key={role.type}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%', 
                            bgcolor: role.color,
                            mr: 1 
                          }} />
                          <Typography variant="body2">{role.title}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box> */}
              </Paper>
            ) : (
              <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.02)' }}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SupervisorAccountIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Search for an employee to view their hierarchy
                  </Typography>
                  <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 500, mx: 'auto', mt: 1 }}>
                    Enter an employee ID, name, or email address to find and explore their position in the organization
                  </Typography>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SearchEmployee;