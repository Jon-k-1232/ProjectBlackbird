import { Container, Stack, TextField, Typography } from '@mui/material';

export default function AdvancedPayments({ selectedQuantity, setTotalTransaction, selectedAmount, setSelectedAmount, setDisableSubmit }) {
  return (
    <Container>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
          <TextField
            required
            type='number'
            max='10'
            label='Retainer/Prepaid Amount'
            value={selectedAmount}
            onChange={e => {
              setSelectedAmount(Math.abs(e.target.value));
              setTotalTransaction(Math.abs((e.target.value * selectedQuantity).toFixed(2)));
              setDisableSubmit(false);
            }}
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
          <Typography style={{ color: '#92999f' }} variant='subtitle2'>
            * This is for clients who have opted for retainer or prepayment.
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
