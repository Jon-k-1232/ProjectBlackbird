import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Stack, CardContent } from '@mui/material';
import Page from '../../Components/Page';
import DataTable from '../../Components/DataTable/DataTable';
import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import { getAllJobDefinitions } from '../../ApiCalls/ApiCalls';

export default function JobDefinitions() {
  const [jobDescriptions, setJobDescriptions] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const allJobDescriptions = await getAllJobDefinitions();
      setJobDescriptions(allJobDescriptions);
    };
    fetchData();
  }, []);

  return (
    <Page>
      <CardContent style={{ maxWidth: '1280px' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={5}>
          <HeaderMenu handleOnClick={data => navigate(`/dashboard/${data}/`)} page={'Job Descriptions'} listOfButtons={button} />
        </Stack>
        <DataTable {...jobDescriptions} route='/dashboard/createNewJobDefinition/' />
      </CardContent>
    </Page>
  );
}

// Name is name of route
const button = [{ name: 'createNewJobDefinition', variant: 'contained', icon: plusFill, htmlName: 'Create New Job Code' }];
