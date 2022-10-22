const express = require('express');
const advancedPaymentRouter = express.Router();
const advancedPaymentService = require('./advancedPayment-service');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { requireAuth } = require('../auth/jwt-auth');

/**
 * Get the whole table of advanced payments
 */
advancedPaymentRouter
  .route('/all')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');

    advancedPaymentService.getAllAdvancedPayments(db).then(allAdvancedPayments => {
      res.send({
        allAdvancedPayments,
        status: 200
      });
    });
  });

/**
 * For a company, get all the advanced payments
 */
advancedPaymentRouter
  .route('/allCompanyAdvancedPayments/:companyId')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const companyId = Number(req.params.companyId);

    advancedPaymentService.getAllCompanyAdvancedPayments(db, companyId).then(allAdvancedPayments => {
      res.send({
        allAdvancedPayments,
        status: 200
      });
    });
  });

/**
 * For a company, get all the advanced payments that still have available balances
 */
advancedPaymentRouter
  .route('/CompanyAdvancedPaymentsGreaterThanZero/:companyId')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const companyId = Number(req.params.companyId);

    advancedPaymentService.getCompanyAdvancedPaymentsGreaterThanZero(db, companyId).then(allAdvancedPayments => {
      res.send({
        allAdvancedPayments,
        status: 200
      });
    });
  });

/**
 * For a company, update the available amount
 */
advancedPaymentRouter
  .route('/update/availableAmount')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { oid, availableAmount } = req.body;

    const cleanedFields = sanitizeFields({ oid, availableAmount });

    const recordOid = Number(cleanedFields.oid);
    const availableAmt = Number(cleanedFields.availableAmount);

    advancedPaymentService.updateAdvancedPayment(db, recordOid, availableAmt).then(allAdvancedPayments => {
      res.send({
        allAdvancedPayments,
        status: 200
      });
    });
  });

/**
 * Add a new advanced payment record for a company
 */
advancedPaymentRouter
  .route('/new/advancedPayment')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { company, appliedOnInvoices, originalAmount, availableAmount, createdDate } = req.body;

    const cleanedFields = sanitizeFields({ company, appliedOnInvoices, originalAmount, availableAmount, createdDate });
    const confirmedTypes = convertToOriginalTypes(cleanedFields);

    advancedPaymentService.insertNewAdvancedPayment(db, confirmedTypes).then(allAdvancedPayments => {
      res.send({
        allAdvancedPayments,
        status: 200
      });
    });
  });

module.exports = advancedPaymentRouter;

/**
 * Converts each constant in the object to the correct data type before inserting into DB.
 * @param {*} invoice
 * @returns
 */
const convertToOriginalTypes = advancedPaymentRouter => {
  return {
    company: Number(advancedPaymentRouter.company),
    appliedOnInvoices: JSON.parse(advancedPaymentRouter.appliedOnInvoices),
    originalAmount: Number(advancedPaymentRouter.originalAmount),
    availableAmount: Number(advancedPaymentRouter.availableAmount),
    createdDate: new Date(advancedPaymentRouter.createdDate)
  };
};
