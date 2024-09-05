import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import MUIDataTable from "mui-datatables";
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "views/Login/config/config";
import Header from "components/Headers/Header.js";
import './styles.css';
const Jobs = () => {
  const [data, setData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    companyLogo: "",
    jobType: "",
    location: "",
    qualifications: [],
    requirements: [],
    skills: [],
    salary: "",
    contactEmail: "",
    education: [],
    benefits: [],
    experience: [],
    description: "",
    postingDate: "",
    applicationDeadline: ""
  });

  // Fetch data from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "jobs"),
      (querySnapshot) => {
        const documents = querySnapshot.docs.map((doc, index) => ({
          id: doc.id,
          SlNo: index + 1,
          ...doc.data(),
        }));
        setData(documents);
      }
    );
    return () => unsubscribe();
  }, []);

  // Handle Add Subscription Plan
  const handleAddUser = async () => {
    try {
      await addDoc(collection(db, "jobs"), formData);
      setFormData({
        title: "",
        company: "",
        companyLogo: "",
        jobType: "",
        location: "",
        qualifications: [],
        requirements: [],
        skills: [],
        salary: "",
        contactEmail: "",
        education: [],
        benefits: [],
        experience: [],
        description: "",
        postingDate: "",
        applicationDeadline: ""
      });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Handle Update Subscription Plan
  const handleUpdateUser = async () => {
    try {
      const userRef = doc(db, "jobs", editId);
      await updateDoc(userRef, formData);
      setFormData({
        title: "",
        company: "",
        companyLogo: "",
        jobType: "",
        location: "",
        qualifications: [],
        requirements: [],
        skills: [],
        salary: "",
        contactEmail: "",
        education: [],
        benefits: [],
        experience: [],
        description: "",
        postingDate: "",
        applicationDeadline: ""
      });
      setDialogOpen(false);
      setEditId(null);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Handle Delete Subscription Plan
  const handleDelete = async (rowIndex) => {
    try {
      const userToDelete = data[rowIndex];
      await deleteDoc(doc(db, "jobs", userToDelete.id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  // Handle Edit Button Click
  const handleEdit = (rowIndex) => {
    const userToEdit = data[rowIndex];
    setFormData({
      name: userToEdit.name,
      price: userToEdit.price,
      validity_in_months: userToEdit.validity_in_months,
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

  // Reset form data when dialog is closed
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({
      name: "",
      price: "",
      validity_in_months: "",
    });
    setEditId(null);
  };

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
      name: "title",
      label: "Job Title",
    },
    {
      name: "company",
      label: "Company",
    },
    {
      name: "jobType",
      label: "Job Type",
    },
    {
      name: "location",
      label: "Location",
    },
    {
      name: "salary",
      label: "Salary",
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
            onClick={() => {
              setFormData({
                name: "",
                price: "",
                validity_in_months: "",
              });
              setEditId(null);
              setDialogOpen(true);
            }}
          >
            Add
          </Button>
        </Box>
        <br />
        <br />
        <MUIDataTable
          title={"Subscription List"}
          data={data}
          columns={columns}
          options={options}
        />
      </Container>

      {/* Dialog for Add/Edit Subscription Plan */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {editId ? "Edit Subscription Plan" : "Add Subscription Plan"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Plan Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Price"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Validity (in months)"
              value={formData.validity_in_months}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  validity_in_months: e.target.value,
                })
              }
              fullWidth
              margin="dense"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained">
              {editId ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default Jobs;
