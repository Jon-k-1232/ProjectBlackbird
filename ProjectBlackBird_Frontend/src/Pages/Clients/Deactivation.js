import { useState, useEffect } from 'react';
import { Container, Stack } from '@mui/material';
import plusFill from '@iconify/icons-eva/plus-fill';
import Page from '../../Components/Page';
import DataTable from '../../Components/DataTable/DataTable';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import { getActiveCompanies } from '../../ApiCalls/ApiCalls';
import { zeroAndDeactivateUserAccount } from '../../ApiCalls/PostApiCalls';
import AlertBanner from '../../Components/AlertBanner/AlertBanner';

export default function Deactivation() {
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [allClients, setAllClients] = useState(null);
  const [postStatus, setPostStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const allCompanies = await getActiveCompanies();
      setAllClients(allCompanies);
    };
    fetchData();
  }, []);

  const handleSubmit = async e => {
    const arrayOfClientsToDeactivate = selectedRowData.map(company => company.oid);
    const postedItem = await zeroAndDeactivateUserAccount(arrayOfClientsToDeactivate);
    setPostStatus(postedItem.status);
    setTimeout(() => setPostStatus(null), 4000);
  };

  return (
    <Page title='deactivation'>
      <Container style={{ maxWidth: '1280px' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={5}>
          <HeaderMenu handleOnClick={e => handleSubmit(e)} page={'Deactivate and Zero Accounts'} listOfButtons={button} />
        </Stack>
        <AlertBanner postStatus={postStatus} type='Contact Deactivation' />
        <DataTable {...allClients} selectOnRowClick={true} useCheckboxes={true} selectedList={items => setSelectedRowData(items)} />
      </Container>
    </Page>
  );
}

const button = [{ name: 'deactivate', variant: 'contained', icon: plusFill, htmlName: 'Deactivate Selected' }];
