import { useState } from 'react';
import { Stack, TextField, Card, Button, Typography, CardContent, Autocomplete } from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import AdapterDayjs from '@mui/lab/AdapterDayjs';
import { postTransactions } from '../../ApiCalls/PostApiCalls';
import AlertBanner from 'src/Components/AlertBanner/AlertBanner';
import PaymentOptions from 'src/Components/TransactionFormOptions/PaymentOptions';
import ChargeOptions from 'src/Components/TransactionFormOptions/ChargeOptions';
import WriteOffOptions from 'src/Components/TransactionFormOptions/WriteOffOptions';
import TimeOptions from 'src/Components/TransactionFormOptions/TimeOptions';
import AdjustmentOptions from 'src/Components/TransactionFormOptions/AdjustmentOptions';
import SelectionOptions from 'src/Components/TransactionFormOptions/SelectionOptions';

export default function NewTransactions({
  passedCompany,
  setCompanyToGetOutstandingInvoice,
  outstandingInvoices,
  setTransaction,
  setContactCard
}) {
  const [selectedCompany, setSelectedCompany] = useState(passedCompany ? passedCompany : null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedTransactionInputValue, setSelectedTransactionInputValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs().format());
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedType, setSelectedType] = useState('Each');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [totalTransaction, setTotalTransaction] = useState(0);
  const [postStatus, setPostStatus] = useState(null);
  const [invoice, setInvoice] = useState('');
  const [disableSubmit, setDisableSubmit] = useState(true);

  const handleSubmit = async e => {
    e.preventDefault();
    const dataToPost = formObjectForPost();
    const postedItem = await postTransactions(dataToPost);
    setPostStatus(postedItem.status);
    passedCompany && setContactCard(postedItem.updatedAccountInfo[0]);
    resetState();
  };

  const formObjectForPost = () => {
    const postObj = {
      company: selectedCompany.oid,
      job: selectedJob.oid,
      employee: selectedEmployee.oid,
      transactionType: selectedTransaction.displayValue,
      transactionDate: selectedDate,
      quantity: selectedQuantity,
      unitOfMeasure: selectedTransaction.displayValue === 'Time' ? 'Hour' : 'Each',
      unitTransaction: selectedAmount,
      totalTransaction: totalTransaction,
      discount: 0,
      invoice: invoice,
      paymentApplied: false,
      ignoreInAgeing: false
    };
    return postObj;
  };

  const resetState = () => {
    setSelectedCompany(passedCompany ? passedCompany : null);
    setSelectedJob(null);
    setSelectedEmployee(null);
    setSelectedTransaction(null);
    setSelectedDate(dayjs().format());
    setSelectedQuantity(1);
    setSelectedType('Each');
    setSelectedAmount('');
    setTotalTransaction(0);
    setInvoice('');
    setTimeout(() => setPostStatus(null), 4000);
  };

  return (
    <Card style={{ marginTop: '25px' }}>
      <CardContent style={{ padding: '20px' }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <SelectionOptions
                passedCompany={passedCompany}
                selectedCompany={selectedCompany}
                setSelectedCompany={item => setSelectedCompany(item)}
                selectedJob={selectedJob}
                setSelectedJob={item => setSelectedJob(item)}
                selectedEmployee={selectedEmployee}
                setSelectedEmployee={item => setSelectedEmployee(item)}
                setCompanyToGetOutstandingInvoice={item => setCompanyToGetOutstandingInvoice(item)}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
                <Autocomplete
                  value={selectedTransaction}
                  onChange={(event, newValue) => {
                    setSelectedTransaction(newValue);
                    setTransaction(newValue.value);
                  }}
                  inputValue={selectedTransactionInputValue}
                  onInputChange={(event, newInputValue) => setSelectedTransactionInputValue(newInputValue)}
                  getOptionLabel={option => option['displayValue']}
                  options={transactionTypes}
                  sx={{ width: 350 }}
                  renderInput={params => <TextField {...params} label='Select Transaction Type' />}
                />

                <DesktopDatePicker
                  label='Select Transaction Date'
                  inputFormat='MM/DD/YYYY'
                  value={selectedDate}
                  onChange={newValue => setSelectedDate(newValue.$d)}
                  renderInput={params => <TextField {...params} />}
                />
              </Stack>
              {selectedTransaction && selectedTransaction.value === 'charge' && (
                <ChargeOptions
                  selectedQuantity={selectedQuantity}
                  setSelectedQuantity={quantity => setSelectedQuantity(quantity)}
                  setTotalTransaction={total => setTotalTransaction(total)}
                  selectedAmount={selectedAmount}
                  setSelectedAmount={amt => setSelectedAmount(amt)}
                  selectedType={selectedType}
                  setDisableSubmit={boolValue => setDisableSubmit(boolValue)}
                />
              )}
              {selectedTransaction && selectedTransaction.value === 'payment' && (
                <PaymentOptions
                  selectedAmount={selectedAmount}
                  setSelectedAmount={amt => setSelectedAmount(amt)}
                  setTotalTransaction={total => setTotalTransaction(total)}
                  selectedQuantity={selectedQuantity}
                  outstandingInvoices={outstandingInvoices}
                  setDisableSubmit={boolValue => setDisableSubmit(boolValue)}
                  setInvoice={invoiceNumber => setInvoice(invoiceNumber)}
                />
              )}
              {selectedTransaction && selectedTransaction.value === 'writeOff' && (
                <WriteOffOptions
                  selectedAmount={selectedAmount}
                  setSelectedAmount={amt => setSelectedAmount(amt)}
                  setTotalTransaction={total => setTotalTransaction(total)}
                  selectedQuantity={selectedQuantity}
                  outstandingInvoices={outstandingInvoices}
                  setDisableSubmit={boolValue => setDisableSubmit(boolValue)}
                  setInvoice={invoiceNumber => setInvoice(invoiceNumber)}
                />
              )}
              {selectedTransaction && selectedTransaction.value === 'time' && (
                <TimeOptions
                  selectedAmount={selectedAmount}
                  setSelectedAmount={amt => setSelectedAmount(amt)}
                  setTotalTransaction={total => setTotalTransaction(total)}
                  selectedQuantity={selectedQuantity}
                  setSelectedQuantity={quantity => setSelectedQuantity(quantity)}
                  selectedEmployee={selectedEmployee}
                  setDisableSubmit={setDisableSubmit}
                />
              )}
              {selectedTransaction && selectedTransaction.value === 'adjustment' && (
                <AdjustmentOptions
                  selectedQuantity={selectedQuantity}
                  setTotalTransaction={total => setTotalTransaction(total)}
                  selectedAmount={selectedAmount}
                  setSelectedAmount={amt => setSelectedAmount(amt)}
                  setDisableSubmit={boolValue => setDisableSubmit(boolValue)}
                />
              )}
              <Typography style={{ color: '#92999f' }} variant='h5'>
                Total ${totalTransaction}
              </Typography>
              <Button disabled={disableSubmit} type='submit' name='submit'>
                Submit
              </Button>
              <AlertBanner postStatus={postStatus} type='Transaction' />
            </Stack>
          </form>
        </LocalizationProvider>
      </CardContent>
    </Card>
  );
}

const transactionTypes = [
  {
    displayValue: 'Charge',
    value: 'charge'
  },
  {
    displayValue: 'Time',
    value: 'time'
  },
  {
    displayValue: 'Payment',
    value: 'payment'
  },
  {
    displayValue: 'Adjustment',
    value: 'adjustment'
  },
  {
    displayValue: 'Write Off',
    value: 'writeOff'
  }
];
