import * as Yup from 'yup';
import { useEffect, useState } from 'react';
import { useFormik, Form, FormikProvider } from 'formik';
import { Stack, TextField, Card, Button, Typography, Container } from '@mui/material';
import Page from '../../Components/Page';
import { FormControlLabel, Autocomplete, Checkbox } from '@mui/material';
import { getCompanyJobs } from '../../ApiCalls/ApiCalls';
import checkValuesOne from './FormValidations';
import dayjs from 'dayjs';

export default function old({ allClients, allEmployees, passedCompany }) {
  const [showDiscount, setShowDiscount] = useState(false);
  const [transactionType, setTransactionType] = useState(null);
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState(null);

  useEffect(() => {
    if (company) {
      const allJobs = passedCompany ? getCompanyJobs(passedCompany.value) : getCompanyJobs(company);
      setCompanyJobs(allJobs.allCompanyJobs.rawData);
    }
  }, [company]);

  // Form value handler
  const formik = useFormik({
    initialValues: {
      company: '',
      job: '',
      employee: '',
      transactionType: '',
      transactionDate: dayjs().format(),
      quantity: 1,
      unitOfMeasure: 'Each',
      unitTransaction: '0.00',
      totalTransaction: '0.00',
      startTime: '',
      endTime: '',
      reference: '',
      noteOrDescription: '',
      discount: '',
      invoice: '',
      userTag: '',
      paymentApplied: '',
      ignoreInAgeing: ''
    },
    onSubmit: (values, { resetForm }) => {
      // const updatedValues = checkValuesOne(values);
      checkValuesOne(values);
      resetForm({ values: '' });
    }
  });

  // Formik constants
  const { handleSubmit, getFieldProps, values } = formik;
  const { discount, quantity, unitTransaction, totalTransaction } = formik.values;
  const passedCompanyArray = [passedCompany];

  // Calculations for sub totals, totals and discounts
  const subTotal = Math.abs(Number(quantity * unitTransaction).toFixed(2));
  const amountToDiscount = Math.abs(Number(subTotal - (subTotal * (100 - discount)) / 100).toFixed(2));
  const totalCharges = discount ? Math.abs(Number((subTotal * (100 - discount)) / 100).toFixed(2)) : Math.abs(subTotal);
  const totalPayment = transactionType === 'Charge' ? Math.abs(Number(totalTransaction).toFixed(2)) : Number(totalTransaction).toFixed(2);

  return (
    <Page style={{ marginTop: '25px' }} title='NewTransactions'>
      <Card style={{ padding: '20px' }}>
        <FormikProvider value={formik}>
          <Form onSubmit={handleSubmit}>
            <Stack spacing={5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 4 }}>
                <Autocomplete
                  required
                  disableClearable
                  options={!passedCompany ? allClients.rawData : passedCompanyArray}
                  label='Select Company'
                  sx={{ width: 300 }}
                  onChange={(e, v) => {
                    values.company = v.value;
                    setCompany(v.value);
                  }}
                  renderInput={params => <TextField required {...params} label='Company' />}
                />

                <Autocomplete
                  required
                  disableClearable
                  options={companyJobs || []}
                  onChange={(e, v) => (values.job = v.value)}
                  label='Select Job'
                  sx={{ width: 300 }}
                  renderInput={params => <TextField required {...params} label='Job' />}
                />

                <Autocomplete
                  required
                  disableClearable
                  options={allEmployees.rawData || []}
                  label='Select Employee'
                  sx={{ width: 300 }}
                  onChange={(e, v) => (values.employee = v.value)}
                  renderInput={params => <TextField required {...params} label='Employee' />}
                />
              </Stack>

              <Autocomplete
                required
                disableClearable
                options={transactionTypes || []}
                sx={{ width: 300 }}
                value={transactionType}
                label={transactionType}
                onChange={(e, v) => {
                  values.transactionType = v.value;
                  setTransactionType(e.target.innerText);
                }}
                renderInput={params => <TextField required {...params} label='Transaction Type' />}
              />

              {/* Will conditionally render the quantity, unit of Measure and amount per unit with transaction type is set to 'Charge' */}
              {transactionType === 'Charge' && (
                <Container>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2, md: 8 }}>
                    <TextField required type='number' {...getFieldProps('quantity')} label='Quantity' />

                    <Autocomplete
                      disableClearable
                      options={type || []}
                      label='Unit of Measure'
                      sx={{ width: 300 }}
                      onChange={(e, v) => (values.unitOfMeasure = v.value)}
                      renderInput={params => <TextField required {...params} label='Unit of Measure' />}
                    />

                    <TextField required type='number' max='10' label='Amount Per Unit' {...getFieldProps('unitTransaction')} />
                  </Stack>

                  <Container style={{ padding: '0', marginTop: '35px' }}>
                    <Typography style={{ color: '#92999f' }} variant='h5'>
                      Sub Total $ {subTotal}
                    </Typography>

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 1, sm: 2, md: 4 }}
                      style={{ display: 'flex', alignItems: 'center', marginTop: '30px' }}>
                      <FormControlLabel
                        label='Discount'
                        control={
                          <Checkbox
                            checked={showDiscount}
                            onChange={e => {
                              setShowDiscount(e.target.checked);
                              if (!e.target.checked) formik.values.discount = null;
                            }}
                          />
                        }
                      />

                      {showDiscount && (
                        <TextField
                          required
                          onInput={event => (event.target.value < 0 ? (event.target.value = 0) : event.target.value)}
                          type='number'
                          max='2'
                          {...getFieldProps('discount')}
                          label='Discount Percentage'
                        />
                      )}
                      {showDiscount && <Typography>Amount to Discount ${amountToDiscount}</Typography>}
                    </Stack>
                  </Container>
                </Container>
              )}

              {/* Handles the total payment box hiding */}
              {transactionType !== null && transactionType !== 'Charge' && (
                <TextField
                  required
                  max='10'
                  sx={{ width: 300 }}
                  type='number'
                  {...getFieldProps('totalTransaction')}
                  label={`Enter ${transactionType} Amount`}
                  helperText={
                    transactionType === 'Adjustment' &&
                    '* When making a subtraction adjustment you will need to manually insert the subtraction sign ( - )'
                  }
                />
              )}

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 2, md: 4 }}
                style={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant='h3'>Total {transactionType === 'Charge' ? totalCharges : totalPayment}</Typography>

                {discount && (
                  <Typography variant='caption' style={{ color: 'red' }}>
                    * Discount of {discount}% applied
                  </Typography>
                )}
              </Stack>

              <TextField label='Add Note' max='300' {...getFieldProps('noteOrDescription')} />

              <Button type='Submit' name='Submit' style={{ height: '30px', marginLeft: '10px' }}>
                Submit
              </Button>
            </Stack>
          </Form>
        </FormikProvider>
      </Card>
    </Page>
  );
}

const transactionTypes = [
  {
    value: 'Charge',
    label: 'Charge'
  },
  {
    value: 'Payment',
    label: 'Payment'
  },
  {
    value: 'Adjustment',
    label: 'Adjustment'
  }
];

const type = [
  {
    value: 'Hour',
    label: 'Hour'
  },
  {
    value: 'Each',
    label: 'Each'
  }
];
