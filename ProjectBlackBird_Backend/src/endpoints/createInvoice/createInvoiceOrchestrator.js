const createInvoiceService = require('./createInvoice-service');
const invoiceService = require('../invoice/invoice-service');
const transactionService = require('../transactions/transactions-service');
const contactService = require('../contacts/contacts-service');
const invoicingLibrary = require('./invoicingLibrary');
const pdfAndZipFunctions = require('../../pdfCreator/pdfOrchestrator');
const dayjs = require('dayjs');
const { getNewInvoices } = require('../invoice/invoice-service');

/**
 * Take a company record. checks for outstanding invoices, calculates interest, and charges. Also creates a pdf bill.
 * @param {*} contactRecord {} object is company record
 * @param {*} i index of map
 * @param {*} db
 * @returns object {} object is the invoice with required fields
 */
const createNewInvoice = async (arrayOfIds, roughDraft, createPdf, db) =>
  Promise.all(
    arrayOfIds.map(async (id, i) => {
      const contact = await contactService.getContactInfo(db, id);
      const contactRecord = contact[0];
      const lastInvoiceNumberInDb = await createInvoiceService.getLastInvoiceNumberInDB(db);
      const nextInvoiceNumber = Number(lastInvoiceNumberInDb[0].max) + i + 1;

      // Getting transactions occurring between last billing cycle and today, grabs onto newly inserted interest transactions
      const lastCompanyInvoiceNumber = await invoiceService.getMostRecentCompanyInvoiceNumber(db, id);
      const lastCompanyInvoice = await invoiceService.getMostRecentCompanyInvoice(db, id, Number(lastCompanyInvoiceNumber[0].max));
      const lastInvoiceDataEndDate = lastCompanyInvoice.length ? lastCompanyInvoice[0].dataEndDate : dayjs().subtract(365, 'day');

      const newCompanyCharges = await createInvoiceService.getCompanyTransactionsAfterLastInvoice(db, lastInvoiceDataEndDate, id);
      const newPayments = await transactionService.getCompanyTransactionTypeAfterGivenDate(db, id, lastInvoiceDataEndDate, 'Payment');
      const outstandingCompanyInvoices = await invoiceService.getOutstandingCompanyInvoice(db, id);
      const beginningBalanceInvoices = await getBeginningBalanceInvoices(db, newPayments, outstandingCompanyInvoices);

      const beginningBalanceTotaledAndGrouped = groupAndTotalBeginningBalance(beginningBalanceInvoices, 'invoiceNumber');
      const paymentsTotaledAndGrouped = groupAndTotalNewPayments(newPayments, 'invoice');
      const transactionsTotaledAndGrouped = groupAndTotalNewTransactions(newCompanyCharges, 'job');

      // Invoice created to send to pdf creation
      const invoiceObject = createInvoice(
        contactRecord,
        nextInvoiceNumber,
        beginningBalanceTotaledAndGrouped,
        paymentsTotaledAndGrouped,
        transactionsTotaledAndGrouped
      );
      const invoiceInsert = createInvoiceInsertObject(invoiceObject);

      // ToDo Total the full bill and create final invoice object.

      // If bills have been approved then inserts will run, and pdf's will generate
      // if (!roughDraft) {

      // Insert interest into transactions
      // Promise.all(interestTransactionsWithoutNulls.map(async transaction => await transactionService.insertNewTransaction(db, transaction)));
      // invoice inserts
      // invoicingLibrary.insertInvoiceDetails(invoiceObject, nextInvoiceNumber, db);
      // invoicingLibrary.insertInvoice(invoiceObject, nextInvoiceNumber, db);
      // invoicingLibrary.updateLedger(contactRecord, invoiceObject, db);
      // invoicingLibrary.updateTransactions(newCompanyTransactions, nextInvoiceNumber, db);
      // }

      if (createPdf) {
        const payTo = await createInvoiceService.getBillTo(db);
        await pdfAndZipFunctions.pdfCreate(invoiceObject, invoiceInsert, payTo[0]);
      }

      return invoiceObject;
    })
  );

module.exports = createNewInvoice;

const createInvoiceInsertObject = invoiceObject => {
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

  return {
    company: contact.oid,
    invoiceNumber: invoiceNumber,
    contactName: `${contact.firstName} ${contact.lastName}`,
    address1: contact.companyName,
    address2: `${contact.firstName} ${contact.lastName}`,
    address3: contact.address1,
    address4: `${contact.city || ''}, ${contact.state || ''} ${contact.zip || ''}`,
    address5: null,
    beginningBalance: beginningBalanceTotaledAndGrouped.subTotal,
    totalPayments: paymentsTotaledAndGrouped.subTotal,
    totalNewCharges: transactionsTotaledAndGrouped.subTotal,
    endingBalance,
    unPaidBalance,
    invoiceDate: now,
    paymentDueDate: endOfCurrentMonth,
    dataEndDate: now
  };
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
  return {
    contact,
    invoiceNumber,
    beginningBalanceTotaledAndGrouped,
    paymentsTotaledAndGrouped,
    transactionsTotaledAndGrouped,
    endingBalance: beginningBalanceTotaledAndGrouped.subTotal + paymentsTotaledAndGrouped.subTotal + transactionsTotaledAndGrouped.subTotal,
    unPaidBalance: transactionsTotaledAndGrouped.subTotal
  };
};

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
 *
 * @param {*} transactions
 * @param {*} groupingProperty
 * @returns
 */
