import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Stack, TextField, Card, Button, CardContent, Checkbox, FormGroup, FormControlLabel } from '@mui/material';
import { updateJobDefinition, createJobDefinition } from '../../ApiCalls/PostApiCalls';
import AlertBanner from '../../Components/AlertBanner/AlertBanner';

export default function NewJobDefinition() {
  const location = useLocation();

  const [jobDescription, setJobDescription] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [billable, setBillable] = useState(location.state ? location.state.rowData[3] : null);
  const [checked, setChecked] = useState(false);
  const [postStatus, setPostStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (location.state) {
        const rowData = location.state.rowData;
        setJobDescription(rowData[1]);
        setTargetPrice(rowData[2]);
        setBillable(Boolean(rowData[3]));
        rowData[3] === 'true' && setChecked(true);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    const dataToPost = objectToPost();
    const JobDefinitionId = location.state ? location.state.rowData[0] : null;
    const postedItem = location.state ? await updateJobDefinition(dataToPost, JobDefinitionId) : await createJobDefinition(dataToPost);
    setPostStatus(postedItem.status);
    setTimeout(() => setPostStatus(null), 4000);
    resetForm();
  };

  const objectToPost = () => {
    return {
      description: jobDescription,
      defaultTargetPrice: targetPrice,
      billable: checked || billable
    };
  };

  const resetForm = () => {
    setJobDescription('');
    setTargetPrice('');
    setBillable(null);
  };

  return (
    <Card style={{ marginTop: '25px' }}>
      <CardContent style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
              <TextField
                fullWidth
                required
                type='text'
                max='100'
                label='General Job Description'
                value={jobDescription}
                onChange={e => {
                  setJobDescription(e.target.value);
                }}
                helperText='General job description. The sub description is added on the job.'
              />
              <TextField
                fullWidth
                required
                type='number'
                max='9'
                label='Target Price'
                value={targetPrice}
                onChange={e => {
                  setTargetPrice(e.target.value);
                }}
                helperText='How much on average does this job cost'
              />
            </Stack>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={checked} onChange={e => setChecked(e.target.checked)} />} label='Billable' />
            </FormGroup>
            <Button type='submit' name='submit'>
              Submit
            </Button>
            <AlertBanner postStatus={postStatus} type='Job Definition' />
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
