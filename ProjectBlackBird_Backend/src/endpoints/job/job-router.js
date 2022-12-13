const express = require('express');
const jobRouter = express.Router();
const jobService = require('./job-service');
const transactionService = require('../transactions/transactions-service');
const helperFunctions = require('../../helperFunctions/helperFunctions');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { defaultDaysInPast } = require('../../../config');
const { requireAuth } = require('../auth/jwt-auth');

// Get all jobs for a company
jobRouter
  .route('/all/:company/:time')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const company = Number(req.params.company);
    const time = Number(req.params.time) ? Number(req.params.time) : defaultDaysInPast;
    const timeBetween = helperFunctions.timeSubtractionFromTodayCalculator(time);

    const jobs = await jobService.getJobs(db, company, timeBetween.currDate, timeBetween.prevDate);

    res.send({
      jobs,
      status: 200
    });
  });

/**
 * Gets all jobs for a specific time by 'days'. Today - x days
 */
jobRouter
  .route('/allJobs/:time')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const time = Number(req.params.time) ? Number(req.params.time) : defaultDaysInPast;
    const timeBetween = helperFunctions.timeSubtractionFromTodayCalculator(time);

    const allJobsWithinTimeframe = await jobService.getAllJobs(db, timeBetween.currDate, timeBetween.prevDate);

    res.send({
      allJobsWithinTimeframe,
      status: 200
    });
  });

/**
 * Get details on Job break down
 */
jobRouter
  .route('/analytics/jobCost/:company')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const companyId = Number(req.params.company);

    const companyJobs = await jobService.getCompanyJobs(db, companyId);
    const jobsBrokenDown = await totalJobAnalytics(db, companyJobs, companyId);

    res.send({
      jobsBrokenDown,
      status: 200
    });
  });

/**
 * Add a job for a client
 */
jobRouter
  .route('/addJob')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { jobDefinition, company, targetPrice, startDate, contact, contactPhone, description, defaultDescription, isComplete } = req.body;

    const cleanedFields = sanitizeFields({
      jobDefinition,
      company,
      targetPrice,
      startDate,
      contact,
      contactPhone,
      description,
      defaultDescription,
      isComplete
    });

    const jobInfo = convertToRequiredTypes(cleanedFields);
    const lastOid = await jobService.getLastJobOidInDB(db);
    const oid = Number(lastOid[0].max) + 1;
    const newJob = { ...jobInfo, oid };

    jobService.insertNewJob(db, newJob).then(function () {
      res.send({ message: 'Job added successfully.', status: 200 });
    });
  });

module.exports = jobRouter;

/**
 * Takes params and converts required items to correct type for db insert.
 * @param {*} contactItem
 * @returns
 */
const convertToRequiredTypes = jobItem => {
  return {
    jobDefinition: Number(jobItem.jobDefinition),
    company: Number(jobItem.company),
    targetPrice: Number(jobItem.targetPrice),
    startDate: jobItem.startDate,
    contact: jobItem.contact,
    contactPhone: jobItem.contactPhone,
    description: jobItem.description,
    defaultDescription: jobItem.defaultDescription,
    isComplete: Boolean(jobItem.isComplete)
  };
};

/**
 * Totals job breakdowns of time and cost
 * @param {*} db
 * @param {*} companyJobs [{},{}]
 * @param {*} companyId
 * @returns
 */
const totalJobAnalytics = async (db, companyJobs, companyId) => {
  const addTimeAndCost = (array, typeTransaction, aggregateProperty) =>
    array.reduce((prev, curr) => {
      if (curr.transactionType === typeTransaction) return prev + curr[aggregateProperty];
      return prev;
    }, 0);

  const addGeneralLabor = (array, typeTransaction, aggregateProperty) =>
    array.reduce((prev, curr) => {
      if (Number(curr.unitTransaction) < 140 && curr.transactionType === typeTransaction) return prev + curr[aggregateProperty];
      return prev;
    }, 0);

  const addSkilledLabor = (array, typeTransaction, aggregateProperty) =>
    array.reduce((prev, curr) => {
      if (Number(curr.unitTransaction) >= 140 && curr.transactionType === typeTransaction) return prev + curr[aggregateProperty];
      return prev;
    }, 0);

  const jobAnalytics = companyJobs.map(async job => {
    const jobTransactions = await transactionService.getJobTransactions(db, companyId, job.oid);
    const filteredTransactionTypes = jobTransactions.filter(
      item => item.transactionType === 'Charge' || item.transactionType === 'Time' || item.transactionType === 'Adjustment'
    );

    const description = job.defaultDescription;
    const subDescription = job.description;
    const jobId = job.oid;
    const jobTotal = filteredTransactionTypes.reduce((prev, curr) => prev + curr.totalTransaction, 0).toFixed(2);
    const chargesOnJob = addTimeAndCost(filteredTransactionTypes, 'Charge', 'totalTransaction').toFixed(2);
    const timeOnJob = addTimeAndCost(filteredTransactionTypes, 'Time', 'quantity').toFixed(2);
    const costOfJobTime = addTimeAndCost(filteredTransactionTypes, 'Time', 'totalTransaction').toFixed(2);
    const adjustmentsOnJob = addTimeAndCost(filteredTransactionTypes, 'Adjustment', 'totalTransaction').toFixed(2);
    const costOfGeneralLabor = addGeneralLabor(filteredTransactionTypes, 'Time', 'totalTransaction').toFixed(2);
    const generalLaborTime = addGeneralLabor(filteredTransactionTypes, 'Time', 'quantity').toFixed(2);
    const costOfSkilledLabor = addSkilledLabor(filteredTransactionTypes, 'Time', 'totalTransaction').toFixed(2);
    const skilledLaborTime = addSkilledLabor(filteredTransactionTypes, 'Time', 'quantity').toFixed(2);

    return {
      jobId,
      description,
      subDescription,
      jobTotal,
      chargesOnJob,
      timeOnJob,
      costOfJobTime,
      adjustmentsOnJob,
      costOfGeneralLabor,
      generalLaborTime,
      costOfSkilledLabor,
      skilledLaborTime
    };
  });

  return Promise.all(jobAnalytics);
};
