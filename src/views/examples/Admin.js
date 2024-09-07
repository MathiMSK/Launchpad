import { useEffect, useState } from "react";
import {
  Container,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import MUIDataTable from "mui-datatables";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "views/Login/config/config";
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import { Grid } from "@mui/material";
import './styles.css';
const Admin = () => {
  const [data, setData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    profile_url: "",
  });

  // Columns for the MUI DataTable
  const columns = [
    {
      name: "SlNo",
      label: "Sl.No",
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "username",
      label: "Name",
    },
    {
      name: "email",
      label: "Email",
    },
    {
      name: "profile_url",
      label: "Profile URL",
    },
    {
      name: "action",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <>
              <Edit
                style={{ cursor: "pointer", marginRight: "10px" }}
                onClick={() => handleEdit(tableMeta.rowIndex)}
              />
              <Delete
                style={{ cursor: "pointer" }}
                onClick={() => handleDelete(tableMeta.rowIndex)}
              />
            </>
          );
        },
      },
    },
  ];

  // Fetch data from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "admin_details"), (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        SlNo: index + 1,
        ...doc.data(),
      }));
      setData(documents);
    });
    return () => unsubscribe();
  }, []);

  // Handle Add User
  const handleAddUser = async () => {
    try {
      await addDoc(collection(db, "admin_details"), formData);
      setEditId(null); 
      setFormData({ email: "" });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Handle Update User
  const handleUpdateUser = async () => {
    try {
      const userRef = doc(db, "admin_details", editId);
      await updateDoc(userRef, formData);
      setFormData({  email: "" });
      setDialogOpen(false);
      setEditId(null);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Handle Delete User
  const handleDelete = async (rowIndex) => {
    try {
      const userToDelete = data[rowIndex];
      await deleteDoc(doc(db, "admin_details", userToDelete.id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  // Handle Edit Button Click
  const handleEdit = (rowIndex) => {
    const userToEdit = data[rowIndex];
    setFormData({
      // username: userToEdit.username,
      email: userToEdit.email,
      // mobile: userToEdit.mobile,
    });
    setEditId(userToEdit.id);
    setDialogOpen(true);
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      handleUpdateUser();
    } else {
      handleAddUser();
    }
  };

  // Options for MUI DataTable
  const options = {
    filterType: "checkbox",
    selectableRows: "none",
    responsive: "simple",
    rowsPerPage: 10,
    rowsPerPageOptions: [10, 20, 30],
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Box sx={{ width: "100%" }}>
          <Button
            startIcon={<Add />}
            variant="contained"
            sx={{ color: "black", backgroundColor: "white", float: "right" }}
            onClick={() => setDialogOpen(true)}
          >
            Add
          </Button>
        </Box>
        <br />
        <br />
        <MUIDataTable
          title={"Admin List"}
          data={data}
          columns={columns}
          options={options}
        />
      </Container>

      {/* Dialog for Add/Edit User */}
      <Dialog
  open={dialogOpen}
  // onClose={() => setDialogOpen(false)}
  onClose={() => {
    setDialogOpen(false);
    setEditId(null); 
    setFormData({ email: "" }); // Clear form data when dialog is closed
  }}
  fullWidth
  maxWidth="sm"
  sx={{ padding: "20px" }}
>
  <DialogTitle>
    <Typography variant="h6" component="div">
      {editId ? "Edit User" : "Add User"}
    </Typography>
  </DialogTitle>
  <form onSubmit={handleSubmit}>
    <DialogContent dividers>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            fullWidth
            margin="dense"
            required
            variant="outlined"
          />
        </Grid>
        {/* Add more form fields here if needed */}
      </Grid>
    </DialogContent>
    <DialogActions sx={{ padding: "16px 24px" }}>
      <Button
        onClick={() => setDialogOpen(false)}
        color="secondary"
        variant="outlined"
        sx={{ marginRight: "8px" }}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        color="primary"
        variant="contained"
      >
        {editId ? "Update" : "Add"}
      </Button>
    </DialogActions>
  </form>
</Dialog>

    </>
  );
};

export default Admin;
