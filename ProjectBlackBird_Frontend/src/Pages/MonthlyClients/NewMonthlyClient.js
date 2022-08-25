import { useState, useEffect } from 'react';
import { Stack, TextField, Card, Button, Checkbox, FormGroup, CardContent, FormControlLabel, Autocomplete } from '@mui/material';
import { addClientToMonthlyList } from '../../ApiCalls/PostApiCalls';
import { getActiveCompanies } from '../../ApiCalls/ApiCalls';
import AlertBanner from '../../Components/AlertBanner/AlertBanner';

export default function NewMonthlyClient() {
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

  const handleSubmit = async e => {
    e.preventDefault();
    const objectToPost = formObjectForPost();
    const postedItem = await addClientToMonthlyList(objectToPost);
    setPostStatus(postedItem.status);
    setTimeout(() => setPostStatus(null), 2000);
    resetContactUpdate();
  };

  const formObjectForPost = () => {
    return {
      company: company.oid,
      companyName: company.companyName,
      monthlyCharge: flatAmount,
      lastInvoiced: null,
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
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
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

            <FormGroup style={{ display: 'inline' }}>
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
