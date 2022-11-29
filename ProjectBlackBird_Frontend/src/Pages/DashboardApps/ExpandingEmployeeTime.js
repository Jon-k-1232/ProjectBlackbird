import { Container } from '@mui/material';
import Page from '../../Components/Page';
import { CollapsibleTable } from 'src/Components/DataTable/ExpandableTable';

export default function ExpandingEmployeeTime() {
  return (
    <Page title='expandingEmployeeTime'>
      <Container style={{ display: 'contents' }}>
        <CollapsibleTable />
      </Container>
    </Page>
  );
}
