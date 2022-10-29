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

module.exports = { createPaymentInsert };
