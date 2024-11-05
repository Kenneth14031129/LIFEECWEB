import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Header from "../components/Header.jsx";
import "../styles/AddUser.css";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [users, setUsers] = useState([]);
  const [hasError, setHasError] = useState(false); // Error state
  const [loading, setLoading] = useState(true); // Loading state

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setHasError(false);
    try {
      const response = await fetch("http://localhost:3000/api/v1/user/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users.");
      }
      const data = await response.json();
      setUsers(data.users || []); // Ensure 'users' is an array
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setHasError(true);
      setLoading(false);
      toast.error("Error fetching user list: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = { name, email, password, userType };

    try {
      const response = await fetch("http://localhost:3000/api/v1/user/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${response.status} ${errorText}`);
      }

      const newUser = await response.json();
      console.log("New User added:", newUser);

      toast.success("User added successfully!");

      // Reset form fields
      setName("");
      setEmail("");
      setPassword("");
      setUserType("");

      fetchUsers(); // Refresh the user list after adding a new user
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Error submitting data: " + error.message);
    }
  };

  // DataGrid columns configuration
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "userType", headerName: "User Type", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleEdit(params.row.id)}
            style={{ marginRight: '10px' }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const handleEdit = (userId) => {
    navigate(`/editUser/${userId}`);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/user/delete/${userId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete user.");
        }
        toast.success("User deleted successfully!");
        fetchUsers(); // Refresh the user list after deletion
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Error deleting user: " + error.message);
      }
    }
  };

  return (
    <div>
      <Header />
      <ToastContainer /> {/* ToastContainer for toast notifications */}
      <Paper elevation={4} className="add-user-form">
        <Typography variant="h4" gutterBottom>
          Add New User
        </Typography>
        <Typography variant="body1" gutterBottom align="center">
          Please enter the details of the new user below.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                fullWidth
                label="Full Name"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                variant="outlined"
                sx={{ border: "none", boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.2)" }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                fullWidth
                label="Email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="outlined"
                type="email"
                sx={{ border: "none", boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.2)" }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <TextField
                fullWidth
                label="Password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="outlined"
                type="password"
                sx={{ border: "none", boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.2)" }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: '48%' } }}>
              <FormControl fullWidth required variant="outlined">
                <InputLabel id="user-type-label">User Type</InputLabel>
                <Select
                  labelId="user-type-label"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  label="User Type"
                >
                  <MenuItem value="Nurse">Nurse</MenuItem>
                  <MenuItem value="Nutritionist">Nutritionist</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: '100%' }}>
              <Button fullWidth variant="contained" color="primary" type="submit">
                Add User
              </Button>
            </Box>
          </Box>
        </form>

        <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
          Registered Users
        </Typography>
        <div style={{ height: 400, width: '100%' }}>
          {loading ? (
            <Typography variant="body1">Loading...</Typography>
          ) : hasError ? (
            <Typography variant="body1" color="error">
              Error loading users. Please try again.
            </Typography>
          ) : users.length === 0 ? (
            <Typography variant="body1">No users found.</Typography>
          ) : (
            <DataGrid
              rows={users.map((user, index) => ({ id: index + 1, ...user }))}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
            />
          )}
        </div>
      </Paper>
    </div>
  );
}

export default AddUser;
