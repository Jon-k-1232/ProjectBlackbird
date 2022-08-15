import { useState } from 'react';
import { Container, Stack, TextField } from '@mui/material';
import InvoiceConfirmation from './InvoiceConfirmation';

export default function PaymentOptions({
  selectedAmount,
  setSelectedAmount,
  setTotalTransaction,
  selectedQuantity,
  outstandingInvoices,
  setDisableSubmit,
  setInvoice
}) {
  const [disable, setDisable] = useState(true);
  return (
    <Container>
      <Stack spacing={3}>
        <InvoiceConfirmation
          outstandingInvoices={outstandingInvoices}
          setDisableSubmit={boolValue => setDisable(boolValue)}
          setInvoice={invoiceNumber => setInvoice(invoiceNumber)}
        />
        <Stack direction='row' alignItems='right' justifyContent='space-between' mb={2}>
          <TextField
            required
            type='number'
            max='10'
            label='Payment Amount'
            value={selectedAmount}
            onChange={e => {
              !disable && setDisableSubmit(false);
              setSelectedAmount(e.target.value);
              setTotalTransaction(-Math.abs(e.target.value * selectedQuantity).toFixed(2));
            }}
            helperText='* Minus ( - ) already applied. Minus indicates payment/ credit'
          />
        </Stack>
      </Stack>
    </Container>
  );
}
