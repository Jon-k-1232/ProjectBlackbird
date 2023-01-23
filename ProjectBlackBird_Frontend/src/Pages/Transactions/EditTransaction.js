import { useEffect, useState } from 'react';
import { Alert, Card, CardContent, Stack, TextField, Autocomplete, Checkbox, FormControlLabel } from '@mui/material';
import Page from '../../Components/Page';
import { getAllTransactions, getActiveCompanies, getCompanyJobs, getAllEmployees } from '../../ApiCalls/ApiCalls';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function EditTransaction() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [selectedOid, setSelectedOid] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [allCompanies, setAllCompanies] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [allCompanyJobs, setAllCompanyJobs] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedTransactionType, setSelectedTransactionType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs().format());
  const [isBillableChecked, setIsBillableChecked] = useState(false);

  useEffect(() => {
    const calls = async () => {
      const transactions = await getAllTransactions(120);
      setAllTransactions(transactions.rawData);

      const allCompanies = await getActiveCompanies();
      setAllCompanies(allCompanies.rawData);

      const allEmployees = await getAllEmployees();
      setAllEmployees(allEmployees.rawData);
    };
    calls();
  }, []);

  const searchForTransaction = async e => {
    setSelectedOid(e.target.value);
    const foundTransaction = allTransactions.find(item => Number(item.oid) === Number(e.target.value));

    if (foundTransaction) {
      console.log(foundTransaction);
      setSelectedTransaction(foundTransaction);
      const foundClient = allCompanies.find(item => item.companyName === foundTransaction.company);
      setSelectedCompany(foundClient);

      // using find since having to look for specific object
      const allCompanyJobs = await getCompanyJobs(foundClient.oid, 730);
      setAllCompanyJobs(allCompanyJobs.rawData);
      const foundJob = allCompanyJobs.rawData.find(item => item.defaultDescription === foundTransaction.job);
      setSelectedJob(foundJob);

      // using find since having to look for specific object
      const foundEmployee = allEmployees.find(item => item.displayname === foundTransaction.employee);
      setSelectedEmployee(foundEmployee);

      // using find since having to look for specific object
      const transactionTypeSelection = transactionTypes.find(item => item.displayValue === foundTransaction.transactionType);
      setSelectedTransactionType(transactionTypeSelection);

      setSelectedDate(foundTransaction.transactionDate);
      setIsBillableChecked(foundTransaction.billable);

      // Handles if no transaction found.
    } else if (!foundTransaction || foundTransaction.invoice === 0) {
      setSelectedTransaction(null);
    }
  };

  const updateTransaction = async (e, value, stateName, valueProperty) => {
    if (e.target.value && e.target.name) {
      setSelectedTransaction(otherSettings => ({ ...otherSettings, [e.target.name]: e.target.value }));
    } else if (value && stateName) {
      setSelectedTransaction(otherSettings => ({ ...otherSettings, [stateName]: value[valueProperty] }));
    }

    if (stateName === 'company') {
      const allCompanyJobs = await getCompanyJobs(value.oid, 730);
      setAllCompanyJobs(allCompanyJobs.rawData);
      setSelectedJob(null);
    }
  };

  return (
    <Page title='Transactions'>
      <Card style={{ marginTop: '25px' }}>
        <CardContent style={{ padding: '20px' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack>
              <Stack style={{ width: '300px' }} direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
                <TextField required type='number' max='10' label='Search By Oid' value={selectedOid} onChange={searchForTransaction} />
              </Stack>

              {selectedTransaction && selectedTransaction.invoice > 0 && (
                <Stack>
                  <Alert severity='warning'> Transaction has already been billed. No edits can be made.</Alert>
                </Stack>
              )}

              {/* Company, Job, Employee selections */}
              {selectedTransaction && Number(selectedTransaction.invoice) === 0 && (
                <Stack>
                  <Stack style={{ paddingTop: '30px' }} direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
                    <Autocomplete
                      value={selectedCompany}
                      onChange={(e, v) => {
                        updateTransaction(e, v, 'company', 'companyName');
                        setSelectedCompany(v);
                      }}
                      getOptionLabel={option => option.companyName}
                      options={allCompanies}
                      sx={{ width: 350 }}
                      renderInput={params => <TextField {...params} label='Select Company' />}
                    />
                    <Autocomplete
                      value={selectedJob}
                      onChange={(e, v) => {
                        updateTransaction(e, v, 'job', 'defaultDescription');
                        setSelectedJob(v);
                      }}
                      options={allCompanyJobs}
                      sx={{ width: 350 }}
                      renderInput={params => <TextField {...params} label='Select Job' />}
                    />
                    <Autocomplete
                      value={selectedEmployee}
                      onChange={(e, v) => {
                        updateTransaction(e, v, 'employee', 'displayname');
                        setSelectedEmployee(v);
                      }}
                      options={allEmployees}
                      sx={{ width: 350 }}
                      renderInput={params => <TextField {...params} label='Select Job' />}
                    />
                  </Stack>

                  {/* Select transaction Type */}
                  <Stack style={{ paddingTop: '30px' }} direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
                    <Autocomplete
                      value={selectedTransactionType}
                      onChange={(e, v) => {
                        updateTransaction(e, v, 'transactionType', 'displayValue');
                        setSelectedTransactionType(v);
                      }}
                      getOptionLabel={option => option.displayValue}
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

                  <Stack style={{ paddingTop: '30px' }} direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
                    <TextField
                      required
                      name='totalTransaction'
                      type='number'
                      max='10'
                      label='Total Transaction'
                      value={selectedTransaction.totalTransaction}
                      onChange={updateTransaction}
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
                    <FormControlLabel
                      control={<Checkbox checked={isBillableChecked} onChange={e => setIsBillableChecked(e.target.checked)} />}
                      label='Billable'
                    />
                  </Stack>
                </Stack>
              )}
            </Stack>
          </LocalizationProvider>
        </CardContent>
      </Card>
    </Page>
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
  },
  {
    displayValue: 'Advanced Payment',
    value: 'advancedPayment'
  }
];
