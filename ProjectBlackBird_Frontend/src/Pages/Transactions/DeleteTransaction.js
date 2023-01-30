import { useEffect, useState } from 'react';
import { Alert, Card, CardContent, Stack, TextField, Checkbox, FormControlLabel, Button, Container } from '@mui/material';
import Page from '../../Components/Page';
import { getAllTransactions } from '../../ApiCalls/ApiCalls';
import { deleteTransaction } from '../../ApiCalls/PostApiCalls';
import greenCheckmark from '../../Static_Icons/greenCheckmark.svg';
import redCircle from '../../Static_Icons/redCircle.svg';

export default function DeleteTransaction() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [selectedOid, setSelectedOid] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDeleteChecked, setIsDeleteChecked] = useState(false);
  const [postStatus, setPostStatus] = useState(null);

  useEffect(() => {
    const calls = async () => {
      const transactions = await getAllTransactions(120);
      setAllTransactions(transactions.rawData);
    };
    calls();
  }, []);

  const searchForTransaction = async e => {
    setSelectedOid(e.target.value);
    const foundTransaction = allTransactions.find(item => Number(item.oid) === Number(e.target.value));

    if (foundTransaction) {
      setSelectedTransaction(foundTransaction);
      setIsDeleteChecked(false);
      // Handles if no transaction found.
    } else if (!foundTransaction || foundTransaction.invoice === 0) {
      setSelectedTransaction(null);
      setIsDeleteChecked(false);
    }
  };

  const handleDelete = async e => {
    const transactionIdToDelete = selectedTransaction.oid;
    const postedItem = await deleteTransaction(transactionIdToDelete);
    setPostStatus(postedItem.status);
    if (postedItem.status === 200) resetState();
    const transactions = await getAllTransactions(120);
    setAllTransactions(transactions.rawData);
    setTimeout(() => setPostStatus(null), 4000);
  };

  const resetState = () => {
    setIsDeleteChecked(false);
    setSelectedTransaction(null);
    setSelectedOid('');
  };

  return (
    <Page title='Transactions'>
      <Card style={{ marginTop: '25px' }}>
        <CardContent style={{ padding: '20px' }}>
          <Stack>
            <Stack style={{ width: '300px' }} direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
              <TextField required type='number' max='10' label='Search By Oid' value={selectedOid} onChange={searchForTransaction} />
            </Stack>
            {selectedTransaction && selectedTransaction.invoice > 0 && (
              <Stack style={{ marginTop: '30px' }}>
                <Alert severity='warning'> Transaction has already been billed. Deletion cannot be completed.</Alert>
              </Stack>
            )}
            {!selectedTransaction && selectedOid && (
              <Stack style={{ marginTop: '30px' }}>
                <Alert severity='warning'>No transaction Found</Alert>
              </Stack>
            )}
            {/* Company, Job, Employee selections */}
            {selectedTransaction && Number(selectedTransaction.invoice) === 0 && (
              <Container direction={{ xs: 'column', sm: 'row' }} style={{ paddingTop: '50px' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }}>
                  <table className='contactColumnOne'>
                    <tbody>
                      <tr>
                        <th>Oid:</th>
                        <td style={style.data}>{selectedTransaction.oid}</td>
                      </tr>
                      <tr>
                        <th>Company:</th>
                        <td style={style.data}>{selectedTransaction.company}</td>
                      </tr>
                      <tr>
                        <th>Job:</th>
                        <td style={style.data}>{selectedTransaction.job}</td>
                      </tr>
                      <tr>
                        <th>Employee:</th>
                        <td style={style.data}>{selectedTransaction.employee}</td>
                      </tr>
                      <tr>
                        <th>Transaction Type:</th>
                        <td style={style.data}>{selectedTransaction.transactionType}</td>
                      </tr>
                      <tr>
                        <th>Transaction Date:</th>
                        <td style={style.data}>{selectedTransaction.transactionDate}</td>
                      </tr>
                      <tr>
                        <th>Quantity:</th>
                        <td style={style.data}>{selectedTransaction.quantity}</td>
                      </tr>
                      <tr>
                        <th>Unit Of Measure:</th>
                        <td style={style.data}>{selectedTransaction.unitOfMeasure}</td>
                      </tr>
                      <tr>
                        <th>Unit Transaction:</th>
                        <td style={style.data}>{selectedTransaction.unitTransaction}</td>
                      </tr>
                      <tr>
                        <th>Invoice:</th>
                        <td style={style.data}>{selectedTransaction.invoice}</td>
                      </tr>
                      <tr>
                        <th>Billable:</th>
                        <td style={style.data}>
                          {selectedTransaction.billable ? (
                            <img style={{ width: '20px' }} src={greenCheckmark} alt='Green Checkmark' />
                          ) : (
                            <img style={{ width: '20px' }} src={redCircle} alt='Red Negative Circle' />
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} style={{ paddingTop: '30px' }}>
                  <FormControlLabel
                    control={<Checkbox checked={isDeleteChecked} onChange={e => setIsDeleteChecked(e.target.checked)} />}
                    label='Delete'
                  />
                </Stack>

                {isDeleteChecked && (
                  <Stack>
                    <Alert severity='error' style={{ marginTop: '30px' }}>
                      WARNING: You are about to delete this transaction. Proceed?
                    </Alert>

                    <Button disabled={!isDeleteChecked} onClick={handleDelete} style={{ fontSize: '20px', marginTop: '30px' }}>
                      Delete Transaction
                    </Button>
                  </Stack>
                )}
              </Container>
            )}

            {postStatus === 200 && <Alert severity='success'>Transaction Removed</Alert>}
            {postStatus !== null && postStatus !== 200 && <Alert severity='error'>Error</Alert>}
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
}

const style = {
  data: {
    paddingLeft: '15px'
  }
};
