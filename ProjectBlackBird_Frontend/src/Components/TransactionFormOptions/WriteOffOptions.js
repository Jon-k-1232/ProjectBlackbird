import { useState } from 'react';
import { Container, Stack, TextField, Autocomplete } from '@mui/material';
import InvoiceConfirmation from './InvoiceConfirmation';

export default function WriteOffOptions({
  selectedAmount,
  setSelectedAmount,
  setTotalTransaction,
  selectedQuantity,
  outstandingInvoices,
  setDisableSubmit,
  setInvoice
}) {
  const [disable, setDisable] = useState(true);
  const [selectedCyclePeriod, setSelectedCyclePeriod] = useState('');
  const [selectedCycleInputValue, setSelectedCycleInputValue] = useState('');

  return (
    <Container>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
          <Autocomplete
            value={selectedCyclePeriod}
            onChange={(event, newValue) => setSelectedCyclePeriod(newValue)}
            inputValue={selectedCycleInputValue}
            onInputChange={(event, newInputValue) => setSelectedCycleInputValue(newInputValue)}
            getOptionLabel={option => option['displayValue'] || ''}
            options={cycleOptions}
            sx={{ width: 350 }}
            renderInput={params => <TextField {...params} label='Select Cycle Period' />}
          />
        </Stack>
        {selectedCyclePeriod.value === 'writeOffInvoiced' && (
          <InvoiceConfirmation
            outstandingInvoices={outstandingInvoices}
            setDisableSubmit={boolValue => setDisable(boolValue)}
            setInvoice={invoiceNumber => setInvoice(invoiceNumber)}
          />
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
          <TextField
            required
            type='number'
            max='10'
            label='Write Off Amount'
            value={selectedAmount}
            onChange={e => {
              e.target.value >= 0 && setSelectedAmount(e.target.value);
              !disable && setDisableSubmit(false);
              setTotalTransaction(-Math.abs(e.target.value * selectedQuantity).toFixed(2));
            }}
            helperText='* Amount will reflect as negative in total amount. This credits the account/job.'
          />
        </Stack>
      </Stack>
    </Container>
  );
}

const cycleOptions = [
  {
    displayValue: 'Write Off Not Invoiced',
    value: 'writeOffNotInvoiced'
  },
  {
    displayValue: 'Write Off Already Invoiced',
    value: 'writeOffInvoiced'
  }
];
