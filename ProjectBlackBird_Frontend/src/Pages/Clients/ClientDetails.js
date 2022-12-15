import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography, Stack } from '@mui/material';
import {
  getCompanyJobs,
  getCompanyTransactions,
  getCompanyInvoices,
  getCompanyInformation,
  getJobAnalytics
} from '../../ApiCalls/ApiCalls';
import Page from '../../Components/Page';
import ContactCard from '../../Components/ContactCard/ContactCard';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import DataTable from '../../Components/DataTable/DataTable';
import ComingSoon from '../../Components/ComingSoon';
import clipboardNotes from '@iconify/icons-foundation/clipboard-notes';
import fileTextFill from '@iconify/icons-eva/file-text-fill';
import baselineWork from '@iconify/icons-ic/baseline-work';
import clockFill from '@iconify/icons-eva/clock-fill';
import statisticsIcon from '@iconify/icons-whh/statistics';
import plusFill from '@iconify/icons-eva/plus-fill';
import NewJob from '../Jobs/NewJob';
import NewClient from '../Clients/NewClient';
import NewTransactionsPage from '../Transactions/NewTransactionPage';
import AccountTools from './AccountTools';

export default function ClientDetails() {
  const [dataToShow, setDataToShow] = useState('invoices');
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState(null);
  const [jobTransactions, setJobTransactions] = useState(null);
  const [companyInvoices, setCompanyInvoices] = useState(null);
  const [companyJobAnalytics, setCompanyJobAnalytics] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      // Data is being stored in props of routing.
      const companyId = Number(location.state.rowData[0]);

      // Selected company info
      const contactDetails = await getCompanyInformation(companyId);
      setCompany(contactDetails);

      // Company transactions
      // second argument, default null(365 days). This is used for time frame.
      const companyTransactions = await getCompanyTransactions(companyId, null);
      setJobTransactions(companyTransactions);

      // Company jobs
      const companyJobs = await getCompanyJobs(companyId, null);
      setCompanyJobs(companyJobs);

      // Company invoices
      const companyInvoices = await getCompanyInvoices(companyId);
      setCompanyInvoices(companyInvoices);

      const jobAnalytic = await getJobAnalytics(companyId);
      setCompanyJobAnalytics(jobAnalytic);
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <Page title='Client Details'>
      <Container style={{ display: 'contents' }}>
        <HeaderMenu handleOnClick={data => setDataToShow(data)} page={'Client Details'} listOfButtons={button} />
        <ContactCard {...company} />
        {dataToShow === 'invoices' && (
          <DataTable {...companyInvoices} route='/invoiceDetails/' columnToSortAscOrDesc='Invoice Date' ascOrDesc='desc' />
        )}
        {dataToShow === 'transactions' && <DataTable {...jobTransactions} columnToSortAscOrDesc='Transaction Date' ascOrDesc='desc' />}
        {dataToShow === 'newTransactions' && (
          <NewTransactionsPage passedCompany={company} updateContactCard={companyUpdates => setCompany(companyUpdates)} />
        )}
        {dataToShow === 'jobs' && (
          <Stack>
            <Container style={{ marginTop: '2em', padding: '0' }}>
              <Typography variant='h6'>Job Breakdown Quick Glance</Typography>
              <DataTable {...companyJobAnalytics} chartHeight={'500'} tableSize={10} paginationIncrement={[10, 25, 50, 100]} />
            </Container>
            <Container style={{ marginTop: '2em', padding: '0' }}>
              <Typography variant='h6'>Jobs</Typography>
              <DataTable {...companyJobs} route='/jobDetails/' columnToSortAscOrDesc='Start Date' ascOrDesc='desc' />
            </Container>
          </Stack>
        )}
        {dataToShow === 'newJob' && <NewJob passedCompany={company} />}
        {dataToShow === 'notes' && <ComingSoon />}
        {dataToShow === 'statistics' && <ComingSoon />}
        {dataToShow === 'newClient' && (
          <NewClient passedCompany={company} updateContactCard={companyUpdates => setCompany(companyUpdates)} />
        )}
        {dataToShow === 'accountTools' && (
          <AccountTools companyId={company.oid} updateContact={updateContact => setCompany(updateContact)} />
        )}
      </Container>
    </Page>
  );
}

const button = [
  { name: 'invoices', variant: 'contained', icon: fileTextFill, htmlName: 'Invoices' },
  { name: 'transactions', variant: 'contained', icon: clockFill, htmlName: 'Transactions' },
  { name: 'newTransactions', variant: 'contained', icon: plusFill, htmlName: 'New Transaction' },
  { name: 'jobs', variant: 'contained', icon: baselineWork, htmlName: 'Jobs' },
  { name: 'newJob', variant: 'contained', icon: plusFill, htmlName: 'New Job' },
  { name: 'notes', variant: 'contained', icon: clipboardNotes, htmlName: 'Notes' },
  { name: 'statistics', variant: 'contained', icon: statisticsIcon, htmlName: 'Statistics' },
  { name: 'newClient', variant: 'contained', icon: clipboardNotes, htmlName: 'Edit Contact' },
  { name: 'accountTools', variant: 'contained', icon: clipboardNotes, htmlName: 'Account Tools' }
];
