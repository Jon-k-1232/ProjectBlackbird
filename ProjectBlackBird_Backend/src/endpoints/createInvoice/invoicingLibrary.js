const invoiceService = require('../invoice/invoice-service');
const ledgerService = require('../ledger/ledger-service');
const dayjs = require('dayjs');
const { defaultInterestRate, defaultInterestMonthsInYear } = require('../../../config');
const transactionService = require('../transactions/transactions-service');

/**
 * Finds matching job transactions within company transactions, groups and adds together into new object.
 * @param {*} newCompanyTransactions [{},{},{}] -Takes and array of objects. Each object is a transaction
 * @returns [{},{},{}] Each object is a new job record.
 */
const aggregateTransactionTotalsByJob = newCompanyTransactions => {
  return newCompanyTransactions.reduce((previousTransactions, currentTransaction) => {
    const { job, company, employee, description, totalTransaction } = currentTransaction;
    // Company may not have any transactions
    if (currentTransaction !== undefined) {
      // If prev is empty (no length), 'newObject' will be the first job to be pushed to prev.
      let newObject = {
        job: job,
        company: company,
        employee: employee,
        description: currentTransaction.job === 1 ? 'Interest' : description,
        overallJobTotal: Number(totalTransaction).toFixed(2),
        allJobTransactions: [currentTransaction]
      };

      // If previous has any items start searching for job matches to group
      if (previousTransactions.length) {
        // Find matching job in previous items
        const foundJobGroupTransactionIndex = previousTransactions.findIndex(prevTrans => prevTrans.job === currentTransaction.job);
        const foundJobGroupTransaction = previousTransactions[foundJobGroupTransactionIndex];

        // If a job match is found aggregate the amounts together, and put the transaction is a list of grouped transactions.
        if (foundJobGroupTransactionIndex !== -1) {
          const flattenGroupedTransactions = foundJobGroupTransaction.allJobTransactions.flatMap(item => item);
          const groupedTransactions = flattenGroupedTransactions.concat(currentTransaction);

          // Add job matches, and group matches to a new property So we can see all the grouped matching transactions
          newObject;
          newObject.allJobTransactions = groupedTransactions;
          newObject.overallJobTotal = (
            Number(currentTransaction.totalTransaction) + Number(foundJobGroupTransaction.overallJobTotal)
          ).toFixed(2);

          // Remove prior transaction record from previous so it is not counted again
          previousTransactions.splice(foundJobGroupTransactionIndex, 1);
        }
      }

      previousTransactions.push(newObject);
    }
    return previousTransactions;
  }, []);
};

/**
 *
 * @param {*} aggregatedTransactionTotalsByJob
 * @returns
 */
const aggregateAndSortRemainingTotals = aggregatedTransactionTotalsByJob => {
  return aggregatedTransactionTotalsByJob.map(companyJob => {
    if (companyJob !== undefined && companyJob.allJobTransactions.length) {
      // additional properties to push onto aggregatedTotals
      let newTotalsPerJob = {
        ...companyJob,
        totalPayments: 0,
        paymentTransactions: [],
        totalAdjustments: 0,
        adjustmentTransactions: [],
        totalWriteOffs: 0,
        writeOffTransactions: [],
        totalInterest: 0,
        interestTransactions: [],
        totalCharges: 0,
        chargeTransactions: [],
        totalTime: 0,
        timeTransactions: []
      };

      companyJob.allJobTransactions.map(transaction => {
        switch (transaction.transactionType) {
          case 'Payment':
            newTotalsPerJob.totalPayments = (Number(newTotalsPerJob.totalPayments) + Number(transaction.totalTransaction)).toFixed(2);
            newTotalsPerJob.paymentTransactions.push(transaction);
            break;
          case 'Adjustment':
            newTotalsPerJob.totalAdjustments = (Number(newTotalsPerJob.totalAdjustments) + Number(transaction.totalTransaction)).toFixed(2);
            newTotalsPerJob.adjustmentTransactions.push(transaction);
            break;
          case 'Write Off':
            newTotalsPerJob.totalWriteOffs = (Number(newTotalsPerJob.totalWriteOffs) + Number(transaction.totalTransaction)).toFixed(2);
            newTotalsPerJob.writeOffTransactions.push(transaction);
            break;
          case 'Interest':
            newTotalsPerJob.totalInterest = (Number(newTotalsPerJob.totalInterest) + Number(transaction.totalTransaction)).toFixed(2);
            newTotalsPerJob.interestTransactions.push(transaction);
            break;
          case 'Charge':
            newTotalsPerJob.totalCharges = (Number(newTotalsPerJob.totalCharges) + Number(transaction.totalTransaction)).toFixed(2);
            newTotalsPerJob.chargeTransactions.push(transaction);
            break;
          case 'Time':
            newTotalsPerJob.totalTime = (Number(newTotalsPerJob.totalTime) + Number(transaction.totalTransaction)).toFixed(2);
            newTotalsPerJob.timeTransactions.push(transaction);
            break;
          default:
            -1;
        }
      });
      return newTotalsPerJob;
    }
    return newTotalsPerJob;
  });
};

