const express = require('express');
const jobDescriptionsRouter = express.Router();
const jobDescriptionService = require('./jobDescriptions-service');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { requireAuth } = require('../auth/jwt-auth');

/**
 * Gets all job descriptions
 */
jobDescriptionsRouter
  .route('/all')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');

    jobDescriptionService.getAllJobDescriptions(db).then(allJobDescriptions => {
      res.send({
        allJobDescriptions,
        status: 200
      });
    });
  });

/**
 * Adds a new Job Description
 */
jobDescriptionsRouter
  .route('/new/addNewDescription')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { description, defaultTargetPrice, billable } = req.body;

    const cleanedFields = sanitizeFields({
      description,
      defaultTargetPrice,
      billable
    });

    const descriptionInfo = convertToRequiredTypes(cleanedFields);

    const lastOid = await jobDescriptionService.getLastJobDescriptionOidInDB(db);
    const oid = Number(lastOid[0].max) + 1;
    const newJobDescription = { ...descriptionInfo, oid };

    jobDescriptionService.insertNewJobDescription(db, newJobDescription).then(() => {
      res.send({
        message: 'Job description added successfully.',
        status: 200
      });
    });
  });

/**
 * Updates a Job Description with a given oid. Param is a Integer
 */
jobDescriptionsRouter
  .route('/update/jobDescription/:descriptionId')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { descriptionId } = req.params;
    const { description, defaultTargetPrice, billable } = req.body;

    const cleanedFields = sanitizeFields({
      description,
      defaultTargetPrice,
      billable
    });

    const descriptionInfo = convertToRequiredTypes(cleanedFields);

    jobDescriptionService.updateJobDescription(db, descriptionInfo, Number(descriptionId)).then(() => {
      res.send({
        message: 'Job description updated',
        status: 200
      });
    });
  });
module.exports = jobDescriptionsRouter;

/**
 * Takes params and converts required items to correct type for db insert.
 * @param {*} contactItem
 * @returns
 */
const convertToRequiredTypes = jobDescription => {
  return {
    description: jobDescription.description,
    defaultTargetPrice: Number(jobDescription.defaultTargetPrice),
    billable: Boolean(jobDescription.billable)
  };
};
