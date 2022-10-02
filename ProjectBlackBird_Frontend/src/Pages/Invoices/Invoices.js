import { useEffect, useState } from 'react';
import { Container, Stack } from '@mui/material';
import Page from '../../Components/Page';
import DataTable from '../../Components/DataTable/DataTable';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import { getAllInvoices } from '../../ApiCalls/ApiCalls';

export default function Invoices() {
  const [invoices, setInvoices] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Past 2 years = 730 days
      const allInvoicesToDate = await getAllInvoices(730);
      setInvoices(allInvoicesToDate);
    };
    fetchData();
  }, []);

  return (
    <Page title='Invoices'>
      <Container style={{ maxWidth: '1280px' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={5}>
          <HeaderMenu page={'Invoices'} />
        </Stack>
        <DataTable {...invoices} route='/invoiceDetails/' columnToSortAscOrDesc='Invoice Date' ascOrDesc='desc' />
      </Container>
    </Page>
  );
}
