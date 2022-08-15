import { useState } from 'react';
import { Container, Stack, TextField, Alert, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function InvoiceConfirmation({ outstandingInvoices, setDisableSubmit, setInvoice }) {
  const [firstInvoiceInput, setFirstInvoiceInput] = useState('');
  const [secondInvoiceInput, setSecondInvoiceInput] = useState('');
  const [invoiceFound, setInvoiceFound] = useState(null);
  const [invoiceDoesNotMatchAlert, setInvoiceDoesNotMatchAlert] = useState(false);
  const [open, setOpen] = useState(true);

  const confirmIfInvoiceFound = (invoiceNum, field) => {
    if (outstandingInvoices) {
      const matchInvoices = outstandingInvoices.rawData.find(invoice => Number(invoice.invoiceNumber) === Number(invoiceNum));
      if (matchInvoices && invoiceNum === firstInvoiceInput && field === 'confirmField') {
        setInvoiceFound(true);
        setInvoiceDoesNotMatchAlert(false);
        setInvoice(invoiceNum);
        setDisableSubmit(false);
      } else if (matchInvoices && invoiceNum === secondInvoiceInput && field === 'firstInvoiceField') {
        setInvoiceFound(true);
        setInvoiceDoesNotMatchAlert(false);
        setInvoice(invoiceNum);
        setDisableSubmit(false);
      } else {
        setInvoiceFound(false);
        setInvoiceDoesNotMatchAlert(true);
      }
    }
  };

  return (
    <Container style={{ padding: '0' }}>
      <Stack spacing={1}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
          <TextField
            required
            type='number'
            value={firstInvoiceInput}
            onChange={e => {
              setFirstInvoiceInput(e.target.value);
              confirmIfInvoiceFound(e.target.value, 'firstInvoiceField');
            }}
            label='Invoice Number'
            helperText='This field is required in order to match the payment to the invoice. INVOICE NUMBER IS REQUIRED.'
          />

          <TextField
            required
            type='number'
            value={secondInvoiceInput}
            onChange={e => {
              setSecondInvoiceInput(e.target.value);
              confirmIfInvoiceFound(e.target.value, 'confirmField');
            }}
            label='Invoice Confirmation'
            helperText='This field is required in order to match the payment to the invoice. INVOICE NUMBER IS REQUIRED.'
          />
        </Stack>

        {invoiceDoesNotMatchAlert && (
          <Collapse in={open}>
            <Alert
              action={
                <IconButton
                  aria-label='close'
                  color='inherit'
                  size='small'
                  onClick={() => {
                    setOpen(false);
                  }}>
                  <CloseIcon fontSize='inherit' />
                </IconButton>
              }
              severity='error'
              sx={{ mb: 2 }}>
              Invoice does not match
            </Alert>
          </Collapse>
        )}
        {!invoiceFound && invoiceFound !== null && (
          <Collapse in={open}>
            <Alert
              action={
                <IconButton
                  aria-label='close'
                  color='inherit'
                  size='small'
                  onClick={() => {
                    setOpen(false);
                  }}>
                  <CloseIcon fontSize='inherit' />
                </IconButton>
              }
              severity='error'
              sx={{ mb: 2 }}>
              No Invoice Record Found
            </Alert>
          </Collapse>
        )}
        {invoiceFound && !invoiceDoesNotMatchAlert && (
          <Collapse in={open}>
            <Alert
              action={
                <IconButton
                  aria-label='close'
                  color='inherit'
                  size='small'
                  onClick={() => {
                    setOpen(false);
                  }}>
                  <CloseIcon fontSize='inherit' />
                </IconButton>
              }
              severity='success'
              sx={{ mb: 2 }}>
              Invoice Record Found
            </Alert>
          </Collapse>
        )}

        {!outstandingInvoices && (
          <Collapse in={open}>
            <Alert
              action={
                <IconButton
                  aria-label='close'
                  color='inherit'
                  size='small'
                  onClick={() => {
                    setOpen(false);
                  }}>
                  <CloseIcon fontSize='inherit' />
                </IconButton>
              }
              severity='error'
              sx={{ mb: 2 }}>
              Select A Company
            </Alert>
          </Collapse>
        )}
      </Stack>
    </Container>
  );
}
