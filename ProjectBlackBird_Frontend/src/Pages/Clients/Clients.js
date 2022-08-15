import { useState, useEffect } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { useNavigate } from 'react-router-dom';
import { Stack, Container, Switch, Grid } from '@mui/material';
import Page from '../../Components/Page';
import DataTable from '../../Components/DataTable/DataTable';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import { getPriorCompanies, getActiveCompanies } from '../../ApiCalls/ApiCalls';

export default function Clients() {
  const navigate = useNavigate();
  const [allClients, setAllClients] = useState(null);
  const [checked, setChecked] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const allCompanies = await getActiveCompanies();
      setAllClients(allCompanies);
    };
    fetchData();
  }, []);

  const handleChange = async e => {
    setChecked(e.target.checked);
    if (e.target.checked === true) {
      const activeCompanies = await getActiveCompanies();
      setAllClients(activeCompanies);
    } else {
      const priorCompanies = await getPriorCompanies();
      setAllClients(priorCompanies);
    }
  };

  return (
    <Page title='Clients'>
      <Container style={{ maxWidth: '1280px' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={5}>
          <HeaderMenu handleOnClick={data => navigate(`/dashboard/${data}/`)} page={'Clients'} listOfButtons={button} />
        </Stack>
        <Grid component='label' container alignItems='center' spacing={1}>
          <Grid item>Prior Clients</Grid>
          <Grid item>
            <Switch checked={checked} onChange={e => handleChange(e)} value={checked} />
          </Grid>
          <Grid item>Active Clients</Grid>
        </Grid>
        <DataTable {...allClients} route='/dashboard/clientDetails/' columnToSortAscOrDesc='Company Name' ascOrDesc='asc' />
      </Container>
    </Page>
  );
}

const button = [{ name: 'newClient', variant: 'contained', icon: plusFill, htmlName: 'New Client' }];
