import { Container, Stack, TextField, Typography } from '@mui/material';

export default function ChargeOptions({
  selectedQuantity,
  setSelectedQuantity,
  setTotalTransaction,
  selectedAmount,
  setSelectedAmount,
  selectedType,
  setDisableSubmit
}) {
  return (
    <Container>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
          <TextField
            required
            type='number'
            value={selectedQuantity}
            onChange={e => {
              setSelectedQuantity(e.target.value);
              setTotalTransaction(Math.abs(e.target.value * selectedAmount).toFixed(2));
            }}
            label='Quantity'
          />
          <Typography style={{ color: '#92999f', alignSelf: 'center' }} variant='subtitle1'>
            {selectedType}
          </Typography>
          <TextField
            required
            type='number'
            max='10'
            label='Charge Amount'
            value={selectedAmount}
            onChange={e => {
              e.target.value >= 0 && setSelectedAmount(e.target.value);
              setTotalTransaction(Math.abs(e.target.value * selectedQuantity).toFixed(2));
              setDisableSubmit(false);
            }}
          />
        </Stack>
      </Stack>
    </Container>
  );
}
