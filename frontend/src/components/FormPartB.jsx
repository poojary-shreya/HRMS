import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box,
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation, useNavigate } from 'react-router-dom';

const Form16BComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log("location: ", location.state);
  
  
  const [employeeId, setEmployeeId] = useState('');
  const [certificateNo, setCertificateNo] = useState('');
  const [form16BData, setForm16BData] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });


  useEffect(() => {
    console.log("Location state received:", location.state);
  
    if (location.state && location.state.employeeId) {
    
      setEmployeeId(location.state.employeeId);
      
   
      if (location.state.certificateNo) {
        setCertificateNo(location.state.certificateNo);
      }
      
     
    }
  }, [location.state]);

  const generateForm16B = async () => {
    if (!employeeId) {
      setNotification({
        open: true,
        message: 'Employee ID is required',
        type: 'error'
      });
      return;
    }
    
    if (!certificateNo) {
      setNotification({
        open: true,
        message: 'Certificate Number is required',
        type: 'error'
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/form16B/generate', {
        employee_id: employeeId,
        certifiacte_no: certificateNo
      });
      
      setForm16BData(response.data);
      setDialogOpen(false);
      
      setNotification({
        open: true,
        message: 'Form 16B generated successfully',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error generating Form 16B:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to generate Form 16B',
        type: 'error'
      });
    
    } finally {
      setLoading(false);
    }
  };

 
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value || 0);
  };


  const navigateToForm16A = () => {
    navigate('/form16A');
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Form 16 Part B
      </Typography>

   
      <Dialog open={dialogOpen && !form16BData} maxWidth="sm" fullWidth>
        <DialogTitle>
          Generate Form 16B
          <IconButton 
            onClick={() => navigate('/form16A')} 
            sx={{ position: "absolute", right: 10, top: 10 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box p={2}>
            <Typography variant="body1" gutterBottom>
              Enter details to generate Form 16B:
            </Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Certificate No"
                  value={certificateNo}
                  onChange={(e) => setCertificateNo(e.target.value)}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={navigateToForm16A} 
            color="secondary"
          >
            Cancel
          </Button>
          <Button 
            onClick={generateForm16B} 
            variant="contained" 
            color="primary"
            disabled={loading || !employeeId || !certificateNo}
          >
            {loading ? <CircularProgress size={24} /> : 'Generate Form 16B'}
          </Button>
        </DialogActions>
      </Dialog>

    
      {form16BData && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            
            <Button variant="contained" color="primary" onClick={navigateToForm16A}>
              Back to Form 16A
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Employee Details</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Employee ID</Typography>
                      <Typography variant="body1">{form16BData.employee.employee_id}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Name</Typography>
                      <Typography variant="body1">{`${form16BData.employee.firstName} ${form16BData.employee.lastName}`}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">PAN Number</Typography>
                      <Typography variant="body1">{form16BData.employee.panNumber}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Phone</Typography>
                      <Typography variant="body1">{form16BData.employee.phoneNumber}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

          
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Exemption Details</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">HRA Exemption</Typography>
                      <Typography variant="body1">{form16BData.form16b.hra_exemption}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Medical Exemption</Typography>
                      <Typography variant="body1">{form16BData.form16b.medical_exemption}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Newspaper Exemption</Typography>
                      <Typography variant="body1">{form16BData.form16b.newspaper_exemption}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Dress Exemption</Typography>
                      <Typography variant="body1">{form16BData.form16b.dress_exemption}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Other Exemption</Typography>
                      <Typography variant="body1">{form16BData.form16b.other_exemption}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Investment Details</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Section 80C</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16b.section80C_investment)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Section 80CCC</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16b.section80CCC_investment)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Section 80CCD(1B)</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16b.section80CCD_1B)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Section 80CCD(2)</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16b.section80CCD_2)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Section 80D</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16b.section80D)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Section 24(b)</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16b.section24_b)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Section 80E</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16b.section80E)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Section 80EEB</Typography>
                      <Typography variant="body1">{formatCurrency(form16BData.form16b.section80EEB)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

        
            <Grid item xs={12}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Deductions & Tax</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Professional Tax</Typography>
                      <Typography variant="body1">{form16BData.form16b.professional_tax}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Investment Deductions</Typography>
                      <Typography variant="body1">{form16BData.form16b.total_deductions}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Taxable Income</Typography>
                      <Typography variant="body1">{form16BData.form16b.taxable_income}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2">Total Tax</Typography>
                      <Typography variant="body1">{form16BData.form16b.total_tax}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            
          </Grid>
        </>
      )}

   
      <Snackbar 
        open={notification.open} 
        autoHideDuration={5000} 
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Form16BComponent;