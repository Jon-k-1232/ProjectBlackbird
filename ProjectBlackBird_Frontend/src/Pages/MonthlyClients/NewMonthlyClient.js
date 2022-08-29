import { useState, useEffect } from 'react';
import { Stack, TextField, Card, Button, Checkbox, FormGroup, CardContent, FormControlLabel, Autocomplete } from '@mui/material';
import { addClientToMonthlyList } from '../../ApiCalls/PostApiCalls';
import { getActiveCompanies } from '../../ApiCalls/ApiCalls';
import AlertBanner from '../../Components/AlertBanner/AlertBanner';
import { tableAndLabelCreation } from '../../ApiCalls/Adapters/AdapterHelperFunctions';

export default function NewMonthlyClient({ passedCompany, setMonthlyClients }) {
  const [allCompanies, setAllCompanies] = useState([]);
  const [company, setCompany] = useState(null);
  const [companyInputValue, setCompanyInputValue] = useState('');
  const [flatAmount, setFlatAmount] = useState('');
  const [activeChecked, setActiveChecked] = useState(false);
  const [postStatus, setPostStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const allCompanies = await getActiveCompanies();
      setAllCompanies(allCompanies.rawData);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (passedCompany) {
      const foundCompany = allCompanies.find(company => company.oid === Number(passedCompany[1]));
      setCompany(foundCompany);
    }
  }, [passedCompany, allCompanies]);

  const handleSubmit = async e => {
    e.preventDefault();
    const objectToPost = formObjectForPost();
    const postedItem = await addClientToMonthlyList(objectToPost);
    setPostStatus(postedItem.status);
    const tableClients = tableAndLabelCreation(postedItem.monthlyClients, 'oid', 'company');
    setMonthlyClients(tableClients);
    setTimeout(() => setPostStatus(null), 2000);
    resetContactUpdate();
  };

  const formObjectForPost = () => {
    return {
      company: company.oid,
      companyName: company.companyName,
      monthlyCharge: Number(flatAmount),
      lastInvoiced: passedCompany[4] || null,
      inactive: activeChecked
    };
  };

  // Resets amount fields when type of transaction is switched. This solves amount carrying over from charge to write of and others.
  const resetContactUpdate = () => {
    setCompany(null);
    setCompanyInputValue('');
    setFlatAmount('');
    setActiveChecked(false);
  };
  return (
    <Card style={{ marginTop: '25px' }}>
      <CardContent style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: 'row', sm: 'row' }} spacing={2}>
            <Stack direction={{ xs: 'row', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
              <Autocomplete
                value={company}
                onChange={(event, newValue) => setCompany(newValue)}
                inputValue={companyInputValue}
                onInputChange={(event, newInputValue) => setCompanyInputValue(newInputValue)}
                getOptionLabel={option => option['companyName']}
                options={allCompanies}
                sx={{ width: 350 }}
                renderInput={params => <TextField {...params} label='Company' />}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
              <TextField
                required
                type='text'
                value={flatAmount}
                onChange={e => setFlatAmount(e.target.value)}
                label='Flat Monthly Amount'
              />
            </Stack>

            <FormGroup style={{ justifyContent: 'center' }}>
              <FormControlLabel
                control={<Checkbox checked={activeChecked} onChange={e => setActiveChecked(e.target.checked)} />}
                label='inactive'
              />
            </FormGroup>

            <Button type='submit' name='submit'>
              Submit
            </Button>
            <AlertBanner postStatus={postStatus} type='Contact' />
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
