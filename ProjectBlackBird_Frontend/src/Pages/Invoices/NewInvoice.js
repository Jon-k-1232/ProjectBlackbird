import { useState, useEffect } from 'react';
import { Container, Stack, Switch, Grid } from '@mui/material';
import plusFill from '@iconify/icons-eva/plus-fill';
import Page from '../../Components/Page';
import DataTable from '../../Components/DataTable/DataTable';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import { getAllReadyToBillInvoices, getAllCompanies, getZippedInvoices } from '../../ApiCalls/ApiCalls';
import { createInvoices } from '../../ApiCalls/PostApiCalls';
import AlertBanner from '../../Components/AlertBanner/AlertBanner';
import { csvGenerator, updateReviewInvoiceObject } from '../../utils/csvGenerator';
import PopupConfirmation from '../../Components/PopupConfirmation';

export default function NewInvoice() {
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [postStatus, setPostStatus] = useState(null);
  const [readyToBill, setReadyToBill] = useState(true);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const readyToBillContacts = await getAllReadyToBillInvoices();
      setInvoices(readyToBillContacts);
    };
    fetchData();
  }, []);

  const handleSubmit = async buttonName => {
    const arrayOfInvoicesToCreate = selectedRowData.map(company => company.oid);
    const roughDraft = buttonName !== 'newInvoice' ? true : false;
    const createPdf = buttonName !== 'csvList' ? true : false;
    const postedItem = await createInvoices(arrayOfInvoicesToCreate, roughDraft, createPdf);
    console.log(postedItem);
    setPostStatus(postedItem.status);
    setTimeout(() => setPostStatus(null), 4000);

    if (buttonName === 'csvList') {
      const invoicesForReview = updateReviewInvoiceObject(postedItem.newInvoices);
      csvGenerator(invoicesForReview, 'Clients Ready to Bill');
    } else {
      // Its odd to have a timer with async call, but needed as facing delay in pdf creation. If zip is created to quickly, then zip will run and some pdf's will fail to fully create.
      setTimeout(async () => await getZippedInvoices(), 4000);
    }
  };

  const handleChange = async e => {
    setReadyToBill(e.target.checked);
    if (e.target.checked === true) {
      const readyToBillContacts = await getAllReadyToBillInvoices();
      setInvoices(readyToBillContacts);
    } else {
      const allContacts = await getAllCompanies();
      setInvoices(allContacts);
    }
  };

  return (
    <Page title='Invoices'>
      <Container style={{ display: 'contents' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={5}>
          <HeaderMenu
            handleOnClick={buttonName => {
              if (buttonName === 'newInvoice') {
                setShowConfirmationDialog(true);
              } else {
                handleSubmit(buttonName);
              }
            }}
            page={'Create Invoices'}
            listOfButtons={button}
          />
        </Stack>
        <Grid component='label' container alignItems='center' spacing={1}>
          <Grid item>All Clients</Grid>
          <Grid item>
            <Switch checked={readyToBill} onChange={e => handleChange(e)} value={readyToBill} />
          </Grid>
          <Grid item>Clients Showing Balances</Grid>
        </Grid>
        <AlertBanner postStatus={postStatus} type='Invoices' />
        <DataTable
          {...invoices}
          selectOnRowClick={true}
          useCheckboxes={true}
          selectedList={items => setSelectedRowData(items)}
          columnToSortAscOrDesc='Company Name'
          ascOrDesc='asc'
        />
        <PopupConfirmation
          show={showConfirmationDialog}
          handleShow={showValue => setShowConfirmationDialog(showValue)}
          confirmFinalInvoice={confirmValue => confirmValue === true && handleSubmit('newInvoice')}
        />
      </Container>
    </Page>
  );
}

const button = [
  { name: 'csvList', variant: 'contained', icon: plusFill, htmlName: 'Create CSV For Selected Invoices' },
  { name: 'roughDraftInvoice', variant: 'contained', icon: plusFill, htmlName: 'Preview Selected Invoices' },
  { name: 'newInvoice', variant: 'contained', icon: plusFill, htmlName: 'Lock and Create Selected Invoices' }
];
