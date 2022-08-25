import { useEffect, useState } from 'react';
import { Container, Stack } from '@mui/material';
// import { useNavigate } from 'react-router-dom';
import Page from '../../Components/Page';
import DataTable from '../../Components/DataTable/DataTable';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import { getMonthlyClients } from '../../ApiCalls/ApiCalls';

export default function MonthlyClients() {
  // const navigate = useNavigate();
  const [clients, setClients] = useState(null);

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
        <DataTable {...clients} />
      </Container>
    </Page>
  );
}