/**
 * Calculates billing interest. Reducing amount model, per annum, rate = 18%
 * @param {*} outstandingCompanyInvoices
 * @returns[{},{},{}] and array of objects. each object is a interest record in 'transaction' table form
 */
const calculateBillingInterest = outstandingCompanyInvoices => {
  const calculatedInterest = balance => Number(((balance * defaultInterestRate) / defaultInterestMonthsInYear).toFixed(2));

  const interestRecords = outstandingCompanyInvoices.map(invoice => {
    const { oid, company, unPaidBalance, paymentDueDate } = invoice;
    const now = dayjs().format('MM/DD/YYYY HH:mm:ss');
    const dueDate = dayjs(paymentDueDate).format('MM/DD/YYYY HH:mm:ss');
    const pastDue = dayjs(now).isAfter(dueDate);

    if (invoice && unPaidBalance >= 0.01 && pastDue) {
      // Forming Object to insert to transaction
      const interestTransaction = {
        company: company,
        job: 1,
        employee: null,
        transactionType: 'Interest',
        transactionDate: now,
        quantity: 1,
        unitOfMeasure: 'Each',
        unitTransaction: calculatedInterest(unPaidBalance),
        totalTransaction: calculatedInterest(unPaidBalance),
        invoice: oid,
        billable: true
      };

      return interestTransaction;
    }
    return;
  });

  return interestRecords;
};

/**
 * Aggregates all jobs, outstanding charges together to create the invoice.
 * @param {*} contactRecord
 * @param {*} aggregatedAndSortedTotals
 * @param {*} outstandingCompanyInvoices
 * @param {*} nextInvoiceNumber
 * @returns
 */
const calculateInvoiceObject = async (contactRecord, aggregatedAndSortedTotals, outstandingCompanyInvoices, nextInvoiceNumber) => {
  // Adds amounts together
  const calculateGroupedJobTotals = (array, property) =>
    array.length ? array.reduce((prev, job) => Number(prev) + Number(job[property]), 0).toFixed(2) : 0;
  // Take an array and a property. The property is an [] array. Property on the array object to flatten.
  const flattenAllGroupedRecords = (array, property) => (array.length ? array.flatMap(job => job[property]) : []);

  const outstandingCharges = calculateGroupedJobTotals(outstandingCompanyInvoices, 'unPaidBalance');
  const writeOffs = calculateGroupedJobTotals(aggregatedAndSortedTotals, 'totalWriteOffs');
  const newPayments = calculateGroupedJobTotals(aggregatedAndSortedTotals, 'totalPayments');
  const payments = (Number(newPayments) + Number(writeOffs)).toFixed(2);
  const newPaymentRecords = flattenAllGroupedRecords(aggregatedAndSortedTotals, 'paymentTransactions');
  const writeOffRecords = flattenAllGroupedRecords(aggregatedAndSortedTotals, 'writeOffTransactions');
  const paymentRecords = [...newPaymentRecords, ...writeOffRecords];
  const newCharges = calculateGroupedJobTotals(aggregatedAndSortedTotals, 'totalCharges');
  const adjustments = calculateGroupedJobTotals(aggregatedAndSortedTotals, 'totalAdjustments');
  const time = calculateGroupedJobTotals(aggregatedAndSortedTotals, 'totalTime');
  const interest = calculateGroupedJobTotals(aggregatedAndSortedTotals, 'totalInterest');
  const charges = (Number(newCharges) + Number(adjustments) + Number(time) + Number(interest)).toFixed(2);
  const chargeItemRecords = aggregatedAndSortedTotals.filter(
    item => item.totalAdjustments || item.totalCharges || item.totalTime || item.totalInterest
  );
  // If the invoice does not have an invoice number, add to new array to calculate. This is used so payments are not double applied. Also this is needed for 'write offs' that are in current cycle that have not been invoiced.
  const writeOffsNotApplied = paymentRecords.filter(record => {
    if (record?.invoice <= 0) return record;
  });
  // Calculate write off's that have not been invoiced.
  const notInvoicedWriteOffs = writeOffsNotApplied ? calculateGroupedJobTotals(writeOffsNotApplied, 'totalTransaction') : 0;
  const endingBalanceTotal = writeOffsNotApplied
    ? Number(outstandingCharges) + Number(charges) + Number(notInvoicedWriteOffs)
    : Number(outstandingCharges) + Number(payments) + Number(notInvoicedWriteOffs) + Number(charges);
  const unpaidTotal = Number(charges).toFixed(2);
  const today = new Date();
  const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const now = dayjs(today.toLocaleString()).format('YYYY-MM-DD HH:mm:ss');
  const { oid, companyName, firstName, lastName, address1, city, state, zip } = contactRecord;

  return (newInvoiceObject = {
    company: oid,
    invoiceNumber: Number(nextInvoiceNumber),
    contactName: companyName ? companyName : '',
    address1: firstName ? firstName : '',
    address2: lastName ? lastName : '',
    address3: address1,
    address4: city ? `${city}, ${state} ${zip}` : '',
    address5: '',
    beginningBalance: Number(outstandingCharges),
    outstandingInvoiceRecords: outstandingCompanyInvoices,
    totalPayments: Number(payments),
    paymentRecords: paymentRecords,
    totalNewCharges: Number(charges),
    newChargesRecords: chargeItemRecords,
    endingBalance: Number(endingBalanceTotal),
    unPaidBalance: Number(unpaidTotal),
    invoiceDate: now,
    paymentDueDate: endOfCurrentMonth,
    dataEndDate: now
  });
};

