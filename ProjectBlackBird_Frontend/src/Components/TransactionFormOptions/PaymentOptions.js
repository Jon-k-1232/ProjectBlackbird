import { useState } from 'react';
import { Container, Stack, TextField, Alert } from '@mui/material';
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
  const [foundInvoice, setFoundInvoice] = useState({});
  const [overPaymentAlert, setOverPaymentAlert] = useState(false);

  /**
   * Sets user input for amount to pay
   * @param {*} e
   */
  const setTransactionAmount = e => {
    !disable && setDisableSubmit(false);
    setSelectedAmount(e.target.value);
    setTotalTransaction(-Math.abs(e.target.value * selectedQuantity).toFixed(2));

    if (e.target.value > foundInvoice.unPaidBalance) {
      setOverPaymentAlert(true);
    } else {
      setOverPaymentAlert(false);
    }
  };

  /**
   * Sets invoice number and finds a matching invoice
   * @param {*} invoiceNumber
   */
  const setAndSaveInvoices = invoiceNumber => {
    setInvoice(invoiceNumber);
    const foundInputInvoice = outstandingInvoices.rawData.find(invoiceRec => invoiceRec.invoiceNumber === invoiceNumber);
    setFoundInvoice(foundInputInvoice);
  };

  return (
    <Container>
      <Stack spacing={3}>
        <InvoiceConfirmation
          outstandingInvoices={outstandingInvoices}
          setDisableSubmit={boolValue => setDisable(boolValue)}
          setInvoice={invoiceNumber => setAndSaveInvoices(invoiceNumber)}
        />
        <Stack direction='row' alignItems='right' justifyContent='space-between' mb={2}>
          <TextField
            required
            type='number'
            max='10'
            label='Payment Amount'
            value={selectedAmount}
            onChange={e => setTransactionAmount(e)}
            helperText='* Minus ( - ) already applied. Minus indicates payment/ credit'
          />
        </Stack>
        <Stack>{overPaymentAlert && <Alert severity='error'>Input Amount Exceeds Invoice Balance</Alert>}</Stack>
      </Stack>
    </Container>
  );
}
