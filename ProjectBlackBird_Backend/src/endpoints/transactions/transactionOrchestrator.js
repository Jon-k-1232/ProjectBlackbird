const transactionService = require('./transactions-service');
const invoiceService = require('../invoice/invoice-service');
const ledgerService = require('../ledger/ledger-service');

const handleChargesAndPayments = async (db, newTransaction) => {
  const ledgerRecordArray = await ledgerService.getCompanyLedger(db, newTransaction.company);
  const ledgerRecord = ledgerRecordArray[0];

  const invoiceRecordArray = await invoiceService.getSingleCompanyInvoice(db, newTransaction);
  const invoiceRecord = invoiceRecordArray[0];

  if (newTransaction.transactionType === 'Charge' || newTransaction.transactionType === 'Time') {
    // Insures that all charges and Time charges are positive
    if (newTransaction.totalTransaction <= 0) newTransaction.totalTransaction = Math.abs(newTransaction.totalTransaction);
    const ledgerRecordUpdate = updateCompanyTotal(ledgerRecord, newTransaction);
    await ledgerService.updateCompanyCurrentBalance(db, ledgerRecordUpdate);
    await transactionService.insertNewTransaction(db, newTransaction);
    return newTransaction;
  }

  if (newTransaction.transactionType === 'Payment' || newTransaction.transactionType === 'Write Off') {
    // ToDo need check for if invoice or not.
    // Insures that all Payments and WriteOffs are negative
    if (newTransaction.totalTransaction >= 0) newTransaction.totalTransaction = -Math.abs(newTransaction.totalTransaction);
    const ledgerRecordPaymentChange = updateCompanyTotal(ledgerRecord, newTransaction);
    const invoiceRecordChange = invoiceRecord && newTransaction.invoice ? updateInvoice(invoiceRecord, newTransaction) : newTransaction;
    await ledgerService.updateCompanyCurrentBalance(db, ledgerRecordPaymentChange);
    invoiceRecord && (await invoiceService.updateCompanyInvoice(db, invoiceRecordChange));
    await transactionService.insertNewTransaction(db, newTransaction);
    return invoiceRecordChange;
  }

  if (newTransaction.transactionType === 'Adjustment') {
    const ledgerRecordPaymentChange = updateCompanyTotal(ledgerRecord, newTransaction);
    await ledgerService.updateCompanyCurrentBalance(db, ledgerRecordPaymentChange);
    await transactionService.insertNewTransaction(db, newTransaction);
    return newTransaction;
  }
};

module.exports = handleChargesAndPayments;

const updateInvoice = (invoiceRecord, newTransaction) => {
  const unPaidBalance = (Number(invoiceRecord.unPaidBalance) + Number(newTransaction.totalTransaction)).toFixed(2);
  return { ...invoiceRecord, unPaidBalance };
};

const updateCompanyTotal = (ledgerRecord, newTransaction) => {
  const newBalance = (Number(ledgerRecord.currentAccountBalance) + Number(newTransaction.totalTransaction)).toFixed(2);
  const updateProperties = {
    currentAccountBalance: Number(newBalance),
    newBalance: newBalance === 0 ? false : true
  };

  return { ...ledgerRecord, ...updateProperties };
};
