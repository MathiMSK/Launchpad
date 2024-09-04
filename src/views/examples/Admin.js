import { useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
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
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "views/Login/config/config";
import { Box, Button } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";

const Admin = () => {
  const [data, setData] = useState([]);

  const columns = [
    {
      name: "SlNo",
      label: "Sl.No",
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({
          style: { minWidth: "50px" }, // Ensures enough width for serial number
        }),
      },
    },
    {
      name: "username",
      label: "Name",
      options: {
        setCellProps: () => ({
          style: {
            minWidth: "150px", // Set minimum width for better responsiveness
            wordWrap: "break-word", // Enable word wrap to prevent overflow
            whiteSpace: "normal", // Ensure the text wraps instead of overlapping
          },
        }),
      },
    },
    {
      name: "email",
      label: "Email",
      options: {
        setCellProps: () => ({
          style: {
            minWidth: "200px", // Set minimum width for better responsiveness
            wordWrap: "break-word", // Enable word wrap to prevent overflow
            whiteSpace: "normal", // Ensure the text wraps instead of overlapping
          },
        }),
      },
    },
    {
      name: "action",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        setCellProps: () => ({
          style: { minWidth: "100px" }, // Ensure enough width for the action buttons
        }),
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <>
              <Edit style={{ cursor: "pointer", marginRight: "10px" }} onClick={() => handleEdit(tableMeta.rowIndex)} />
              <Delete style={{ cursor: "pointer" }} onClick={() => handleDelete(tableMeta.rowIndex)} />
            </>
          );
        },
      },
    },
  ];

  const handleEdit = (rowIndex) => {
    console.log("Edit action clicked on row: ", rowIndex);
    // Add your edit logic here
  };

  const handleDelete = (rowIndex) => {
    console.log("Delete action clicked on row: ", rowIndex);
    // Add your delete logic here
  };

  const dataWithSlNo = data.map((row, index) => ({
    SlNo: index + 1,
    ...row,
  }));

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (querySnapshot) => {
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(documents);
    });
    return () => unsubscribe();
  }, []);

  const options = {
    filterType: "checkbox",
    selectableRows: "none",
    responsive: "simple", // Use 'simple' for better mobile responsiveness
    rowsPerPage: 5, // Set the default number of rows per page
    rowsPerPageOptions: [5, 10, 15],
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
          >
            Add
          </Button>
        </Box>
        <br />
        <br />
        <MUIDataTable
          title={"Admin List"}
          data={dataWithSlNo}
          columns={columns}
          options={options}
        />
      </Container>
    </>
  );
};

export default Admin;
