import { useEffect, useState } from 'react';
import { Container, Stack, Typography } from '@mui/material';
import Page from '../../Components/Page';
import DataTable from '../../Components/DataTable/DataTable';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import { getMonthlyClients } from '../../ApiCalls/ApiCalls';
import NewMonthlyClient from './NewMonthlyClient';

export default function MonthlyClients() {
  const [clients, setClients] = useState(null);
  const [companyToPass, setCompanyToPass] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const activeMonthlyClients = await getMonthlyClients();
      setClients(activeMonthlyClients);
    };
    fetchData();
  }, []);

  return (
    <Page title='MonthlyClients'>
      <Container style={{ display: 'contents' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={5}>
          <HeaderMenu page={'Monthly Clients'} />
        </Stack>
        <Typography variant='h6' style={{ color: 'red' }}>
          Warning: This is a list only at this time.
        </Typography>
        <Typography variant='subtitle2' style={{ color: 'red' }}>
          These amounts are NOT being auto calculated.
        </Typography>
        <NewMonthlyClient passedCompany={companyToPass} setMonthlyClients={data => setClients(data)} />
        <DataTable
          {...clients}
          tableSize={10}
          paginationIncrement={[5, 10, 15]}
          chartHeight='500'
          noRoute={true}
          passRowData={data => setCompanyToPass(data)}
        />
      </Container>
    </Page>
  );
}
