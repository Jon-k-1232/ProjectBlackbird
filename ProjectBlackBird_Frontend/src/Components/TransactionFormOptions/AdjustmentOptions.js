import { Container, Stack, TextField, Typography } from '@mui/material';

export default function AdjustmentOptions({ selectedQuantity, setTotalTransaction, selectedAmount, setSelectedAmount, setDisableSubmit }) {
  return (
    <Container>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
          <TextField
            required
            type='number'
            max='10'
            label='Adjustment Amount'
            value={selectedAmount}
            onChange={e => {
              setSelectedAmount(e.target.value);
              setTotalTransaction((e.target.value * selectedQuantity).toFixed(2));
              setDisableSubmit(false);
            }}
            helperText='* To make a credit to the job use the minus ( - ) in front of the amount.'
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
          <Typography style={{ color: '#92999f' }} variant='subtitle2'>
            *Please note that NEGATIVE adjustments can only be made to an account that has current transactions that have not yet been invoiced.
            You can only adjust to the point that the current transactions hit "0". DO NOT OVER ADJUST THE CURRENT CYCLE TRANSACTIONS TO A
            NEGATIVE BALANCE, STOP AT "0". If you wish to adjust an amount that appeared on a prior invoice, please use 'Write Off' and reference
            the invoice.
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}
