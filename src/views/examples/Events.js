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
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "views/Login/config/config";
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Switch, FormControlLabel, Chip } from "@mui/material";
import { Add, Delete, Edit, Visibility } from "@mui/icons-material";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import s3 from "views/Login/config/awsConfig";

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
  const [selectedFiles, setSelectedFiles] = useState([]);
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
          console.log(data[index.rowIndex].status,"value");
          return (
            <>
              {
                value && data[index.rowIndex].status === "Approved" && data[index.rowIndex].approved_by_admin === true ? (<Chip label="Approved" color="success" />):(<Chip label="Rejected" color="error" />)
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

  const uploadFilesAndGetUrls = async (files) => {
    const promises = [];
    const urls = [];
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const key = `banner_images/${file.name}`;
  
      const params = {
        Bucket: 'launchpad-events',
        Key: key,
        Body: file,
        ContentType: file.type,
      };
  
      const uploadPromise = s3.upload(params).promise();
      promises.push(uploadPromise);
    }
  
    try {
      await Promise.all(promises);
  
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = `https://launchpad-events.s3.ap-south-1.amazonaws.com/banner_images/${file.name}`
        urls.push(url);
      }
  
      return urls;
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  };
 
  // Handle Add Event
  const handleAddEvent = async () => {
    try {
      let newBannerImageUrls = [];
  
      if (selectedFiles.length > 0) {
        newBannerImageUrls = await uploadFilesAndGetUrls(selectedFiles);
      }
  
      if (editId) {
        // Update existing event
        const eventRef = doc(db, "events", editId);
        const eventDoc = await getDoc(eventRef);
  
        if (!eventDoc.exists()) {
          throw new Error("Event not found");
        }
  
        const existingData = eventDoc.data();
        const oldBannerImages = existingData.banner_images || [];
        const combinedBannerImages = [...oldBannerImages, ...newBannerImageUrls];
  
        await updateDoc(eventRef, {
          ...formData,
          banner_images: combinedBannerImages,
        });
      } else {
        // Add new event
        await addDoc(collection(db, "events"), {
          ...formData,
          banner_images: newBannerImageUrls,
        });
      }
  
      resetForm();
    } catch (error) {
      console.error("Error adding or updating event: ", error);
    }
  };
  

  // Handle Update Event
  const handleUpdateEvent = async () => {
    try {
      let newBannerImageUrls = [];
  
      if (selectedFiles.length > 0) {
        newBannerImageUrls = await uploadFilesAndGetUrls(selectedFiles);
      }
  
        // Update existing event
        const eventRef = doc(db, "events", editId);
        const eventDoc = await getDoc(eventRef);
  
        if (!eventDoc.exists()) {
          throw new Error("Event not found");
        }
  
        const existingData = eventDoc.data();
        const oldBannerImages = existingData.banner_images || [];
        const combinedBannerImages = [...oldBannerImages, ...newBannerImageUrls];
  
        await updateDoc(eventRef, {
          ...formData,
          banner_images: combinedBannerImages,
        });
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
    console.log("Original Date:", eventToEdit.date); // "03-09-24"
    console.log("Original Time:", eventToEdit.time); // "1:15 PM"
  
    // Convert "03-09-24" to "2024-03-09"
    const [month, day, year] = eventToEdit.date.split('-');
    const formattedDate = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
    // Convert "1:15 PM" to "13:15"
    const [time, modifier] = eventToEdit.time.split(' ');
    let [hours, minutes] = time.split(':');
  
    if (modifier === 'PM' && hours !== '12') {
      hours = String(parseInt(hours, 10) + 12);
    } else if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }
  
    const formattedTime = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  
    setFormData({
      title: eventToEdit.title,
      event_type: eventToEdit.event_type,
      date: formattedDate,
      time: formattedTime,
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
    console.log(eventToView,"eventToView")
    setSelectedEvent(eventToView);
    setViewDialogOpen(true);
  };

  // Handle Approve Event
  const handleApprove = async () => {
    try {
      const eventRef = doc(db, "events", selectedEvent.id);
      await updateDoc(eventRef, {  approved_by_admin: true ,status : "Approved"});
      setViewDialogOpen(false);
    } catch (error) {
      console.error("Error approving event: ", error);
    }
  };

  // Handle Reject Event
  const handleReject = async () => {
    try {
      const eventRef = doc(db, "events", selectedEvent.id);
      await updateDoc(eventRef, { approved_by_admin: false,status : "Pending" });
      setViewDialogOpen(false);
    } catch (error) {
      console.error("Error rejecting event: ", error);
    }
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevents the page from refreshing
  
    if (editId) {
      handleUpdateEvent();
    } else {
      handleAddEvent();
    }
  };
  
  // Handle File Change
  const handleFileChange = (e) => {
    setBannerImage(e.target.files[0]);
    setSelectedFiles(e.target.files);
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

  const uploadFiles = async () => {
    const promises = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const params = {
        Bucket: 'launchpad-events',
        Key: file.name,
        Body: file,
        ContentType: file.type,
      };

      const uploadPromise = s3.upload(params).promise();
      promises.push(uploadPromise);
    }

    try {
      const results = await Promise.all(promises);
      console.log('All files uploaded successfully:', results);
    } catch (error) {
      console.error('Error uploading files:', error);
    }
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
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
              required
            />
            <TextField
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              fullWidth
              margin="dense"
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
              multiple
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
          </div>
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
          <Button onClick={handleReject} style={{backgroundColor:"red"}} variant="contained">
            Reject
          </Button>
          <Button onClick={handleApprove} style={{backgroundColor:"green"}}  variant="contained">
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
