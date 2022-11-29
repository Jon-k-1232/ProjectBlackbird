import { Container } from '@mui/material';
import Page from '../../Components/Page';
import ExpandingEmployeeTime from '../DashboardApps/ExpandingEmployeeTime';

export default function Dashboard() {
  return (
    <Page title='dashboard'>
      <Container style={{ display: 'contents' }}>
        <ExpandingEmployeeTime />
      </Container>
    </Page>
  );
}
