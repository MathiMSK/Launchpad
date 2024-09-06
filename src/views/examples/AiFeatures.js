import React, { useState } from 'react';
import { Tabs, Tab, Box, styled } from '@mui/material';
import MUIDataTable from 'mui-datatables';
import Header from 'components/Headers/Header';
import { Container } from 'reactstrap';

// Sample data for the tables
const aiInterviewData = [
  { id: 1, candidate: 'John Doe', position: 'AI Engineer', score: 85 },
  { id: 2, candidate: 'Jane Smith', position: 'Data Scientist', score: 90 },
];

const aiCommunicationData = [
  { id: 1, project: 'AI Project A', status: 'Completed', feedback: 'Excellent' },
  { id: 2, project: 'AI Project B', status: 'In Progress', feedback: 'Good' },
];

// Columns for MUI DataTables
const interviewColumns = [
  { name: 'id', label: 'ID' },
  { name: 'candidate', label: 'Candidate' },
  { name: 'position', label: 'Position' },
  { name: 'score', label: 'Score' },
];

const communicationColumns = [
  { name: 'id', label: 'ID' },
  { name: 'project', label: 'Project' },
  { name: 'status', label: 'Status' },
  { name: 'feedback', label: 'Feedback' },
];

// Styled Tab component
const CustomTab = styled(Tab)(({ theme }) => ({
  '&.Mui-selected': {
    color: 'white',
    // backgroundColor: theme.palette.primary.main,
  },
}));

const AiFeatures = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
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
                options={{ filterType: 'checkbox' }}
              />
            )}
            {value === 1 && (
              <MUIDataTable
                title={"AI Communication Report"}
                data={aiCommunicationData}
                columns={communicationColumns}
                options={{ filterType: 'checkbox' }}
              />
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default AiFeatures;
