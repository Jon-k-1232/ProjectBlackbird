const express = require('express');
const payToRouter = express.Router();
const payToService = require('./payTo-service');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { requireAuth } = require('../auth/jwt-auth');

// Gets most recent 'pay to' record
payToRouter
  .route('/recent')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');

    payToService.getpayToInfo(db).then(payToInfo => {
      const payToMostRecent = payToInfo.pop();
      res.send({
        payToMostRecent,
        status: 200
      });
    });
  });

// Updates information for who to pay
payToRouter
  .route('/update/payTo')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const {
      customerName,
      customerAddress,
      customerCity,
      customerState,
      customerZip,
      customerPhone,
      customerFax,
      lastInvoiceNumber,
      statementText
    } = req.body;

    const newRecord = sanitizeFields({
      customerName,
      customerAddress,
      customerCity,
      customerState,
      customerZip,
      customerPhone,
      customerFax,
      lastInvoiceNumber,
      statementText
    });

    payToService.insertPayToInfo(db, newRecord).then(() => {
      res.send({ message: 'invoice added successfully.', status: 200 });
    });
  });

module.exports = payToRouter;
