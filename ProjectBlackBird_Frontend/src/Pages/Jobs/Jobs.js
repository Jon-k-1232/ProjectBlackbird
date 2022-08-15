import { useEffect, useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { useNavigate } from 'react-router-dom';
import { Stack, CardContent } from '@mui/material';
import Page from '../../Components/Page';
import DataTable from '../../Components/DataTable/DataTable';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import { getAllJobs } from '../../ApiCalls/ApiCalls';

export default function Jobs() {
  const [jobs, setJobs] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const allJobs = await getAllJobs();
      setJobs(allJobs);
    };
    fetchData();
  }, []);

  return (
    <Page>
      <CardContent style={{ maxWidth: '1280px' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={5}>
          <HeaderMenu handleOnClick={data => navigate(`/dashboard/${data}/`)} page={'Jobs'} listOfButtons={button} />
        </Stack>
        <DataTable {...jobs} route='/dashboard/jobDetails/' columnToSortAscOrDesc='Start Date' ascOrDesc='desc' />
      </CardContent>
    </Page>
  );
}

// Name is name of route
const button = [{ name: 'newJob', variant: 'contained', icon: plusFill, htmlName: 'Create New Job' }];
