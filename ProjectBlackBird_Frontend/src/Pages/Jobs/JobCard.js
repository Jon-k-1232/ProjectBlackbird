import React from 'react';
import { Typography, Card, CardContent, Container } from '@mui/material';

export default function JobCard({ selectedJob, company }) {
  const { companyName, oid, inactive } = company || '';
  const { defaultDescription, description, defaultTargetPrice, isComplete } = selectedJob || '';

  const jobDetail = () => (
    <table style={{ textAlign: 'justify' }}>
      <tbody>
        <tr>
          <th>Job Name:</th>
          <td>{defaultDescription}</td>
        </tr>
        <tr>
          <th>Additional Detail:</th>
          <td>{description}</td>
        </tr>
        <tr>
          <th>Target Price:</th>
          <td>{defaultTargetPrice}</td>
        </tr>
        <tr>
          <th>Job Status:</th>
          <td>{isComplete ? 'Completed' : 'Active'}</td>
        </tr>
      </tbody>
    </table>
  );

  const jobDetailTwo = () => (
    <table style={{ textAlign: 'justify' }}>
      <tbody>
        <tr>
          <th>Due on Account:</th>
          <td>Placeholder Text</td>
        </tr>
        <tr>
          <th>Amount Due on Job:</th>
          <td>Placeholder Text</td>
        </tr>
        <tr>
          <th> Write Off:</th>
          <td>Placeholder Text</td>
        </tr>
        <tr>
          <th> Average Time:</th>
          <td>Placeholder Text</td>
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