const groupAndTotalBeginningBalance = (beginningBalanceInvoices, groupingProperty) => {
  const newObject = { groupedInvoices: {}, subTotal: 0 };

  // Group Items by Job
  const groupedAndTotalJobs = beginningBalanceInvoices.reduce((acc, obj) => {
    const key = obj[groupingProperty];
    if (!acc[key]) acc[key] = { invoice: 0, invoiceTotal: 0, invoiceDate: '', invoiceGroupedByJob: [] };

    // Current cycle transaction have a invoice of 0. Accounts for current cycle write offs, invoice will be 0.
    // Billable = true for transactions that are billable.
    if (obj.invoiceNumber !== 0) {
      const invoiceAmount = acc[key].invoiceTotal + obj.unPaidBalance;

      acc[key].invoiceDate = obj.invoiceDate;
      acc[key].invoiceTotal = Number(invoiceAmount);
      acc[key].invoice = Number(obj[groupingProperty]);
      acc[key].invoiceGroupedByJob.push(obj);
    }
    return acc;
  }, {});

  // Totals all the grouped jobs to get the subTotal for transactions section on invoice.
  Object.keys(groupedAndTotalJobs).forEach(
    invoiceNumber => (newObject.subTotal = newObject.subTotal + groupedAndTotalJobs[invoiceNumber].invoiceTotal)
  );

  newObject.groupedInvoices = groupedAndTotalJobs;

  return newObject;
};

/**
 * Totals and groups payments
 * @param {*} newPayments
 * @param {*} property
 * @returns {} Object with two properties
 */
const groupAndTotalNewPayments = (newPayments, property) => {
  const newObject = { groupedPayments: {}, subTotal: 0 };

  // Group Items by Job
  const groupedAndTotalJobs = newPayments.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) acc[key] = { invoice: 0, invoiceTotal: 0, transactionDate: '', transactionType: '', paymentsGroupedByInvoice: [] };

    // Current cycle transaction have a invoice of 0. Accounts for current cycle write offs, invoice will be 0.
    // Billable = true for transactions that are billable.
    if (obj.invoice !== 0) {
      const invoiceAmount = acc[key].invoiceTotal + obj.totalTransaction;

      acc[key].transactionDate = obj.transactionDate;
      acc[key].transactionType = obj.transactionType;
      acc[key].invoiceTotal = invoiceAmount;
      acc[key].invoice = obj[property];
      acc[key].paymentsGroupedByInvoice.push(obj);
    }
    return acc;
  }, {});

  // Totals all the grouped jobs to get the subTotal for transactions section on invoice.
  Object.keys(groupedAndTotalJobs).forEach(
    invoiceNumber => (newObject.subTotal = newObject.subTotal + groupedAndTotalJobs[invoiceNumber].invoiceTotal)
  );

  newObject.groupedPayments = groupedAndTotalJobs;

  return newObject;
};

/**
 * Groups transactions, and totals
 * @param {*} transactions
 * @param {*} property
 * @returns Map {{Job#:{allTransactions:[],jobTotal:INT},{Job#:{allTransactions:[],jobTotal:INT}} }
 */
const groupAndTotalNewTransactions = (transactions, property) => {
  const newObject = { groupedTransactions: {}, subTotal: 0 };

  // Group Items by Job
  const groupedAndTotalJobs = transactions.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) acc[key] = { job: 0, jobTotal: 0, description: '', transactionsGroupedByJob: [] };

    // Current cycle transaction have a invoice of 0. Accounts for current cycle write offs, invoice will be 0.
    // Billable = true for transactions that are billable.
    if (obj.invoice === 0 && obj.billable) {
      const jobAmount = acc[key].jobTotal + obj.totalTransaction;

      acc[key].description = obj.description;
      acc[key].jobTotal = jobAmount;
      acc[key].job = obj[property];
      acc[key].transactionsGroupedByJob.push(obj);
    }
    return acc;
  }, {});

  // Totals all the grouped jobs to get the subTotal for transactions section on invoice.
  Object.keys(groupedAndTotalJobs).forEach(
    jobNumber => (newObject.subTotal = newObject.subTotal + groupedAndTotalJobs[jobNumber].jobTotal)
  );

  newObject.groupedTransactions = groupedAndTotalJobs;

  return newObject;
};
