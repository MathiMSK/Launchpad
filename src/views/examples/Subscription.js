import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  UncontrolledTooltip,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import MUIDataTable from "mui-datatables";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "views/Login/config/config";
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";

const Subscription = () => {
  const [data, setData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    validity_in_months: "",
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
      name: "name",
      label: "Plan Name",
    },
    {
      name: "price",
      label: "Price",
    },
    {
      name: "validity_in_months",
      label: "Validity (in months)",
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
    const unsubscribe = onSnapshot(collection(db, "subscription_plan"), (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        SlNo: index + 1,
        ...doc.data(),
      }));
      setData(documents);
    });
    return () => unsubscribe();
  }, []);
  console.log();
  

  // Handle Add User
  const handleAddUser = async () => {
    try {
      await addDoc(collection(db, "subscription_plan"), formData);
      setFormData({   name: "",
        price: "",
        validity_in_months: "" });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Handle Update User
  const handleUpdateUser = async () => {
    try {
      const userRef = doc(db, "subscription_plan", editId);
      await updateDoc(userRef, formData);
      setFormData({   name: "",
        price: "",
        validity_in_months: "" });
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
      await deleteDoc(doc(db, "subscription_plan", userToDelete.id));
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
          title={"Subscription List"}
          data={data}
          columns={columns}
          options={options}
        />
      </Container>

      {/* Dialog for Add/Edit User */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{editId ? "Edit Subscription Plan" : "Add Subscription Plan"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              label="Plan Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Validity ( in months )"
              value={formData.validity_in_months}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              fullWidth
              margin="dense"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="primary">
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

export default Subscription;
