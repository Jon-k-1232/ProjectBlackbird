const invoiceService = require('../invoice/invoice-service');
const ledgerService = require('../ledger/ledger-service');
const transactionService = require('../transactions/transactions-service');
const transactionsObjects = require('../transactions/transactionsObjects');
const advancedPaymentService = require('../advancedPayment/advancedPayment-service');
const dayjs = require('dayjs');

/**
 * Get outstanding invoices. Update those invoices that have payments on them.
 * @param {*} db
 * @param {*} newPayments
 * @param {*} outstandingCompanyInvoices
 * @returns [{},{}] Array of Objects. Each Object is an invoice.
 */
const getBeginningBalanceInvoices = async (db, id, paymentsTotaledAndGrouped) => {
  const newPayments = Object.entries(paymentsTotaledAndGrouped.groupedPayments);
  const invoiceIds = Object.keys(paymentsTotaledAndGrouped.groupedPayments).map(item => Number(item));

  const beginningInvoicesFromDB = await invoiceService.getOutstandingInvoicesArray(db, invoiceIds, id);
  const beginningBalanceInvoices = [...beginningInvoicesFromDB];

  let beginningBalanceArray = [];

  /*
  Finding payments that match with invoices. This is needed for readability of the bill. Since the unpaid amt is handled real time when payments are made,
  We have to find the payment that matches the outstanding invoice and add that amount back only on the bill, Not the db so the client of the company can see the break down of the bill. 
   */
  beginningBalanceInvoices.forEach(outstandingInvoice => {
    // If payments exist
    if (Object.keys(newPayments).length) {
      // Match this is where the matching of invoices occurs in this loop.
      newPayments.forEach(payment => {
        const [paymentInvoiceNumber, paymentInvoiceValue] = payment;
        // If a match is found than update the match for the bill.
        if (Number(paymentInvoiceNumber) === Number(outstandingInvoice.invoiceNumber)) {
          outstandingInvoice.unPaidBalance = outstandingInvoice.unPaidBalance + Math.abs(paymentInvoiceValue.invoiceTotal);
          beginningBalanceArray.push(outstandingInvoice);
          return payment;
        } else {
          beginningBalanceArray.push(outstandingInvoice);
          return payment;
        }
      });
    } else {
      // If no payments just push the outstanding invoice to the new array.
      beginningBalanceArray.push(outstandingInvoice);
    }
    return outstandingInvoice;
  });

  // If any duplicate beginning balance invoices found, this removes duplicate objects
  return [...new Set(beginningBalanceArray)];
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
  transactionsTotaledAndGrouped,
  advancedPaymentsAppliedToTransactions
) => {
  const today = new Date();
  const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const now = dayjs(today.toLocaleString()).format('YYYY-MM-DD HH:mm:ss');
  const newEndingBalance =
    beginningBalanceTotaledAndGrouped.subTotal +
    paymentsTotaledAndGrouped.subTotal +
    advancedPaymentsAppliedToTransactions.transactionsSubTotal;

  return {
    contact,
    invoiceNumber,
    beginningBalanceTotaledAndGrouped,
    paymentsTotaledAndGrouped,
    transactionsTotaledAndGrouped,
    endingBalance: newEndingBalance,
    unPaidBalance: advancedPaymentsAppliedToTransactions.transactionsSubTotal,
    invoiceDate: now,
    paymentDueDate: endOfCurrentMonth,
    advancedPaymentsAppliedToTransactions
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

/**
 * Inserts payments for advanced payments, and updates the advanced payment record in advancedPayment table
 * @param {*} advancedPaymentsAppliedToTransactions
 * @param {*} nextInvoiceNumber
 * @param {*} db
 */
const handleAdvancedPayments = async (advancedPaymentsAppliedToTransactions, nextInvoiceNumber, db) => {
  // Insert each of the updated adjusted invoices for advanced payments
  if (advancedPaymentsAppliedToTransactions.adjustedAdvancedPayments.length) {
    advancedPaymentsAppliedToTransactions.adjustedAdvancedPayments.forEach(async advancedPaymentRecord => {
      const advancedPaymentInsert = advancedPaymentRecord.availableAmount;
      const recordId = advancedPaymentRecord.oid;
      const arrayOfInvoices = [...advancedPaymentRecord.appliedOnInvoices, nextInvoiceNumber];
      await advancedPaymentService.updateAdvancedPayment(db, arrayOfInvoices, recordId, advancedPaymentInsert);

      // After the bill is created, this inserts the Advanced payment as a payment into 'transactions' table.
      if (advancedPaymentRecord.availableAmount !== advancedPaymentRecord.startingCycleAmountAvailable) {
        const paymentObject = transactionsObjects.createPaymentInsert(advancedPaymentRecord, nextInvoiceNumber);
        await transactionService.insertNewTransaction(db, paymentObject);
      }
    });
  }
};

module.exports = {
  getBeginningBalanceInvoices,
  createInvoiceInsertObject,
  createInvoice,
  updateLedger,
  insertInvoiceDetails,
  updateTransactions,
  handleAdvancedPayments
};
