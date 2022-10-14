const invoicingLibrary = require('./invoicingLibrary');
const invoicingQueryFunctions = require('./invoicingQueryFunctions');
const invoicingCalculations = require('./invoicingCalculations');
const pdfAndZipFunctions = require('../../pdfCreator/pdfOrchestrator');

/**
 * Take a company record. checks for outstanding invoices, calculates interest, and charges. Also creates a pdf bill.
 * @param {*} contactRecord {} object is company record
 * @param {*} i index of map
 * @param {*} db
 * @returns object {} object is the invoice with required fields
 */
const createNewInvoice = async (arrayOfIds, roughDraft, createPdf, db) => {
  const invoiceCreation = arrayOfIds.map(async (id, i) => {
    const [nextInvoiceNumber, contactRecord, lastInvoiceDataEndDate, payTo] = await invoicingQueryFunctions.fetchInitialData(db, id, i);
    const [newCompanyCharges, newPayments, beginningBalanceInvoices] = await invoicingQueryFunctions.fetchInvoiceTransactionsAndInvoices(
      db,
      id,
      lastInvoiceDataEndDate
    );

    const beginningBalanceTotaledAndGrouped = invoicingCalculations.groupAndTotalBeginningBalance(
      beginningBalanceInvoices,
      'invoiceNumber'
    );
    const paymentsTotaledAndGrouped = invoicingCalculations.groupAndTotalNewPayments(newPayments, 'invoice');
    const transactionsTotaledAndGrouped = invoicingCalculations.groupAndTotalNewTransactions(newCompanyCharges, 'job');

    // Invoice created to send to pdf creation
    const invoiceObject = invoicingLibrary.createInvoice(
      contactRecord,
      nextInvoiceNumber,
      beginningBalanceTotaledAndGrouped,
      paymentsTotaledAndGrouped,
      transactionsTotaledAndGrouped
    );

    if (!roughDraft) {
      invoicingQueryFunctions.postInvoiceDataToDB(db, invoiceObject, nextInvoiceNumber, contactRecord, newCompanyCharges);
    }

    if (createPdf) {
      // Array with single number indicates number of pdf copies of current invoice needed
      await pdfAndZipFunctions.pdfCreate(invoiceObject, [1], payTo[0]);
    }

    return invoiceObject;
  });

  return Promise.all(invoiceCreation);
};

module.exports = createNewInvoice;
