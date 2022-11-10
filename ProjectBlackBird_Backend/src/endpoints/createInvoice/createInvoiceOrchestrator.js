const invoicingLibrary = require('./invoicingLibrary');
const invoicingQueryFunctions = require('./invoicingQueryFunctions');
const invoicingCalculations = require('./invoicingCalculations');
const pdfAndZipFunctions = require('../../pdfCreator/pdfOrchestrator');

/**
 * For each company record given, the advanced payments, payments, outstanding bills, and transactions will be calculated. In addition a pdf bill will be created.
 * @param {*} contactRecord {} object is company record
 * @param {*} i index of map
 * @param {*} db
 * @returns object {} object is the invoice with required fields
 */
const createNewInvoice = async (arrayOfIds, roughDraft, createPdf, db, contactBalance) => {
  const invoiceCreation = arrayOfIds.map(async (id, i) => {
    const [nextInvoiceNumber, contactRecord, lastInvoiceDataEndDate, payTo] = await invoicingQueryFunctions.fetchInitialData(db, id, i);
    const [newCompanyCharges, newPayments, advancedPayments] = await invoicingQueryFunctions.fetchInvoiceTransactionsAndInvoices(
      db,
      id,
      lastInvoiceDataEndDate
    );

    const paymentsTotaledAndGrouped = invoicingCalculations.groupAndTotalNewPayments(newPayments, 'invoice');
    const beginningBalanceInvoices = await invoicingLibrary.getBeginningBalanceInvoices(db, id, paymentsTotaledAndGrouped);
    const beginningBalanceTotaledAndGrouped = invoicingCalculations.groupAndTotalBeginningBalance(
      beginningBalanceInvoices,
      'invoiceNumber'
    );
    const transactionsTotaledAndGrouped = invoicingCalculations.groupAndTotalNewTransactions(newCompanyCharges, 'job');
    const advancedPaymentsTotaledAndGrouped = invoicingCalculations.groupAndTotalAdvancedPayments(advancedPayments);

    // Creates / calculates the object for Advanced Payments / retainers
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

    if (!contactBalance && !roughDraft) {
      invoicingQueryFunctions.postInvoiceDataToDB(
        db,
        invoiceObject,
        nextInvoiceNumber,
        contactRecord,
        newCompanyCharges,
        advancedPaymentsAppliedToTransactions
      );
    }

    if (!contactBalance && createPdf) {
      // Array with single number indicates number of pdf copies of current invoice needed
      await pdfAndZipFunctions.pdfCreate(invoiceObject, [1], payTo[0]);
    }

    return invoiceObject;
  });

  return Promise.all(invoiceCreation);
};

module.exports = createNewInvoice;
