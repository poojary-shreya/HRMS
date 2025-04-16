import React, { useState, useEffect, createContext, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Card, CardContent, Typography, TextField, Button, Grid, Box,
  Paper, Checkbox, FormControlLabel, Divider, Chip, LinearProgress,
  List, ListItem, ListItemText, ListItemIcon, Alert, CircularProgress
} from '@mui/material';
import {
  CheckCircle, Assignment, EventNote, Update, PlayArrow, 
  CheckBox, CheckBoxOutlineBlank, Person, Email, Badge
} from '@mui/icons-material';


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
   
        const userData = localStorage.getItem('user');
        
        if (userData) {
          const user = JSON.parse(userData);
          
  
          const { data } = await axios.get(`${API_BASE_URL}/auth/verify-token`, {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          });
          
          if (data.valid) {
           
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            setCurrentUser(user);
          } else {
           
            logout();
          }
        }
      } catch (err) {
        console.error("Auth verification error:", err);
  
        logout();
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
  }, []);
  

  const login = async (email, password) => {
    try {
      setError(null);
      
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, { 
        email, 
        password 
      });
      
    
      localStorage.setItem('user', JSON.stringify(data));
      
  
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setCurrentUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    

    delete axios.defaults.headers.common['Authorization'];
  
    setCurrentUser(null);
  };

  const register = async (userData) => {
    try {
      setError(null);
      
      const { data } = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      error, 
      login, 
      logout, 
      register 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

function EmployeeTrainingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext); 
  
  const [training, setTraining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updating, setUpdating] = useState(false);
  

  const [progress, setProgress] = useState(0);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [taskCompleted, setTaskCompleted] = useState([]);
  
  useEffect(() => {
    fetchTrainingDetails();
  }, [id]);
  
  const fetchTrainingDetails = async () => {
    try {
      setLoading(true);
      setError("");
   
      if (!id || id === 'undefined') {
        setError("Invalid training ID. Please select a valid training.");
        setLoading(false);
        return;
      }
      

      console.log(`Fetching training with ID: ${id}`);
      
    
      const token = currentUser?.token;
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
  
      const params = {};
      if (currentUser?.email) {
        params.email = currentUser.email;
      }
      
    
      const { data } = await axios.get(`${API_BASE_URL}/trainings/employee/${id}`, {
        headers,
        params
      });
      
      if (!data) {
        throw new Error("No data received from server");
      }
      
      console.log("Training data received:", data);
      setTraining(data);
      
  
      if (data.progressUpdates && data.progressUpdates.length > 0) {
        setProgress(data.progressPercentage || 0);
        
        if (data.completedTasks && Array.isArray(data.completedTasks)) {
          setTaskCompleted(data.completedTasks);
        } else {
         
          const defaultTasks = generateDefaultTasks(data.skillContent || "training");
          setTaskCompleted(defaultTasks);
        }
      } else {
    
        const defaultTasks = generateDefaultTasks(data.skillContent || "training");
        setTaskCompleted(defaultTasks);
      }
    } catch (error) {
      console.error("Error fetching training details:", error);
      
   
      let errorMsg = "Failed to load training details";
      
      if (error.response) {
      
        errorMsg = error.response.data?.message || error.response.statusText;
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
     
        if (error.response.status === 404) {
          errorMsg = "Training not found. It may have been deleted or you don't have access.";
        }
     
        else if (error.response.status === 403) {
          errorMsg = "You don't have permission to view this training.";
        }
      } else if (error.request) {
       
        errorMsg = "No response received from server. Please check your connection.";
      } else {
     
        errorMsg = error.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  
  const generateDefaultTasks = (skillContent) => {
   
    return [
      { id: 1, task: `Introduction to ${skillContent}`, completed: false },
      { id: 2, task: `Core concepts of ${skillContent}`, completed: false },
      { id: 3, task: `Practical application of ${skillContent}`, completed: false },
      { id: 4, task: `${skillContent} assessment`, completed: false }
    ];
  };
  
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);
  
  const handleTaskToggle = (taskId) => {
    const updatedTasks = taskCompleted.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTaskCompleted(updatedTasks);
    
   
    const completedCount = updatedTasks.filter(task => task.completed).length;
    const newProgress = Math.round((completedCount / updatedTasks.length) * 100);
    setProgress(newProgress);
  };
  
  const updateTrainingProgress = async () => {
    if (!statusUpdate.trim()) {
      setError("Please add a status update before submitting");
      return;
    }
    
    try {
      setUpdating(true);
      
      const progressUpdate = {
        date: new Date().toISOString(),
        statusUpdate,
        progressPercentage: progress,
        completedTasks: taskCompleted
      };
      
  
      const employeeEmail = training.email;
      const employeeName = training.employee;
      const employeeId = training.employeeId;
      
  
      const headers = {};
      if (currentUser?.token) {
        headers['Authorization'] = `Bearer ${currentUser.token}`;
      }
      
    
      const response = await axios.put(`${API_BASE_URL}/trainings/${id}/progress`, {
        progressUpdates: [...(training.progressUpdates || []), progressUpdate],
        progressPercentage: progress,
        completedTasks: taskCompleted,
      
        status: progress === 100 ? 'Completed' : 'In Progress',
       
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: employeeName,
        employeeEmail,
        employeeId
      }, { headers });
      
      setTraining(response.data);
      setStatusUpdate("");
      setSuccess("Progress updated successfully! HR has been notified of your update.");
      
      
      await axios.post(`${API_BASE_URL}/trainings/notify`, {
        trainingId: id,
        employeeEmail,
        employeeName,
        employeeId,
        updateType: 'progress',
        progressPercentage: progress,
        status: progress === 100 ? 'Completed' : 'In Progress'
      }, { headers });
      
    } catch (error) {
      console.error("Error updating progress:", error);
      setError(error.response?.data?.message || "Failed to update progress");
    } finally {
      setUpdating(false);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Planned': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate('/employee/trainings')} sx={{ mt: 2 }}>
          Back to Trainings
        </Button>
      </Container>
    );
  }
  
  if (!training) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
          Training not found
        </Alert>
        <Button onClick={() => navigate('/employee/trainings')} sx={{ mt: 2 }}>
          Back to Trainings
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}
      
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" gutterBottom>
              {training.title}
            </Typography>
            <Chip 
              label={training.status} 
              color={getStatusColor(training.status)} 
              icon={<PlayArrow />}
            />
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Training Information
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Employee" 
                      secondary={training.employee} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Badge />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Employee ID" 
                      secondary={training.employeeId || 'Not assigned'} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email" 
                      secondary={training.email} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Skill Category" 
                      secondary={training.skillCategory} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Assignment />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Skill Content" 
                      secondary={training.skillContent} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EventNote />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Duration" 
                      secondary={`${new Date(training.startDate).toLocaleDateString()} - ${new Date(training.endDate).toLocaleDateString()}`} 
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Progress Tracker
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={progress} 
                      sx={{ height: 10, borderRadius: 5 }} 
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{`${progress}%`}</Typography>
                </Box>
                
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                  Task Completion
                </Typography>
                
                {taskCompleted.map((task) => (
                  <FormControlLabel
                    key={task.id}
                    control={
                      <Checkbox
                        checked={task.completed}
                        onChange={() => handleTaskToggle(task.id)}
                        icon={<CheckBoxOutlineBlank />}
                        checkedIcon={<CheckBox />}
                      />
                    }
                    label={task.task}
                  />
                ))}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Update Progress
          </Typography>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Status Update"
            placeholder="Describe what you've learned and your progress..."
            value={statusUpdate}
            onChange={(e) => setStatusUpdate(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            color="primary"
            onClick={updateTrainingProgress}
            disabled={updating}
            startIcon={<Update />}
          >
            {updating ? 'Updating...' : 'Submit Update'}
          </Button>
        </CardContent>
      </Card>
      
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Progress History
          </Typography>
          
          {(!training.progressUpdates || training.progressUpdates.length === 0) ? (
            <Typography variant="body2" color="text.secondary">
              No progress updates yet. Be the first to add an update!
            </Typography>
          ) : (
            <List>
              {training.progressUpdates.map((update, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <CheckCircle color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle1">
                            Progress Update: {update.progressPercentage}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(update.date)}
                          </Typography>
                        </Box>
                      }
                      secondary={update.statusUpdate}
                    />
                  </ListItem>
                  {index < training.progressUpdates.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}


function EmployeeTrainingViewWithAuth() {
  return (
    <AuthProvider>
      <EmployeeTrainingView />
    </AuthProvider>
  );
}

export default EmployeeTrainingViewWithAuth;