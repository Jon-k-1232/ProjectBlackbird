const invoiceService = require('../invoice/invoice-service');
const ledgerService = require('../ledger/ledger-service');
const transactionService = require('../transactions/transactions-service');
const dayjs = require('dayjs');

/**
 * Gets invoices that have zero balance for which payments zero'd out, as well as outstanding invoices.
 * @param {*} db
 * @param {*} newPayments
 * @param {*} outstandingCompanyInvoices
 * @returns [{},{}] Array of Objects. Each Object is an invoice.
 */
const getBeginningBalanceInvoices = async (db, newPayments, outstandingCompanyInvoices) => {
  const findInvoice = payment =>
    outstandingCompanyInvoices.find(outstandingInvoice => Number(outstandingInvoice.invoiceNumber) === Number(payment.invoice));

  const additionalInvoice = async payment => invoiceService.getOutstandingInvoice(db, payment);

  const allApplicableInvoices = newPayments.map(async payment => {
    const foundInvoice = findInvoice(payment);

    if (foundInvoice === undefined) {
      const pulledInvoiceDB = await additionalInvoice(payment);
      const pulledInvoice = pulledInvoiceDB[0];
      // If a payment was made, since invoice reflect payment already applied the math would not read well on invoice. Not changing the DB, this is for invoice display only.
      pulledInvoice.unPaidBalance = pulledInvoice.unPaidBalance + Math.abs(payment.totalTransaction);
      return pulledInvoice;
    }

    // If a payment was made, since invoice reflect payment already applied the math would not read well on invoice. Not changing the DB, this is for invoice display only.
    foundInvoice.unPaidBalance = foundInvoice.unPaidBalance + Math.abs(payment.totalTransaction);
    return foundInvoice;
  });

  // If no new payments received, than return any outstanding invoices.
  const beginningBalanceArray = newPayments.length ? await Promise.all(allApplicableInvoices) : outstandingCompanyInvoices;
  return beginningBalanceArray;
};

/**
 * Creates new invoice to create PDF.
 * @param {*} contact
 * @param {*} invoiceNumber
 * @param {*} beginningBalanceTotaledAndGrouped
 * @param {*} paymentsTotaledAndGrouped
 * @param {*} transactionsTotaledAndGrouped
 * @returns
 */
const createInvoice = (
  contact,
  invoiceNumber,
  beginningBalanceTotaledAndGrouped,
  paymentsTotaledAndGrouped,
  transactionsTotaledAndGrouped
) => {
  const today = new Date();
  const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const now = dayjs(today.toLocaleString()).format('YYYY-MM-DD HH:mm:ss');

  return {
    contact,
    invoiceNumber,
    beginningBalanceTotaledAndGrouped,
    paymentsTotaledAndGrouped,
    transactionsTotaledAndGrouped,
    endingBalance: beginningBalanceTotaledAndGrouped.subTotal + paymentsTotaledAndGrouped.subTotal + transactionsTotaledAndGrouped.subTotal,
    unPaidBalance: transactionsTotaledAndGrouped.subTotal,
    invoiceDate: now,
    paymentDueDate: endOfCurrentMonth
  };
};

/**
 * Creates invoice object, then inserts into DB
 * @param {*} invoiceObject
 * @param {*} db
 * @returns
 */
