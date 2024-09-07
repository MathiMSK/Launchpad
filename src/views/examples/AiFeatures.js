import React, { useEffect, useState } from 'react';
import MUIDataTable from 'mui-datatables';
import Header from 'components/Headers/Header';
import { Container } from 'reactstrap';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "views/Login/config/config";
import { Visibility } from '@mui/icons-material';
import {  Tabs, Tab, Box, styled, Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";


// Styled Tab component
const CustomTab = styled(Tab)(({ theme }) => ({
  '&.Mui-selected': {
    color: 'white',
    // backgroundColor: theme.palette.primary.main,
  },
}));

const AiFeatures = () => {
  const [value, setValue] = useState(0);
  const [aiInterviewData, setAiInterviewData] = useState();
  const [aiCommunicationData, setAiCommunicationData] = useState();
  const [selectedInterview, setSelectedInterview] = useState();
  const [selectedCommunication, setSelectedCommunication] = useState();
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewDialogOpen1, setViewDialogOpen1] = useState(false);
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "ai_interview_report"), (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        SlNo: index + 1,
        ...doc.data(),
      }));
      setAiInterviewData(documents);
    });
    return () => unsubscribe();
  }, []);

  const handleView = (rowIndex) => {
    const interviewToView = aiInterviewData[rowIndex];
    setSelectedInterview(interviewToView);
    setViewDialogOpen(true);
  };
  const handleView1 = (rowIndex) => {
    const communicationToView = aiCommunicationData[rowIndex];
    setSelectedCommunication(communicationToView);
    setViewDialogOpen1(true);
  };

  const interviewColumns = [
    { name: 'username', label: 'Username' , 
      options: {
        customBodyRender: (value) => value || '---',
      },
    },
    { name: 'date', label: 'Date', 
      options: {
        customBodyRender: (value) => value || '---',
      },
     },
    { name: 'role', label: 'Role', 
      options: {
        customBodyRender: (value) => value || '---',
      },
     },
    { name: 'jobDescription', label: 'JobDescription' , 
      options: {
        customBodyRender: (value) => value || '---',
      },
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
  
  const communicationColumns = [
    { name: 'username', label: 'Username', 
      options: {
        customBodyRender: (value) => value || '---',
      },
    },
    { name: 'date', label: 'Date', 
      options: {
        customBodyRender: (value) => value || '---',
      },
    },
    { name: 'role', label: 'Role', 
      options: {
        customBodyRender: (value) => value || '---',
      },
    },
    { name: 'jobDescription', label: 'JobDescription', 
      options: {
        customBodyRender: (value) => value || '---',
      },
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
                onClick={() => handleView1(tableMeta.rowIndex)}
              />
            </>
          );
        },
      },
    },
  ];
  

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "ai_communication_report"), (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        SlNo: index + 1,
        ...doc.data(),
      }));
      setAiCommunicationData(documents);
    });
    return () => unsubscribe();
  }, []);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

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
        <Box sx={{ width: '100%' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <CustomTab label="AI Interview Report" />
            <CustomTab label="AI Communication Report" />
          </Tabs>
          <Box sx={{ p: 3 }}>
            {value === 0 && (
              <MUIDataTable
                title={"AI Interview Report"}
                data={aiInterviewData}
                columns={interviewColumns}
                options={options}
              />
            )}
            {value === 1 && (
              <MUIDataTable
              title={"AI Communication Report"}
              data={aiCommunicationData}
              columns={communicationColumns}
              options={options}
            />
            )}
          </Box>
        </Box>
      </Container>
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)}>
        <DialogTitle>AI Interview Report Details</DialogTitle>
        <DialogContent>
          {selectedInterview && (
            <>
              <p><strong>Username:</strong> {selectedInterview.username}</p>
              <p><strong>Role:</strong> {selectedInterview.role}</p>
              <p><strong>Job Description:</strong> {selectedInterview.jobDescription}</p>
              <p><strong>Question Limit:</strong> {selectedInterview.question_limit}</p>
              <p><strong>Date:</strong> {selectedInterview.date}</p>
              <p><strong>Time:</strong> {selectedInterview.time}</p>
              <b><strong>Interview Questions: </strong> {!selectedInterview.data && "---"}</b> 
              {selectedInterview.data && selectedInterview.data.map((i) => {
                return (
                  <React.Fragment key={i.isMe}>
                  <p><strong>{i.isMe === true ?  "Answer" : "Question" }:</strong> {i.text}</p>
                  <p><strong>{i.isMe === true ? "Answered Time" : "Questioned Time" }:</strong> {i.time}</p>
                  </React.Fragment>
                  )})}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={viewDialogOpen1} onClose={() => setViewDialogOpen1(false)}>
        <DialogTitle>AI Communication Report Details</DialogTitle>
        <DialogContent>
          {selectedCommunication && (
            <>
              <p><strong>Username:</strong> {selectedCommunication.username}</p>
              <p><strong>Role:</strong> {selectedCommunication.role ? selectedCommunication.role : "---"}</p>
              <p><strong>Job Description:</strong> {selectedCommunication.jobDescription ? selectedCommunication.jobDescription : "---"}</p>
              <p><strong>Question Limit:</strong> {selectedCommunication.question_limit}</p>
              <p><strong>Date:</strong> {selectedCommunication.date}</p>
              <p><strong>Time:</strong> {selectedCommunication.time}</p>
              <b><strong>Interview Questions: </strong> {!selectedCommunication.data && "---"}</b> 
              {selectedCommunication.data && selectedCommunication.data.map((i) => {
                return (
                  <React.Fragment key={i.isMe}>
                  <p><strong>{i.isMe === true ?  "Answer" : "Question" }:</strong> {i.text}</p>
                  <p><strong>{i.isMe === true ? "Answered Time" : "Questioned Time" }:</strong> {i.time}</p>
                  </React.Fragment>
                  )})}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AiFeatures;
