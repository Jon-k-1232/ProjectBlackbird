import { useState, useEffect } from 'react';
import { Container, Card, Typography, TextField } from '@mui/material';
import Page from '../../Components/Page';
import { CollapsibleTable } from 'src/Components/DataTable/ExpandableTable';
import { getEmployeeTime } from '../../ApiCalls/ApiCalls';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useContext } from 'react';
import { context } from '../../App';

export default function ExpandingEmployeeTime() {
  const { loginUser } = useContext(context);
  const [employeeTime, setEmployeeTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format());

  useEffect(() => {
    const fetchData = async () => {
      // Get prior days time by default
      const date = dayjs().subtract(1, 'day').format();
      setSelectedDate(date);
      console.log(date);
      const employeeTime = await getEmployeeTime(date);
      const filteredByEmployeeAccess = filterListOnEmployeeAccess(employeeTime);
      setEmployeeTime(filteredByEmployeeAccess);
    };

    fetchData();
    // eslint-disable-next-line
  }, []);

  /**
   * Searches if user is a employee or manager.
   * If a employee, the employee can only see their time.
   * If a manager, the manager can see every ones time.
   * @param {*} employeeTime
   * @returns
   */
  const filterListOnEmployeeAccess = employeeTime => {
    if (loginUser.role === 'employee') {
      const employeeTimeValue = employeeTime.employeeTime[loginUser.oid];
      const employeeDailyValue = { [loginUser.oid]: employeeTimeValue };
      return { ...employeeTime, employeeTime: employeeDailyValue };
    }
    return employeeTime;
  };

  return (
    <Page title='expandingEmployeeTime' style={{ width: '40em' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card style={{ paddingTop: '5px', paddingBottom: '5px' }}>
          {employeeTime && (
            <Container style={{ padding: '10px' }}>
              <Container style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '5px' }}>
                <Typography variant='h5'>Daily Time</Typography>
                <DesktopDatePicker
                  sx='small'
                  label='Select Date'
                  inputFormat='MM/DD/YYYY'
                  value={selectedDate}
                  onChange={async newValue => {
                    setSelectedDate(newValue.$d);
                    const employeeTime = await getEmployeeTime(newValue.$d);
                    const filteredByEmployeeAccess = filterListOnEmployeeAccess(employeeTime);
                    setEmployeeTime(filteredByEmployeeAccess);
                  }}
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
