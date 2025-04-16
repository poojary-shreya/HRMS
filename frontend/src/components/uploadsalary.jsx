import { useEffect, useState } from "react";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation } from "react-router-dom";
import { Container, TextField, Button, Typography, Paper, Dialog, DialogTitle, DialogContent, IconButton, Box, Grid } from "@mui/material";

const UploadSalary = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [pfno, setPfno] = useState("");
  const [uan, setUan] = useState("");
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [ctc, setCtc] = useState("");
  const [joiningBonus, setJoiningBonus] = useState("");
  const [variableSalary, setVariableSalary] = useState("");
  const [isJoiningBonusPaid, setIsJoiningBonusPaid] = useState(false);
  const [salaryDetails, setSalaryDetails] = useState(null);
  const [open, setOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setOpen(true);
  }, [location.pathname]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/employees/${employeeId}`);
      setEmployeeDetails(res.data.data);
      setOpen(false); 
    } catch (error) {
      console.error("Error fetching employee details:", error);
      alert("Employee not found");
    }
  };

  const calculateSalaryComponents = (enteredCTC) => {
    if (enteredCTC <= 0) {
      alert("CTC must be greater than 0");
      return;
    }
    
    const base_salary = enteredCTC * 0.50;
    const hra = base_salary * 0.40;
    const pf = base_salary * 0.12;
    const professional_tax = 200;
    const medical_allowance = 15000;
    const newspaper_allowance = 12000;
    const dress_allowance = 12000;
    let other_allowance = enteredCTC - (base_salary + hra + pf + (professional_tax * 12) + medical_allowance + newspaper_allowance + dress_allowance);
    
    if(other_allowance < 0) {
      other_allowance = 0;
    }
    
    const joiningBonusValue = parseFloat(joiningBonus) || 0;
    const variableSalaryValue = parseFloat(variableSalary) || 0;
    

    const deduction = pf + (professional_tax * 12);
    const taxable_income = base_salary + hra + medical_allowance + newspaper_allowance + 
                          dress_allowance + other_allowance + joiningBonusValue + 
                          variableSalaryValue - deduction;
    
 
    let total_tax = 0;
    if (taxable_income > 1200000) {
      total_tax += (taxable_income - 1200000) * 0.3 + 400000 * 0.2 + 400000 * 0.05;
    } else if (taxable_income > 800000) {
      total_tax += (taxable_income - 800000) * 0.2 + 400000 * 0.05;
    } else if (taxable_income >= 400000) {
      total_tax += (taxable_income - 400000) * 0.05;
    }
    
    total_tax += total_tax * 0.04; 
    const monthly_tax = total_tax / 12;
    
    setSalaryDetails({
      ctc: enteredCTC,
      base_salary,
      hra,
      pf,
      professional_tax,
      medical_allowance,
      newspaper_allowance,
      dress_allowance,
      other_allowance,
      joining_bonus: joiningBonusValue,
      variable_salary: variableSalaryValue,
      taxable_income,
      total_tax,
      monthly_tax
    });
  };

  const handleCtcChange = (e) => {
    let enteredCTC = parseFloat(e.target.value);
    
    if (enteredCTC < 0) {
      alert("CTC cannot be negative!");
      setCtc(""); 
      return;
    }
  
    setCtc(enteredCTC);
    if (!isNaN(enteredCTC)) {
      calculateSalaryComponents(enteredCTC);
    }
  };

  const handleJoiningBonusChange = (e) => {
    let value = parseFloat(e.target.value);
    
    if (value < 0) {
      alert("Joining Bonus cannot be negative!");
      setJoiningBonus(""); 
      return;
    }
  
    setJoiningBonus(value);
    if (ctc && !isNaN(parseFloat(ctc))) {
      calculateSalaryComponents(parseFloat(ctc));
    }
  };

  const handleVariableSalaryChange = (e) => {
    let value = parseFloat(e.target.value);
    
    if (value < 0) {
      alert("Variable Salary cannot be negative!");
      setVariableSalary(""); 
      return;
    }
  
    setVariableSalary(value);
    if (ctc && !isNaN(parseFloat(ctc))) {
      calculateSalaryComponents(parseFloat(ctc));
    }
  };
  
  const submitPayroll = async () => {
    if (!salaryDetails || !pfno.trim() || !uan.trim() || ctc === "") {
      alert("Please fill in all required fields (CTC, PF Number, and UAN) before submitting.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/payroll/createPayroll", {
        employee_id: employeeId,
        pfno,
        uan,
        ctc: parseFloat(ctc),
        joining_bonus: parseFloat(joiningBonus) || 0,
        variable_salary: parseFloat(variableSalary) || 0,
        is_joining_bonus_paid: isJoiningBonusPaid
      });
      alert("Salary details submitted successfully!");
    } catch (error) {
      console.error("Error submitting payroll:", error);
      alert("Error submitting salary details");
    }
  };

  return (
    <>
      {!open && !employeeDetails && (
        <Box display="flex" justifyContent="left" mt={3} ml={3}>
          <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
            Fetch Payslip
          </Button>
        </Box>
      )}
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload CTC Details
          <IconButton onClick={() => setOpen(false)} sx={{ position: "absolute", right: 10, top: 10 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Employee ID"
            variant="outlined"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            margin="normal"
          />
          <Box display="flex" justifyContent="center" mt={3} gap={2}>
            <Button variant="contained" color="primary" onClick={fetchEmployeeDetails}>
              Fetch
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Container width="95%" maxWidth="none" sx={{mt:4}}>
        <Paper elevation={3} sx={{ p: 8 }}>
          {employeeDetails && (
            <>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Employee Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth label="First Name" variant="outlined" value={employeeDetails.firstName} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Last Name" variant="outlined" value={employeeDetails.lastName} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Phone Number" variant="outlined" value={employeeDetails.phoneNumber} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="City" variant="outlined" value={employeeDetails.city} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="PF Number" variant="outlined" value={pfno} onChange={(e) => setPfno(e.target.value)} required />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="UAN" variant="outlined" value={uan} onChange={(e) => setUan(e.target.value)} required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Enter CTC" variant="outlined" type="number" value={ctc} onChange={handleCtcChange} required />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Joining Bonus" variant="outlined" type="number" value={joiningBonus} onChange={handleJoiningBonusChange} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Variable Salary" variant="outlined" type="number" value={variableSalary} onChange={handleVariableSalaryChange} />
                </Grid>
              </Grid>
            </>
          )}

          {salaryDetails && (
            <Paper sx={{ mt: 3, p: 2, backgroundColor: "#e3f2fd" }}>
              <Typography variant="h6">Salary Breakdown</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography><strong>Base Salary:</strong> ₹{salaryDetails.base_salary.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>HRA:</strong> ₹{salaryDetails.hra.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>PF:</strong> ₹{salaryDetails.pf.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Professional Tax:</strong> ₹{salaryDetails.professional_tax.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Medical Allowance:</strong> ₹{salaryDetails.medical_allowance.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Newspaper Allowance:</strong> ₹{salaryDetails.newspaper_allowance.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Dress Allowance:</strong> ₹{salaryDetails.dress_allowance.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>Other Allowance:</strong> ₹{salaryDetails.other_allowance.toFixed(2)}</Typography>
                </Grid>
                {salaryDetails.joining_bonus > 0 && (
                  <Grid item xs={6}>
                    <Typography><strong>Joining Bonus:</strong> ₹{salaryDetails.joining_bonus.toFixed(2)}</Typography>
                  </Grid>
                )}
                {salaryDetails.variable_salary > 0 && (
                  <Grid item xs={6}>
                    <Typography><strong>Variable Salary:</strong> ₹{salaryDetails.variable_salary.toFixed(2)}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}

          {salaryDetails && (
            <Box textAlign="center">
              <Button variant="contained" color="primary" sx={{ mt: 3 }} onClick={submitPayroll}>
                Submit Payroll
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default UploadSalary;