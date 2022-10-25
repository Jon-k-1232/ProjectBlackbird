const invoiceService = require('../invoice/invoice-service');
const ledgerService = require('../ledger/ledger-service');
const transactionService = require('../transactions/transactions-service');
const createInvoiceService = require('./createInvoice-service');
const contactService = require('../contacts/contacts-service');
const invoicingLibrary = require('./invoicingLibrary');
const dayjs = require('dayjs');
const advancedPaymentService = require('../advancedPayment/advancedPayment-service');

/**
 * Fetches transactional data, payments, outstanding bills. Fetches additional outstanding bills that payments have been made on if not originally included.
 * @param {*} db db item
 * @param {*} id oid of the contact.
 * @param {*} lastInvoiceDataEndDate last invoice date. 'String DATE'
 * @returns newCompanyCharges, newPayments, beginningBalanceInvoices. Each item is a separate array
 */
const fetchInvoiceTransactionsAndInvoices = async (db, id, lastInvoiceDataEndDate) => {
  const newCompanyCharges = await createInvoiceService.getCompanyTransactionsAfterLastInvoice(db, lastInvoiceDataEndDate, id);
  const newPayments = await transactionService.getCompanyTransactionTypeAfterGivenDate(db, id, lastInvoiceDataEndDate, 'Payment');
  const advancedPayments = await advancedPaymentService.getCompanyAdvancedPaymentsGreaterThanZero(db, id);
  return Promise.all([newCompanyCharges, newPayments, advancedPayments]);
};

/**
 * Fetches initial data in order to Get the invoices, and transactions for a given clients.
 * @param {*} db oid of the contact.
 * @param {*} id oid of the contact.
 * @param {*} i index needed in order to add to invoice count
 * @returns nextInvoiceNumber, contactRecord, lastInvoiceDataEndDate, payTo. Each item is a separate array
 */
const fetchInitialData = async (db, id, i) => {
  const contact = await contactService.getContactInfo(db, id);
  const contactRecord = contact[0];
  const lastInvoiceNumberInDb = await createInvoiceService.getLastInvoiceNumberInDB(db);
  const nextInvoiceNumber = Number(lastInvoiceNumberInDb[0].max) + i + 1;

  // Getting transactions occurring between last billing cycle and today, grabs onto newly inserted interest transactions
  const lastCompanyInvoiceNumber = await invoiceService.getMostRecentCompanyInvoiceNumber(db, id);
  const lastCompanyInvoice = await invoiceService.getMostRecentCompanyInvoice(db, id, Number(lastCompanyInvoiceNumber[0].max));
  const lastInvoiceDataEndDate = lastCompanyInvoice.length ? lastCompanyInvoice[0].dataEndDate : dayjs().subtract(365, 'day');
  const payTo = await createInvoiceService.getBillTo(db);
  return Promise.all([nextInvoiceNumber, contactRecord, lastInvoiceDataEndDate, payTo]);
};

/**
 * Update invoiceDetails, insert invoice,update ledger, and update each transaction with invoice number
 * @param {*} db
 * @param {*} invoiceObject
 * @param {*} nextInvoiceNumber
 * @param {*} contactRecord
 * @param {*} newCompanyCharges
 */
const postInvoiceDataToDB = async (
  db,
  invoiceObject,
  nextInvoiceNumber,
  contactRecord,
  newCompanyCharges,
  advancedPaymentsAppliedToTransactions
) => {
  await invoicingLibrary.insertInvoiceDetails(invoiceObject, nextInvoiceNumber, db);
  // Creates object for invoice insert
  const invoiceInsert = await invoicingLibrary.createInvoiceInsertObject(invoiceObject, db);
  await invoicingLibrary.updateLedger(contactRecord, invoiceInsert, db);
  await invoicingLibrary.updateTransactions(newCompanyCharges, nextInvoiceNumber, db);
};

module.exports = {
  postInvoiceDataToDB,
  fetchInitialData,
  fetchInvoiceTransactionsAndInvoices
};