const createInvoiceInsertObject = async (invoiceObject, db) => {
  const {
    invoiceNumber,
    contact,
    beginningBalanceTotaledAndGrouped,
    paymentsTotaledAndGrouped,
    transactionsTotaledAndGrouped,
    endingBalance,
    unPaidBalance
  } = invoiceObject;
  const today = new Date();
  const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const now = dayjs(today.toLocaleString()).format('YYYY-MM-DD HH:mm:ss');

  const invoice = {
    company: Number(contact.oid),
    invoiceNumber: Number(invoiceNumber),
    contactName: `${contact.firstName} ${contact.lastName}`,
    address1: contact.companyName,
    address2: `${contact.firstName} ${contact.lastName}`,
    address3: contact.address1,
    address4: `${contact.city || ''}, ${contact.state || ''} ${contact.zip || ''}`,
    address5: null,
    beginningBalance: Number(beginningBalanceTotaledAndGrouped.subTotal),
    totalPayments: Number(paymentsTotaledAndGrouped.subTotal),
    totalNewCharges: Number(transactionsTotaledAndGrouped.subTotal),
    endingBalance: Number(endingBalance),
    unPaidBalance: Number(unPaidBalance),
    invoiceDate: now,
    paymentDueDate: endOfCurrentMonth,
    dataEndDate: now
  };

  await invoiceService.insertNewInvoice(db, invoice);

  return invoice;
};

/**
 * Updates contact card with balance, and that a no new balance
 * @param {*} contactRecord
 * @param {*} invoiceObject
 * @param {*} db
 * @returns
 */
const updateLedger = async (contactRecord, invoiceObject, db) => {
  const { endingBalance, beginningBalance } = invoiceObject;
  // Create Ledger object
  const updatedLedger = {
    newBalance: false,
    company: contactRecord.oid,
    advancedPayment: 0,
    currentAccountBalance: Number(endingBalance),
    beginningAccountBalance: Number(beginningBalance),
    statementBalance: Number(endingBalance)
  };

  // Insert Ledger object
  return ledgerService.updateCompanyLedger(db, updatedLedger);
};

/**
 * Forms invoice detail
 * @param {*} invoiceObject
 * @param {*} invoiceNumber
 * @param {*} db
 * @returns no return
 */
const insertInvoiceDetails = async (invoiceObject, invoiceNumber, db) => {
  const { transactionsTotaledAndGrouped, paymentsTotaledAndGrouped } = invoiceObject;

  if (Object.keys(transactionsTotaledAndGrouped.groupedTransactions)) {
    // Handles for Transactions
    Object.entries(transactionsTotaledAndGrouped.groupedTransactions).forEach(async transaction => {
      const [key, value] = transaction;
      const { description, transactionType, jobTotal } = value;
      const invoiceDetail = {
        invoice: invoiceNumber,
        detailDate: dayjs().format(),
        detailType: transactionType,
        jobDescription: description,
        charges: jobTotal,
        writeOff: 0,
        net: jobTotal,
        payment: 0
      };

      return invoiceService.insertNewInvoiceDetails(db, invoiceDetail);
    });
  }

  if (Object.keys(paymentsTotaledAndGrouped.groupedPayments)) {
    // Handles For Payments and Write offs.
    Object.entries(paymentsTotaledAndGrouped.groupedPayments).forEach(async transaction => {
      const [key, value] = transaction;
      const { transactionType, invoiceTotal } = value;
      const invoiceDetail = {
        invoice: invoiceNumber,
        detailDate: dayjs().format(),
        detailType: transactionType,
        jobDescription: transactionType,
        charges: 0,
        writeOff: transactionType === 'Write Off' ? invoiceTotal : 0,
        net: invoiceTotal,
        payment: transactionType === 'Payment' ? invoiceTotal : 0
      };
      return invoiceService.insertNewInvoiceDetails(db, invoiceDetail);
    });
  }
};

/**
 * Updates each transaction where the invoice number is 0 with an invoice number. This will show the transaction appearing on a given invoice.
 * @param {*} transactionsToUpdate [{},{}]
 * @param {*} invoiceNumber Int
 * @param {*} db
 */
const updateTransactions = async (transactionsToUpdate, invoiceNumber, db) => {
  transactionsToUpdate.forEach(async transaction => {
    if (transaction.invoice === 0) {
      await transactionService.updateTransactionWithInvoice(db, transaction, invoiceNumber);
    }
    return transaction;
  });
};

module.exports = {
  getBeginningBalanceInvoices,
  createInvoiceInsertObject,
  createInvoice,
  updateLedger,
  insertInvoiceDetails,
  updateTransactions
};
