// import React, {useState} from 'react';
import React from 'react';
import { Container, Stack } from '@mui/material';
import Page from '../../Components/Page';
// import closeCircleFill from '@iconify/icons-eva/close-circle-fill';
// import checkmarkCircle2Fill from '@iconify/icons-eva/checkmark-circle-2-fill';
// import HeaderMenu from '../../Components/HeaderMenu/HeaderMenu';
import ProfileForm from '../../Components/ProfileForm/ProfileForm';

export default function Profile() {
  // const [dataToShow, setDataToShow] = useState('fakeCall');

  return (
    <Page title='Profile'>
      <Container>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={5}>
          {/* Save buttons in header Menu */}
          {/* <HeaderMenu handleOnClick={data => setDataToShow(data)} page={'Profile'} listOfButtons={button} /> */}
        </Stack>
        <ProfileForm />
      </Container>
    </Page>
  );
}

// const button = [
//   { name: 'save', variant: 'contained', icon: checkmarkCircle2Fill, htmlName: 'save' },
//   { name: 'cancel', variant: 'contained', icon: closeCircleFill, htmlName: 'cancel' }
// ];
