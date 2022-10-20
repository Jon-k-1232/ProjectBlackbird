import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from '@mui/material';
import Page from '../../Components/Page';
import DataTable from '../../Components/DataTable/DataTable';
import { getCompanyJobs, getCompanyInformation, getJobTransactions } from '../../ApiCalls/ApiCalls';
import JobCard from './JobCard';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';

export default function JobDetails() {
  const location = useLocation();

  const [company, setCompany] = useState(null);
  const [jobTransactions, setJobTransactions] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobFinancials, setJobFinancials] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Data is being stored in props of routing
      const companyId = Number(location.state.rowData[2]);

      // Getting contact info for company
      const contactDetails = await getCompanyInformation(companyId);
      setCompany(contactDetails);

      // Selected job info
      const jobNumber = Number(location.state.rowData[0]);
      const companyJobs = await getCompanyJobs(companyId, null);
      const selectedJob = companyJobs.rawData.find(jobItem => jobItem.oid === jobNumber);
      setSelectedJob(selectedJob);

      const jobTransactions = await getJobTransactions(companyId, jobNumber);
      setJobTransactions(jobTransactions);

      const transactionCalculations = calculateJobFinancials(jobTransactions);
      setJobFinancials(transactionCalculations);
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const calculateJobFinancials = jobTransactions => {
    const filterBySingle = transactionType => jobTransactions.rawData.filter(item => item.transactionType === transactionType);
    const jobTransactionsPaymentsRemoved = jobTransactions.rawData.filter(
      item => item.transactionType !== 'Payment' && item.transactionType !== 'Write Off'
    );
    const addAmounts = (array, property) => array.reduce((prev, curr) => prev + curr[property], 0);

    const jobTransactionsTimeOnly = filterBySingle('Time');
    const jobTransactionChargeOnly = filterBySingle('Charge');
    const jobTransactionsWriteOffOnly = filterBySingle('WriteOff');
    const jobTransactionsAdjustmentsOnly = filterBySingle('Adjustment');

    const totalCharges = addAmounts(jobTransactionsPaymentsRemoved, 'totalTransaction');
    const chargesOnly = addAmounts(jobTransactionChargeOnly, 'totalTransaction');
    const writeOffsOnly = addAmounts(jobTransactionsWriteOffOnly, 'totalTransaction');
    const adjustmentsOnly = addAmounts(jobTransactionsAdjustmentsOnly, 'totalTransaction');
    const totalTimeCharge = addAmounts(jobTransactionsTimeOnly, 'totalTransaction');
    const totalTime = addAmounts(jobTransactionsTimeOnly, 'quantity');

    return { totalTime, totalCharges, chargesOnly, writeOffsOnly, adjustmentsOnly, totalTimeCharge };
  };

  return (
    <Page title='Client Details'>
      <Container style={{ maxWidth: '1280px' }}>
        <HeaderMenu page={'Job Details'} />
        <JobCard selectedJob={selectedJob} company={company} statistics={jobFinancials} />
        <DataTable {...jobTransactions} />
      </Container>
    </Page>
  );
}

// const button = [
//   { name: 'notes', variant: 'contained', icon: clipboardNotes, htmlName: 'Notes' },
//   { name: 'transactions', variant: 'contained', icon: clockFill, htmlName: 'Transactions' },
//   { name: 'newTransactions', variant: 'contained', icon: plusFill, htmlName: 'New Transaction' },
//   { name: 'jobs', variant: 'contained', icon: baselineWork, htmlName: 'Jobs' },
//   { name: 'newJob', variant: 'contained', icon: plusFill, htmlName: 'New Job' },
//   { name: 'invoices', variant: 'contained', icon: fileTextFill, htmlName: 'Invoices' },
//   { name: 'statistics', variant: 'contained', icon: statisticsIcon, htmlName: 'Statistics' }
// ];
