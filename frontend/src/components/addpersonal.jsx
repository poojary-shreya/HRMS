import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Grid,
  Box,
  Paper,
} from "@mui/material";

const Addpersonal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams(); 
  const isEditMode = !!id || location.state?.isEdit;
  
  const [formData, setFormData] = useState({
    employmentStatus: "Active",
    company_registration_no:"12345",

    personalDetails: {
      firstName: "",
      lastName: "",
      personalemail:"",
      dateOfBirth: "",
      anniversary: "",
      gender: "",
      panNumber: "",
      panCardFile: null,
      adharCardNumber: "",
      adharCardFile: null,
    },
    contactInfo: {
      phoneNumber: "",
      houseNumber: "",
      street: "",
      crossStreet: "",
      area: "",
      city: "",
      pinCode: "",
    },
    emergencyContact: {
      mobile: "",
      landline: "",
    },
    insurance: {
      individualInsurance: "",
      groupInsurance: "",
    },
    nominations: [{ name: "", relationship: "", age: "" }],
    qualifications: [{ degree: "", institution: "", year: "", file: null }],
    certificates: [{ name: "", issuedBy: "", date: "", file: null }],

  });

  const handleDirectChange = (e, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleChange = (e, section, key) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: e.target.value,
      },
    }));
  };

  const handleArrayChange = (section, index, field) => (event) => {
    setFormData((prev) => {
      const updatedSection = [...prev[section]];
      updatedSection[index][field] = event.target.value;
      return { ...prev, [section]: updatedSection };
    });
  };

  const handleFileUpload = (e, section, key) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: e.target.files[0],
      },
    }));
  };

  const handleArrayFileUpload = (section, index, field) => (event) => {
    setFormData((prev) => {
      const updatedSection = [...prev[section]];
      updatedSection[index] = {
        ...updatedSection[index],
        file: event.target.files[0]
      };
      return { ...prev, [section]: updatedSection };
    });
  };

  const addEntry = (section, newEntry) => {
    setFormData((prev) => ({
      ...prev,
      [section]: [...prev[section], newEntry],
    }));
  };

  

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const editId = id || location.state?.employee_id;
      
      if (editId) {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/employees/${editId}`);
          
          if (data.success) {
            const employeeData = data.data;
            setFormData({
              employee_id:editId,
              employmentStatus: employeeData.employmentStatus,
              company_registration_no:employeeData.company_registration_no,
              personalDetails: {
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                personalemail: employeeData.personalemail,
                dateOfBirth: employeeData.dateOfBirth?.split('T')[0] || '',
                anniversary: employeeData.anniversary?.split('T')[0] || '',
                gender: employeeData.gender,
                panNumber: employeeData.panNumber,
                adharCardNumber: employeeData.adharCardNumber
              },
              contactInfo: {
                phoneNumber: employeeData.phoneNumber,
                houseNumber: employeeData.houseNumber,
                street: employeeData.street,
                crossStreet: employeeData.crossStreet,
                area: employeeData.area,
                city: employeeData.city,
                pinCode: employeeData.pinCode
              },
              emergencyContact: {
                mobile:employeeData.mobile,
                landline: employeeData.landline,
              },
              insurance: {
                individualInsurance: employeeData.individualInsurance,
                groupInsurance: employeeData.groupInsurance,
              },
              nominations: employeeData.nominations || [{ name: "", relationship: "", age: "" }],
              qualifications: employeeData.qualifications || [{ degree: "", institution: "", year: "", file: null }],
              certificates: employeeData.certificates || [{ name: "", issuedBy: "", date: "", file: null }]
            });
          }
        } catch (error) {
          console.error("Fetch error:", error);
          alert("Error loading employee data");
        }
      }
    };
  
    if (isEditMode) fetchEmployeeData();
  }, [id, location.state, isEditMode]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      const editId = id || location.state?.employee_id;
  
   
      formDataToSend.append("employmentStatus", formData.employmentStatus);
      formDataToSend.append("company_registration_no", formData.company_registration_no);

      
      formDataToSend.append("personalDetails", JSON.stringify(formData.personalDetails));
      formDataToSend.append("contactInfo", JSON.stringify(formData.contactInfo));
      formDataToSend.append("nominations", JSON.stringify(formData.nominations));
      formDataToSend.append("qualifications", JSON.stringify(formData.qualifications));
      formDataToSend.append("certificates", JSON.stringify(formData.certificates));
      formDataToSend.append("insurance", JSON.stringify(formData.insurance));
      formDataToSend.append("emergencyContact", JSON.stringify(formData.emergencyContact));
  
      if (formData.personalDetails.panCardFile) {
        formDataToSend.append("panCardFile", formData.personalDetails.panCardFile);
      }
      if (formData.personalDetails.adharCardFile) {
        formDataToSend.append("adharCardFile", formData.personalDetails.adharCardFile);
      }
      
      formData.qualifications.forEach((qual, index) => {
        if (qual.file) {
          formDataToSend.append(`qualificationFile`, qual.file);
        }
      });
      
      formData.certificates.forEach((cert, index) => {  
        if (cert.file) {
          formDataToSend.append(`certificationFile`, cert.file);
        }
      });
  
      const apiUrl = isEditMode
        ? `http://localhost:5000/api/updateEmployee/${editId}`
        : "http://localhost:5000/api/addEmployee";
  
      const response = await axios({
        method: isEditMode ? "put" : "post",
        url: apiUrl,
        data: formDataToSend,
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.data.success) {
        const {employee_id, companyemail}=response.data.data;
        alert(isEditMode ? "Updated successfully!" : `Employee added successfully!\nEmployeeId: ${employee_id}\nCompanyEmail: ${companyemail}`);
        navigate("/addfinancial", { 
          state: { 
            employee_id: employee_id,
            isEdit: isEditMode
          } 
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };
  return (
    <Box sx={{ maxWidth: 1500, margin: 'auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        {isEditMode ? "Edit  Personal Details" : "Add  Personal Details"}
      </Typography>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Grid container spacing={2}>
        {isEditMode && (
      <Grid item xs={6}>
        <TextField 
          label="Employee ID" 
          fullWidth 
          value={formData.employee_id || ''}
          disabled={true}
        />
      </Grid>
    )}
    <Grid item xs={isEditMode ? 6 : 12}>
      <FormControl fullWidth>
        <InputLabel>Employment Status</InputLabel>
        <Select
          label="Employment Status"
          value={formData.employmentStatus}
          onChange={(e) => handleDirectChange(e, 'employmentStatus')}
          required>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Resigned">Resigned</MenuItem>
          <MenuItem value="Deceased">Deceased</MenuItem>
        </Select>
      </FormControl>
    </Grid>
          {/* <Grid item xs={12}>
            <TextField 
              label="Company Registration No" 
              fullWidth 
              value={formData.company_registration_no}
              onChange={(e) => handleDirectChange(e, 'company_registration_no')}
              required 
              disabled={isEditMode}
            />
          </Grid> */}
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Personal Details</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><TextField label="First Name" fullWidth value={formData.personalDetails.firstName} onChange={(e) => handleChange(e, 'personalDetails', 'firstName')} required /></Grid>
          <Grid item xs={6}><TextField label="Last Name" fullWidth value={formData.personalDetails.lastName} onChange={(e) => handleChange(e, 'personalDetails', 'lastName')} required /></Grid>
          <Grid item xs={6}><TextField label="Email" fullWidth value={formData.personalDetails.personalemail} onChange={(e) => handleChange(e, 'personalDetails', 'personalemail')} required /></Grid>
          <Grid item xs={6}><TextField label="Date of Birth" type="date" fullWidth value={formData.personalDetails.dateOfBirth} InputLabelProps={{ shrink: true }} onChange={(e) => handleChange(e, 'personalDetails', 'dateOfBirth')} required /></Grid>
          <Grid item xs={6}><TextField label="Anniversary" type="date" fullWidth value={formData.personalDetails.anniversary} InputLabelProps={{ shrink: true }} onChange={(e) => handleChange(e, 'personalDetails', 'anniversary')} /></Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                label="Gender"
                value={formData.personalDetails.gender}
                onChange={(e) => handleChange(e, 'personalDetails', 'gender')}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}><TextField label="PAN Card Number" fullWidth value={formData.personalDetails.panNumber} onChange={(e) => handleChange(e, 'personalDetails', 'panNumber')} required /></Grid>
          <Grid item xs={6}>
            <Typography variant="body2" gutterBottom>PAN Card File</Typography>
            <input type="file" onChange={(e) => handleFileUpload(e, 'personalDetails', 'panCardFile')} />
          </Grid>
          <Grid item xs={6}><TextField label="Aadhar Card Number" fullWidth value={formData.personalDetails.adharCardNumber} onChange={(e) => handleChange(e, 'personalDetails', 'adharCardNumber')} required /></Grid>
          <Grid item xs={6}>
            <Typography variant="body2" gutterBottom>Aadhar Card File</Typography>
            <input type="file" onChange={(e) => handleFileUpload(e, 'personalDetails', 'adharCardFile')} />
          </Grid>

          
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Contact Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><TextField label="Phone Number" fullWidth value={formData.contactInfo.phoneNumber} onChange={(e) => handleChange(e, 'contactInfo', 'phoneNumber')} required /></Grid>
          <Grid item xs={6}><TextField label="House Number" fullWidth value={formData.contactInfo.houseNumber} onChange={(e) => handleChange(e, 'contactInfo', 'houseNumber')} required /></Grid>
          <Grid item xs={6}><TextField label="Street" fullWidth value={formData.contactInfo.street} onChange={(e) => handleChange(e, 'contactInfo', 'street')} required /></Grid>
          <Grid item xs={6}><TextField label="Cross Street" fullWidth value={formData.contactInfo.crossStreet} onChange={(e) => handleChange(e, 'contactInfo', 'crossStreet')} /></Grid>
          <Grid item xs={6}><TextField label="Area" fullWidth value={formData.contactInfo.area} onChange={(e) => handleChange(e, 'contactInfo', 'area')} required /></Grid>
          <Grid item xs={6}><TextField label="City" fullWidth value={formData.contactInfo.city} onChange={(e) => handleChange(e, 'contactInfo', 'city')} required /></Grid>
          <Grid item xs={6}><TextField label="Pin Code" fullWidth value={formData.contactInfo.pinCode} onChange={(e) => handleChange(e, 'contactInfo', 'pinCode')} required /></Grid>
        </Grid>
      </Paper>


      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Emergency Contact</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><TextField label="Mobile" fullWidth value={formData.emergencyContact.mobile} onChange={(e) => handleChange(e, 'emergencyContact', 'mobile')} required /></Grid>
          <Grid item xs={6}><TextField label="Landline" fullWidth value={formData.emergencyContact.landline} onChange={(e) => handleChange(e, 'emergencyContact', 'landline')}  /></Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>health Information(This details needs to be filled by company)</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}><TextField label="Individual Insuarnce" fullWidth value={formData.insurance.individualInsurance} onChange={(e) => handleChange(e, 'insurance', 'individualInsurance')} required /></Grid>
          <Grid item xs={6}><TextField label="Group Insuarnce" fullWidth value={formData.insurance.groupInsurance} onChange={(e) => handleChange(e, 'insurance', 'groupInsurance')} required /></Grid>
        </Grid>
      </Paper>









      

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Nomination Details</Typography>
        {formData.nominations.map((nomination, index) => (
          <Grid container spacing={3} key={index} alignItems="center">
            <Grid item xs={4}>
              <TextField fullWidth label="Name" value={nomination.name} onChange={handleArrayChange("nominations", index, "name")} required />
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth>
                <InputLabel>Relationship</InputLabel>
                <Select value={nomination.relationship} onChange={handleArrayChange("nominations", index, "relationship")} label="Relationship" required>
                  <MenuItem value="Spouse">Spouse</MenuItem>
                  <MenuItem value="Parent">Parent</MenuItem>
                  <MenuItem value="Child">Child</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Age" value={nomination.age} onChange={handleArrayChange("nominations", index, "age")} required />
            </Grid>
          </Grid>
        ))}
        <Button onClick={() => addEntry("nominations", { name: "", relationship: "", age: "" })} variant="outlined" sx={{ mt: 2 }}>Add Nominee</Button>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Qualifications</Typography>
        {formData.qualifications.map((qualification, index) => (
          <Grid container spacing={3} key={index} alignItems="center">
            <Grid item xs={3}>
              <TextField fullWidth label="Degree" value={qualification.degree} onChange={handleArrayChange("qualifications", index, "degree")} required />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth label="Institution" value={qualification.institution} onChange={handleArrayChange("qualifications", index, "institution")} required />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth label="Year" value={qualification.year} onChange={handleArrayChange("qualifications", index, "year")} required />
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" gutterBottom>Qualification Document</Typography>
              <input type="file" accept=".pdf,.jpg,.png" onChange={handleArrayFileUpload("qualifications", index, "file")} />
            </Grid>
          </Grid>
        ))}
        <Button onClick={() => addEntry("qualifications", { degree: "", institution: "", year: "", file: null })} variant="outlined" sx={{ mt: 2 }}>Add Qualification</Button>
      </Paper>

      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>Certifications</Typography>
        {formData.certificates.map((cert, index) => (
          <Grid container spacing={3} key={index} alignItems="center">
            <Grid item xs={3}>
              <TextField fullWidth label="Certificate Name" value={cert.name} onChange={handleArrayChange("certificates", index, "name")} required />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth label="Issued By" value={cert.issuedBy} onChange={handleArrayChange("certificates", index, "issuedBy")} required />
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={cert.date} onChange={handleArrayChange("certificates", index, "date")} required />
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body2" gutterBottom>Certificate Document</Typography>
              <input type="file" accept=".pdf,.jpg,.png" onChange={handleArrayFileUpload("certificates", index, "file")} />
            </Grid>
          </Grid>
        ))}
        <Button onClick={() => addEntry("certificates", { name: "", issuedBy: "", date: "", file: null })} variant="outlined" sx={{ mt: 2 }}>Add Certificate</Button>
      </Paper>
      
      <Grid container sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            size="large"
        
          >
            {isEditMode ? 'Update' : 'Save'} Employee
          </Button>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            color="primary" 
        
            onClick={() => navigate("/addfinancial", { 
              state: { 
                employee_id: formData.employee_id,
                isEdit: isEditMode
              } 
            })}
          >
            Finance details
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Addpersonal;