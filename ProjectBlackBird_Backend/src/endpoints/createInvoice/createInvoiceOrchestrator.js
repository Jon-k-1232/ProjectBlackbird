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
    const [newCompanyCharges, newPayments, advancedPayments] = await invoicingQueryFunctions.fetchInvoiceTransactionsAndInvoices(
      db,
      id,
      lastInvoiceDataEndDate
    );

    /* 
    DO NOT CHANGE ORDER OF FETCH NOR GROUPINGS.
    Grouping of payments must come before getting the outstanding invoices. Outstanding invoices is dependant on it.
    */
    const paymentsTotaledAndGrouped = invoicingCalculations.groupAndTotalNewPayments(newPayments, 'invoice');
    const beginningBalanceInvoices = await invoicingLibrary.getBeginningBalanceInvoices(db, id, paymentsTotaledAndGrouped);
    const beginningBalanceTotaledAndGrouped = invoicingCalculations.groupAndTotalBeginningBalance(
      beginningBalanceInvoices,
      'invoiceNumber'
    );
    const transactionsTotaledAndGrouped = invoicingCalculations.groupAndTotalNewTransactions(newCompanyCharges, 'job');
    const advancedPaymentsTotaledAndGrouped = invoicingCalculations.groupAndTotalAdvancedPayments(advancedPayments);
    //
    const advancedPaymentsAppliedToTransactions = invoicingCalculations.adjustSubTotaledTransactions(
      transactionsTotaledAndGrouped,
      advancedPaymentsTotaledAndGrouped
    );

    // Invoice created to send to pdf creation
    const invoiceObject = invoicingLibrary.createInvoice(
      contactRecord,
      nextInvoiceNumber,
      beginningBalanceTotaledAndGrouped,
      paymentsTotaledAndGrouped,
      transactionsTotaledAndGrouped,
      advancedPaymentsAppliedToTransactions
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
