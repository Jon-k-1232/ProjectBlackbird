// import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Card, Stack, Container, Typography } from '@mui/material';
import AuthLayout from '../../Layouts/AuthLayout';
import Page from '../../Components/Page';
import { MHidden } from '../../Components/@material-extend';
import LoginForm from './LoginForm';

const RootStyle = styled(Page)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2)
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

export default function Login({ setLoginUser }) {
  return (
    <RootStyle title='Login'>
      <AuthLayout />

      <MHidden width='mdDown'>
        <SectionStyle>
          <Typography variant='h3' sx={{ px: 5, mt: 10, mb: 5 }}>
            Hi, Welcome Back
          </Typography>
        </SectionStyle>
      </MHidden>

      <Container maxWidth='sm'>
        <ContentStyle>
          <Stack sx={{ mb: 5 }}>
            <Typography variant='h4' gutterBottom>
              Sign in to Dragon Slayer
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>Enter your details below.</Typography>
          </Stack>

          <LoginForm setUser={user => setLoginUser(user)} />
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
