import { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Page from '../../Components/Page';
import { Typography, Card, CardContent } from '@mui/material';
import DataTable from '../../Components/DataTable/DataTable';
import { getAnInvoice, rePrintInvoice, getZippedInvoices } from '../../ApiCalls/ApiCalls';
import dayjs from 'dayjs';
import HeaderMenu from 'src/Components/HeaderMenu/HeaderMenu';
import plusFill from '@iconify/icons-eva/plus-fill';
import AlertBanner from '../../Components/AlertBanner/AlertBanner';

export default function InvoiceDetails() {
  const location = useLocation();
  const [invoiceDetails, setInvoiceDetails] = useState({});
  const [invoice, setInvoice] = useState({});
  const [postStatus, setPostStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const invoiceData = location.state.rowData;
      const invoiceId = invoiceData[2];
      const companyId = invoiceData[1];
      const invoice = await getAnInvoice(invoiceId, companyId);
      setInvoice(invoice.invoice);
      setInvoiceDetails(invoice.details);
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  const {
    contactName,
    address1,
    invoiceNumber,
    company,
    dataEndDate,
    beginningBalance,
    endingBalance,
    invoiceDate,
    paymentDueDate,
    totalNewCharges,
    totalPayments
  } = invoice;

  const handleSubmit = async e => {
    const postedItem = await rePrintInvoice(invoiceNumber);
    setPostStatus(postedItem.status);
    await getZippedInvoices();
    setTimeout(() => setPostStatus(null), 4000);
  };

  return (
    <Page title='invoiceDetails'>
      <HeaderMenu handleOnClick={e => handleSubmit(e)} page={'Invoice Details'} listOfButtons={button} />
      <AlertBanner postStatus={postStatus} type='Invoice Re-Printed' />
      <Container style={{ maxWidth: '1280px' }}>
        <Card className='contactWrapper'>
          <CardContent style={styles.header} className='contactHeader'>
            <Typography variant='h4'>{address1 ? address1 : contactName}</Typography>
            <Typography variant='subtitle1'>Invoice: {invoiceNumber}</Typography>
          </CardContent>
          <CardContent style={styles.tableBody} className='contactTables'>
            <table className='contactColumnOne'>
              <tbody>
                <tr>
                  <th>Company Name:</th>
                  <td>{address1}</td>
                </tr>
                <tr>
                  <th>Contact Name:</th>
                  <td>{contactName}</td>
                </tr>
                <tr>
                  <th>Company Id:</th>
                  <td>{company}</td>
                </tr>
                <tr>
                  <th>Invoice Date:</th>
                  <td>{dayjs(invoiceDate).format('MMMM DD, YYYY')}</td>
                </tr>
                <tr>
                  <th>Due Date:</th>
                  <td>{dayjs(paymentDueDate).format('MMMM DD, YYYY')}</td>
                </tr>
                <tr>
                  <th>Data End Date:</th>
                  <td>{dayjs(dataEndDate).format('MMMM DD, YYYY HH:mm:ss')}</td>
                </tr>
              </tbody>
            </table>

            <table className='contactColumnTwo'>
              <tbody>
                <tr>
                  <th>Beginning Balance:</th>
                  <td>{(beginningBalance && beginningBalance.toFixed(2)) || '0.00'}</td>
                </tr>
                <tr>
                  <th>Payments:</th>
                  <td>{(totalPayments && totalPayments.toFixed(2)) || '0.00'}</td>
                </tr>
                <tr>
                  <th>New Charges:</th>
                  <td>{(totalNewCharges && totalNewCharges.toFixed(2)) || '0.00'}</td>
                </tr>
                <tr>
                  <th>Ending Balance:</th>
                  <td>{(endingBalance && endingBalance.toFixed(2)) || '0.00'}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {Object.keys(invoiceDetails).length ? (
          <DataTable {...invoiceDetails} />
        ) : (
          <Typography style={{ textAlign: 'center', padding: '10px' }} variant='h3'>
            No Details Found
          </Typography>
        )}
      </Container>
    </Page>
  );
}

const styles = {
  header: {
    padding: '0px 0px 12px 0px'
  },
  tableBody: {
    padding: '0px 10px'
  }
};

const button = [{ name: 'Print', variant: 'contained', icon: plusFill, htmlName: 'Print Again' }];
