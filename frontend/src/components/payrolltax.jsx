import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from "@mui/material";
import {  useLocation, useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";


const PayrollTax = () => {
  const navigate = useNavigate();

  const location = useLocation();
  console.log(location.state);
  const payrollIdFromRoute = location.state?.EmployeeId || "";
  console.log(payrollIdFromRoute);

  const [payroll, setPayroll] = useState(payrollIdFromRoute); 
  const [payrollId, setPayrollId] = useState(""); 
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    standard_deduction: "",
    section80C_investment: "",
    section80CCC_investment: "",
    otherInvestment: "",
    section80D: "",
    section80CCD_1B: "",
    section80CCD_2: "",
    section24_b: "",
    section80E: "",
    section80EEB: ""
  });


  useEffect(() => {
    setOpen(true);
  }, [location.pathname]);


  useEffect(() => {
    if(payrollIdFromRoute) {
      setPayrollId(payrollIdFromRoute);
    }
  }, [payrollIdFromRoute]);
  
  const fetchPayroll = async () => {
    try {
      setError(null);
      const payrollResponse = await axios.get(`http://localhost:5000/api/tax/salary/${payrollId}`);
      let payrollData = payrollResponse.data.data;
  
    
      let updatedHra = 0;
      let updateMedical = 0;
      let updateNewspaper = 0;
      let updateDress = 0;
      let updateOtherAllowance = 0;
      let section80C = 0;
      let section80CCC = 0;
      let otherInvestment = 0;
      let section80D = 0;
      let section80CCD_1B = 0;
      let section80CCD_2 = 0;
      let section24_b = 0;
      let section80E = 0;
      let section80EEB = 0;
      
      try {
      
        const documentResponse = await axios.get("http://localhost:5000/api/employee/status/documents");
        console.log(documentResponse);
        
        if (documentResponse.data && Array.isArray(documentResponse.data)) {
          const documents = documentResponse.data;
          console.log(documents);
      
          const employeeId = payrollData.personal?.employee_id;
      
        
          if (employeeId && documents.length > 0) {
            const employeeDocuments = documents.filter(doc => doc.employee_id === employeeId) || [];
          
           
            if (employeeDocuments.length > 0) {
              updatedHra = employeeDocuments.find(doc => doc.category?.toLowerCase() === "hra")?.claimed_amount || 0;
              updateMedical = employeeDocuments.find(doc => doc.category?.toLowerCase() === "medical_allowance")?.claimed_amount || 0;
              updateNewspaper = employeeDocuments.find(doc => doc.category?.toLowerCase() === "newspaper_allowance")?.claimed_amount || 0;
              updateDress = employeeDocuments.find(doc => doc.category?.toLowerCase() === "dress_allowance")?.claimed_amount || 0;
              updateOtherAllowance = employeeDocuments.find(doc => doc.category?.toLowerCase() === "other_allowance")?.claimed_amount || 0;
          
              section80C = employeeDocuments
                .filter(doc => doc.category === "section80C_investment")
                .reduce((total, doc) => total + (doc.claimed_amount || 0), 0);
          
              section80CCC = employeeDocuments
                .filter(doc => doc.category === "section80CCC_investment")
                .reduce((total, doc) => total + (doc.claimed_amount || 0), 0);
          
              otherInvestment = employeeDocuments
                .filter(doc => doc.category === "other_investment")
                .reduce((total, doc) => total + (doc.claimed_amount || 0), 0);
        
              section80D = employeeDocuments
                .filter(doc => doc.category === "section80D")
                .reduce((total, doc) => total + (doc.claimed_amount || 0), 0);
        
              section80CCD_1B = employeeDocuments
                .filter(doc => doc.category === "section80CCD_1B")
                .reduce((total, doc) => total + (doc.claimed_amount || 0), 0);
        
              section80CCD_2 = employeeDocuments
                .filter(doc => doc.category === "section80CCD_2")
                .reduce((total, doc) => total + (doc.claimed_amount || 0), 0);
        
              section24_b = employeeDocuments
                .filter(doc => doc.category === "section24_b")
                .reduce((total, doc) => total + (doc.claimed_amount || 0), 0);
        
              section80E = employeeDocuments
                .filter(doc => doc.category === "section80E")
                .reduce((total, doc) => total + (doc.claimed_amount || 0), 0);
        
              section80EEB = employeeDocuments
                .filter(doc => doc.category === "section80EEB")
                .reduce((total, doc) => total + (doc.claimed_amount || 0), 0);
            }
          }
        }
      } catch (docError) {
        console.error("Error fetching documents, proceeding with default values", docError);
      }
  
      setPayroll({
        ...payrollData,
        hra: updatedHra,
        medical_allowance: updateMedical,
        newspaper_allowance: updateNewspaper,
        dress_allowance: updateDress,
        other_allowance: updateOtherAllowance,
      });
  
      setFormData({
        standard_deduction: "",
        section80C_investment: section80C,
        section80CCC_investment: section80CCC,
        otherInvestment: otherInvestment,
        section80D: section80D,
        section80CCD_1B: section80CCD_1B,
        section80CCD_2: section80CCD_2,
        section24_b: section24_b,
        section80E: section80E,
        section80EEB: section80EEB
      });
      setOpen(false);
  
    } catch (error) {
      console.error("Error fetching payroll or investments", error);
      setPayroll(null); 
      setError("Failed to fetch payroll. Please check the Employee ID and try again.");
    }
  };
  
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, employee_id: payrollId };
      await axios.post("http://localhost:5000/api/tax/calculate", payload);
      alert("Payroll calculated successfully");


      if(payrollIdFromRoute){
        navigate("/generate-payslip",{
          state :{employeeId:payrollIdFromRoute,
            month:location.state?.month || "",
            year: location.state?.year || "",
          }
        })
      }
    } catch (error) {
      console.error("Error calculating payroll", error);
    }
  };

  return (
    <>
    {!open && (<Box display="flex" justifyContent="left" mt={2}>
              <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
                Fetch Payroll
              </Button>
            </Box>)}
   
    <Container maxWidth={false} sx={{ maxWidth: 1500, mt: 2, boxShadow: 3, mx: 3, paddingTop:"15px", paddingBottom: "8px" }}>

    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Payroll Calculation
          <IconButton onClick={() => setOpen(false)} sx={{ position: "absolute", right: 10, top: 10 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Enter Employee ID"
            variant="outlined"
            value={payrollId}
            onChange={(e) => setPayrollId(e.target.value)}
           margin="normal"
          />
         {error && <Typography color="error" align="center" mt={2}>{error}</Typography>}
                    
          <Box display="flex" justifyContent="center" mt={3} gap={2}>
          <Button variant="contained" color="primary" onClick={fetchPayroll}>
          Fetch Payroll
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => setOpen(false)}>
             Cancel
          </Button>
        </Box>

        </DialogContent>
      </Dialog>

      
      {payroll && (
        <>
        <Typography variant="h4" gutterBottom align="center" fontWeight="bold" >
      Payroll Calculation
    </Typography>
          <TableContainer component={Paper} style={{ marginBottom: "20px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>First Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Last Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Phone Number</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>CTC</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Base Salary</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>HRA</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Medical Allowance</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>PF</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{payroll.personal?.firstName}</TableCell>
                  <TableCell>{payroll.personal?.lastName}</TableCell>
                  <TableCell>{payroll.personal?.phoneNumber}</TableCell>
                  <TableCell>{payroll.ctc}</TableCell>
                  <TableCell>{payroll.base_salary}</TableCell>
                  <TableCell>{payroll.hra}</TableCell>
                  <TableCell>{payroll.medical_allowance}</TableCell>
                  <TableCell>{payroll.pf}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Standard Deduction"
              name="standard_deduction"
              fullWidth
              margin="normal"
              onChange={handleChange}
              required
            />
            </Grid>
            <Grid item xs={6}>
            <TextField
              label="Section 80C Investment"
              name="section80C_investment"
              fullWidth
              margin="normal"
              value={formData.section80C_investment}
              onChange={handleChange}
              required
            />
            </Grid>
            <Grid item xs={6}>
            <TextField
              label="Section 80CCC Investment"
              name="section80CCC_investment"
              fullWidth
              margin="normal"
              value={formData.section80CCC_investment}
              onChange={handleChange}
              required
            />
            </Grid>
            <Grid item xs={6}>
            <TextField
              label="section80D Investment"
              name="section80D"
              fullWidth
              margin="normal"
              value={formData.section80D}
              onChange={handleChange}
              required
            />
            </Grid><Grid item xs={6}>
            <TextField
              label="section80CCD(1B) Investment"
              name="section80CCD_1B"
              fullWidth
              margin="normal"
              value={formData.section80CCD_1B}
              onChange={handleChange}
              required
            />
            </Grid><Grid item xs={6}>
            <TextField
              label="section80CCD(2) Investment"
              name="section80CCD_2"
              fullWidth
              margin="normal"
              value={formData.section80CCD_2}
              onChange={handleChange}
              required
            />
            </Grid><Grid item xs={6}>
            <TextField
              label="section24(b) Investment"
              name="section24_b"
              fullWidth
              margin="normal"
              value={formData.section24_b}
              onChange={handleChange}
              required
            />
            </Grid><Grid item xs={6}>
            <TextField
              label="section80E Investment"
              name="section80E"
              fullWidth
              margin="normal"
              value={formData.section80E}
              onChange={handleChange}
              required
            />
            </Grid>
            <Grid item xs={6}>
            <TextField
              label="section80EEB Investment"
              name="section80EEB"
              fullWidth
              margin="normal"
              value={formData.section80EEB}
              onChange={handleChange}
              required
            />
            </Grid>
            <Grid item xs={6}>
            <TextField
              label="Other Investment"
              name="otherInvestment"
              fullWidth
              margin="normal"
              value={formData.otherInvestment}
              onChange={handleChange}
              required
            />
            </Grid>
            <Box display="flex" justifyContent="center" marginTop={2}>
            <Button type="submit" variant="contained" color="primary"  >Calculate Payroll</Button>

            </Box>
            </Grid>
          </form>
        </>
      )}
    </Container>
    </>
  );
};

export default PayrollTax;