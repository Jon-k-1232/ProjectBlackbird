import { useState, useEffect } from 'react';
import { Container, Card, Typography, TextField } from '@mui/material';
import Page from '../../Components/Page';
import { CollapsibleTable } from 'src/Components/DataTable/ExpandableTable';
import { getEmployeeTime } from '../../ApiCalls/ApiCalls';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function ExpandingEmployeeTime() {
  const [employeeTime, setEmployeeTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format());

  useEffect(() => {
    const fetchData = async () => {
      const date = '2022-11-17';
      const employeeTime = await getEmployeeTime(date);
      setEmployeeTime(employeeTime);
    };
    fetchData();
  }, []);

  return (
    <Page title='expandingEmployeeTime'>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card style={{ paddingTop: '5px', paddingBottom: '5px' }}>
          {employeeTime && (
            <Container>
              <Container style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px' }}>
                <Typography variant='h5'>Daily Time</Typography>
                <DesktopDatePicker
                  sx='small'
                  label='Select Date'
                  inputFormat='MM/DD/YYYY'
                  value={selectedDate}
                  onChange={newValue => setSelectedDate(newValue.$d)}
                  renderInput={params => <TextField size='small' {...params} />}
                />
              </Container>
              <CollapsibleTable data={employeeTime} />
            </Container>
          )}
        </Card>
      </LocalizationProvider>
    </Page>
  );
}
