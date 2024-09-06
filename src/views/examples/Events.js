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
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Switch, FormControlLabel, Chip } from "@mui/material";
import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Events = () => {
  const [data, setData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    event_type: "",
    date: "",
    time: "",
    location: "",
    description: "",
    approved_by_admin: false,
    status: "Pending",
    banner_images: [""],
    is_virtual_event: false,
    is_active: false,
  });
  const [bannerImage, setBannerImage] = useState(null);

  // Firebase Storage
  const storage = getStorage();

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
      label: "Name",
    },
    {
      name: "event_type",
      label: "Event Type",
    },
    {
      name: "date",
      label: "Date",
    },
    {
      name: "status",
      label: "Status",
      options:{
        customBodyRender:(value, index)=>{
          return (
            <>
              {
                value.approved_by_admin === true ? (<Chip label="Appored" color="success" />):(<Chip label="Rejected" color="error" />)
              }
            </>
          )
        }
      }
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
              <Visibility
                style={{ cursor: "pointer", marginRight: "10px" }}
                onClick={() => handleView(tableMeta.rowIndex)}
              />
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
    const unsubscribe = onSnapshot(collection(db, "events"), (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        SlNo: index + 1,
        ...doc.data(),
      }));
      setData(documents);
    });
    return () => unsubscribe();
  }, []);

  // Handle Add Event
  const handleAddEvent = async () => {
    try {
      let bannerImageUrl = "";
      if (bannerImage) {
        const imageRef = ref(storage, `banner_images/${bannerImage.name}`);
        await uploadBytes(imageRef, bannerImage);
        bannerImageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "events"), { ...formData, banner_images: [bannerImageUrl] });
      resetForm();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Handle Update Event
  const handleUpdateEvent = async () => {
    try {
      let bannerImageUrl = formData.banner_images[0];
      if (bannerImage) {
        const imageRef = ref(storage, `banner_images/${bannerImage.name}`);
        await uploadBytes(imageRef, bannerImage);
        bannerImageUrl = await getDownloadURL(imageRef);
      }

      const eventRef = doc(db, "events", editId);
      await updateDoc(eventRef, { ...formData, banner_images: [bannerImageUrl] });
      resetForm();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Handle Delete Event
  const handleDelete = async (rowIndex) => {
    try {
      const eventToDelete = data[rowIndex];
      await deleteDoc(doc(db, "events", eventToDelete.id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  // Handle Edit Button Click
  const handleEdit = (rowIndex) => {
    const eventToEdit = data[rowIndex];
    setFormData({
      title: eventToEdit.title,
      event_type: eventToEdit.event_type,
      date: eventToEdit.date,
      time: eventToEdit.time,
      location: eventToEdit.location,
      description: eventToEdit.description,
      approved_by_admin: eventToEdit.approved_by_admin,
      status: eventToEdit.status,
      banner_images: eventToEdit.banner_images,
      is_virtual_event: eventToEdit.is_virtual_event,
      is_active: eventToEdit.is_active,
    });
    setEditId(eventToEdit.id);
    setDialogOpen(true);
  };

  // Handle View Button Click
  const handleView = (rowIndex) => {
    const eventToView = data[rowIndex];
    setSelectedEvent(eventToView);
    setViewDialogOpen(true);
  };

  // Handle Approve Event
  const handleApprove = async () => {
    try {
      const eventRef = doc(db, "events", selectedEvent.id);
      await updateDoc(eventRef, {  approved_by_admin: true });
      setViewDialogOpen(false);
    } catch (error) {
      console.error("Error approving event: ", error);
    }
  };

  // Handle Reject Event
  const handleReject = async () => {
    try {
      const eventRef = doc(db, "events", selectedEvent.id);
      await updateDoc(eventRef, { approved_by_admin: false });
      setViewDialogOpen(false);
    } catch (error) {
      console.error("Error rejecting event: ", error);
    }
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      handleUpdateEvent();
    } else {
      handleAddEvent();
    }
  };

  // Handle File Change
  const handleFileChange = (e) => {
    setBannerImage(e.target.files[0]);
  };

  // Reset form data when dialog is closed
  const resetForm = () => {
    setFormData({
      title: "",
      event_type: "",
      date: "",
      time: "",
      location: "",
      description: "",
      approved_by_admin: false,
      status: "Pending",
      banner_images: [""],
      is_virtual_event: false,
      is_active: false,
    });
    setBannerImage(null);
    setDialogOpen(false);
    setEditId(null);
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
          title={"Events List"}
          data={data}
          columns={columns}
          options={options}
        />
      </Container>

      {/* Dialog for Add/Edit Event */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
      <DialogTitle>{editId ? "Edit Event" : "Add Event"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Event Type"
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label={formData.is_virtual_event ? "Virtual Link" : "Location"}
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            fullWidth
            margin="dense"
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            margin="dense"
            required
          />
          {formData.banner_images[0] && (
            <TextField
              label="Banner Image URL"
              value={formData.banner_images[0]}
              onChange={(e) =>
                setFormData({ ...formData, banner_images: [e.target.value] })
              }
              fullWidth
              margin="dense"
            />
          )}
          <input
            accept="image/*"
            type="file"
            onChange={handleFileChange}
            style={{ marginTop: '10px', display: 'block' }} // Added margin for spacing
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_virtual_event}
                onChange={(e) =>
                  setFormData({ ...formData, is_virtual_event: e.target.checked })
                }
              />
            }
            label="Virtual Event"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
            }
            label="Active Event"
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

      {/* Dialog for Viewing Event Details */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)}>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <>
              <p><strong>Title:</strong> {selectedEvent.title}</p>
              <p><strong>Event Type:</strong> {selectedEvent.event_type}</p>
              <p><strong>Date:</strong> {selectedEvent.date}</p>
              <p><strong>Time:</strong> {selectedEvent.time}</p>
              <p><strong>Location:</strong> {selectedEvent.location}</p>
              <p><strong>Description:</strong> {selectedEvent.description}</p>
              <p><strong>Banner Image:</strong> <img src={selectedEvent.banner_images[0]} alt="Banner" style={{ width: "100%" }} /></p>
              <p><strong>Status:</strong> {selectedEvent.status}</p>
              <p><strong>Virtual Event:</strong> {selectedEvent.is_virtual_event ? "Yes" : "No"}</p>
              <p><strong>Active Event:</strong> {selectedEvent.is_active ? "Yes" : "No"}</p>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReject} color="secondary" variant="contained">
            Reject
          </Button>
          <Button onClick={handleApprove} color="primary" variant="contained">
            Approve
          </Button>
          {/* <Button onClick={() => setViewDialogOpen(false)} color="primary">
            Close
          </Button> */}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Events;
