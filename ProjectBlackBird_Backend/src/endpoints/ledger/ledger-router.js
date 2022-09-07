const express = require('express');
const ledgerRouter = express.Router();
const ledgerService = require('./ledger-service');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { requireAuth } = require('../auth/jwt-auth');

/**
 * Gets all ledgers
 */
ledgerRouter
  .route('/all')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');

    ledgerService.getAllLedgers(db).then(ledgers => {
      res.send({
        ledgers,
        status: 200
      });
    });
  });

/**
 * Gets a company
 */
ledgerRouter
  .route('/ledger/:companyId')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');
    const companyId = Number(req.params.companyId);

    ledgerService.getCompanyLedger(db, companyId).then(ledgers => {
      res.send({
        ledgers,
        status: 200
      });
    });
  });

/**
 * adds a company
 */
ledgerRouter
  .route('/retainer/addCompany')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { newBalance, company, advancedPayment, currentAccountBalance, beginningAccountBalance, statementBalance } = req.body;

    const cleanedFields = sanitizeFields({
      newBalance,
      company,
      advancedPayment,
      currentAccountBalance,
      beginningAccountBalance,
      statementBalance
    });

    const newLedger = convertToOriginalTypes(cleanedFields);

    ledgerService.insertNewCompanyLedger(db, newLedger).then(ledger => {
      res.send({
        ledger,
        message: 'ledger added successfully.',
        status: 200
      });
    });
  });

/**
 * Updates a company
 */
ledgerRouter
  .route('/retainer/updateCompany')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { newBalance, company, advancedPayment, currentAccountBalance, beginningAccountBalance, statementBalance } = req.body;

    const cleanedFields = sanitizeFields({
      newBalance,
      company,
      advancedPayment,
      currentAccountBalance,
      beginningAccountBalance,
      statementBalance
    });

    const newLedger = convertToOriginalTypes(cleanedFields);

    ledgerService.updateCompanyLedger(db, newLedger).then(ledger => {
      res.send({
        ledger,
        message: 'ledger updated successfully.',
        status: 200
      });
    });
  });

module.exports = ledgerRouter;

const convertToOriginalTypes = ledger => {
  return {
    newBalance: Number(ledger.newBalance),
    company: Number(ledger.company),
    retainerBalance: Number(ledger.retainerBalance),
    currentAccountBalance: Number(ledger.currentAccountBalance),
    beginningAccountBalance: Number(ledger.beginningAccountBalance),
    statementBalance: Number(ledger.statementBalance),
    prepaidBalance: Number(ledger.prepaidBalance)
  };
};
