const createInvoiceService = require('./createInvoice-service');
const invoiceService = require('../invoice/invoice-service');
const transactionService = require('../transactions/transactions-service');
const contactService = require('../contacts/contacts-service');
const invoicingLibrary = require('./invoicingLibrary');
const pdfAndZipFunctions = require('../../pdfCreator/pdfOrchestrator');
const dayjs = require('dayjs');

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
      const removeNulls = array => array.filter(item => item);
      const contact = await contactService.getContactInfo(db, id);
      const contactRecord = contact[0];
      const lastInvoiceNumberInDb = await createInvoiceService.getLastInvoiceNumberInDB(db);
      const nextInvoiceNumber = Number(lastInvoiceNumberInDb[0].max) + i + 1;

      // Get outstanding bills based off 'unpaidBalance' column.
      const outstandingCompanyInvoices = await invoiceService.getOutstandingCompanyInvoice(db, id);

      // ToDo outstandingCompanyInvoices should also include any negatives for credits. we do have the credit being queried
      // ToDo continued: on 'accountCredit'. outstandingCompanyInvoices, and credit should likely be grouped. this may take care of the negative not displaying on bill.

      // Calculate interest
      // ToDO update so interest can run based off a boolean, or auto after 25 days.

      // const companyInterestRecords = await transactionService.getTransactionTypeToday(db, 'Interest', id);
      // const hasInterestBeenChargedToday =
      //   companyInterestRecords.length && companyInterestRecords.filter(item => item.transactionDate !== dayjs().format());
      // const hasInterestBeenChargedInPassedMonth =
      //   companyInterestRecords.length && companyInterestRecords.filter(item => item.transactionDate !== dayjs().subtract(25, 'day'));
      // const interestTransactions = outstandingCompanyInvoices.length ? invoicingLibrary.calculateBillingInterest(outstandingCompanyInvoices) : [];
      // const interestTransactionsWithoutNulls =
      //   hasInterestBeenChargedToday.length || hasInterestBeenChargedInPassedMonth.length ? [] : removeNulls(interestTransactions);
      const interestTransactionsWithoutNulls = [];

      // Getting transactions occurring between last billing cycle and today, grabs onto newly inserted interest transactions
      const lastCompanyInvoiceNumber = await invoiceService.getMostRecentCompanyInvoiceNumber(db, id);
      const lastCompanyInvoice = await invoiceService.getMostRecentCompanyInvoice(db, id, Number(lastCompanyInvoiceNumber[0].max));
      const lastInvoiceDataEndDate = lastCompanyInvoice.length ? lastCompanyInvoice[0].dataEndDate : dayjs().subtract(365, 'day');
      const newCompanyCharges = await createInvoiceService.getCompanyTransactionsAfterLastInvoice(db, lastInvoiceDataEndDate, id);
      const newPayments = await transactionService.getCompanyTransactionTypeAfterGivenDate(db, id, lastInvoiceDataEndDate, 'Payment');

      // ToDO Need to handle for if account has a credit
      // If the account shows a credit, apply payment to new charges.
      // If a payment is applied then a record of some sort will need created to document were credit was applied.
      const accountCredit = await invoiceService.getCreditedCompanyAmounts(db, id);

      // Merges interest and transactions
      const newCompanyTransactions = [...accountCredit, ...newPayments, ...newCompanyCharges, ...interestTransactionsWithoutNulls];

      // Aggregates transactions by grouped jobs. Multiple transactions for the same job will add together and output with a single job, Each job will have totals
      const aggregatedTransactionTotalsByJob = invoicingLibrary.aggregateTransactionTotalsByJob(newCompanyTransactions);
      const aggregatedAndSortedTotals = invoicingLibrary.aggregateAndSortRemainingTotals(
        aggregatedTransactionTotalsByJob,
        nextInvoiceNumber
      );

      // Invoice created to send to pdf creation
      const invoiceObject = await invoicingLibrary.calculateInvoiceObject(
        contactRecord,
        aggregatedAndSortedTotals,
        outstandingCompanyInvoices,
        nextInvoiceNumber
      );

      // If bills have been approved then inserts will run, and pdf's will generate
      if (!roughDraft) {
        // Insert interest into transactions
        // Promise.all(interestTransactionsWithoutNulls.map(async transaction => await transactionService.insertNewTransaction(db, transaction)));
        // invoice inserts
        invoicingLibrary.insertInvoiceDetails(invoiceObject, nextInvoiceNumber, db);
        invoicingLibrary.insertInvoice(invoiceObject, nextInvoiceNumber, db);
        invoicingLibrary.updateContact(contactRecord, invoiceObject, db);
      }
      if (createPdf) {
        const payTo = await createInvoiceService.getBillTo(db);
        await pdfAndZipFunctions.pdfCreate(invoiceObject, payTo[0]);
      }

      return invoiceObject;
    })
  );

module.exports = createNewInvoice;
