import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';


const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roleFromQuery = searchParams.get('role') || '';

  const [role, setRole] = useState(roleFromQuery);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/user/login', {
        email,
        password,
        
      },{withCredentials: true,});

      const { token ,user} = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);


      navigate('/');

    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'white',
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          {role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Login` : 'Login'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            label="Role"
            select
            variant="outlined"
            fullWidth
            margin="normal"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <MenuItem value="employee">Employee</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="hr">HR</MenuItem>
          </TextField>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              variant="contained"
              type="submit"
              sx={{
                mt: 2,
                width: "120px",
              
              }}
            >
              Login
            </Button>

          </Box>
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 2, cursor: "pointer", color: "blue" }}
            onClick={() => navigate("/register")}
          >
            Don't have an account? Register here.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button

              variant="outlined"
              color="black"
              sx={{ mt: 2, width: "120px" }}
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default Login;
