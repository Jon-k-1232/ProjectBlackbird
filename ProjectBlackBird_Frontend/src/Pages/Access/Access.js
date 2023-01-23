import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Button, Typography, Container } from '@mui/material';
import { MotionContainer, varBounceIn } from '../Page404';
import Page from '../../Components/Page';
import RainCloud from '../Access/image/RainCloud.gif';

const RootStyle = styled(Page)(({ theme }) => ({
  display: 'flex',
  minHeight: '100%',
  alignItems: 'center',
  paddingTop: theme.spacing(15),
  paddingBottom: theme.spacing(10)
}));

export default function AccessControl() {
  return (
    <RootStyle>
      <Container>
        <MotionContainer initial='initial' open>
          <Box sx={{ maxWidth: 480, margin: 'auto', textAlign: 'center' }}>
            <motion.div variants={varBounceIn}>
              <Typography variant='h3' paragraph>
                Access Denied
              </Typography>
            </motion.div>
            <Typography sx={{ color: 'text.secondary' }}>
              If you are supposed to have access to this page please contact your administrator.
            </Typography>

            <motion.div variants={varBounceIn}>
              <Box component='img' src={RainCloud} sx={{ height: 260, mx: 'auto', my: { xs: 5, sm: 10 } }} />
            </motion.div>

            <Button to='/dashboard' size='large' variant='contained' component={RouterLink}>
              Go to Home
            </Button>
          </Box>
        </MotionContainer>
      </Container>
    </RootStyle>
  );
}