/**
 * Updates contact card with balance, and that a no new balance
 * @param {*} contactRecord
 * @param {*} invoiceObject
 * @param {*} db
 * @returns
 */
const updateLedger = async (contactRecord, invoiceObject, db) => {
  const updatedLedger = {
    newBalance: false,
    company: contactRecord.oid,
    advancedPayment: invoiceObject.advancedPayment || 0,
    currentAccountBalance: Number(invoiceObject.endingBalance),
    beginningAccountBalance: Number(invoiceObject.beginningBalance),
    statementBalance: Number(invoiceObject.endingBalance)
  };
  return ledgerService.updateCompanyLedger(db, updatedLedger);
};

/**
 * Forms object for invoice and inserts.
 * @param {*} invoiceObject
 * @param {*} nextInvoiceNumber
 * @param {*} db
 * @returns no return
 */
const insertInvoice = async (invoiceObject, nextInvoiceNumber, db) => {
  const { contactName, address1, address2, address3, address4, address5 } = invoiceObject;

  const invoice = {
    ...invoiceObject,
    invoiceNumber: nextInvoiceNumber,
    address1: !address1 ? contactName : address1,
    address2: !address2 ? address3 : address2,
    address3: !address3 ? address4 : address3,
    address4: !address4 ? address5 : address4,
    address5: !address5 ? '' : address5
  };

  delete invoice.newChargesRecords;
  delete invoice.outstandingInvoiceRecords;
  delete invoice.paymentRecords;

  return invoiceService.insertNewInvoice(db, invoice);
};

/**
 * Forms invoice detail
 * @param {*} invoiceObject
 * @param {*} invoiceNumber
 * @param {*} db
 * @returns no return
 */
const insertInvoiceDetails = (invoiceObject, invoiceNumber, db) => {
  invoiceObject.newChargesRecords.forEach(async transaction => {
    const { transactionType, description, totalTransaction } = transaction;
    const invoiceDetail = {
      invoice: invoiceNumber,
      detailDate: dayjs().format(),
      detailType: transactionType,
      jobDescription: description,
      charges: totalTransaction,
      writeOff: transactionType === 'Write Off' ? totalTransaction : 0,
      net: totalTransaction,
      payment: transactionType === 'Payment' ? totalTransaction : 0
    };
    return invoiceService.insertNewInvoiceDetails(db, invoiceDetail);
  });
};

/**
 * Updates each transaction where the invoice number is 0 with an invoice number. This will show the transaction appearing on a given invoice.
 * @param {*} transactionsToUpdate [{},{}]
 * @param {*} invoiceNumber Int
 * @param {*} db
 */
const updateTransactions = (transactionsToUpdate, invoiceNumber, db) => {
  transactionsToUpdate.forEach(async trans => {
    if (trans.invoice === 0 || !trans.invoice) {
      await transactionService.updateTransactionWithInvoice(db, trans.oid, invoiceNumber);
    }
    return trans;
  });
};

module.exports = {
  aggregateTransactionTotalsByJob,
  aggregateAndSortRemainingTotals,
  calculateBillingInterest,
  calculateInvoiceObject,
  updateLedger,
  insertInvoice,
  insertInvoiceDetails,
  updateTransactions
};
