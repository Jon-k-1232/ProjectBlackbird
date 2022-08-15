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
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <Page title='Client Details'>
      <Container style={{ maxWidth: '1280px' }}>
        <HeaderMenu page={'Job Details'} />
        {/* <HeaderMenu handleOnClick={data => setDataToShow(data)} page={'Client Details'} listOfButtons={button} /> */}
        <JobCard selectedJob={selectedJob} company={company} />
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
