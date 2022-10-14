/**
 * Groups outstanding invoices together, totals each invoice, and sub totals all invoices.
 * @param {*} beginningBalanceInvoices
 * @param {*} groupingProperty
 * @returns {}
 */
const groupAndTotalBeginningBalance = (beginningBalanceInvoices, groupingProperty) => {
  const newObject = { groupedInvoices: {}, subTotal: 0 };

  // Group Items by invoice
  const groupedAndTotalJobs = beginningBalanceInvoices.reduce((acc, obj) => {
    const key = obj[groupingProperty];
    if (!acc[key]) acc[key] = { invoice: 0, invoiceTotal: 0, invoiceDate: '', invoiceGroupedByJob: [] };

    // Current cycle transaction have a invoice of 0. Accounts for current cycle write offs, invoice will be 0.
    if (obj.invoiceNumber !== 0) {
      const invoiceAmount = acc[key].invoiceTotal + obj.unPaidBalance;

      acc[key].invoiceDate = obj.invoiceDate;
      acc[key].invoiceTotal = Number(invoiceAmount);
      acc[key].invoice = Number(obj[groupingProperty]);
      acc[key].invoiceGroupedByJob.push(obj);
    }
    return acc;
  }, {});

  // Totals all the grouped items to get the total
  Object.keys(groupedAndTotalJobs).forEach(
    invoiceNumber => (newObject.subTotal = newObject.subTotal + groupedAndTotalJobs[invoiceNumber].invoiceTotal)
  );

  newObject.groupedInvoices = groupedAndTotalJobs;
  return newObject;
};

/**
 * Groups Payments together, totals each invoice, and sub totals all invoices.
 * @param {*} newPayments
 * @param {*} property
 * @returns {}
 */
const groupAndTotalNewPayments = (newPayments, property) => {
  const newObject = { groupedPayments: {}, subTotal: 0 };

  // Group Items by invoice
  const groupedAndTotalJobs = newPayments.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) acc[key] = { invoice: 0, invoiceTotal: 0, transactionDate: '', transactionType: '', paymentsGroupedByInvoice: [] };

    // Current cycle transaction have a invoice of 0. Accounts for current cycle write offs, invoice will be 0.
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

  // Totals all the grouped items to get the total
  Object.keys(groupedAndTotalJobs).forEach(
    invoiceNumber => (newObject.subTotal = newObject.subTotal + groupedAndTotalJobs[invoiceNumber].invoiceTotal)
  );

  newObject.groupedPayments = groupedAndTotalJobs;
  return newObject;
};

/**
 * Groups transactions together, totals each transactions job, and sub totals all jobs.
 * @param {*} transactions
 * @param {*} property
 * @returns {}
 */
const groupAndTotalNewTransactions = (transactions, property) => {
  const newObject = { groupedTransactions: {}, subTotal: 0 };

  // Group Items by Job
  const groupedAndTotalJobs = transactions.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) acc[key] = { job: 0, jobTotal: 0, description: '', transactionType: '', transactionsGroupedByJob: [] };

    // Current cycle transaction have a invoice of 0. Accounts for current cycle write offs, invoice will be 0.
    if (obj.invoice === 0) {
      const jobAmount = acc[key].jobTotal + obj.totalTransaction;

      acc[key].description = obj.description;
      acc[key].transactionType = obj.transactionType;
      acc[key].jobTotal = jobAmount;
      acc[key].job = obj[property];
      acc[key].transactionsGroupedByJob.push(obj);
    }
    return acc;
  }, {});

  // Totals all the grouped items to get the total
  Object.keys(groupedAndTotalJobs).forEach(
    jobNumber => (newObject.subTotal = newObject.subTotal + groupedAndTotalJobs[jobNumber].jobTotal)
  );

  newObject.groupedTransactions = groupedAndTotalJobs;
  return newObject;
};

module.exports = {
  groupAndTotalNewTransactions,
  groupAndTotalNewPayments,
  groupAndTotalBeginningBalance
};
