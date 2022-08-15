import { useEffect, useState } from 'react';
import { Stack, Alert, TextField, Card, Button, CardContent, Autocomplete } from '@mui/material';
import { getAnInvoice, getAllCompanies } from '../../ApiCalls/ApiCalls';
import { postInvoiceUpdate } from '../../ApiCalls/PostApiCalls';
import AlertBanner from 'src/Components/AlertBanner/AlertBanner';

export default function EditAnInvoice() {
  const [allCompanies, setAllCompanies] = useState([]);

  const [oid, setOid] = useState(null);
  const [company, setCompany] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState(null);
  const [contactName, setContactName] = useState(null);
  const [address1, setAddress1] = useState(null);
  const [address2, setAddress2] = useState(null);
  const [address3, setAddress3] = useState(null);
  const [address4, setAddress4] = useState(null);
  const [address5, setAddress5] = useState(null);
  const [beginningBalance, setBeginningBalance] = useState('');
  const [totalPayments, setTotalPayments] = useState('');
  const [totalNewCharges, setTotalNewCharges] = useState('');
  const [endingBalance, setEndingBalance] = useState('');
  const [unPaidBalance, setUnPaidBalance] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [paymentDueDate, setPaymentDueDate] = useState(null);
  const [dataEndDate, setDataEndDate] = useState(null);
  const [selectedCompanyInputValue, setSelectedCompanyInputValue] = useState('');
  const [invoice, setInvoice] = useState(null);
  const [confirmInvoice, setConfirmInvoice] = useState(null);
  const [postStatus, setPostStatus] = useState(null);
  const [invoiceAlert, setInvoiceAlert] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const allCompanies = await getAllCompanies();
      setAllCompanies(allCompanies.rawData);
    };
    fetchData();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    const dataToPost = formObjectForPost();
    const postedItem = await postInvoiceUpdate(dataToPost);
    setPostStatus(postedItem.status);
    setTimeout(() => setPostStatus(null), 4000);
    resetState();
  };

  const formObjectForPost = () => {
    const postObj = {
      oid: oid,
      company: company.oid,
      invoiceNumber: invoiceNumber,
      contactName: contactName,
      address1: address1,
      address2: address2,
      address3: address3,
      address4: address4,
      address5: address5,
      beginningBalance: beginningBalance,
      totalPayments: totalPayments,
      totalNewCharges: totalNewCharges,
      endingBalance: endingBalance,
      unPaidBalance: unPaidBalance,
      invoiceDate: invoiceDate,
      paymentDueDate: paymentDueDate,
      dataEndDate: dataEndDate
    };
    return postObj;
  };

  const handleGettingOfInvoice = async () => {
    const getInvoice = await getAnInvoice(invoice, company.oid);
    if (getInvoice.invoice) {
      setOid(getInvoice.invoice.oid);
      setInvoiceNumber(getInvoice.invoice.invoiceNumber);
      setContactName(getInvoice.invoice.contactName);
      setAddress1(getInvoice.invoice.address1);
      setAddress2(getInvoice.invoice.address2);
      setAddress3(getInvoice.invoice.address3);
      setAddress4(getInvoice.invoice.address4);
      setAddress5(getInvoice.invoice.address5);
      setBeginningBalance(getInvoice.invoice.beginningBalance);
      setTotalPayments(getInvoice.invoice.totalPayments);
      setTotalNewCharges(getInvoice.invoice.totalNewCharges);
      setEndingBalance(getInvoice.invoice.endingBalance);
      setUnPaidBalance(getInvoice.invoice.unPaidBalance);
      setInvoiceDate(getInvoice.invoice.invoiceDate);
      setPaymentDueDate(getInvoice.invoice.paymentDueDate);
      setDataEndDate(getInvoice.invoice.dataEndDate);
    }
  };

  const resetState = () => {
    setOid(null);
    setCompany(null);
    setInvoiceNumber(null);
    setContactName(null);
    setAddress1(null);
    setAddress2(null);
    setAddress3(null);
    setAddress4(null);
    setAddress5(null);
    setBeginningBalance('');
    setTotalPayments('');
    setTotalNewCharges('');
    setEndingBalance('');
    setUnPaidBalance('');
    setInvoiceDate(null);
    setPaymentDueDate(null);
    setDataEndDate(null);
    setInvoice(null);
    setConfirmInvoice(null);
  };

  return (
    <Card style={{ marginTop: '25px' }}>
      <CardContent style={{ padding: '20px' }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
              <Autocomplete
                value={company}
                onChange={(event, newValue) => setCompany(newValue)}
                inputValue={selectedCompanyInputValue}
                onInputChange={(event, newInputValue) => setSelectedCompanyInputValue(newInputValue)}
                getOptionLabel={option => option['companyName']}
                options={allCompanies}
                sx={{ width: 350 }}
                renderInput={params => <TextField {...params} label='Select Company' />}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
              <TextField
                required
                type='number'
                value={invoice}
                onChange={e => {
                  if (e.target.value !== confirmInvoice) {
                    setInvoiceAlert(true);
                    setInvoice(e.target.value);
                  } else {
                    setInvoiceAlert(false);
                    setInvoice(e.target.value);
                  }
                }}
                label='Invoice Number'
              />

              <TextField
                required
                type='number'
                value={confirmInvoice}
                onChange={e => {
                  handleGettingOfInvoice();
                  if (e.target.value !== invoice) {
                    setInvoiceAlert(true);
                    setConfirmInvoice(e.target.value);
                  } else {
                    setInvoiceAlert(false);
                    setConfirmInvoice(e.target.value);
                  }
                }}
                label='Invoice Confirmation'
              />
            </Stack>

            {invoiceAlert && <Alert severity='warning'>Invoice does not match</Alert>}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
              <TextField type='number' value={beginningBalance} onChange={e => setBeginningBalance(e.target.value)} label='Beginning Balance' />
              <TextField type='number' value={totalPayments} onChange={e => setTotalPayments(e.target.value)} label='Total Payments' />
              <TextField type='number' value={totalNewCharges} onChange={e => setTotalNewCharges(e.target.value)} label='Total New Charges' />
              <TextField type='number' value={endingBalance} onChange={e => setEndingBalance(e.target.value)} label='Ending Balance' />
              <TextField type='number' value={unPaidBalance} onChange={e => setUnPaidBalance(e.target.value)} label='UnPaid Balance' />
            </Stack>

            <Button type='submit' name='submit'>
              Submit
            </Button>
            <AlertBanner postStatus={postStatus} type='Transaction' />
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
