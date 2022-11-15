const dayjs = require('dayjs');

/**
 * Creates the payment object for insert into 'transactions' table
 * @param {*} advancedPaymentRecord
 * @param {*} nextInvoiceNumber
 * @returns
 */
const createPaymentInsert = (advancedPaymentRecord, nextInvoiceNumber) => {
  const { startingCycleAmountAvailable, company, availableAmount } = advancedPaymentRecord;
  const paymentAmount = startingCycleAmountAvailable - availableAmount;

  return {
    company: company,
    job: 0,
    employee: 0,
    transactionType: 'Payment',
    transactionDate: dayjs().format(),
    quantity: 1,
    unitOfMeasure: 'Each',
    unitTransaction: paymentAmount,
    totalTransaction: -Math.abs(paymentAmount),
    invoice: nextInvoiceNumber,
    billable: false
  };
};

const createTransactionJobJoinObject = transaction => {
  const {
    job,
    company,
    transactionType,
    transactionDate,
    quantity,
    unitOfMeasure,
    unitTransaction,
    totalTransaction,
    invoice,
    billable,
    description,
    firstName,
    lastName
  } = transaction;
  return {
    company,
    job,
    description,
    employee: `${firstName} ${lastName}`,
    transactionType,
    transactionDate,
    quantity,
    unitOfMeasure,
    unitTransaction,
    totalTransaction,
    invoice,
    billable
  };
};

module.exports = { createPaymentInsert, createTransactionJobJoinObject };
