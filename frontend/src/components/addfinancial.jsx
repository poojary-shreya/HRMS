import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Paper, Grid, TextField, Button } from "@mui/material";

const AddFinancial = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const isEditMode = state?.isEdit;
  
  const [formData, setFormData] = useState({
    employeeDetails: {
      employeeId: state?.employee_id || "",
      department: "",
      resignationDate: "",
      noticePeriod: "",
      advanceSalary: "",
      creditCardOffered: "",
    },
    finance: {
      bankName: "",
      accountDetails: "",
      ifscCode: "",
      currentSalary: "",
      previousSalary: "",
      ctc: "",
      taxCalculation: "",
    },
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (isEditMode && state?.employee_id) {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:5000/api/financial/${state.employee_id}`
          );
          
          if (response.data.success && response.data.data) {
            const financialData = response.data.data; 
            setFormData({
              employeeDetails: {
                employeeId: financialData.employee_id,
                department: financialData.department,
                resignationDate: financialData.resignationDate || "",
                noticePeriod: financialData.noticePeriod || "",
                advanceSalary: financialData.advanceSalary || "",
                creditCardOffered: financialData.creditCardOffered || "",
              },
              finance: {
                bankName: financialData.bankName || "",
                accountDetails: financialData.accountNumber || "", 
                ifscCode: financialData.ifscCode || "",
                currentSalary: financialData.currentSalary || "",
                previousSalary: financialData.previousSalary || "",
                ctc: financialData.ctc || "",
                taxCalculation: financialData.taxCalculation || "",
              },
            });
          }
        } catch (error) {
          console.error("Error fetching financial data:", error);
          alert("Failed to load financial details");
        } finally {
          setLoading(false);
        }
      }
    };
  
    if (isEditMode) fetchFinancialData();
  }, [isEditMode, state?.employee_id]);

  const handleChange = (e, section, field) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: e.target.value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.employeeDetails.employeeId || !formData.employeeDetails.department) {
      alert("Employee ID and Department are required!");
      return;
    }
  
    try {
      const payload = {
        employee_id: formData.employeeDetails.employeeId,
        department: formData.employeeDetails.department,
        resignationDate: formData.employeeDetails.resignationDate || null,
        noticePeriod: formData.employeeDetails.noticePeriod,
        advanceSalary: formData.employeeDetails.advanceSalary,
        creditCardOffered: formData.employeeDetails.creditCardOffered,
        bankName: formData.finance.bankName,
        accountNumber: formData.finance.accountDetails, 
        ifscCode: formData.finance.ifscCode,
        currentSalary: parseFloat(formData.finance.currentSalary) || 0,
        previousSalary: parseFloat(formData.finance.previousSalary) || 0,
        ctc: parseFloat(formData.finance.ctc) || 0,
        taxCalculation: parseFloat(formData.finance.taxCalculation) || 0,
      };
  
      const response = await axios({
        method: isEditMode ? "put" : "post",
        url: isEditMode 
          ? `http://localhost:5000/api/financial/${formData.employeeDetails.employeeId}`
          : "http://localhost:5000/api/financial",
        data: payload,
        headers: {
          "Content-Type": "application/json",
        }
      });
  
      if (response.data.success || response.status === 201) {
        alert(`Financial details ${isEditMode ? 'updated' : 'added'} successfully!`);
       
        navigate("/addrole", { 
          state: { 
            employee_id: formData.employeeDetails.employeeId,
            isEdit: isEditMode 
          } 
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.error || 
        "Failed to save financial details";
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <Box sx={{ maxWidth: 1500, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        {isEditMode ? "Edit Financial Details" : "Add Financial Details"}
      </Typography>
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom> Employee Details </Typography>
        <Grid container spacing={2}>
          {Object.keys(formData.employeeDetails).map((field) => (
            <Grid item xs={6} key={field}>
              <TextField
                label={field.replace(/([A-Z])/g, " $1").trim()}
                fullWidth
                type={field === "resignationDate" ? "date" : "text"}
                InputLabelProps={field === "resignationDate" ? { shrink: true } : {}}
                value={formData.employeeDetails[field]}
                onChange={(e) => handleChange(e, "employeeDetails", field)}
                required={["department", "employeeId"].includes(field)}
                disabled={field === "employeeId" && (state?.employee_id || isEditMode)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom> Finance Information </Typography>
        <Grid container spacing={2}>
          {Object.keys(formData.finance).map((field) => (
            <Grid item xs={6} key={field}>
              <TextField
                label={field.replace(/([A-Z])/g, " $1").trim()}
                fullWidth
                value={formData.finance[field]}
                onChange={(e) => handleChange(e, "finance", field)}
                required
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            {isEditMode ? 'Update' : 'Submit'}
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate("/addrole", { 
              state: { 
                employee_id: formData.employeeDetails.employeeId,
                isEdit: isEditMode 
              } 
            })} 
          >
            Role & responsibilities
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddFinancial;