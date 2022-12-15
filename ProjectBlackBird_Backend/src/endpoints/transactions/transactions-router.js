const express = require('express');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { requireAuth } = require('../auth/jwt-auth');
const transactionsRouter = express.Router();
const transactionService = require('./transactions-service');
const ledgerService = require('../ledger/ledger-service');
const contactService = require('../contacts/contacts-service');
const advancedPaymentService = require('../advancedPayment/advancedPayment-service');
const helperFunctions = require('../../helperFunctions/helperFunctions');
const contactObjects = require('../contacts/contactObjects');
const handleChargesAndPayments = require('./transactionOrchestrator');
const createNewInvoice = require('../createInvoice/createInvoiceOrchestrator');
const { defaultDaysInPast } = require('../../../config');

/**
 * All Transactions within a given time frame- in days.
 * @:time - time in past whole days. example: 6 will get past 6 days
 */
transactionsRouter
  .route('/all/:time')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const time = Number(req.params.time) ? Number(req.params.time) : defaultDaysInPast;
    const timeBetween = helperFunctions.timeSubtractionFromTodayCalculator(time);

    const transactions = await transactionService.getTransactions(db, timeBetween.currDate, timeBetween.prevDate);
    const allTransactions = transactions.map(transaction => transactionObject(transaction));

    res.send({
      allTransactions,
      status: 200
    });
  });

/**
 * All Transactions within a given time frame- in days.
 * @:time - time in past whole days. example: 6 will get past 6 days
 */
transactionsRouter
  .route('/companyTransactions/:company/:time')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');

    // Default time 360 days if user has not provided a time
    const time = req.params.time === Number(req.params.time) ? Number(req.params.time) : defaultDaysInPast;
    const company = Number(req.params.company);
    const timeBetween = helperFunctions.timeSubtractionFromTodayCalculator(time);

    const companyTransactions = await transactionService.getCompanyTransactions(db, company, timeBetween.currDate, timeBetween.prevDate);
    // Create a cleaned up object. query used is being used by other items that need the additional data. Rather than duplicate, easier to clean data.
    const sortedCompanyTransactions = companyTransactions.map(transaction => transactionObject(transaction));

    res.send({
      sortedCompanyTransactions,
      status: 200
    });
  });

/**
 *
 */
transactionsRouter
  .route('/jobTransactions/:companyId/:jobId/')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const companyId = Number(req.params.companyId);
    const jobId = Number(req.params.jobId);

    const jobTransactions = await transactionService.getJobTransactions(db, companyId, jobId);

    res.send({
      jobTransactions,
      status: 200
    });
  });

/**
 * Handles Payments, Charges, Time Charges, Adjustment, and updating the DB
 */
transactionsRouter
  .route('/new/addNewTransaction')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const {
      company,
      job,
      employee,
      transactionType,
      transactionDate,
      quantity,
      unitOfMeasure,
      unitTransaction,
      totalTransaction,
      invoice,
      billable
    } = req.body;

    const cleanedFields = sanitizeFields({
      company,
      job,
      employee,
      transactionType,
      transactionDate,
      quantity,
      unitOfMeasure,
      unitTransaction,
      totalTransaction,
      invoice,
      billable
    });

    const newTransaction = convertToOriginalTypes(cleanedFields);
    const nullValues = doesObjectContainNullValue(newTransaction);

    if (newTransaction.transactionType === 'Advanced Payment') {
      const advancedPayment = advancedPaymentObject(newTransaction);
      await advancedPaymentService.insertNewAdvancedPayment(db, advancedPayment);
      res.send({ status: 200 });
    } else if (nullValues && newTransaction.transactionType !== 'Advanced Payment') {
      res.send({
        message: 'NOT SUCCESSFUL, not all fields are filled out. Please complete all fields and resubmit.',
        status: 400
      });
    } else if (!nullValues && newTransaction.transactionType !== 'Advanced Payment') {
      // Orchestrator in transactionOrchestrator file.
      const roughDraft = true;
      const createPdf = false;
      const contactBalance = true;
      const balanceResponse = await handleChargesAndPayments(db, newTransaction);
      const contactInfo = await contactService.getContactInfo(db, newTransaction.company);
      const companyLedger = await ledgerService.getCompanyLedger(db, newTransaction.company);
      const currentAmounts = await createNewInvoice([newTransaction.company], roughDraft, createPdf, db, contactBalance);
      const updatedAccountInfo = contactObjects.mergeContactAndInvoice(contactInfo[0], currentAmounts[0], companyLedger[0]);

      res.send({
        balanceResponse,
        updatedAccountInfo: [updatedAccountInfo],
        message: 'Transaction and account updated successfully.',
        status: 200
      });
    }
  });

module.exports = transactionsRouter;

/**
 * Insure that the types being insert into db are the correct types.
 * @param {*} newTransaction
 * @returns
 */
const convertToOriginalTypes = newTransaction => {
  return {
    company: Number(newTransaction.company),
    job: Number(newTransaction.job),
    employee: Number(newTransaction.employee),
    transactionType: newTransaction.transactionType,
    transactionDate: newTransaction.transactionDate,
    quantity: Number(newTransaction.quantity),
    unitOfMeasure: newTransaction.unitOfMeasure,
    unitTransaction: Number(newTransaction.unitTransaction),
    totalTransaction: Number(newTransaction.totalTransaction),
    invoice: Number(newTransaction.invoice),
    billable: Boolean(newTransaction.billable)
  };
};

/**
 * Check for null values in a object
 * @param {*} newTransaction
 * @returns
 */
const doesObjectContainNullValue = newTransaction => {
  const transaction = Object.entries(newTransaction).map(item => {
    const [key, value] = item;

    if (key !== 'invoice' && (value === null || value === undefined)) {
      return true;
    } else if (key === 'job' && (value === null || value === undefined || value === 0)) {
      return true;
    }
    return false;
  });

  return transaction.includes(true);
};

/**
 * Form the object for transactions
 * @param {*} transactions
 * @returns
 */
const transactionObject = transactions => {
  return {
    oid: transactions.oid,
    company: transactions.companyName,
    JobId: transactions.job,
    job: transactions.defaultDescription,
    employee: transactions.displayname,
    transactionType: transactions.transactionType,
    transactionDate: transactions.transactionDate,
    quantity: transactions.quantity,
    unitOfMeasure: transactions.unitOfMeasure,
    unitTransaction: transactions.unitTransaction,
    totalTransaction: transactions.totalTransaction,
    invoice: transactions.invoice,
    billable: transactions.billable
  };
};

/**
 * Form object for advanced payment
 * @param {*} advancedPayment
 * @returns
 */
const advancedPaymentObject = advancedPayment => ({
  company: Number(advancedPayment.company),
  appliedOnInvoices: [],
  originalAmount: Number(advancedPayment.totalTransaction),
  availableAmount: Number(advancedPayment.totalTransaction),
  createdDate: new Date(advancedPayment.transactionDate)
});
