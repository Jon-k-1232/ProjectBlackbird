import { useEffect, useState } from 'react';
import { Stack, TextField, Card, Button, CardContent, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { getEmployee } from '../../ApiCalls/ApiCalls';
import { updateEmployee, createEmployee } from '../../ApiCalls/PostApiCalls';
import AlertBanner from '../../Components/AlertBanner/AlertBanner';

export default function NewEmployee() {
  const location = useLocation();

  const [employeeID, setEmployeeID] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [hourlyCost, setHourlyCost] = useState('');
  const [inactiveEmployeeChecked, setInactiveEmployeeChecked] = useState(false);
  const [postStatus, setPostStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (location.state) {
        const employeeID = Number(location.state.rowData[0]);
        const employee = employeeID && (await getEmployee(employeeID));
        setEmployeeID(employee.oid);
        setFirstName(employee.firstName);
        setLastName(employee.lastName);
        setMiddleName(employee.middleName);
        setHourlyCost(employee.hourlyCost);
        setInactiveEmployeeChecked(employee.inactive);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    const dataToPost = objectToPost();
    const postedItem = location.state ? await updateEmployee(dataToPost, employeeID) : await createEmployee(dataToPost);
    setPostStatus(postedItem.status);
    setTimeout(() => setPostStatus(null), 4000);
    resetForm();
  };

  const objectToPost = () => {
    return {
      firstName: firstName,
      lastName: lastName,
      middleI: middleName,
      hourlyCost: hourlyCost,
      inactive: inactiveEmployeeChecked
    };
  };

  const resetForm = () => {
    setInactiveEmployeeChecked(true);
    setFirstName('');
    setLastName('');
    setMiddleName('');
    setHourlyCost('');
  };

  return (
    <Card style={{ marginTop: '25px' }}>
      <CardContent style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
              <TextField
                fullWidth
                required
                type='text'
                max='26'
                label='First name'
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
              <TextField fullWidth required type='26' max='100' label='Last name' value={lastName} onChange={e => setLastName(e.target.value)} />
              <TextField fullWidth type='text' max='15' label='Middle name' value={middleName} onChange={e => setMiddleName(e.target.value)} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
              <TextField required type='text' max='6' label='Hourly Cost' value={hourlyCost} onChange={e => setHourlyCost(e.target.value)} />
            </Stack>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox checked={inactiveEmployeeChecked} onChange={e => setInactiveEmployeeChecked(e.target.inactiveEmployeeChecked)} />
                }
                label='Inactive'
              />
            </FormGroup>
            <Button type='submit' name='submit'>
              Submit
            </Button>
            <AlertBanner postStatus={postStatus} type='Employee' />
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
