import React, { useEffect, useState } from "react";
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

const CarrerAssesment = () => {
  const [data, setData] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
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
      name: "username",
      label: "Name",
    },
    {
      name: "education",
      label: "Education",
    },
    {
      name: "date",
      label: "Date",
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
            </>
          );
        },
      },
    },
  ];

  // Fetch data from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "carrer_assesment_report"), (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        SlNo: index + 1,
        ...doc.data(),
      }));
      setData(documents);
    });
    return () => unsubscribe();
  }, []);



  // Handle View Button Click
  const handleView = (rowIndex) => {
    const eventToView = data[rowIndex];
    console.log(eventToView,"view");
    setSelectedEvent(eventToView);
    setViewDialogOpen(true);
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

      
      {/* Dialog for Viewing Event Details */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)}>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <>
              <p><strong>Name:</strong> {selectedEvent.name ? selectedEvent.name : "---"}</p>
              <p><strong>Username:</strong> {selectedEvent?.username}</p>
              <p><strong>Education:</strong> {selectedEvent.education ? selectedEvent.education : "---"}</p>
              <p><strong>Date:</strong> {selectedEvent.date}</p>
              <p><strong>Time:</strong> {selectedEvent.time}</p>
              <b><strong>Career:</strong></b>
              {selectedEvent.career && selectedEvent.career.map((i) => {
                return (
                  <React.Fragment key={i.title}>
                    <p><strong>Title:</strong> {i.title}</p>
                    <p><strong>If Additional Data Required:</strong> {i.if_additional_course_required}</p>
                    <p><strong>Score:</strong> {i.score}</p>
                <p><strong>Core Engineering Jobs: </strong> {!i.data.core_engineering_jobs && "---"}</p> 
                      <ul>
                          {i.data.core_engineering_jobs && i.data.core_engineering_jobs.map((job, index) => (
                            <li key={index}>{job}</li>
                          )) }
                        </ul> 
                    <p><strong>Essential Skills:</strong> {!i.data.essential_skills && "---"}</p>
                        <ul>
                          {i.data.essential_skills && i.data.essential_skills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                    <p><strong>Industry Insights Highlights:</strong>{!i.data.industry_insights_highlights && "---"}</p>
                        <ul>
                          {i.data.industry_insights_highlights && i.data.industry_insights_highlights.map((ind, index) => (
                            <li key={index}>{ind}</li>
                          ))}
                        </ul>
                    <p><strong>Job Responsibilities:</strong>{!i.data.job_responsibilities && "---"}</p>
                        <ul>
                          {i.data.job_responsibilities && i.data.job_responsibilities.map((res, index) => (
                            <li key={index}>{res}</li>
                          ))}
                        </ul>
                    <p><strong>Market Trends Highlights:</strong>{!i.data.market_trends_highlights && "---"}</p>
                        <ul>
                          {i.data.market_trends_highlights && i.data.market_trends_highlights.map((market, index) => (
                            <li key={index}>{market}</li>
                          ))}
                        </ul>
                   {i.data.salary_range && (
                    <>
                      <p><strong>Salary Range:</strong>{!i.data.salary_range && "---"}</p>
                        <ul>
                          {Object.entries(i.data.salary_range).map(([experience, salary], index) => (
                            <li key={index}>
                              <strong>{experience.replace('_', '-')}:</strong> {salary}
                            </li>
                          ))}
                        </ul>
                        </>)}
                        <p><strong>Study Programs:</strong>{!i.data.study_programs && "---"}</p>
                          {i.data.study_programs && Object.entries(i.data.study_programs).map(([programType, programDetails], index) => (
                            <div key={index}>
                              <b>{programDetails.title}</b>
                              <p><strong>Duration:</strong> {programDetails.duration}</p>
                              <p><strong>Specializations:</strong></p>
                              <ul>
                                {programDetails.specializations.map((specialization, index) => (
                                  <li key={index}>{specialization}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        <p><strong>Market Trends Highlights:</strong>{!i.data.trending_jobs && "---"}</p>
                          <ul>
                            {i.data.trending_jobs && i.data.trending_jobs.map((trend, index) => (
                              <li key={index}>{trend}</li>
                            ))}
                          </ul>
                        <hr></hr>
                  </React.Fragment>
                );
              })}
              <b><strong>Personality:</strong></b>
              <p><strong>NiceName:</strong> {selectedEvent.personality.niceName}</p>
              <p><strong>Personality:</strong> {selectedEvent.personality.personality}</p>
              <p><strong>Role:</strong> {selectedEvent.personality.role}</p>
              <p><strong>Strategy:</strong> {selectedEvent.personality.strategy}</p>
              <p><strong>Variant:</strong> {selectedEvent.personality.variant}</p>
              <p><strong>Personality Traits:</strong></p>
              <div>
                {selectedEvent.personality.traits && selectedEvent.personality.traits.map((trait, index) => (
                  <div key={index} style={{ border: `2px solid ${trait.color}`, padding: '10px', marginBottom: '15px' }}>
                    <h3>{trait.trait}</h3>
                    <img src={trait.imageSrc} alt={trait.imageAlt} style={{ maxWidth: '100px' }} />
                    <p><strong>Description:</strong> {trait.description}</p>
                    <p><strong>Snippet:</strong> {trait.snippet}</p>
                    <p><strong>Energy Level:</strong> {trait.pct}%</p>
                    <p><strong>Key:</strong> {trait.key}</p>
                    <p><strong>Labels:</strong> {trait.titles.join(', ')}</p>
                    <a href={trait.link} target="_blank" rel="noopener noreferrer">Learn more about {trait.label}</a>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CarrerAssesment;
