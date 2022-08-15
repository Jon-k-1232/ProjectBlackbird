// import { useState } from 'react';
import { Container, Stack, Button } from '@mui/material';
import plusFill from '@iconify/icons-eva/plus-fill';
import Page from '../../Components/Page';
import { Icon } from '@iconify/react';
import { zeroCompanyAccount, zeroAndDeactivateUserAccount } from '../../ApiCalls/PostApiCalls';

export default function AccountTools({ companyId, updateContact }) {
  const handleOnClick = async buttonName => {
    if (buttonName === 'zeroAccount') {
      const postItem = await zeroCompanyAccount(companyId);
      updateContact(postItem.updatedContact);
    } else {
      const postItem = await zeroAndDeactivateUserAccount(companyId);
      updateContact(postItem.updatedContact);
    }
  };

  return (
    <Page title='Invoices'>
      <Container style={{ maxWidth: '1280px', marginTop: '20px' }}>
        <Stack direction='row' alignItems='center' justifyContent='space-between' mb={5}>
          <Stack spacing={3}>
            {buttons &&
              buttons.map((button, i) => (
                <Button
                  key={i}
                  onClick={e => handleOnClick(e.target.name)}
                  name={button.name}
                  style={{ height: '30px', margin: '10px' }}
                  variant={button.variant}
                  startIcon={<Icon icon={button.icon} />}>
                  {button.htmlName}
                </Button>
              ))}
          </Stack>
        </Stack>
      </Container>
    </Page>
  );
}

const buttons = [
  { name: 'zeroAccount', variant: 'contained', icon: plusFill, htmlName: 'Zero Account' },
  { name: 'zeroAndDeactivateAccount', variant: 'contained', icon: plusFill, htmlName: 'Zero And Deactivate Account' }
];
