import { useEffect, useState } from 'react';
import { Container, Stack } from '@mui/material';
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
      <Container style={{ maxWidth: '1280px' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={5}>
          <HeaderMenu page={'Monthly Clients'} />
        </Stack>
        <NewMonthlyClient passedCompany={companyToPass} setMonthlyClients={data => setClients(data)} />
        <DataTable
          {...clients}
          tableSize={5}
          paginationIncrement={[5, 10, 15]}
          chartHeight='500'
          noRoute={true}
          passRowData={data => setCompanyToPass(data)}
        />
      </Container>
    </Page>
  );
}
