import React from 'react';
import { Typography, Card, CardContent, Container } from '@mui/material';

export default function JobCard({ selectedJob, company, statistics }) {
  const { companyName, oid, inactive } = company || '';
  const { defaultDescription, description } = selectedJob || '';
  const { totalCharges, totalTime, chargesOnly, writeOffsOnly, adjustmentsOnly, totalTimeCharge } = statistics || '';

  const jobDetail = () => (
    <table style={{ textAlign: 'justify' }}>
      <tbody>
        <tr>
          <th>Job Name:</th>
          <td>{description}</td>
        </tr>
        <tr>
          <th>Additional Detail:</th>
          <td>{defaultDescription}</td>
        </tr>
      </tbody>
    </table>
  );

  const jobDetailTwo = () => (
    <table style={{ textAlign: 'justify' }}>
      <tbody>
        <tr>
          <th>Charges + Time + Adjustments:</th>
          <td>${totalCharges}</td>
        </tr>
        <tr>
          <th>Breakdown of Time Cost:</th>
          <td>${totalTimeCharge}</td>
        </tr>
        <tr>
          <th>Breakdown of Charges:</th>
          <td>${chargesOnly}</td>
        </tr>
        <tr>
          <th>Breakdown of Write Offs:</th>
          <td>${writeOffsOnly}</td>
        </tr>
        <tr>
          <th>Breakdown of Adjustments:</th>
          <td>${adjustmentsOnly}</td>
        </tr>
        <tr>
          <th>Breakdown of Time:</th>
          <td>{totalTime} Billable Hours</td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <Card className='contactWrapper'>
      <CardContent style={styles()}>
        <Typography variant='h4'>{companyName}</Typography>
        <Typography variant='subtitle1'>{inactive ? 'Inactive' : 'Active'}</Typography>
        <Typography variant='subtitle1'>Client: {oid}</Typography>
      </CardContent>
      <Container style={{ display: 'flex' }}>
        <CardContent style={{ padding: '5px' }}>{jobDetail()}</CardContent>
        <CardContent style={{ padding: '5px 30px 8px' }}>{jobDetailTwo()}</CardContent>
      </Container>
    </Card>
  );
}

const styles = () => ({
  padding: '0px',
  display: 'Flex',
  alignItems: 'baseline',
  justifyContent: 'space-between'
});
