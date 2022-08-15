import { useEffect, useState } from 'react';
import { Container, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import plusFill from '@iconify/icons-eva/plus-fill';
import Page from '../../Components/Page';
import DataTable from '../../Components/DataTable/DataTable';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import { getAllTransactions } from '../../ApiCalls/ApiCalls';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const allTransactionsToDate = await getAllTransactions(730);
      setTransactions(allTransactionsToDate);
    };
    fetchData();
  }, []);

  return (
    <Page title='Transactions'>
      <Container style={{ maxWidth: '1280px' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={5}>
          <HeaderMenu handleOnClick={data => navigate(`/dashboard/${data}/`)} page={'Transactions'} listOfButtons={button} />
        </Stack>
        {/* If transaction detail needed pass a route below in DataTable - route='/dashboard/transactionDetails/' */}
        <DataTable name='Transactions' {...transactions} />
      </Container>
    </Page>
  );
}

const button = [{ name: 'newTransaction', variant: 'contained', icon: plusFill, htmlName: 'New Transaction' }];
