import React, { useState, useEffect } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Page from '../../Components/Page';
import DataTable from '../../Components/DataTable/DataTable';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import { getAllEmployees } from '../../ApiCalls/ApiCalls';

export default function Employees() {
  const navigate = useNavigate();

  const [allEmployees, setAllEmployees] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const allEmployees = await getAllEmployees();
      setAllEmployees(allEmployees);
    };
    fetchData();
  }, []);

  return (
    <Page title='employees'>
      <Container style={{ maxWidth: '1280px' }}>
        <HeaderMenu handleOnClick={data => navigate(`/dashboard/${data}/`)} page={'Employees'} listOfButtons={button} />
      </Container>
      <DataTable {...allEmployees} route='/dashboard/newEmployee/' />
    </Page>
  );
}

const button = [{ name: 'newEmployee', variant: 'contained', icon: plusFill, htmlName: 'Add Employee' }];
