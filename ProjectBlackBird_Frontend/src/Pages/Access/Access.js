import { Stack, Container, Typography } from '@mui/material';
import Page from '../../Components/Page';

export default function AccessControl() {
  return (
    <Page title='accessControl'>
      <Container style={{ display: 'contents' }}>
        <Stack>
          <Typography variant='h5'>Access Control</Typography>
        </Stack>
      </Container>
    </Page>
  );
}
