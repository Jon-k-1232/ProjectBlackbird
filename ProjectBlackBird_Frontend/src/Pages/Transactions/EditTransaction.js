import { useEffect, useState } from 'react';
import { Alert, Card, CardContent, Stack, TextField, Checkbox, FormControlLabel, Button, Container } from '@mui/material';
import Page from '../../Components/Page';
import { getAllTransactions } from '../../ApiCalls/ApiCalls';
import greenCheckmark from '../../Static_Icons/greenCheckmark.svg';
import redCircle from '../../Static_Icons/redCircle.svg';

export default function EditTransaction() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [selectedOid, setSelectedOid] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDeleteChecked, setIsDeleteChecked] = useState(false);

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
      console.log(foundTransaction);
      setSelectedTransaction(foundTransaction);
      setIsDeleteChecked(false);
      // Handles if no transaction found.
    } else if (!foundTransaction || foundTransaction.invoice === 0) {
      setSelectedTransaction(null);
      setIsDeleteChecked(false);
    }
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

            {/* Company, Job, Employee selections */}
            {selectedTransaction && Number(selectedTransaction.invoice) === 0 && (
              <Container direction={{ xs: 'column', sm: 'row' }} style={{ paddingTop: '50px' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }}>
                  <table className='contactColumnOne'>
                    <tbody>
                      <tr>
                        <th>Oid:</th>
                        <td>{selectedTransaction.oid}</td>
                      </tr>
                      <tr>
                        <th>Company:</th>
                        <td>{selectedTransaction.company}</td>
                      </tr>
                      <tr>
                        <th>Job:</th>
                        <td>{selectedTransaction.job}</td>
                      </tr>
                      <tr>
                        <th>Employee:</th>
                        <td>{selectedTransaction.employee}</td>
                      </tr>
                      <tr>
                        <th>Transaction Type:</th>
                        <td>{selectedTransaction.transactionType}</td>
                      </tr>
                      <tr>
                        <th>Transaction Date:</th>
                        <td>{selectedTransaction.transactionDate}</td>
                      </tr>
                      <tr>
                        <th>Quantity:</th>
                        <td>{selectedTransaction.quantity}</td>
                      </tr>
                      <tr>
                        <th>Unit Of Measure:</th>
                        <td>{selectedTransaction.unitOfMeasure}</td>
                      </tr>
                      <tr>
                        <th>Unit Transaction:</th>
                        <td>{selectedTransaction.unitTransaction}</td>
                      </tr>
                      <tr>
                        <th>Invoice:</th>
                        <td>{selectedTransaction.invoice}</td>
                      </tr>
                      <tr>
                        <th>Billable:</th>
                        <td>
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
                      WARNING: YOU ARE ABOUT TO PERMANENTLY DELETE THIS TRANSACTION.
                    </Alert>

                    <Button
                      disabled={!isDeleteChecked}
                      onClick={e => console.log('clicked')}
                      style={{ fontSize: '20px', marginTop: '30px' }}
                    >
                      Delete Transaction
                    </Button>
                  </Stack>
                )}
              </Container>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
}
