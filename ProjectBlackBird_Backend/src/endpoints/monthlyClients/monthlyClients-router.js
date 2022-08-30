const express = require('express');
const monthlyClientsRouter = express.Router();
const monthlyClientsService = require('./monthlyClients-service');
const jsonParser = express.json();
const { sanitizeFields } = require('../../utils');
const { requireAuth } = require('../auth/jwt-auth');

// Gets active monthly clients
monthlyClientsRouter
  .route('/active')
  .all(requireAuth)
  .get(async (req, res) => {
    const db = req.app.get('db');

    monthlyClientsService.getMonthlyClients(db).then(clients => {
      res.send({
        clients,
        status: 200
      });
    });
  });

// Add a monthly client
monthlyClientsRouter
  .route('/add')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { company, companyName, monthlyCharge, lastInvoiced, inactive } = req.body;

    const sanitizeNewClient = sanitizeFields({
      company,
      companyName,
      monthlyCharge,
      lastInvoiced,
      inactive
    });

    const newClient = convertToOriginalTypes(sanitizeNewClient);

    monthlyClientsService.addMonthlyClient(db, newClient).then(() => {
      monthlyClientsService.getMonthlyClients(db).then(monthlyClients => {
        res.send({
          monthlyClients,
          message: 'Monthly Client Added Successfully.',
          status: 200
        });
      });
    });
  });

// Update a monthly client
monthlyClientsRouter
  .route('/update')
  .all(requireAuth)
  .post(jsonParser, async (req, res) => {
    const db = req.app.get('db');
    const { company, companyName, monthlyCharge, lastInvoiced, inactive } = req.body;

    const sanitizeNewClient = sanitizeFields({
      company,
      companyName,
      monthlyCharge,
      lastInvoiced,
      inactive
    });

    const updatedClient = convertToOriginalTypes(sanitizeNewClient);

    monthlyClientsService.updateMonthlyClient(db, updatedClient).then(() => {
      monthlyClientsService.getMonthlyClients(db).then(monthlyClients => {
        res.send({
          monthlyClients,
          message: 'Monthly Client Added Successfully.',
          status: 200
        });
      });
    });
  });

module.exports = monthlyClientsRouter;

/**
 * Convert items to the correct values before db inserts.
 * @param {*} client {}
 * @returns {}
 */
const convertToOriginalTypes = client => {
  if (client.lastInvoiced === 'null') client.lastInvoiced = null;
  return {
    company: Number(client.company),
    companyName: client.companyName,
    monthlyCharge: Number(client.monthlyCharge),
    lastInvoiced: client.lastInvoiced || null,
    inactive: Boolean(client.inactive) || false
  };
};
