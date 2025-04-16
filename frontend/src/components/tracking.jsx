import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Pagination,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Search,
  Person,
  Email,
  Phone,
  Code,
  WorkHistory,
  Add
} from "@mui/icons-material";

const CandidateFilter = () => {
  const [filters, setFilters] = useState({ skills: "", experience: "" });
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [displayedCandidates, setDisplayedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [openAddSkillDialog, setOpenAddSkillDialog] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [skillError, setSkillError] = useState("");
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
    fetchAvailableSkills();
  }, []);

  useEffect(() => {
    if (filteredCandidates.length > 0) {
      const sortedCandidates = [...filteredCandidates].sort((a, b) => b.id - a.id);

      const searchFilteredCandidates = searchTerm
        ? sortedCandidates.filter(candidate =>
            candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.positionApplied?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : sortedCandidates;

      updateDisplayedCandidates(searchFilteredCandidates, page);
    } else {
      setDisplayedCandidates([]);
    }
  }, [filteredCandidates, searchTerm, page]);

  const updateDisplayedCandidates = (candidates, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedCandidates(candidates.slice(startIndex, endIndex));
  };

  const fetchCandidates = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/candidates");
      setCandidates(response.data);
      setFilteredCandidates(response.data);
    } catch (error) {
      setError("Failed to fetch candidates. Please try again.");
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
  
      const response = await axios.get("http://localhost:5000/api/skills");
      if (response.data && Array.isArray(response.data)) {
        setAvailableSkills(response.data);
     
        localStorage.setItem('availableSkills', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error("Error fetching skills from API:", error);
      
   
      const localSkills = localStorage.getItem('availableSkills');
      if (localSkills) {
        try {
          const parsedSkills = JSON.parse(localSkills);
          setAvailableSkills(parsedSkills);
        } catch (parseError) {
          console.error("Error parsing local skills:", parseError);
          setDefaultSkills();
        }
      } else {

        setDefaultSkills();
      }
    }
  };

  const setDefaultSkills = () => {
    const defaultSkills = [
      "Node", "React", "Python", "Java", "MongoDB", "Express", "JavaScript", 
      "Django", "SQL", "Spring Boot", ".NET", "C#", "Angular", "TypeScript", 
      "PostgreSQL", "Kotlin", "C++", "Blockchain", "Vue.js", "Solidity"
    ];
    setAvailableSkills(defaultSkills);
    localStorage.setItem('availableSkills', JSON.stringify(defaultSkills));
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filterCandidates = () => {
    setFilteredCandidates(
      candidates.filter(
        (candidate) =>
          (!filters.skills || candidate.skills.includes(filters.skills)) &&
          (!filters.experience || candidate.experience === parseInt(filters.experience))
      )
    );
    setPage(1);
  };

  const scheduleInterview = (candidate) => {
    navigate("/interview-scheduling", { 
      state: { 
        name: candidate.name, 
        email: candidate.email,
        positionApplied: candidate.positionApplied || "Not specified",
        skills: candidate.skills.join(", "), 
        experience: `${candidate.experience} years`
      } 
    });
  };

  const handleOpenAddSkillDialog = () => {
    setOpenAddSkillDialog(true);
    setNewSkill("");
    setSkillError("");
  };

  const handleCloseAddSkillDialog = () => {
    setOpenAddSkillDialog(false);
  };

  const handleNewSkillChange = (e) => {
    setNewSkill(e.target.value);
    if (e.target.value.trim() === "") {
      setSkillError("Skill cannot be empty");
    } else if (availableSkills.includes(e.target.value.trim())) {
      setSkillError("This skill already exists");
    } else {
      setSkillError("");
    }
  };

  const handleAddSkill = async () => {
    if (newSkill.trim() === "") {
      setSkillError("Skill cannot be empty");
      return;
    }

    if (availableSkills.includes(newSkill.trim())) {
      setSkillError("This skill already exists");
      return;
    }

    const updatedSkills = [...availableSkills, newSkill.trim()];

    try {
    
      await axios.post("http://localhost:5000/api/skills", { skill: newSkill.trim() });
      
   
      setAvailableSkills(updatedSkills);
      
      localStorage.setItem('availableSkills', JSON.stringify(updatedSkills));
      
     
      setError("");
      
   
      handleCloseAddSkillDialog();
    } catch (error) {
      console.error("Error adding skill to API:", error);
      
   
      setAvailableSkills(updatedSkills);
      localStorage.setItem('availableSkills', JSON.stringify(updatedSkills));
      handleCloseAddSkillDialog();
    }
  };

  return (
    <Box sx={{ maxWidth: 1500, margin: "auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Candidate Filter
      </Typography>
      
      <Box display="flex" gap={2} marginBottom={2}>
        <FormControl fullWidth>
          <InputLabel>Skills</InputLabel>
          <Select 
            name="skills" 
            label="Skills" 
            value={filters.skills} 
            onChange={handleChange}
            endAdornment={
              <InputAdornment position="end" sx={{ position: 'absolute', right: 28, pointerEvents: 'none' }}>
                <Button 
                  onClick={handleOpenAddSkillDialog}
                  sx={{ minWidth: 'auto', pointerEvents: 'auto' }}
                >
                  <Add />
                </Button>
              </InputAdornment>
            }
          >
            {availableSkills.sort().map((skill) => (
              <MenuItem key={skill} value={skill}>{skill}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Experience (Years)</InputLabel>
          <Select
            name="experience"
            label="Experience (Years)"
            value={filters.experience}
            onChange={handleChange}
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"].map((year) => (
              <MenuItem key={year} value={year}>{year} years</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ width: "180px", height: "40px", paddingTop: "10px" }}>
          <Button
            variant="contained"
            onClick={filterCandidates}
          >
            Filter
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", marginBottom: 2 }}>
        <TextField
          label="Search candidates"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <hr style={{ margin: "20px 0", border: "1px solid gray" }} />
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><Person fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Name</TableCell>
                  <TableCell><Email fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Email</TableCell>
                  <TableCell><Phone fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Phone</TableCell>
                  <TableCell><WorkHistory fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Job Title</TableCell>
                  <TableCell><Code fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Skills</TableCell>
                  <TableCell><WorkHistory fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />Experience</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedCandidates.length > 0 ? (
                  displayedCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>{candidate.name}</TableCell>
                      <TableCell>{candidate.email}</TableCell>
                      <TableCell>{candidate.phone}</TableCell>
                      <TableCell>{candidate.positionApplied || 'N/A'}</TableCell>
                      <TableCell>{candidate.skills.join(", ")}</TableCell>
                      <TableCell>{candidate.experience} years</TableCell>
                      <TableCell>
                        <Box sx={{ width: "185px", height: "30px" }}>
                          <Button
                            variant="contained"
                            onClick={() => scheduleInterview(candidate)}
                          >
                            Schedule Interview
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No candidates found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredCandidates.length > itemsPerPage && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={Math.ceil(filteredCandidates.length / itemsPerPage)}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}


      <Dialog open={openAddSkillDialog} onClose={handleCloseAddSkillDialog}>
        <DialogTitle>Add New Skill</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Skill Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newSkill}
            onChange={handleNewSkillChange}
            error={!!skillError}
            helperText={skillError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddSkillDialog}>Cancel</Button>
          <Button 
            onClick={handleAddSkill} 
            variant="contained" 
            disabled={!newSkill.trim() || !!skillError}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidateFilter;