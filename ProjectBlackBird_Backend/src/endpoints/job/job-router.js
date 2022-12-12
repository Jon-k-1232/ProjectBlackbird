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

// Get all jobs for a company
jobRouter
  .route('/analytics/jobCost/:company')
  // .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const company = Number(req.params.company);

    const companyJobs = await jobService.getCompanyJobs(db, company);
    const jobTransactions = await Promise.all(
      companyJobs.map(async job => {
        const jobTransactions = await transactionService.getJobTransactions(db, company, job.oid);
        const filteredTransactionTypes = jobTransactions.filter(
          item => item.transactionType === 'Charge' || item.transactionType === 'Time' || item.transactionType === 'Adjustment'
        );

        const description = job.defaultDescription;
        const subDescription = job.description;
        const id = job.oid;
        const jobTotal = filteredTransactionTypes.reduce((prev, curr) => prev + curr.totalTransaction, 0);

        const jobCharges = filteredTransactionTypes.reduce((prev, curr) => {
          if (curr.transactionType === 'Charge') return prev + curr.totalTransaction;
          return prev;
        }, 0);

        const jobTime = filteredTransactionTypes.reduce((prev, curr) => {
          if (curr.transactionType === 'Time') return prev + curr.quantity;
          return prev;
        }, 0);

        const jobTimeCost = filteredTransactionTypes.reduce((prev, curr) => {
          if (curr.transactionType === 'Time') return prev + curr.totalTransaction;
          return prev;
        }, 0);

        const jobAdjustments = filteredTransactionTypes.reduce((prev, curr) => {
          if (curr.transactionType === 'Adjustment') return prev + curr.totalTransaction;
          return prev;
        }, 0);

        const generalLabor = filteredTransactionTypes.reduce((prev, curr) => {
          if (Number(curr.unitTransaction) < 140 && curr.transactionType === 'Time') return prev + curr.totalTransaction;
          return prev;
        }, 0);

        const generalLaborTime = filteredTransactionTypes.reduce((prev, curr) => {
          if (Number(curr.unitTransaction) < 140 && curr.transactionType === 'Time') return prev + curr.quantity;
          return prev;
        }, 0);

        const skilledLabor = filteredTransactionTypes.reduce((prev, curr) => {
          if (Number(curr.unitTransaction) >= 140 && curr.transactionType === 'Time') return prev + curr.totalTransaction;
          return prev;
        }, 0);

        const skilledLaborTime = filteredTransactionTypes.reduce((prev, curr) => {
          if (Number(curr.unitTransaction) >= 140 && curr.transactionType === 'Time') return prev + curr.quantity;
          return prev;
        }, 0);

        return {
          description,
          subDescription,
          id,
          jobTotal,
          jobCharges,
          jobTime,
          jobTimeCost,
          jobAdjustments,
          generalLabor,
          generalLaborTime,
          skilledLabor,
          skilledLaborTime
        };
      })
    );

    res.send({
      jobTransactions,
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
