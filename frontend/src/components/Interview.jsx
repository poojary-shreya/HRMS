import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
} from "@mui/material";
import axios from "axios";

const InterviewScheduleForm = () => {
  const location = useLocation();
  const candidateData = location.state || {};

  const [hiringManagers, setHiringManagers] = useState([]);
  const [managerLoadError, setManagerLoadError] = useState(null);

  const [interview, setInterview] = useState({
    name: candidateData.name || "",
    email: candidateData.email || "",
    skills: candidateData.skills || "",
    experience: candidateData.experience || "",
    interviewDate: "",
    interviewTime: "",
    interviewer: "",
    round: "",
    hiringManagerEmail: candidateData.hiringManagerEmail || "",
    positionApplied: candidateData.positionApplied || "" 
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const fetchHiringManagers = async () => {
    setManagerLoadError(null);
    try {
   
      const response = await axios.get("http://localhost:5000/api/roles/employees/byrole/Hiring Manager");
      
      if (response.data.success && response.data.data) {
    
        const managers = response.data.data.map(manager => ({
          email: manager.email || manager.companyemail,
          name: `${manager.firstName || ''} ${manager.lastName || ''}`.trim(),
        }));
        setHiringManagers(managers);
      } else {
        throw new Error("Failed to fetch hiring managers");
      }
    } catch (err) {
      console.error("Error fetching hiring managers:", err);
      setManagerLoadError("Failed to load hiring managers");
    }
  };

  useEffect(() => {
    if (candidateData.name) {
      setInterview((prev) => ({
        ...prev,
        name: candidateData.name,
        email: candidateData.email,
        skills: candidateData.skills || "",
        experience: candidateData.experience || "",
        positionApplied: candidateData.positionApplied || "",
        hiringManagerEmail: candidateData.hiringManagerEmail || ""
      }));
    }
    
 
    fetchHiringManagers();
  }, [candidateData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...interview,
      experience: parseInt(interview.experience) || 0,
      positionApplied: interview.positionApplied 
    };
    console.log("Payload being sent:", payload);
  
    try {
      const response = await fetch("http://localhost:5000/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), 
      });

      const data = await response.json();
      if (response.ok) {
        alert("Interview scheduled! Confirmation email sent.");
        setInterview({
          name: "",
          email: "",
          skills: "",
          experience: "",
          interviewDate: "",
          positionApplied: "",
          interviewTime: "",
          interviewer: "",
          round: "",
          hiringManagerEmail: ""
        });
      } else {
        setError(data.message || "Error scheduling interview");
      }
    } catch (err) {
      console.error("Error scheduling interview:", err);
      setError("An error occurred while scheduling the interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: 1500, mt: 3, boxShadow: 3, mx: 3 }}>
        <Card>
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            sx={{ padding: "15px" }}
            fontWeight="bold"
          >
            Interview Scheduling
          </Typography>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Candidate Name"
                    value={interview.name || ""}
                    onChange={(e) =>
                      setInterview({ ...interview, name: e.target.value })
                    }
                    fullWidth
                    required
                    margin="normal"
                    InputProps={{ readOnly: !!candidateData?.name }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Candidate Email"
                    type="email"
                    value={interview.email || ""}
                    onChange={(e) =>
                      setInterview({ ...interview, email: e.target.value })
                    }
                    fullWidth
                    required
                    margin="normal"
                    InputProps={{ readOnly: !!candidateData?.email }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Skills"
                    value={interview.skills || ""}
                    onChange={(e) =>
                      setInterview({ ...interview, skills: e.target.value })
                    }
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: !!candidateData?.skills }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Experience"
                    value={interview.experience || ""}
                    onChange={(e) =>
                      setInterview({ ...interview, experience: e.target.value })
                    }
                    fullWidth
                    margin="normal"
                    InputProps={{ readOnly: !!candidateData?.experience }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Job Title"
                    value={interview.positionApplied}
                    onChange={(e) =>
                      setInterview({ ...interview, positionApplied: e.target.value })
                    }
                    fullWidth
                    required
                    margin="normal"
                    InputProps={{ readOnly: !!candidateData?.positionApplied }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required margin="normal">
                    <InputLabel>Hiring Manager Email</InputLabel>
                    <Select
                      label="Hiring Manager Email"
                      value={interview.hiringManagerEmail}
                      onChange={(e) => setInterview({ ...interview, hiringManagerEmail: e.target.value })}
                      inputProps={{ readOnly: !!candidateData?.hiringManagerEmail }}
                    >
                      {managerLoadError && (
                        <MenuItem disabled>
                          <Typography color="error">{managerLoadError}</Typography>
                        </MenuItem>
                      )}
                      
                      {hiringManagers.length === 0 && !managerLoadError && (
                        <MenuItem disabled>
                          <Typography>No hiring managers found</Typography>
                        </MenuItem>
                      )}
                      
                      {hiringManagers.map((manager) => (
                        <MenuItem key={manager.email} value={manager.email}>
                          {manager.name ? `${manager.name} (${manager.email})` : manager.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Interview Date"
                    type="date"
                    value={interview.interviewDate}
                    onChange={(e) =>
                      setInterview({ ...interview, interviewDate: e.target.value })
                    }
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Interview Time"
                    type="time"
                    value={interview.interviewTime}
                    onChange={(e) =>
                      setInterview({ ...interview, interviewTime: e.target.value })
                    }
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    margin="normal"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required margin="normal">
                    <InputLabel>Round</InputLabel>
                    <Select
                      label="Round"
                      value={interview.round}
                      onChange={(e) =>
                        setInterview({ ...interview, round: e.target.value })
                      }
                    >
                      {["Technical 1", "Technical 2", "Technical 3", "Architectural Round", "Manager Round", "HR Round"].map((round) => (
                        <MenuItem key={round} value={round}>{round}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Interviewer"
                    value={interview.interviewer}
                    onChange={(e) =>
                      setInterview({ ...interview, interviewer: e.target.value })
                    }
                    fullWidth
                    required
                    margin="normal"
                  />
                </Grid>
              </Grid>

              {error && <Box sx={{ color: "red", marginTop: 2 }}>{error}</Box>}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: 2 }}
                  disabled={loading}
                >
                  {loading ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </div>
  );
};

export default InterviewScheduleForm;