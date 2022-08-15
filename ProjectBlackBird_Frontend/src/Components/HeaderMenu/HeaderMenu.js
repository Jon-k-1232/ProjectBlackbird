import { Container, Stack, Button, Typography } from '@mui/material';
import { Icon } from '@iconify/react';

export default function HeaderMenu({ page, handleOnClick, listOfButtons }) {
  return (
    <Container style={{ padding: '0' }}>
      <Stack direction='row' alignItems='right' justifyContent='space-between' mb={2}>
        <Typography variant='h4' gutterBottom>
          {page}
        </Typography>
        <div>
          {listOfButtons &&
            listOfButtons.map((button, i) => (
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
        </div>
      </Stack>
    </Container>
  );
}
