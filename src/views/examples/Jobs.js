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
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Add, Delete, Edit, UploadFile } from "@mui/icons-material";
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
import "./styles.css";

const Jobs = () => {
  const [data, setData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isUrlInput, setIsUrlInput] = useState(true); // New state variable to toggle between URL and image upload

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    companyLogo: "",
    jobType: "",
    location: "",
    qualifications: [""],
    requirements: [""],
    skills: [""],
    salary: "",
    contactEmail: "",
    education: [""],
    benefits: [""],
    experience: [""],
    description: "",
    postingDate: "",
    applicationDeadline: "",
  });

  // Fetch data from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "jobs"), (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        SlNo: index + 1,
        ...doc.data(),
      }));
      setData(documents);
    });
    return () => unsubscribe();
  }, []);

  // Handle Add Job
  const handleAddJob = async () => {
    try {
      await addDoc(collection(db, "jobs"), formData);
      resetForm();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // Handle Update Job
  const handleUpdateJob = async () => {
    try {
      const jobRef = doc(db, "jobs", editId);
      await updateDoc(jobRef, formData);
      resetForm();
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  // Handle Delete Job
  const handleDelete = async (rowIndex) => {
    try {
      const jobToDelete = data[rowIndex];
      await deleteDoc(doc(db, "jobs", jobToDelete.id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  // Handle Edit Button Click
  const handleEdit = (rowIndex) => {
    const jobToEdit = data[rowIndex];
    setFormData({ ...jobToEdit });
    setIsUrlInput(jobToEdit.companyLogo ? true : false); // Set the toggle based on existing data
    setEditId(jobToEdit.id);
    setDialogOpen(true);
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      handleUpdateJob();
    } else {
      handleAddJob();
    }
  };

  // Reset form data when dialog is closed
  const resetForm = () => {
    setFormData({
      title: "",
      company: "",
      companyLogo: "",
      jobType: "",
      location: "",
      qualifications: [""],
      requirements: [""],
      skills: [""],
      salary: "",
      contactEmail: "",
      education: [""],
      benefits: [""],
      experience: [""],
      description: "",
      postingDate: "",
      applicationDeadline: "",
    });
    setDialogOpen(false);
    setEditId(null);
    setIsUrlInput(true); // Reset to default
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData({ ...formData, companyLogo: reader.result }); // Convert image to base64 URL
    };

    if (file) {
      reader.readAsDataURL(file);
    }
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
  const handleAddField = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ""] });
  };

  // Handle Remove Field
  const handleRemoveField = (field, index) => {
    const newFields = formData[field].filter((_, idx) => idx !== index);
    setFormData({ ...formData, [field]: newFields });
  };

  // Handle Change in Field
  const handleFieldChange = (field, index, value) => {
    const newFields = formData[field].map((item, idx) =>
      idx === index ? value : item
    );
    setFormData({ ...formData, [field]: newFields });
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
              resetForm();
              setDialogOpen(true);
            }}
          >
            Add
          </Button>
        </Box>
        <br />
        <br />
        <MUIDataTable
          title={"Job List"}
          data={data}
          columns={columns}
          options={options}
        />
      </Container>

      {/* Dialog for Add/Edit Job */}
      <Dialog
        open={dialogOpen}
        onClose={resetForm}
        maxWidth="md"
        fullWidth
        PaperProps={{ style: { maxHeight: "90vh" } }} // Ensure the dialog does not exceed 90% of viewport height
      >
        <DialogTitle>{editId ? "Edit Job" : "Add Job"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent
            dividers
            style={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            <TextField
              label="Job Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Job Type"
              value={formData.jobType}
              onChange={(e) =>
                setFormData({ ...formData, jobType: e.target.value })
              }
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Salary"
              value={formData.salary}
              onChange={(e) =>
                setFormData({ ...formData, salary: e.target.value })
              }
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Contact Email"
              value={formData.contactEmail}
              onChange={(e) =>
                setFormData({ ...formData, contactEmail: e.target.value })
              }
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              margin="dense"
              required
              multiline
              rows={4}
            />
            <TextField
              label="Posting Date"
              value={formData.postingDate}
              onChange={(e) =>
                setFormData({ ...formData, postingDate: e.target.value })
              }
              fullWidth
              margin="dense"
              required
            />
            <TextField
              label="Application Deadline"
              value={formData.applicationDeadline}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  applicationDeadline: e.target.value,
                })
              }
              fullWidth
              margin="dense"
              required
            />

            {/* Toggle between URL input and file upload */}
            <FormControlLabel
              control={
                <Switch
                  checked={isUrlInput}
                  onChange={(e) => setIsUrlInput(e.target.checked)}
                  name="companyLogoToggle"
                  color="primary"
                />
              }
              label="Use URL for Company Logo"
            />

            {/* Conditional rendering of input fields */}
            {isUrlInput ? (
              <TextField
                label="Company Logo URL"
                value={formData.companyLogo}
                onChange={(e) =>
                  setFormData({ ...formData, companyLogo: e.target.value })
                }
                fullWidth
                margin="dense"
                required
              />
            ) : (
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFile />}
              >
                Upload Company Logo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
            )}

            {/* Dynamic Input Fields for Qualifications */}
            <Box>
              <h4>Qualifications</h4>
              {formData.qualifications.map((qualification, index) => (
                <Box key={index} display="flex" alignItems="center">
                  <TextField
                    label={`Qualification ${index + 1}`}
                    value={qualification}
                    onChange={(e) =>
                      handleFieldChange("qualifications", index, e.target.value)
                    }
                    fullWidth
                    margin="dense"
                    required
                  />
                  <IconButton
                    onClick={() => handleRemoveField("qualifications", index)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() => handleAddField("qualifications")}
              >
                Add Qualification
              </Button>
            </Box>

            {/* Dynamic Input Fields for Requirements */}
            <Box>
              <h4>Requirements</h4>
              {formData.requirements.map((requirement, index) => (
                <Box key={index} display="flex" alignItems="center">
                  <TextField
                    label={`Requirement ${index + 1}`}
                    value={requirement}
                    onChange={(e) =>
                      handleFieldChange("requirements", index, e.target.value)
                    }
                    fullWidth
                    margin="dense"
                    required
                  />
                  <IconButton
                    onClick={() => handleRemoveField("requirements", index)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() => handleAddField("requirements")}
              >
                Add Requirement
              </Button>
            </Box>

            {/* Dynamic Input Fields for Skills */}
            <Box>
              <h4>Skills</h4>
              {formData.skills.map((skill, index) => (
                <Box key={index} display="flex" alignItems="center">
                  <TextField
                    label={`Skill ${index + 1}`}
                    value={skill}
                    onChange={(e) =>
                      handleFieldChange("skills", index, e.target.value)
                    }
                    fullWidth
                    margin="dense"
                    required
                  />
                  <IconButton onClick={() => handleRemoveField("skills", index)}>
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button startIcon={<Add />} onClick={() => handleAddField("skills")}>
                Add Skill
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm} color="primary">
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
